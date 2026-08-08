"use client";

import { useActionState } from "react";
import { adminLoginAction, type AuthState } from "@/actions/auth";
import { SubmitButton } from "../SubmitButton";

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, {} as AuthState);
  return (
    <form action={action} className="mt-6 space-y-4">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@thuannaga.com"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <SubmitButton pending={pending} className="w-full bg-slate-900 hover:bg-slate-700">
        Log in to admin
      </SubmitButton>
    </form>
  );
}
