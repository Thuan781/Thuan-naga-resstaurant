export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

export function formatDateTime(d: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d));
}

export function formatTime(d: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(d));
}

export function formatTimeAgo(d: Date | string): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
