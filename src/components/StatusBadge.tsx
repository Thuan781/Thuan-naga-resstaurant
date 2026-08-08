import { STATUS_META, type OrderStatusValue } from "@/lib/order-status";

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const meta = STATUS_META[status as OrderStatusValue] ?? STATUS_META.CONFIRMED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.short}
    </span>
  );
}
