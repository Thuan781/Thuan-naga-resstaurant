import { prisma } from "./prisma";
import { round2 } from "./format";

export const TAX_RATE = 0.05; // 5% GST on food

export async function nextOrderNumber(): Promise<number> {
  const last = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return (last?.orderNumber ?? 0) + 1;
}

export interface LineItemInput {
  itemId: string;
  quantity: number;
  addons: Array<{ name: string; price: number }>;
  note?: string;
}

export interface PriceBreakdown {
  subtotal: number;
  addonsTotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export async function validatePromo(
  code: string | undefined,
  subtotal: number
): Promise<{ valid: boolean; discount: number; code?: string; message?: string }> {
  if (!code) return { valid: true, discount: 0 };
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) return { valid: false, discount: 0, message: "Invalid promo code" };
  if (promo.expiresAt && promo.expiresAt < new Date())
    return { valid: false, discount: 0, message: "This promo code has expired" };
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
    return { valid: false, discount: 0, message: "This promo code has reached its usage limit" };
  if (subtotal < promo.minOrder)
    return {
      valid: false,
      discount: 0,
      message: `Add items worth ${"₹" + promo.minOrder} or more to use this code`,
    };
  return {
    valid: true,
    code: promo.code,
    discount: round2((subtotal * promo.discountPercent) / 100),
  };
}

export function parseAddons(json: string): Array<{ name: string; price: number }> {
  try {
    const parsed = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Full line amount including addons, times quantity. */
export function orderLineAmount(line: {
  price: number;
  addons: string;
  quantity: number;
}): number {
  const addonSum = parseAddons(line.addons).reduce((s, a) => s + a.price, 0);
  return round2((line.price + addonSum) * line.quantity);
}

export function computePricing(
  subtotal: number,
  settings: { deliveryFee: number; freeDeliveryAbove: number },
  promoDiscount: number
): { tax: number; deliveryFee: number; total: number } {
  const tax = round2(subtotal * TAX_RATE);
  let deliveryFee = settings.deliveryFee;
  if (settings.freeDeliveryAbove > 0 && subtotal >= settings.freeDeliveryAbove) {
    deliveryFee = 0;
  }
  const total = round2(subtotal + tax + deliveryFee - promoDiscount);
  return { tax, deliveryFee, total };
}
