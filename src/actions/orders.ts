"use server";

import { z } from "zod";
import { addressSchema, placeOrderSchema, reviewSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoreStatus } from "@/lib/store-status";
import {
  computePricing,
  nextOrderNumber,
  validatePromo,
  type LineItemInput,
} from "@/lib/orders";
import { round2 } from "@/lib/format";

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  orderId?: string;
  orderNumber?: number;
  total?: number;
  promo?: { valid: boolean; discount: number; message?: string };
};

function flatten<T>(result: { error: z.ZodError<T> }): Record<string, string> {
  const fe = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? ""]));
}

function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

export async function placeOrderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to place your order." };
  if (user.role === "ADMIN") return { error: "Admin accounts cannot place customer orders." };

  const rawMethod = String(formData.get("paymentMethod") ?? "").trim() as "COD" | "UPI";
  if (rawMethod !== "COD" && rawMethod !== "UPI") {
    return { error: "Please choose a payment method — UPI or Cash on Delivery — to place your order." };
  }

  const parsed = placeOrderSchema.safeParse({
    deliveryName: formData.get("deliveryName"),
    deliveryPhone: formData.get("deliveryPhone"),
    deliveryAddress: formData.get("deliveryAddress"),
    items: parseJsonField<LineItemInput[]>(formData.get("items"), []),
    promoCode: formData.get("promoCode") || undefined,
    specialInstructions: formData.get("specialInstructions") || undefined,
    paymentMethod: rawMethod,
    paymentRef: formData.get("paymentRef") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed) };
  }
  const data = parsed.data;

  const settings = await prisma.restaurantSettings.findFirst();
  if (!settings) return { error: "Store settings are not configured." };

  const status = getStoreStatus(settings);
  if (!status.canOrder) return { error: status.detail };

  // Load items from the DB and compute prices server-side (never trust the client).
  const ids = [...new Set(data.items.map((i) => i.itemId))];
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: ids }, isAvailable: true },
  });
  const itemById = new Map(menuItems.map((m) => [m.id, m]));

  let subtotal = 0;
  let longestPrep = 0;
  const lines = [];
  for (const line of data.items) {
    const item = itemById.get(line.itemId);
    if (!item) return { error: "One of the items in your cart is no longer available." };
    const allowedAddons = parseJsonField<Array<{ name: string; price: number }>>(item.addons, []);
    const addons = line.addons
      .map((a) => allowedAddons.find((allowed) => allowed.name === a.name))
      .filter((a): a is { name: string; price: number } => !!a);
    const linePrice = round2(item.price + addons.reduce((s, a) => s + a.price, 0));
    subtotal = round2(subtotal + linePrice * line.quantity);
    longestPrep = Math.max(longestPrep, item.prepTime);
    // Store the base price; addons are tracked separately so invoices/reorders stay accurate.
    lines.push({ itemId: item.id, name: item.name, price: item.price, quantity: line.quantity, addons: JSON.stringify(addons), note: line.note || null });
  }

  if (subtotal < settings.minOrderValue) {
    return { error: `Minimum order value is ₹${settings.minOrderValue}.` };
  }

  const promo = await validatePromo(data.promoCode, subtotal);
  if (!promo.valid) return { error: promo.message ?? "Invalid promo code" };

  const pricing = computePricing(subtotal, settings, promo.discount);
  const total = pricing.total;

  let paymentStatus: "PENDING" | "PAID" = "PENDING";
  if (data.paymentMethod === "COD") {
    if (!settings.codEnabled) return { error: "Cash on Delivery is currently unavailable." };
    if (total > settings.codMaxAmount) {
      return { error: `Cash on Delivery is available only for orders up to ₹${settings.codMaxAmount}.` };
    }
  } else {
    // UPI — the order can only be placed once the customer has actually paid.
    if (!settings.upiEnabled) return { error: "UPI payments are currently unavailable." };
    const ref = (data.paymentRef ?? "").trim();
    if (ref.length < 6) {
      return { error: "Please enter the UPI transaction reference (shown in your UPI app after paying) to confirm your payment." };
    }
    paymentStatus = "PAID";
  }

  const estimatedMinutes = Math.max(25, longestPrep + 20);
  const orderNumber = await nextOrderNumber();
  const history = [{ status: "CONFIRMED", at: new Date().toISOString() }];

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.id,
      deliveryName: data.deliveryName,
      deliveryPhone: data.deliveryPhone,
      deliveryAddress: data.deliveryAddress,
      items: { create: lines },
      subtotal,
      tax: pricing.tax,
      deliveryFee: pricing.deliveryFee,
      discount: promo.discount,
      promoCode: promo.code ?? null,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus,
      paymentRef: data.paymentMethod === "UPI" ? (data.paymentRef ?? "").trim() || null : null,
      status: "CONFIRMED",
      statusHistory: JSON.stringify(history),
      specialInstructions: data.specialInstructions || null,
      estimatedMinutes,
    },
  });

  if (promo.code) {
    await prisma.promoCode.update({
      where: { code: promo.code },
      data: { usedCount: { increment: 1 } },
    });
  }

  return { ok: true, orderId: order.id, orderNumber, total };
}

export async function submitReviewAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in." };

  const parsed = reviewSchema.safeParse({
    orderId: formData.get("orderId"),
    rating: Number(formData.get("rating")),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) return { error: "Please select a star rating." };

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: true, review: true },
  });
  if (!order || order.userId !== user.id) return { error: "Order not found." };
  if (order.status !== "DELIVERED") return { error: "You can review an order only after it's delivered." };
  if (order.review) return { error: "You've already reviewed this order." };

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        orderId: order.id,
        userId: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
      },
    });
    for (const line of order.items) {
      if (!line.itemId) continue;
      const item = await tx.menuItem.findUnique({ where: { id: line.itemId } });
      if (!item) continue;
      const newCount = item.ratingCount + 1;
      const newRating = round2((item.rating * item.ratingCount + parsed.data.rating) / newCount);
      await tx.menuItem.update({
        where: { id: item.id },
        data: { ratingCount: newCount, rating: newRating },
      });
    }
  });

  return { ok: true };
}

export async function addAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in." };

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    fullAddress: formData.get("fullAddress"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed) };
  }

  const count = await prisma.address.count({ where: { userId: user.id } });
  await prisma.address.create({
    data: {
      ...parsed.data,
      phone: parsed.data.phone || null,
      isDefault: count === 0,
      userId: user.id,
    },
  });
  return { ok: true };
}

export async function deleteAddressAction(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in." };
  const id = String(formData.get("id") ?? "");
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== user.id) return { error: "Address not found." };
  await prisma.address.delete({ where: { id } });
  return { ok: true };
}

export async function validatePromoAction(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; message?: string }> {
  return validatePromo(code.trim().toUpperCase(), subtotal);
}
