import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreStatus } from "@/lib/store-status";
import { StatusBadge } from "@/components/StatusBadge";
import { inr, formatTimeAgo } from "@/lib/format";
import { STATUS_META, type OrderStatusValue } from "@/lib/order-status";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = new Date(startOfDay.getTime() - 7 * 86_400_000);

  const [settings, todayOrders, statusGroups, recentOrders, topItems, paymentGroups] =
    await Promise.all([
      prisma.restaurantSettings.findFirst(),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfDay } },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.orderItem.groupBy({
        by: ["itemId", "name"],
        where: { itemId: { not: null }, order: { createdAt: { gte: weekAgo }, status: { not: "CANCELLED" } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: { createdAt: { gte: startOfDay }, status: { not: "CANCELLED" } },
        _count: { _all: true },
      }),
    ]);

  const revenue = todayOrders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const active = todayOrders.filter((o) => o.status !== "CANCELLED" && o.status !== "DELIVERED").length;
  const avg = todayOrders.filter((o) => o.status !== "CANCELLED").length
    ? revenue / todayOrders.filter((o) => o.status !== "CANCELLED").length
    : 0;

  const statusCounts = new Map(statusGroups.map((g) => [g.status, g._count._all]));
  const storeStatus = getStoreStatus(settings ?? { storeStatus: "OPEN", hours: "[]", deliveryEnabled: true });

  const statCards = [
    { label: "Today's orders", value: String(todayOrders.length), icon: "🧾", tint: "bg-primary-50 text-primary-700" },
    { label: "Today's revenue", value: inr(revenue), icon: "💰", tint: "bg-accent-50 text-accent-700" },
    { label: "Avg order value", value: inr(avg), icon: "📈", tint: "bg-sky-50 text-sky-700" },
    { label: "Active orders", value: String(active), icon: "🔥", tint: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${
            storeStatus.canOrder ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-600 ring-red-200"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${storeStatus.canOrder ? "bg-emerald-500" : "bg-red-500"} ${storeStatus.canOrder ? "animate-pulse" : ""}`} />
          {storeStatus.label}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${c.tint}`}>{c.icon}</span>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2.5 pr-4 font-semibold">Order</th>
                  <th className="pb-2.5 pr-4 font-semibold">Customer</th>
                  <th className="pb-2.5 pr-4 font-semibold">Total</th>
                  <th className="pb-2.5 pr-4 font-semibold">Status</th>
                  <th className="pb-2.5 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-primary-700 hover:underline">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{o.user.name}</td>
                    <td className="py-3 pr-4 font-medium">{inr(o.total)}</td>
                    <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3 text-slate-500">{formatTimeAgo(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          {/* Status distribution */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Today by status</h2>
            <ul className="mt-3 space-y-2.5">
              {(Object.keys(STATUS_META) as OrderStatusValue[]).map((s) => {
                const count = statusCounts.get(s) ?? 0;
                const meta = STATUS_META[s];
                return (
                  <li key={s} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                      {meta.short}
                    </span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Top items */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Top items · 7 days</h2>
            <ol className="mt-3 space-y-2.5">
              {topItems.map((t, i) => (
                <li key={t.itemId} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-gold text-slate-900" : "bg-slate-100 text-slate-600"}`}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{t.name}</span>
                  <span className="shrink-0 font-bold text-slate-900">{t._sum.quantity ?? 0}×</span>
                </li>
              ))}
              {topItems.length === 0 && <li className="text-sm text-slate-400">No orders this week yet.</li>}
            </ol>
          </section>

          {/* Payment split */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Payments today</h2>
            <ul className="mt-3 space-y-2.5">
              {paymentGroups.map((g) => (
                <li key={g.paymentMethod} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">💵 {g.paymentMethod}</span>
                  <span className="font-bold text-slate-900">{g._count._all}</span>
                </li>
              ))}
              {paymentGroups.length === 0 && <li className="text-sm text-slate-400">No payments yet.</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
