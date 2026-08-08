"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCategoryAction, deleteMenuItemAction } from "@/actions/admin";

export function DeleteItemButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = () => {
    if (!confirm(`Delete "${name}" from the menu?`)) return;
    const fd = new FormData();
    fd.set("id", id);
    start(async () => {
      await deleteMenuItemAction(fd);
      router.refresh();
    });
  };
  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}

export function DeleteCategoryButton({ id, name, count }: { id: string; name: string; count: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = () => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const fd = new FormData();
    fd.set("id", id);
    start(async () => {
      await deleteCategoryAction(fd);
      router.refresh();
    });
  };
  return (
    <button
      type="button"
      onClick={run}
      disabled={pending || count > 0}
      title={count > 0 ? "Move or delete items first" : "Delete category"}
      className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
    >
      {pending ? "…" : "✕"}
    </button>
  );
}

export function EditLink({ href }: { href: string }) {
  return (
    <Link href={href} className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100">
      Edit
    </Link>
  );
}
