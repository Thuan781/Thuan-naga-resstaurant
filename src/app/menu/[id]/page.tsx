import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DishImage } from "@/components/DishImage";
import AddToCartPanel from "@/components/AddToCartPanel";
import { SpiceLevel, VegDot } from "@/components/badges";
import MenuItemCard from "@/components/MenuItemCard";
import { parseAddons } from "@/lib/orders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({ where: { id } });
  return { title: item?.name ?? "Dish" };
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({ where: { id }, include: { category: true } });
  if (!item) notFound();

  const related = await prisma.menuItem.findMany({
    where: { categoryId: item.categoryId, id: { not: item.id }, isAvailable: true },
    include: { category: true },
    take: 4,
  });

  const toView = (i: (typeof related)[number]) => ({
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
  });

  const tags = item.tags ? item.tags.split(",").filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/menu" className="hover:text-primary-600">Menu</Link>
        <span>/</span>
        <Link href={`/menu?cat=${item.category.slug}`} className="hover:text-primary-600">
          {item.category.name}
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-800">{item.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <DishImage
            imageUrl={item.imageUrl}
            emoji={item.emoji}
            priority
            className="aspect-square w-full rounded-3xl shadow-lg"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {item.isVeg && <span className="rounded-full bg-accent-50 px-3 py-1 font-semibold text-accent-700">Vegetarian</span>}
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">{item.category.name}</span>
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-3 py-1 font-medium">{t}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{item.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700 ring-1 ring-amber-200">
                  ★ {item.rating.toFixed(1)}
                  <span className="font-medium text-amber-600/70">({item.ratingCount} reviews)</span>
                </span>
                <SpiceLevel level={item.spiceLevel} />
                <VegDot isVeg={item.isVeg} />
              </div>
            </div>
          </div>

          <p className="mt-5 text-base leading-7 text-slate-600">{item.description}</p>

          <div className="mt-7">
            <AddToCartPanel
              itemId={item.id}
              name={item.name}
              emoji={item.emoji}
              imageUrl={item.imageUrl}
              basePrice={item.price}
              prepTime={item.prepTime}
              addons={parseAddons(item.addons)}
              unavailable={!item.isAvailable}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-accent-50 p-4 text-sm text-accent-800">
            <p className="font-semibold">🛵 Delivery info</p>
            <p className="mt-1 leading-6">
              Freshly prepared — expect <span className="font-bold">~{Math.max(25, item.prepTime + 20)} minutes</span>{" "}
              from order to doorstep. Free delivery on orders over ₹300.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-slate-900">More from {item.category.name}</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <MenuItemCard key={r.id} item={toView(r)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
