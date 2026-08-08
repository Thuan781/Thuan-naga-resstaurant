"use client";

import { useActionState, useState } from "react";
import { saveMenuItemAction, type AdminState } from "@/actions/admin";
import { SubmitButton } from "../SubmitButton";

interface AddonRow {
  name: string;
  price: string;
}

export default function ItemForm({
  categories,
  item,
}: {
  categories: Array<{ id: string; name: string; emoji: string | null }>;
  item?: {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    emoji: string | null;
    imageUrl: string | null;
    prepTime: number;
    spiceLevel: number;
    isVeg: boolean;
    isAvailable: boolean;
    isTrending: boolean;
    tags: string;
    addons: Array<{ name: string; price: number }>;
  };
}) {
  const [state, action, pending] = useActionState(saveMenuItemAction, {} as AdminState);
  const [addons, setAddons] = useState<AddonRow[]>(
    item ? item.addons.map((a) => ({ name: a.name, price: String(a.price) })) : []
  );

  const inputCls = (error?: boolean) =>
    `h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition-all focus:ring-2 ${
      error ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
    }`;

  const fe = state.fieldErrors;

  return (
    <form action={action} className="space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="addons" value={JSON.stringify(addons.filter((a) => a.name.trim()).map((a) => ({ name: a.name.trim(), price: Number(a.price) || 0 })))} />

      {state.error && !fe && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">{state.error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Name</span>
          <input name="name" defaultValue={item?.name} placeholder="e.g. Smoked Pork with Bamboo Shoot" className={inputCls(!!fe?.name)} />
          {fe?.name && <span className="mt-1 block text-xs text-red-600">{fe.name}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Category</span>
          <select name="categoryId" defaultValue={item?.categoryId ?? categories[0]?.id} className={inputCls(!!fe?.categoryId)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Description</span>
        <textarea
          name="description"
          defaultValue={item?.description}
          rows={2}
          placeholder="What makes this dish special?"
          className={`w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 ${fe?.description ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"}`}
        />
        {fe?.description && <span className="mt-1 block text-xs text-red-600">{fe.description}</span>}
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Price (₹)</span>
          <input name="price" type="number" step="0.01" min="0" defaultValue={item?.price} className={inputCls(!!fe?.price)} />
          {fe?.price && <span className="mt-1 block text-xs text-red-600">{fe.price}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Prep time (min)</span>
          <input name="prepTime" type="number" min="1" max="180" defaultValue={item?.prepTime ?? 15} className={inputCls()} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Spice level</span>
          <select name="spiceLevel" defaultValue={item?.spiceLevel ?? 0} className={inputCls()}>
            <option value="0">🌱 Mild (0)</option>
            <option value="1">🌶️ Mild (1)</option>
            <option value="2">🌶️🌶️ Spicy (2)</option>
            <option value="3">🌶️🌶️🌶️ Extra hot (3)</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Emoji (art)</span>
          <input name="emoji" defaultValue={item?.emoji ?? "🍛"} maxLength={8} className={inputCls()} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Image URL (optional)</span>
          <input name="imageUrl" defaultValue={item?.imageUrl ?? ""} placeholder="https://…" className={inputCls(!!fe?.imageUrl)} />
          {fe?.imageUrl && <span className="mt-1 block text-xs text-red-600">{fe.imageUrl}</span>}
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Tags <span className="font-normal text-slate-400">(comma separated)</span></span>
        <input name="tags" defaultValue={item?.tags} placeholder="vegan, gluten-free, seasonal" className={inputCls()} />
      </label>

      {/* Addons */}
      <div>
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Add-ons</span>
        <div className="space-y-2">
          {addons.map((a, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={a.name}
                onChange={(e) => setAddons(addons.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                placeholder="Add-on name (e.g. Extra chilli)"
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-primary-400"
              />
              <input
                value={a.price}
                onChange={(e) => setAddons(addons.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))}
                type="number"
                min="0"
                placeholder="₹"
                className="h-10 w-24 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-primary-400"
              />
              <button
                type="button"
                onClick={() => setAddons(addons.filter((_, j) => j !== i))}
                className="h-10 w-10 shrink-0 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Remove add-on"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAddons([...addons, { name: "", price: "" }])}
          className="mt-2 rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-primary-400 hover:text-primary-600"
        >
          + Add add-on
        </button>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-4 rounded-xl bg-slate-50 p-4">
        {[
          { name: "isAvailable", label: "Available", default: item?.isAvailable ?? true },
          { name: "isVeg", label: "Vegetarian", default: item?.isVeg ?? false },
          { name: "isTrending", label: "Trending", default: item?.isTrending ?? false },
        ].map((f) => (
          <label key={f.name} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input name={f.name} type="checkbox" defaultChecked={f.default} className="h-4 w-4 accent-[#ff6b35]" />
            {f.label}
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <SubmitButton pending={pending} className="bg-primary-500 hover:bg-primary-600">
          {item ? "Save changes" : "Create item"}
        </SubmitButton>
        <a href="/admin/menu" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Cancel
        </a>
      </div>
    </form>
  );
}
