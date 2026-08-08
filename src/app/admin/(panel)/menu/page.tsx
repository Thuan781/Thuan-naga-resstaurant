import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SpiceLevel, VegDot } from "@/components/badges";
import CategoryForm from "@/components/admin/CategoryForm";
import { DeleteCategoryButton, DeleteItemButton, EditLink } from "@/components/admin/MenuRowActions";
import { inr } from "@/lib/format";

export const metadata: Metadata = { title: "Menu Management", robots: { index: false } };

export default async function AdminMenuPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { name: "asc" } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Menu management</h1>
          <p className="mt-1 text-sm text-slate-500">{categories.reduce((s, c) => s + c.items.length, 0)} dishes across {categories.length} categories</p>
        </div>
        <Link href="/admin/menu/new" className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600">
          + Add item
        </Link>
      </div>

      <div className="mt-6">
        <CategoryForm />
      </div>

      <div className="mt-6 space-y-8">
        {categories.map((cat) => (
          <section key={cat.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <span className="text-xl">{cat.emoji ?? "🍽️"}</span>
                {cat.name}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{cat.items.length}</span>
              </h2>
              <DeleteCategoryButton id={cat.id} name={cat.name} count={cat.items.length} />
            </header>
            {cat.items.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">No items yet in this category.</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {cat.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <span className="text-2xl">{item.emoji ?? "🍛"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-medium text-slate-800">
                        <span className="truncate">{item.name}</span>
                        <VegDot isVeg={item.isVeg} />
                      </p>
                      <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                        <SpiceLevel level={item.spiceLevel} />
                        <span>⏱️ {item.prepTime} min</span>
                        {item.isTrending && <span className="font-semibold text-amber-600">🔥 Trending</span>}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">{inr(item.price)}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.isAvailable ? "bg-accent-50 text-accent-700" : "bg-slate-100 text-slate-400"}`}>
                      {item.isAvailable ? "In stock" : "Sold out"}
                    </span>
                    <div className="flex items-center gap-1">
                      <EditLink href={`/admin/menu/${item.id}/edit`} />
                      <DeleteItemButton id={item.id} name={item.name} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
