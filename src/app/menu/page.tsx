import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import MenuBrowser from "@/components/MenuBrowser";
import type { CategoryView, MenuItemView } from "@/lib/types";

export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [categories, items] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.menuItem.findMany({
      include: { category: true },
      orderBy: [{ isTrending: "desc" }, { ratingCount: "desc" }],
    }),
  ]);

  const categoryViews: CategoryView[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    emoji: c.emoji,
    sortOrder: c.sortOrder,
  }));

  const itemViews: MenuItemView[] = items.map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description,
    price: i.price,
    emoji: i.emoji,
    imageUrl: i.imageUrl,
    spiceLevel: i.spiceLevel,
    isVeg: i.isVeg,
    rating: i.rating,
    ratingCount: i.ratingCount,
    prepTime: i.prepTime,
    categoryName: i.category.name,
    categorySlug: i.category.slug,
    isAvailable: i.isAvailable,
    isTrending: i.isTrending,
  }));

  return (
    <div className="pb-12">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-extrabold text-white">Our Menu</h1>
          <p className="mt-1.5 text-primary-100">
            Fresh from our kitchen — customise spice, add-ons and more.
          </p>
        </div>
      </div>
      <MenuBrowser categories={categoryViews} items={itemViews} initialCat={cat} />
    </div>
  );
}
