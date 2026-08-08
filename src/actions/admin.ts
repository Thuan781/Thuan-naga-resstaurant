"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { categorySchema, menuItemSchema, settingsSchema } from "@/lib/validation";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextStatus, type OrderStatusValue } from "@/lib/order-status";

export type AdminState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
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

async function requireAdmin(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/");
}

const checkbox = (fd: FormData, key: string) => fd.get(key) === "on";

export async function saveMenuItemAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();

  const parsed = menuItemSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    emoji: formData.get("emoji") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    prepTime: formData.get("prepTime"),
    spiceLevel: formData.get("spiceLevel"),
    isVeg: checkbox(formData, "isVeg"),
    isAvailable: checkbox(formData, "isAvailable"),
    isTrending: checkbox(formData, "isTrending"),
    tags: formData.get("tags") || "",
    addons: parseJsonField<Array<{ name: string; price: number }>>(formData.get("addons"), []),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed) };
  }
  const data = parsed.data;

  const payload = {
    name: data.name,
    description: data.description,
    price: data.price,
    categoryId: data.categoryId,
    emoji: data.emoji || null,
    imageUrl: data.imageUrl || null,
    prepTime: data.prepTime,
    spiceLevel: data.spiceLevel,
    isVeg: data.isVeg,
    isAvailable: data.isAvailable,
    isTrending: data.isTrending,
    tags: data.tags ?? "",
    addons: JSON.stringify(data.addons),
  };

  if (data.id) {
    await prisma.menuItem.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.menuItem.create({ data: payload });
  }
  redirect("/admin/menu");
}

export async function deleteMenuItemAction(formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.menuItem.delete({ where: { id } });
  return { ok: true };
}

export async function saveCategoryAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    name: formData.get("name"),
    emoji: formData.get("emoji") || undefined,
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed) };
  const data = parsed.data;
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (data.id) {
    await prisma.category.update({
      where: { id: data.id },
      data: { name: data.name, emoji: data.emoji || null, sortOrder: data.sortOrder },
    });
  } else {
    await prisma.category.create({
      data: { name: data.name, emoji: data.emoji || null, sortOrder: data.sortOrder, slug },
    });
  }
  redirect("/admin/menu");
}

export async function deleteCategoryAction(formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const count = await prisma.menuItem.count({ where: { categoryId: id } });
  if (count > 0) return { error: "Move or delete the items in this category first." };
  await prisma.category.delete({ where: { id } });
  return { ok: true };
}

export async function updateSettingsAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    storeStatus: formData.get("storeStatus"),
    emergencyMessage: formData.get("emergencyMessage") || undefined,
    deliveryEnabled: checkbox(formData, "deliveryEnabled"),
    deliveryFee: formData.get("deliveryFee"),
    freeDeliveryAbove: formData.get("freeDeliveryAbove"),
    minOrderValue: formData.get("minOrderValue"),
    codEnabled: checkbox(formData, "codEnabled"),
    codMaxAmount: formData.get("codMaxAmount"),
    upiEnabled: checkbox(formData, "upiEnabled"),
    upiId: formData.get("upiId"),
    hours: parseJsonField<Array<{ day: number; open: string; close: string; closed: boolean }>>(
      formData.get("hours"),
      []
    ),
  });
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed) };
  const data = parsed.data;

  await prisma.restaurantSettings.upsert({
    where: { id: 1 },
    update: {
      storeStatus: data.storeStatus,
      emergencyMessage: data.emergencyMessage || null,
      deliveryEnabled: data.deliveryEnabled,
      deliveryFee: data.deliveryFee,
      freeDeliveryAbove: data.freeDeliveryAbove,
      minOrderValue: data.minOrderValue,
      codEnabled: data.codEnabled,
      codMaxAmount: data.codMaxAmount,
      upiEnabled: data.upiEnabled,
      upiId: data.upiId,
      hours: JSON.stringify(data.hours),
    },
    create: {
      id: 1,
      storeStatus: data.storeStatus,
      emergencyMessage: data.emergencyMessage || null,
      deliveryEnabled: data.deliveryEnabled,
      deliveryFee: data.deliveryFee,
      freeDeliveryAbove: data.freeDeliveryAbove,
      minOrderValue: data.minOrderValue,
      codEnabled: data.codEnabled,
      codMaxAmount: data.codMaxAmount,
      upiEnabled: data.upiEnabled,
      upiId: data.upiId,
      hours: JSON.stringify(data.hours),
    },
  });
  return { ok: true };
}

export async function updateOrderStatusAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const target = String(formData.get("status") ?? "") as OrderStatusValue;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found." };
  if (order.status === "CANCELLED" || order.status === "DELIVERED") {
    return { error: "This order is already finished." };
  }
  const next = nextStatus(order.status);
  if (target !== next) {
    return { error: `Invalid status transition: ${order.status} → ${target}` };
  }

  const history = JSON.parse(order.statusHistory || "[]") as Array<{ status: string; at: string }>;
  history.push({ status: target, at: new Date().toISOString() });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: target,
      statusHistory: JSON.stringify(history),
      deliveredAt: target === "DELIVERED" ? new Date() : order.deliveredAt,
    },
  });
  return { ok: true };
}

export async function cancelOrderAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found." };
  if (order.status === "CANCELLED" || order.status === "DELIVERED") {
    return { error: "This order is already finished." };
  }
  const history = JSON.parse(order.statusHistory || "[]") as Array<{ status: string; at: string }>;
  history.push({ status: "CANCELLED", at: new Date().toISOString() });
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      statusHistory: JSON.stringify(history),
      cancelledAt: new Date(),
      cancelReason: reason || null,
    },
  });
  return { ok: true };
}

export async function addAdminAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "ADMIN") return { error: "This email already has admin access." };
    await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    return { ok: true };
  }
  // New account: random password — the person sets their own via "Forgot password".
  await prisma.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      passwordHash: await hashPassword(randomBytes(16).toString("hex")),
      role: "ADMIN",
    },
  });
  return { ok: true };
}

export async function removeAdminAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const current = await getCurrentUser();
  if (current && current.email.toLowerCase() === email) {
    return { error: "You can't remove your own admin access." };
  }
  await prisma.user.updateMany({ where: { email }, data: { role: "CUSTOMER" } });
  return { ok: true };
}
