"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addAdminAction, removeAdminAction, type AdminState } from "@/actions/admin";
import { SubmitButton } from "../SubmitButton";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isSelf: boolean;
}

export default function AdminAccess({ admins }: { admins: AdminUser[] }) {
  const router = useRouter();
  const [addState, addAction, addPending] = useActionState(addAdminAction, {} as AdminState);
  const [removeState, removeAction, removePending] = useActionState(removeAdminAction, {} as AdminState);

  useEffect(() => {
    if (addState.ok || removeState.ok) router.refresh();
  }, [addState.ok, removeState.ok, router]);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="font-bold text-slate-900">Admin access</h2>
      <p className="mt-1 text-sm text-slate-500">
        People with these emails can log in to the admin panel. Anyone can be added — a new
        account gets a random password and the person sets their own via “Forgot password”.
      </p>

      <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
        {admins.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {a.name}
                {a.isSelf && (
                  <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                    YOU
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-slate-500">{a.email}</p>
            </div>
            {!a.isSelf && (
              <form action={removeAction}>
                <input type="hidden" name="email" value={a.email} />
                <button
                  type="submit"
                  disabled={removePending}
                  className="rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Remove
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {(addState.error || removeState.error) && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {addState.error || removeState.error}
        </p>
      )}
      {addState.ok && (
        <p className="mt-3 rounded-xl bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700 ring-1 ring-accent-200">
          ✓ Admin access updated.
        </p>
      )}

      <form action={addAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          name="name"
          placeholder="Name (optional)"
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="newadmin@example.com"
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary-400"
        />
        <SubmitButton pending={addPending} className="bg-primary-500 px-6 hover:bg-primary-600">
          Add admin
        </SubmitButton>
      </form>
    </section>
  );
}
