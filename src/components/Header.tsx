"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { Logo } from "./Logo";
import type { StoreStatusInfo } from "@/lib/store-status";

export interface HeaderUser {
  name: string;
  email: string;
  role: string;
}

const STATUS_STYLES: Record<StoreStatusInfo["kind"], { pill: string; dot: string }> = {
  open: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  limited: { pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  closed: { pill: "bg-red-50 text-red-600 ring-red-200", dot: "bg-red-500" },
  "closed-hours": { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  "delivery-off": { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};

export default function Header({
  user,
  status,
}: {
  user: HeaderUser | null;
  status: StoreStatusInfo;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const styles = STATUS_STYLES[status.kind];

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          active ? "bg-primary-100 text-primary-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo size={42} glow className="transition-transform duration-300 group-hover:scale-105" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight text-slate-900">Thuan Naga</span>
            <span className="block text-[11px] font-medium text-crimson">NAGA FLAVOURS · WARM HEARTS</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">{navLink("/menu", "Menu")}</nav>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 lg:inline-flex ${styles.pill}`}
            title={status.detail}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot} ${status.canOrder ? "animate-pulse" : ""}`} />
            <span className="max-w-40 truncate">{status.label}</span>
          </span>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
            aria-label="Cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span key={count} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-primary-500 px-1 text-[11px] font-bold text-white shadow">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              {navLink("/orders", "My Orders")}
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-md"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-slide-in border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {[
              { href: "/menu", label: "Menu" },
              { href: "/cart", label: `Cart${count ? ` (${count})` : ""}` },
              ...(user ? [{ href: "/orders", label: "My Orders" }, { href: "/account", label: "Account" }] : [{ href: "/login", label: "Login" }, { href: "/register", label: "Sign up" }]),
            ].map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
