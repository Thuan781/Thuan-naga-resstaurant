"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { Logo } from "../Logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/menu", label: "Menu", icon: "🍽️" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <Logo size={38} />
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-slate-900">Thuan Naga</p>
          <p className="text-[11px] font-medium text-crimson">Admin Panel</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-4">
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4 lg:mt-auto">
        <p className="mb-2 truncate px-1 text-xs font-medium text-slate-400">{userName}</p>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            View site
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50">
              Log out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
