"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type PasswordState } from "@/actions/password";
import { SubmitButton } from "./SubmitButton";

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, {} as PasswordState);

  if (state.ok) {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl bg-accent-50 p-5 ring-1 ring-accent-200">
          <p className="text-2xl">✅</p>
          <p className="mt-1 text-sm font-bold text-accent-800">Password updated!</p>
          <p className="mt-1 text-xs text-accent-700">
            You can now log in with your new password. Any existing sessions were signed out.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="flex-1 rounded-full bg-primary-500 px-5 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-primary-600"
          >
            Customer login
          </Link>
          <Link
            href="/admin/login"
            className="flex-1 rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-slate-700"
          >
            Admin login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Account email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">6-digit reset code</span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm tracking-[0.3em] outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">New password</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm password</span>
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>
      </div>
      <SubmitButton pending={pending} className="w-full bg-primary-500 hover:bg-primary-600">
        Set new password
      </SubmitButton>
    </form>
  );
}
