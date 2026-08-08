import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, inr } from "@/lib/format";
import { STATUS_META, type OrderStatusValue } from "@/lib/order-status";

export const metadata: Metadata = { title: "Orders", robots: { index: false } };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status && status in STATUS_META ? (status as OrderStatusValue) : null;

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : undefined,
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
  const countMap = new Map(counts.map((g) => [g.status, g._count._all]));
  const total = counts.reduce((s, g) => s + g._count._all, 0);

  const chips: Array<{ key: OrderStatusValue | null; label: string }> = [
    { key: null, label: `All (${total})` },
    ...(Object.keys(STATUS_META) as OrderStatusValue[]).map((s) => ({
      key: s,
      label: `${STATUS_META[s].short} (${countMap.get(s) ?? 0})`,
    })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Orders</h1>
      <p className="mt-1 text-sm text-slate-500">Manage and update every order in real time.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <Link
            key={c.key ?? "all"}
            href={c.key ? `/admin/orders?status=${c.key}` : "/admin/orders"}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === c.key ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {orders.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-slate-400">No orders here yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold">Payment</th>
                  <th className="px-3 py-3 font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/orders/${o.id}`} className="font-bold text-primary-700 hover:underline">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700">{o.user.name}</td>
                    <td className="px-3 py-3.5 text-slate-500">{o.items.length}</td>
                    <td className="px-3 py-3.5">
                      <span className="text-slate-600">{o.paymentMethod === "UPI" ? "📱 UPI" : "💵 COD"}</span>
                      <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${o.paymentStatus === "PAID" ? "bg-accent-50 text-accent-700" : "bg-amber-50 text-amber-700"}`}>
                        {o.paymentStatus === "PAID" ? "PAID" : o.paymentMethod === "UPI" ? "UNVERIFIED" : "DUE"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-slate-900">{inr(o.total)}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
