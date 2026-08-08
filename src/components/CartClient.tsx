"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, cartSubtotal, lineTotal } from "@/store/cart";
import { QuantityStepper } from "./QuantityStepper";
import { DishImage } from "./DishImage";
import { validatePromoAction } from "@/actions/orders";
import { inr, round2 } from "@/lib/format";

export interface CartSettings {
  deliveryFee: number;
  freeDeliveryAbove: number;
  minOrderValue: number;
  canOrder: boolean;
}

export default function CartClient({ settings }: { settings: CartSettings }) {
  const { items, removeItem, setQuantity, promoCode, promoDiscount, promoMessage, setPromo } = useCart();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);

  const subtotal = cartSubtotal(items);
  const tax = round2(subtotal * 0.05);
  const delivery = subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee;
  const total = round2(subtotal + tax + delivery - promoDiscount);

  const applyPromo = async () => {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const res = await validatePromoAction(code, subtotal);
      if (res.valid) {
        setPromo(code.toUpperCase(), res.discount, "Promo applied 🎉");
        setCode("");
      } else {
        setPromo(null, 0, res.message);
      }
    } finally {
      setChecking(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Add some Naga goodness and it’ll show up here.</p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-600"
        >
          Browse the menu →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Your cart</h1>
      <p className="mt-1 text-sm text-slate-500">{items.length} {items.length === 1 ? "item" : "items"} in your order</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <DishImage imageUrl={item.imageUrl} emoji={item.emoji} className="h-20 w-20 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/menu/${item.itemId}`} className="font-semibold text-slate-900 hover:text-primary-700">
                      {item.name}
                    </Link>
                    {item.addons.length > 0 && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        + {item.addons.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    {item.note && <p className="mt-0.5 text-xs italic text-slate-400">“{item.note}”</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-slate-400 transition-colors hover:text-red-500"
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <QuantityStepper small quantity={item.quantity} onChange={(q) => setQuantity(item.key, q)} />
                  <span className="font-bold text-slate-900">{inr(lineTotal(item))}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Promo */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">Promo code</p>
            {promoCode && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1.5 text-sm font-semibold text-accent-700">
                {promoCode} applied · −{inr(promoDiscount)}
                <button type="button" onClick={() => setPromo(null, 0)} className="text-accent-500 hover:text-accent-700">✕</button>
              </p>
            )}
            {promoMessage && !promoCode && (
              <p className="mt-2 text-sm font-medium text-red-600">{promoMessage}</p>
            )}
            <div className="mt-2.5 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Try WELCOME10"
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm uppercase tracking-wide outline-none focus:border-primary-400 focus:bg-white"
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={checking || !code.trim()}
                className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
              >
                {checking ? "…" : "Apply"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">Try: WELCOME10, SPICY15, THUAN20</p>
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-bold text-slate-900">Bill details</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Item total</dt><dd className="font-medium text-slate-800">{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Tax (5%)</dt><dd className="font-medium text-slate-800">{inr(tax)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Delivery fee</dt>
              <dd className="font-medium text-slate-800">
                {delivery === 0 ? <span className="font-semibold text-accent-600">FREE</span> : inr(delivery)}
              </dd>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-accent-600"><dt>Promo discount</dt><dd className="font-semibold">−{inr(promoDiscount)}</dd></div>
            )}
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-base">
              <dt className="font-bold text-slate-900">To pay</dt>
              <dd className="font-extrabold text-slate-900">{inr(total)}</dd>
            </div>
          </dl>
          {subtotal < settings.minOrderValue && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Add {inr(settings.minOrderValue - subtotal)} more to reach the minimum order of {inr(settings.minOrderValue)}.
            </p>
          )}
          {settings.freeDeliveryAbove > 0 && subtotal < settings.freeDeliveryAbove && (
            <p className="mt-2 rounded-xl bg-accent-50 px-3 py-2 text-xs font-medium text-accent-700">
              Add {inr(settings.freeDeliveryAbove - subtotal)} more for free delivery!
            </p>
          )}
          <Link
            href={settings.canOrder && subtotal >= settings.minOrderValue ? "/checkout" : "/menu"}
            className={`mt-4 block rounded-full py-3 text-center text-sm font-bold text-white transition-all ${
              settings.canOrder && subtotal >= settings.minOrderValue
                ? "bg-primary-500 shadow-md shadow-primary-500/25 hover:-translate-y-0.5 hover:bg-primary-600"
                : "cursor-not-allowed bg-slate-300"
            }`}
          >
            {settings.canOrder ? "Proceed to checkout →" : "Store is closed — check back soon"}
          </Link>
        </div>
      </div>
    </div>
  );
}
