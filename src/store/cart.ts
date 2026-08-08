"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { round2 } from "@/lib/format";

export interface CartAddon {
  name: string;
  price: number;
}

export interface CartItem {
  key: string;
  itemId: string;
  name: string;
  emoji: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  addons: CartAddon[];
  note?: string;
  prepTime?: number;
}

export interface CartState {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
  promoMessage: string | null;
  addItem: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  setNote: (key: string, note: string) => void;
  clear: () => void;
  setPromo: (code: string | null, discount: number, message?: string) => void;
}

const itemKey = (item: { itemId: string; addons: CartAddon[]; note?: string }) =>
  `${item.itemId}::${item.addons.map((a) => `${a.name}:${a.price}`).join("|")}::${item.note ?? ""}`;

export const lineTotal = (item: CartItem) =>
  round2((item.unitPrice + item.addons.reduce((s, a) => s + a.price, 0)) * item.quantity);

export const cartSubtotal = (items: CartItem[]) => round2(items.reduce((s, i) => s + lineTotal(i), 0));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      promoMessage: null,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const key = itemKey(item);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, key, quantity }],
          };
        }),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, quantity) } : i)),
        })),
      setNote: (key, note) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, note } : i)),
        })),
      clear: () => set({ items: [], promoCode: null, promoDiscount: 0, promoMessage: null }),
      setPromo: (code, discount, message) =>
        set({ promoCode: code, promoDiscount: discount, promoMessage: message ?? null }),
    }),
    { name: "thuannaga-cart" }
  )
);
