import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import MenuItemCard from "@/components/MenuItemCard";
import { DishImage } from "@/components/DishImage";
import GreetingRobot from "@/components/GreetingRobotMount";
import type { MenuItemView } from "@/lib/types";

type MenuItemWithCategory = Prisma.MenuItemGetPayload<{ include: { category: true } }>;

function toView(item: MenuItemWithCategory): MenuItemView {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    emoji: item.emoji,
    imageUrl: item.imageUrl,
    spiceLevel: item.spiceLevel,
    isVeg: item.isVeg,
    rating: item.rating,
    ratingCount: item.ratingCount,
    prepTime: item.prepTime,
    categoryName: item.category.name,
    categorySlug: item.category.slug,
    isAvailable: item.isAvailable,
    isTrending: item.isTrending,
  };
}

export default async function HomePage() {
  const [categories, trending, featured] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { items: true } },
        items: {
          where: { isAvailable: true },
          orderBy: { ratingCount: "desc" },
          take: 1,
          select: { imageUrl: true, emoji: true },
        },
      },
    }),
    prisma.menuItem.findMany({
      where: { isTrending: true, isAvailable: true },
      include: { category: true },
      orderBy: { rating: "desc" },
      take: 8,
    }),
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true },
      orderBy: { ratingCount: "desc" },
      take: 3,
    }),
  ]);

  const featuredViews = featured.map(toView);

  return (
    <div>
      {/* Hero — dark neon */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* neon ambient blobs */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
        {/* subtle grid + vignette */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.9))]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-crimson/60 bg-crimson/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-red-200">
              🌶️ AUTHENTIC NAGA CUISINE · TAMENGLONG, MANIPUR
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Real Naga flavours,
              <span className="mt-1 block font-script text-6xl font-normal leading-[1.2] sm:text-7xl lg:text-8xl">
                <span className="neon-orange">delivered hot</span>
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
              Smoked pork with bamboo shoot, king chilli chicken, axone delicacies — cooked fresh
              in our kitchen and delivered across Tamenglong.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/menu"
                className="neon-btn rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5"
              >
                Order now
              </Link>
              <Link
                href="/menu"
                className="rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:text-primary-300"
              >
                Browse the menu
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-2 text-sm text-slate-300">
              <span className="neon-green">💵 Cash on Delivery</span>
              <span className="neon-gold">🛵 Free delivery over ₹300</span>
              <span className="neon-orange">⏱️ Avg. prep ~25 min</span>
            </div>

            {/* 3D greeting robot */}
            <div className="mt-8">
              <GreetingRobot />
            </div>
          </div>

          {/* 3D showcase: logo + neon dishes */}
          <div className="tilt-scene relative hidden lg:block" style={{ perspective: "1200px" }}>
            <div className="relative grid grid-cols-3 items-center gap-5">
              {featuredViews.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/menu/${item.id}`}
                  className={`group ${i === 1 ? "z-10 -my-4 scale-110" : i === 0 ? "translate-y-8" : "-translate-y-8"}`}
                  style={{ animationDelay: `${i * 140}ms` }}
                >
                  <div className="tilt-card animate-fade-up rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
                    <DishImage
                      imageUrl={item.imageUrl}
                      emoji={item.emoji}
                      float={i === 1}
                      priority={i === 1}
                      className="aspect-square w-full rounded-2xl"
                    />
                    <p className="mt-2 line-clamp-1 text-center text-xs font-semibold text-slate-100">{item.name}</p>
                    <p className="text-center text-xs font-bold neon-orange">₹{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* the logo as the neon centrepiece */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-56 w-56 items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-0 animate-glow-spin rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, rgba(255,107,53,.9), rgba(46,206,118,.9), rgba(255,215,0,.9), transparent)",
                    filter: "blur(10px)",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-4 rounded-full border border-white/25"
                  style={{ boxShadow: "0 0 40px rgba(255,107,53,.45), inset 0 0 30px rgba(255,215,0,.25)" }}
                />
                <Image
                  src="/logo.png"
                  alt="Thuan Naga logo"
                  width={1254}
                  height={1254}
                  priority
                  className="relative h-40 w-40 animate-float rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">What are you craving?</h2>
            <p className="mt-1 text-sm text-slate-500">Browse by category</p>
          </div>
          <Link href="/menu" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Full menu →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const cover = c.items[0];
            return (
              <Link
                key={c.id}
                href={`/menu?cat=${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
              >
                <span className="relative block h-20 w-20 overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-transform duration-300 group-hover:scale-105">
                  {cover?.imageUrl ? (
                    <DishImage imageUrl={cover.imageUrl} emoji={cover.emoji} className="h-full w-full" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 text-3xl">
                      {c.emoji ?? "🍽️"}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                <span className="text-xs text-slate-400">{c._count.items} dishes</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section className="bg-gradient-to-b from-white to-orange-50/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">🔥 Trending in Tamenglong</h2>
              <p className="mt-1 text-sm text-slate-500">What everyone is ordering right now</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((item) => (
              <MenuItemCard key={item.id} item={toView(item)} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">Ordering is this easy</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { emoji: "🍽️", title: "Pick your dishes", text: "Browse the menu and add your favourites — customise spice and add-ons." },
            { emoji: "🛵", title: "We cook & deliver", text: "The kitchen starts as soon as you order. Track your order in real time." },
            { emoji: "💵", title: "Pay on delivery", text: "Pay with cash when your food arrives. No cards, no hassle." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-2xl text-white shadow-md">
                {s.emoji}
              </span>
              <p className="mt-4 font-semibold text-slate-900">
                <span className="mr-1.5 text-primary-500">{i + 1}.</span>
                {s.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — neon */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="neon-ring relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary-600/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-accent-500/30 blur-3xl" />
          <p className="relative font-script text-4xl text-gold">Craving something bold?</p>
          <h2 className="neon-orange relative mt-2 text-4xl font-extrabold sm:text-5xl">
            Order your favourite tonight
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
            From smoked pork to bhut jolokia chicken — your next favourite meal is minutes away.
          </p>
          <Link
            href="/menu"
            className="neon-btn relative mt-8 inline-block rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-9 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5"
          >
            Start your order →
          </Link>
        </div>
      </section>
    </div>
  );
}
