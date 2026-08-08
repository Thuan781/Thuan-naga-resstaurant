"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelOrderAction, updateOrderStatusAction, type AdminState } from "@/actions/admin";
import { isTerminal, nextStatus, STATUS_META } from "@/lib/order-status";

export default function OrderControls({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const [cancelPending, startCancel] = useTransition();

  const advance = (target: string) => {
    setError(null);
    const fd = new FormData();
    fd.set("orderId", orderId);
    fd.set("status", target);
    start(async () => {
      const res: AdminState = await updateOrderStatusAction({} as AdminState, fd);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  };

  const doCancel = () => {
    setError(null);
    const fd = new FormData();
    fd.set("orderId", orderId);
    fd.set("reason", reason);
    startCancel(async () => {
      const res: AdminState = await cancelOrderAction({} as AdminState, fd);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  };

  const next = nextStatus(status);
  const finished = isTerminal(status);

  if (finished) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-900">Update order</h2>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
      {next && (
        <button
          type="button"
          onClick={() => advance(next)}
          disabled={pending}
          className="mt-3 w-full rounded-full bg-primary-500 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-600 disabled:opacity-60"
        >
          {pending ? "Updating…" : `Mark as ${STATUS_META[next].short} →`}
        </button>
      )}
      {!showCancel ? (
        <button
          type="button"
          onClick={() => setShowCancel(true)}
          className="mt-2.5 w-full rounded-full border border-red-200 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
        >
          Cancel order
        </button>
      ) : (
        <div className="mt-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3">
          <p className="text-xs font-semibold text-red-700">Cancel this order?</p>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="mt-2 h-10 w-full rounded-lg border border-red-200 bg-white px-3 text-sm outline-none focus:border-red-400"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={doCancel}
              disabled={cancelPending}
              className="flex-1 rounded-full bg-red-500 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
            >
              {cancelPending ? "…" : "Yes, cancel"}
            </button>
            <button
              type="button"
              onClick={() => setShowCancel(false)}
              className="flex-1 rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
            >
              Keep
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
