"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTerminal } from "@/lib/order-status";

export default function TrackingRefresh({ status }: { status: string }) {
  const router = useRouter();

  useEffect(() => {
    if (isTerminal(status)) return;
    const id = setInterval(() => router.refresh(), 15000);
    return () => clearInterval(id);
  }, [status, router]);

  if (isTerminal(status)) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-200">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
      Live · auto-updating
    </span>
  );
}
