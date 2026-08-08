import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ItemForm from "@/components/admin/ItemForm";
import { parseAddons } from "@/lib/orders";

export const metadata: Metadata = { title: "Edit Item", robots: { index: false } };

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, categories] = await Promise.all([
    prisma.menuItem.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold text-slate-900">Edit item</h1>
      <p className="mt-1 text-sm text-slate-500">{item.name}</p>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <ItemForm
          categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))}
          item={{
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            categoryId: item.categoryId,
            emoji: item.emoji,
            imageUrl: item.imageUrl,
            prepTime: item.prepTime,
            spiceLevel: item.spiceLevel,
            isVeg: item.isVeg,
            isAvailable: item.isAvailable,
            isTrending: item.isTrending,
            tags: item.tags,
            addons: parseAddons(item.addons),
          }}
        />
      </div>
    </div>
  );
}
