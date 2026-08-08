"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useState } from "react";

export default function ReorderButton({
  items,
}: {
  items: Array<{
    itemId: string | null;
    name: string;
    price: number;
    addons: Array<{ name: string; price: number }>;
  }>;
}) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const reorder = () => {
    for (const line of items) {
      if (!line.itemId) continue;
      addItem({
        itemId: line.itemId,
        name: line.name,
        emoji: null,
        unitPrice: line.price,
        prepTime: 15,
        addons: line.addons,
      });
    }
    setAdded(true);
    setTimeout(() => router.push("/cart"), 400);
  };

  return (
    <button
      type="button"
      onClick={reorder}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
        added ? "bg-accent-500 text-white" : "bg-primary-50 text-primary-700 hover:bg-primary-500 hover:text-white"
      }`}
    >
      {added ? "✓ Added to cart" : "↺ Reorder"}
    </button>
  );
}
