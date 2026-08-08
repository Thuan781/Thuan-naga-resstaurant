"use client";

import { useMemo, useState } from "react";
import MenuItemCard from "./MenuItemCard";
import type { CategoryView, MenuItemView } from "@/lib/types";

type SortKey = "popular" | "price-asc" | "price-desc" | "rating";

export default function MenuBrowser({
  categories,
  items,
  initialCat,
}: {
  categories: CategoryView[];
  items: MenuItemView[];
  initialCat?: string;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(initialCat ?? "all");
  const [vegOnly, setVegOnly] = useState(false);
  const [maxSpice, setMaxSpice] = useState(3);
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    let list = items.filter((i) => i.isAvailable);
    if (cat !== "all") list = list.filter((i) => i.categorySlug === cat);
    if (vegOnly) list = list.filter((i) => i.isVeg);
    list = list.filter((i) => i.spiceLevel <= maxSpice);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => b.ratingCount - a.ratingCount);
    }
    return list;
  }, [items, cat, vegOnly, maxSpice, query, sort]);

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes, ingredients…"
                className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary-400"
            >
              <option value="popular">Most popular</option>
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
            </select>
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} className="h-4 w-4 accent-[#14b55e]" />
              Veg only
            </label>
            <label className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600">
              Max spice
              <span className="flex items-center gap-1">
                {[1, 2, 3].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setMaxSpice(l)}
                    className={`text-base ${l <= maxSpice ? "" : "opacity-25 grayscale"}`}
                    aria-label={`Max spice level ${l}`}
                  >
                    🌶️
                  </button>
                ))}
                <button type="button" onClick={() => setMaxSpice(0)} className="text-[11px] font-semibold text-slate-400 hover:text-slate-600">
                  any
                </button>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCat("all")}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              cat === "all" ? "bg-primary-500 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            All dishes
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                cat === c.slug ? "bg-primary-500 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <p className="text-4xl">🍽️</p>
            <p className="mt-3 font-semibold text-slate-700">No dishes match your filters</p>
            <p className="mt-1 text-sm text-slate-500">Try widening your spice tolerance or clearing the search.</p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{filtered.length}</span> {filtered.length === 1 ? "dish" : "dishes"}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
