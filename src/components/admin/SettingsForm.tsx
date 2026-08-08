"use client";

import { useActionState, useState } from "react";
import { updateSettingsAction, type AdminState } from "@/actions/admin";
import { SubmitButton } from "../SubmitButton";
import { DAY_NAMES_FULL, type DayHours } from "@/lib/store-status";

export default function SettingsForm({ settings }: { settings: Record<string, unknown> }) {
  const [state, action, pending] = useActionState(updateSettingsAction, {} as AdminState);
  const [hours, setHours] = useState<DayHours[]>(
    (settings.hours as DayHours[] | null) ?? Array.from({ length: 7 }, (_, day) => ({ day, open: "10:00", close: "21:30", closed: false }))
  );

  const setHour = (day: number, patch: Partial<DayHours>) => {
    setHours(hours.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="hours" value={JSON.stringify(hours)} />
      {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">{state.error}</p>}

      {/* Store status */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Store status</h2>
        <p className="mt-1 text-sm text-slate-500">Controls whether customers can place orders.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { value: "OPEN", label: "Open", desc: "Accept all orders", emoji: "🟢" },
            { value: "LIMITED", label: "Limited service", desc: "COD only", emoji: "🟡" },
            { value: "CLOSED", label: "Closed", desc: "Pause all orders", emoji: "🔴" },
          ].map((o) => (
            <label
              key={o.value}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                settings.storeStatus === o.value ? "border-primary-500 bg-primary-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input type="radio" name="storeStatus" value={o.value} defaultChecked={settings.storeStatus === o.value} className="sr-only" />
              <p className="text-sm font-bold text-slate-900">{o.emoji} {o.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{o.desc}</p>
            </label>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Emergency message (shown when closed)</span>
          <input
            name="emergencyMessage"
            defaultValue={(settings.emergencyMessage as string) ?? ""}
            placeholder="e.g. Closed today due to heavy rain — see you tomorrow!"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400"
          />
        </label>
      </section>

      {/* Hours */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Operating hours</h2>
        <p className="mt-1 text-sm text-slate-500">Orders are accepted only during these hours.</p>
        <div className="mt-4 space-y-2">
          {hours.map((h) => (
            <div key={h.day} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <span className="w-24 text-sm font-semibold text-slate-700">{DAY_NAMES_FULL[h.day]}</span>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={!h.closed} onChange={(e) => setHour(h.day, { closed: !e.target.checked })} className="h-4 w-4 accent-[#ff6b35]" />
                Open
              </label>
              {!h.closed && (
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={h.open}
                    onChange={(e) => setHour(h.day, { open: e.target.value })}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-primary-400"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="time"
                    value={h.close}
                    onChange={(e) => setHour(h.day, { close: e.target.value })}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-primary-400"
                  />
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Delivery */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Delivery</h2>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
          <input name="deliveryEnabled" type="checkbox" defaultChecked={settings.deliveryEnabled as boolean} className="h-4 w-4 accent-[#ff6b35]" />
          Delivery enabled
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Delivery fee (₹)</span>
            <input name="deliveryFee" type="number" step="0.01" min="0" defaultValue={settings.deliveryFee as number} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Free delivery above (₹)</span>
            <input name="freeDeliveryAbove" type="number" step="0.01" min="0" defaultValue={settings.freeDeliveryAbove as number} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Minimum order (₹)</span>
            <input name="minOrderValue" type="number" step="0.01" min="0" defaultValue={settings.minOrderValue as number} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400" />
          </label>
        </div>
      </section>

      {/* COD */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Cash on Delivery</h2>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
          <input name="codEnabled" type="checkbox" defaultChecked={settings.codEnabled as boolean} className="h-4 w-4 accent-[#ff6b35]" />
          Accept COD payments
        </label>
        <label className="mt-4 block max-w-xs">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Max COD order value (₹)</span>
          <input name="codMaxAmount" type="number" step="0.01" min="0" defaultValue={settings.codMaxAmount as number} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400" />
        </label>
      </section>

      {/* UPI */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">UPI payments</h2>
        <p className="mt-1 text-sm text-slate-500">Customers pay instantly to your UPI ID using GPay, PhonePe, Paytm or any UPI app.</p>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
          <input name="upiEnabled" type="checkbox" defaultChecked={settings.upiEnabled as boolean} className="h-4 w-4 accent-[#ff6b35]" />
          Accept UPI payments
        </label>
        <label className="mt-4 block max-w-sm">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">UPI ID (VPA)</span>
          <input
            name="upiId"
            defaultValue={(settings.upiId as string) ?? "kthuan781-1@okaxis"}
            placeholder="yourname@upi"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm outline-none focus:border-primary-400"
          />
          <span className="mt-1 block text-xs text-slate-400">Shown on the checkout QR code and payment screen.</span>
        </label>
      </section>

      <div className="flex gap-3">
        <SubmitButton pending={pending} className="bg-primary-500 px-8 hover:bg-primary-600" pendingText="Saving…">
          Save settings
        </SubmitButton>
        {state.ok && <span className="self-center text-sm font-semibold text-accent-600">✓ Saved</span>}
      </div>
    </form>
  );
}
