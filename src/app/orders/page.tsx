import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import ReorderButton from "@/components/ReorderButton";
import { parseAddons } from "@/lib/orders";
import { formatDateTime, inr } from "@/lib/format";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true, review: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">My orders</h1>
      <p className="mt-1 text-sm text-slate-500">Track, reorder and review everything you’ve ordered.</p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <p className="text-5xl">📦</p>
          <p className="mt-3 font-semibold text-slate-700">No orders yet</p>
          <p className="mt-1 text-sm text-slate-500">Your Naga food adventure starts here.</p>
          <Link href="/menu" className="mt-5 inline-block rounded-full bg-primary-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-600">
            Order something delicious →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/orders/${order.id}`} className="font-bold text-slate-900 hover:text-primary-700">
                    Order #{order.orderNumber}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <p className="text-sm text-slate-600">
                  {order.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{inr(order.total)}</span>
                  {order.status === "DELIVERED" && order.review ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                      ★ {order.review.rating}/5 rated
                    </span>
                  ) : (
                    <ReorderButton
                      items={order.items.map((i) => ({
                        itemId: i.itemId,
                        name: i.name,
                        price: i.price,
                        addons: parseAddons(i.addons),
                      }))}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
