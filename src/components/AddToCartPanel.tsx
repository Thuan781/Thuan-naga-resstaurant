"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartAddon } from "@/store/cart";
import { QuantityStepper } from "./QuantityStepper";
import { inr, round2 } from "@/lib/format";

export default function AddToCartPanel({
  itemId,
  name,
  emoji,
  imageUrl,
  basePrice,
  prepTime,
  addons,
  unavailable,
}: {
  itemId: string;
  name: string;
  emoji: string | null;
  imageUrl?: string | null;
  basePrice: number;
  prepTime: number;
  addons: CartAddon[];
  unavailable?: boolean;
}) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const chosenAddons = addons.filter((a) => selected.has(a.name));
  const addonTotal = chosenAddons.reduce((s, a) => s + a.price, 0);
  const lineTotal = round2((basePrice + addonTotal) * qty);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAdd = (goToCart: boolean) => {
    addItem(
      {
        itemId,
        name,
        emoji,
        imageUrl,
        unitPrice: basePrice,
        prepTime,
        addons: chosenAddons,
        note: note.trim() || undefined,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
    if (goToCart) router.push("/cart");
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-slate-900">{inr(basePrice)}</span>
        {prepTime > 0 && <span className="text-xs text-slate-500">⏱️ ~{prepTime} min prep</span>}
      </div>

      {addons.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-800">Add-ons</p>
          <div className="mt-2 space-y-2">
            {addons.map((a) => (
              <label
                key={a.name}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm transition-colors has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50"
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(a.name)}
                    onChange={() => toggle(a.name)}
                    className="h-4 w-4 accent-[#ff6b35]"
                  />
                  <span className="font-medium text-slate-700">{a.name}</span>
                </span>
                <span className="font-semibold text-slate-800">+{inr(a.price)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-800">Quantity</p>
        <div className="mt-2">
          <QuantityStepper quantity={qty} onChange={setQty} />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-800">Special instructions</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. less oil, extra gravy…"
          rows={2}
          maxLength={200}
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {unavailable ? (
        <div className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">
          Currently unavailable
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleAdd(false)}
            className={`rounded-full py-3 text-sm font-bold transition-all ${
              added
                ? "bg-accent-500 text-white"
                : "bg-primary-500 text-white shadow-md shadow-primary-500/25 hover:-translate-y-0.5 hover:bg-primary-600"
            }`}
          >
            {added ? "✓ Added to cart" : `Add to cart · ${inr(lineTotal)}`}
          </button>
          <button
            type="button"
            onClick={() => handleAdd(true)}
            className="rounded-full border border-primary-300 py-3 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-50"
          >
            Add & checkout →
          </button>
        </div>
      )}
    </div>
  );
}
