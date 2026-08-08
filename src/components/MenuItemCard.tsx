"use client";

import Link from "next/link";
import { useState } from "react";
import { DishImage } from "./DishImage";
import { SpiceLevel, VegDot } from "./badges";
import { useCart } from "@/store/cart";
import { inr } from "@/lib/format";
import type { MenuItemView } from "@/lib/types";

export default function MenuItemCard({ item }: { item: MenuItemView }) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      itemId: item.id,
      name: item.name,
      emoji: item.emoji,
      imageUrl: item.imageUrl,
      unitPrice: item.price,
      prepTime: item.prepTime,
      addons: [],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div className="tilt-card group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <Link href={`/menu/${item.id}`} className="block">
        <div className="relative">
          <DishImage
            imageUrl={item.imageUrl}
            emoji={item.emoji}
            className="h-40 w-full transition-transform duration-500 group-hover:scale-105"
          />
          {item.isVeg !== undefined && (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur">
              <VegDot isVeg={item.isVeg} />
            </span>
          )}
          {item.isTrending && (
            <span className="absolute right-3 top-3 rounded-full bg-gold px-2 py-1 text-[11px] font-bold text-slate-900 shadow-sm">
              🔥 Trending
            </span>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                Sold out
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-primary-700">
              {item.name}
            </h3>
          </div>
          <p className="line-clamp-2 text-sm leading-5 text-slate-500">{item.description}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-medium text-amber-600">
              ★ {item.rating.toFixed(1)}
              <span className="font-normal text-slate-400">({item.ratingCount})</span>
            </span>
            <SpiceLevel level={item.spiceLevel} />
          </div>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <span className="text-base font-bold text-slate-900">{inr(item.price)}</span>
        {item.isAvailable && (
          <button
            type="button"
            onClick={handleAdd}
            className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              added
                ? "bg-accent-500 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-500 hover:text-white"
            }`}
          >
            {added ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Added
              </>
            ) : (
              <>Add +</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
