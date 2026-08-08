"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import { addAddressAction, deleteAddressAction, type ActionState } from "@/actions/orders";
import { SubmitButton } from "./SubmitButton";

export default function AddressManager({
  addresses,
}: {
  addresses: Array<{ id: string; label: string; fullAddress: string; phone: string | null; isDefault: boolean }>;
}) {
  const [state, action, pending] = useActionState(addAddressAction, {} as ActionState);
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this address?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startDelete(async () => {
      await deleteAddressAction(fd);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="space-y-3">
        {addresses.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No saved addresses yet — add one below for faster checkout.
          </p>
        )}
        {addresses.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                {a.label}
                {a.isDefault && <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700">DEFAULT</span>}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-600">{a.fullAddress}</p>
              {a.phone && <p className="mt-0.5 text-xs text-slate-400">{a.phone}</p>}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(a.id)}
              disabled={isDeleting}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <form action={action} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-800">Add a new address</p>
        {state.error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{state.error}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input name="label" placeholder="Label (Home / Office)" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary-400" />
          <input name="phone" placeholder="Phone (optional)" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary-400" />
        </div>
        <textarea
          name="fullAddress"
          placeholder="Full address — house, street, landmark…"
          rows={2}
          className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
        />
        <div className="mt-3">
          <SubmitButton pending={pending} className="bg-slate-900 hover:bg-slate-700">
            Save address
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
