import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import OrderControls from "@/components/admin/OrderControls";
import { orderLineAmount, parseAddons } from "@/lib/orders";
import { formatDateTime, inr } from "@/lib/format";

export const metadata: Metadata = { title: "Order Detail", robots: { index: false } };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true, review: true },
  });
  if (!order) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm font-semibold text-slate-500 hover:text-primary-600">← All orders</Link>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">Placed {formatDateTime(order.createdAt)} by {order.user.name} ({order.user.email})</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.cancelReason && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          Cancellation reason: {order.cancelReason}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Progress</h2>
            <div className="mt-4">
              <OrderStatusTimeline history={order.statusHistory} status={order.status} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Items</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {order.items.map((item) => {
                const addons = parseAddons(item.addons);
                return (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{item.name} <span className="text-slate-400">× {item.quantity}</span></p>
                      {addons.length > 0 && <p className="mt-0.5 text-xs text-slate-500">+ {addons.map((a) => `${a.name} (${inr(a.price)})`).join(", ")}</p>}
                      {item.note && <p className="mt-0.5 text-xs italic text-slate-400">“{item.note}”</p>}
                    </div>
                    <span className="font-semibold">{inr(orderLineAmount(item))}</span>
                  </li>
                );
              })}
            </ul>
            {order.specialInstructions && (
              <div className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
                📝 <span className="font-semibold">Kitchen note:</span> {order.specialInstructions}
              </div>
            )}
          </section>

          {order.review && (
            <section className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
              <h2 className="font-bold text-amber-800">Customer review</h2>
              <p className="mt-1 text-xl">{"⭐".repeat(order.review.rating)}</p>
              {order.review.comment && <p className="mt-2 text-sm leading-6 text-amber-900">{order.review.comment}</p>}
              <p className="mt-2 text-xs text-amber-700">{formatDateTime(order.review.createdAt)}</p>
            </section>
          )}
        </div>

        <div className="h-fit space-y-4 lg:sticky lg:top-8">
          <OrderControls orderId={order.id} status={order.status} />

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Delivery</h2>
            <p className="mt-2 text-sm font-semibold text-slate-800">{order.deliveryName}</p>
            <p className="text-sm text-slate-500">{order.deliveryPhone}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{order.deliveryAddress}</p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Payment</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd className="font-medium">{order.paymentMethod === "UPI" ? "📱 UPI" : "💵 COD"}</dd></div>
              {order.paymentMethod === "UPI" && order.paymentRef && (
                <div className="flex justify-between"><dt className="text-slate-500">UPI ref</dt><dd className="font-mono text-xs font-medium text-slate-700">{order.paymentRef}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${order.paymentStatus === "PAID" ? "bg-accent-50 text-accent-700" : "bg-amber-50 text-amber-700"}`}>{order.paymentStatus === "PAID" ? "Paid" : order.paymentMethod === "UPI" ? "Payment pending" : "Due on delivery"}</span></dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Item total</dt><dd>{inr(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Tax</dt><dd>{inr(order.tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd>{order.deliveryFee === 0 ? "FREE" : inr(order.deliveryFee)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-accent-600"><dt>{order.promoCode}</dt><dd>−{inr(order.discount)}</dd></div>}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base"><dt className="font-bold">Total</dt><dd className="font-extrabold">{inr(order.total)}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
