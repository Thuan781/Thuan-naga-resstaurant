"use client";

import { useActionState, useState } from "react";
import { saveCategoryAction, type AdminState } from "@/actions/admin";
import { SubmitButton } from "../SubmitButton";

export default function CategoryForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveCategoryAction, {} as AdminState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-primary-400 hover:text-primary-600"
      >
        + New category
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Emoji</span>
        <input name="emoji" placeholder="🍲" maxLength={8} className="h-10 w-16 rounded-xl border border-slate-200 px-3 text-center text-sm outline-none focus:border-primary-400" />
      </label>
      <label className="block min-w-44 flex-1">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Name</span>
        <input name="name" placeholder="e.g. Traditional Naga" className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-primary-400" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-600">Order</span>
        <input name="sortOrder" type="number" min="0" defaultValue={0} className="h-10 w-20 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary-400" />
      </label>
      {state.error && <p className="w-full text-xs font-medium text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton pending={pending} className="bg-slate-900 hover:bg-slate-700" pendingText="Saving…">
          Save
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
