export const ORDER_FLOW = [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export type FlowStatus = (typeof ORDER_FLOW)[number];
export type OrderStatusValue = FlowStatus | "CANCELLED";

export interface StatusMeta {
  label: string;
  short: string;
  badge: string;
  dot: string;
  desc: string;
}

export const STATUS_META: Record<OrderStatusValue, StatusMeta> = {
  CONFIRMED: {
    label: "Order Confirmed",
    short: "Confirmed",
    badge: "bg-sky-100 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    desc: "We've received your order and are getting the kitchen ready.",
  },
  PREPARING: {
    label: "Preparing",
    short: "Preparing",
    badge: "bg-amber-100 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    desc: "The kitchen is cooking your food fresh.",
  },
  READY: {
    label: "Ready",
    short: "Ready",
    badge: "bg-violet-100 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
    desc: "Your order is packed and ready.",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    short: "Out for Delivery",
    badge: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
    desc: "Our delivery partner is on the way to you.",
  },
  DELIVERED: {
    label: "Delivered",
    short: "Delivered",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    desc: "Enjoy your meal! Don't forget to rate your order.",
  },
  CANCELLED: {
    label: "Cancelled",
    short: "Cancelled",
    badge: "bg-red-100 text-red-700 ring-red-200",
    dot: "bg-red-500",
    desc: "This order was cancelled.",
  },
};

export function isTerminal(status: string): boolean {
  return status === "DELIVERED" || status === "CANCELLED";
}

export function nextStatus(status: string): FlowStatus | null {
  const i = ORDER_FLOW.indexOf(status as FlowStatus);
  if (i === -1 || i >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1];
}

export interface StatusHistoryEntry {
  status: string;
  at: string;
}

export function parseStatusHistory(json: string): StatusHistoryEntry[] {
  try {
    return JSON.parse(json) as StatusHistoryEntry[];
  } catch {
    return [];
  }
}
