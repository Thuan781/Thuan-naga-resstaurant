import { ORDER_FLOW, STATUS_META, parseStatusHistory } from "@/lib/order-status";
import { formatTime } from "@/lib/format";

export function OrderStatusTimeline({ history, status }: { history: string; status: string }) {
  const entries = parseStatusHistory(history);
  const byStatus = new Map(entries.map((e) => [e.status, e.at]));
  const cancelled = status === "CANCELLED";
  const terminal = cancelled || status === "DELIVERED";

  return (
    <ol className="relative space-y-0">
      {ORDER_FLOW.map((step, i) => {
        const meta = STATUS_META[step];
        const at = byStatus.get(step);
        const isCurrent = step === status;
        const isDone = !!at || (isCurrent && !terminal);
        const isLast = i === ORDER_FLOW.length - 1;

        return (
          <li key={step} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 rounded ${
                  cancelled ? "bg-red-200" : isDone ? "bg-accent-400" : "bg-slate-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                cancelled
                  ? step === "CONFIRMED"
                    ? "bg-accent-500 text-white"
                    : "bg-slate-200 text-slate-400"
                  : isDone
                    ? "bg-accent-500 text-white"
                    : "bg-slate-100 text-slate-300"
              }`}
            >
              {isDone && !cancelled ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`text-sm font-semibold ${cancelled ? "text-slate-400" : isDone ? "text-slate-900" : "text-slate-400"}`}>
                {meta.label}
                {isCurrent && !cancelled && (
                  <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
                    Current
                  </span>
                )}
              </p>
              {at && <p className="mt-0.5 text-xs text-slate-500">{formatTime(at)}</p>}
              {isCurrent && !cancelled && <p className="mt-1 text-xs leading-5 text-slate-500">{meta.desc}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
