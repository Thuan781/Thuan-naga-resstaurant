"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useCart, cartSubtotal, lineTotal } from "@/store/cart";
import { placeOrderAction, type ActionState } from "@/actions/orders";
import { DishImage } from "./DishImage";
import { SubmitButton } from "./SubmitButton";
import { inr, round2 } from "@/lib/format";

export interface CheckoutAddress {
  id: string;
  label: string;
  fullAddress: string;
  phone: string | null;
  isDefault: boolean;
}

type PayMethod = "UPI" | "COD";

export default function CheckoutClient({
  user,
  addresses,
  settings,
  canOrder,
  storeMessage,
}: {
  user: { name: string; email: string; phone: string | null };
  addresses: CheckoutAddress[];
  settings: {
    deliveryFee: number;
    freeDeliveryAbove: number;
    minOrderValue: number;
    codMaxAmount: number;
    codEnabled: boolean;
    upiEnabled: boolean;
    upiId: string;
  };
  canOrder: boolean;
  storeMessage: string;
}) {
  const router = useRouter();
  const { items, promoCode, promoDiscount, clear } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null
  );
  const [newAddress, setNewAddress] = useState({ label: "", fullAddress: "", phone: "" });
  const [useNew, setUseNew] = useState(addresses.length === 0);
  const [instructions, setInstructions] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PayMethod | null>(settings.upiEnabled ? "UPI" : settings.codEnabled ? "COD" : null);
  const [upiRef, setUpiRef] = useState("");
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const subtotal = cartSubtotal(items);
  const tax = round2(subtotal * 0.05);
  const delivery = subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee;
  const total = round2(subtotal + tax + delivery - promoDiscount);
  const longestPrep = items.reduce((m, i) => Math.max(m, i.prepTime ?? 15), 0);
  const eta = Math.max(25, longestPrep + 20);

  const chosenAddress = addresses.find((a) => a.id === selectedAddress);
  const deliveryName = user.name;
  const deliveryPhone = useNew ? (newAddress.phone || user.phone || "") : (chosenAddress?.phone || user.phone || "");
  const deliveryAddress = useNew ? newAddress.fullAddress : (chosenAddress?.fullAddress ?? "");

  const codBlocked = !settings.codEnabled || total > settings.codMaxAmount;

  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: settings.upiId,
      pn: "Thuan Naga Restaurant",
      am: total.toFixed(2),
      cu: "INR",
      tn: "Order from Thuan Naga Restaurant",
    });
    return `upi://pay?${params.toString()}`;
  }, [settings.upiId, total]);

  useEffect(() => {
    if (paymentMethod !== "UPI") return;
    let alive = true;
    QRCode.toDataURL(upiLink, { width: 200, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } })
      .then((url) => alive && setQrDataUrl(url))
      .catch(() => alive && setQrDataUrl(null));
    return () => {
      alive = false;
    };
  }, [paymentMethod, upiLink]);

  const itemsJson = useMemo(
    () =>
      JSON.stringify(
        items.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
          addons: i.addons,
          note: i.note,
        }))
      ),
    [items]
  );

  const [state, action, pending] = useActionState(placeOrderAction, {} as ActionState);

  useEffect(() => {
    if (state.ok && state.orderId) {
      clear();
      router.push(`/orders/${state.orderId}?placed=1`);
    }
  }, [state.ok, state.orderId, router, clear]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-6xl">🧾</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Nothing to checkout</h1>
        <p className="mt-2 text-slate-500">Your cart is empty.</p>
        <Link href="/menu" className="mt-6 inline-block rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white">
          Browse the menu →
        </Link>
      </div>
    );
  }

  const canSubmit =
    paymentMethod === "COD" || (paymentMethod === "UPI" && upiRef.trim().length >= 6 && upiConfirmed);

  return (
    <form action={action} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <input type="hidden" name="items" value={itemsJson} />
      <input type="hidden" name="paymentMethod" value={paymentMethod ?? ""} />
      {paymentMethod === "UPI" && <input type="hidden" name="paymentRef" value={upiRef.trim()} />}
      {promoCode && <input type="hidden" name="promoCode" value={promoCode} />}

      <h1 className="text-2xl font-extrabold text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">Estimated delivery: <span className="font-semibold text-slate-700">~{eta} minutes</span></p>

      {state.error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      {!canOrder && (
        <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
          🕒 {storeMessage} Your order can’t be placed right now.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Delivery address */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Deliver to</h2>
            {addresses.length > 0 && (
              <div className="mt-3 space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                      !useNew && selectedAddress === a.id
                        ? "border-primary-400 bg-primary-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressChoice"
                      checked={!useNew && selectedAddress === a.id}
                      onChange={() => {
                        setUseNew(false);
                        setSelectedAddress(a.id);
                      }}
                      className="mt-1 h-4 w-4 accent-[#ff6b35]"
                    />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        {a.label}
                        {a.isDefault && (
                          <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700">DEFAULT</span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-slate-500">{a.fullAddress}</span>
                      {a.phone && <span className="mt-0.5 block text-xs text-slate-400">{a.phone}</span>}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <label className={`mt-3 flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${useNew ? "border-primary-400 bg-primary-50" : "border-slate-200"}`}>
              <input
                type="radio"
                name="addressChoice"
                checked={useNew}
                onChange={() => setUseNew(true)}
                className="h-4 w-4 accent-[#ff6b35]"
              />
              <span className="text-sm font-semibold text-slate-800">Use a new address</span>
            </label>

            {useNew && (
              <div className="mt-3 space-y-3 border-t border-slate-100 pt-4">
                <input
                  name="newLabel"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  placeholder="Label (Home / Office)"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-primary-400 focus:bg-white"
                />
                <textarea
                  name="newFullAddress"
                  value={newAddress.fullAddress}
                  onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                  placeholder="House, street, landmark, town…"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:bg-white"
                />
                <input
                  name="newPhone"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="Phone for delivery (optional)"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-primary-400 focus:bg-white"
                />
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Delivery name</label>
                <input
                  name="deliveryName"
                  defaultValue={deliveryName}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Delivery phone</label>
                <input
                  name="deliveryPhone"
                  defaultValue={deliveryPhone}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full address</label>
              <textarea
                name="deliveryAddress"
                defaultValue={deliveryAddress}
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-400"
              />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Payment method</h2>
            <p className="mt-1 text-xs text-slate-500">
              Choose UPI or Cash on Delivery — an order can only be placed once a payment method is selected.
            </p>
            <div className="mt-3 space-y-2">
              {/* UPI */}
              {settings.upiEnabled && (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                    paymentMethod === "UPI" ? "border-primary-400 bg-primary-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                    className="mt-1 h-4 w-4 accent-[#ff6b35]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      📱 UPI (GPay · PhonePe · Paytm)
                      {paymentMethod === "UPI" && (
                        <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700">SELECTED</span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">Pay instantly with any UPI app</span>
                  </span>
                </label>
              )}

              {paymentMethod === "UPI" && (
                <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50/70 to-accent-50/40 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                      {qrDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qrDataUrl} alt={`Scan to pay ${settings.upiId} via UPI`} width={168} height={168} className="h-40 w-40" />
                      ) : (
                        <div className="flex h-40 w-40 items-center justify-center text-xs text-slate-400">Generating QR…</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-sm text-slate-700">
                        Scan with any UPI app and pay{" "}
                        <span className="font-extrabold text-slate-900">{inr(total)}</span>
                      </p>
                      <p className="rounded-lg bg-white/70 px-3 py-2 text-sm ring-1 ring-slate-200">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">UPI ID</span>
                        <span className="font-mono font-semibold text-slate-900">{settings.upiId}</span>
                      </p>
                      <a
                        href={upiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700"
                      >
                        Open UPI app ↗
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 border-t border-primary-100 pt-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                        UPI transaction reference / UTR <span className="text-red-500">*</span>
                      </span>
                      <input
                        value={upiRef}
                        onChange={(e) => setUpiRef(e.target.value)}
                        placeholder="e.g. 412345678901 (shown in your UPI app after paying)"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400"
                      />
                    </label>
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={upiConfirmed}
                        onChange={(e) => setUpiConfirmed(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[#ff6b35]"
                      />
                      <span>
                        I confirm I have paid <span className="font-bold">{inr(total)}</span> via UPI to{" "}
                        <span className="font-mono font-semibold">{settings.upiId}</span>.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* COD */}
              {settings.codEnabled && (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                    codBlocked
                      ? "cursor-not-allowed border-slate-100 opacity-50"
                      : paymentMethod === "COD"
                        ? "border-primary-400 bg-primary-50"
                        : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={paymentMethod === "COD"}
                    disabled={codBlocked}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 h-4 w-4 accent-[#ff6b35]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      💵 Cash on Delivery
                      {paymentMethod === "COD" && (
                        <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700">SELECTED</span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {codBlocked
                        ? total > settings.codMaxAmount
                          ? `Not available for orders above ${inr(settings.codMaxAmount)}`
                          : "Currently unavailable"
                        : "Pay when your food arrives"}
                    </span>
                  </span>
                </label>
              )}
            </div>
          </section>

          {/* Instructions */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Special instructions <span className="font-normal text-slate-400">(optional)</span></h2>
            <textarea
              name="specialInstructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Anything the kitchen should know?"
              rows={2}
              maxLength={500}
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:bg-white"
            />
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Order summary</h2>
            <ul className="mt-3 space-y-3">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <DishImage imageUrl={i.imageUrl} emoji={i.emoji} className="h-12 w-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {i.name} <span className="text-slate-400">× {i.quantity}</span>
                    </p>
                    {i.addons.length > 0 && (
                      <p className="truncate text-xs text-slate-500">+ {i.addons.map((a) => a.name).join(", ")}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{inr(lineTotal(i))}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Item total</dt><dd className="font-medium">{inr(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Tax (5%)</dt><dd className="font-medium">{inr(tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Delivery fee</dt><dd className="font-medium">{delivery === 0 ? <span className="font-semibold text-accent-600">FREE</span> : inr(delivery)}</dd></div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-accent-600"><dt>{promoCode} discount</dt><dd className="font-semibold">−{inr(promoDiscount)}</dd></div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base"><dt className="font-bold">Total</dt><dd className="font-extrabold">{inr(total)}</dd></div>
            </dl>
          </div>

          {!paymentMethod && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
              ⚠️ Please choose a payment method (UPI or Cash on Delivery) to place your order.
            </p>
          )}
          {paymentMethod === "UPI" && !canSubmit && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
              ⚠️ Enter your UPI transaction reference and confirm your payment to place the order.
            </p>
          )}

          <SubmitButton
            pending={pending}
            disabled={!canSubmit}
            className="w-full bg-primary-500 py-3.5 hover:bg-primary-600 disabled:bg-slate-300"
            pendingText="Placing your order…"
          >
            {paymentMethod === "UPI" ? `Place order · ${inr(total)}` : `Place order · ${inr(total)}`}
          </SubmitButton>
          <p className="text-center text-xs text-slate-400">
            {paymentMethod === "UPI"
              ? `Pay ${inr(total)} now via UPI — your order is confirmed once payment is made.`
              : `Pay ${inr(total)} in cash when your food arrives.`}
          </p>
        </div>
      </div>
    </form>
  );
}
