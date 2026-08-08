import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ItemForm from "@/components/admin/ItemForm";

export const metadata: Metadata = { title: "New Item", robots: { index: false } };

export default async function NewItemPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold text-slate-900">Add a new item</h1>
      <p className="mt-1 text-sm text-slate-500">It’ll appear on the customer menu right away.</p>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <ItemForm categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))} />
      </div>
    </div>
  );
}
