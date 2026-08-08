import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import TrackingRefresh from "@/components/TrackingRefresh";
import ReviewForm from "@/components/ReviewForm";
import { orderLineAmount, parseAddons } from "@/lib/orders";
import { formatDateTime, inr } from "@/lib/format";

export const metadata: Metadata = { title: "Order tracking" };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await getCurrentUser();
  if (!user) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, review: true },
  });
  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  const isOwner = order.userId === user.id;
  const cancelReason = order.cancelReason;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {placed === "1" && (
        <div className="mb-6 animate-fade-up rounded-2xl bg-accent-500 p-6 text-white shadow-lg shadow-accent-500/25">
          <p className="text-3xl">🎉</p>
          <h1 className="mt-2 text-xl font-extrabold">Order placed successfully!</h1>
          <p className="mt-1 text-sm text-accent-100">
            Order <span className="font-bold">#{order.orderNumber}</span> · {inr(order.total)} · {order.paymentMethod === "UPI" ? "Paid via UPI" : "Cash on Delivery"} ·
            ETA <span className="font-bold">~{order.estimatedMinutes} minutes</span>. The kitchen is on it!
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <TrackingRefresh status={order.status} />
          <StatusBadge status={order.status} />
        </div>
      </div>

      {cancelReason && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          Cancelled: {cancelReason}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Timeline */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-900">Order progress</h2>
            <OrderStatusTimeline history={order.statusHistory} status={order.status} />
          </section>

          {/* Items */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Items</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {order.items.map((item) => {
                const addons = parseAddons(item.addons);
                return (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">
                        {item.name} <span className="text-slate-400">× {item.quantity}</span>
                      </p>
                      {addons.length > 0 && (
                        <p className="mt-0.5 text-xs text-slate-500">+ {addons.map((a) => `${a.name} (${inr(a.price)})`).join(", ")}</p>
                      )}
                      {item.note && <p className="mt-0.5 text-xs italic text-slate-400">“{item.note}”</p>}
                    </div>
                    <span className="shrink-0 font-semibold text-slate-800">{inr(orderLineAmount(item))}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Review */}
          {isOwner && order.status === "DELIVERED" && !order.review && (
            <ReviewForm orderId={order.id} />
          )}
          {isOwner && order.status === "DELIVERED" && order.review && (
            <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
              <p className="text-sm font-bold text-amber-800">Your review</p>
              <p className="mt-1 text-lg">{"⭐".repeat(order.review.rating)}</p>
              {order.review.comment && <p className="mt-2 text-sm leading-6 text-amber-900">{order.review.comment}</p>}
            </div>
          )}
        </div>

        <div className="h-fit space-y-4 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Delivering to</h2>
            <p className="mt-2 text-sm font-semibold text-slate-800">{order.deliveryName}</p>
            <p className="text-sm text-slate-500">{order.deliveryPhone}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{order.deliveryAddress}</p>
            {order.specialInstructions && (
              <p className="mt-3 rounded-xl bg-primary-50 px-3 py-2 text-xs leading-5 text-primary-800">
                📝 <span className="font-semibold">Kitchen note:</span> {order.specialInstructions}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Payment</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd className="font-medium">{order.paymentMethod === "UPI" ? "📱 UPI" : "💵 Cash on Delivery"}</dd></div>
              {order.paymentMethod === "UPI" && order.paymentRef && (
                <div className="flex justify-between"><dt className="text-slate-500">UPI ref</dt><dd className="font-mono text-xs font-medium text-slate-700">{order.paymentRef}</dd></div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${order.paymentStatus === "PAID" ? "bg-accent-50 text-accent-700" : "bg-amber-50 text-amber-700"}`}>
                    {order.paymentStatus === "PAID" ? "Paid" : order.paymentMethod === "UPI" ? "Payment pending" : "Due on delivery"}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between"><dt className="text-slate-500">Item total</dt><dd>{inr(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Tax (5%)</dt><dd>{inr(order.tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Delivery fee</dt><dd>{order.deliveryFee === 0 ? <span className="font-semibold text-accent-600">FREE</span> : inr(order.deliveryFee)}</dd></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-accent-600"><dt>{order.promoCode ?? "Promo"}</dt><dd className="font-semibold">−{inr(order.discount)}</dd></div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base"><dt className="font-bold">Total</dt><dd className="font-extrabold">{inr(order.total)}</dd></div>
            </dl>
          </section>

          <Link href="/orders" className="block text-center text-sm font-semibold text-slate-500 hover:text-primary-600">
            ← All orders
          </Link>
        </div>
      </div>
    </div>
  );
}
