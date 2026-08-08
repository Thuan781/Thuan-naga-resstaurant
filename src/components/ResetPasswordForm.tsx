"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type PasswordState } from "@/actions/password";
import { SubmitButton } from "./SubmitButton";

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, {} as PasswordState);

  if (state.ok) {
    return (
      <div className="mt-6 text-center">
        <p className="text-5xl">✅</p>
        <h2 className="mt-3 text-lg font-bold text-slate-900">Password updated</h2>
        <p className="mt-1 text-sm text-slate-500">You can now log in with your new password.</p>
        <Link
          href="/login"
          className="mt-5 inline-block rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600"
        >
          Go to login →
        </Link>
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
          required
          placeholder="you@example.com"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">6-digit code</span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          placeholder="••••••"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">New password</span>
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm password</span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your new password"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <SubmitButton pending={pending} className="w-full bg-primary-500 hover:bg-primary-600">
        Set new password
      </SubmitButton>
      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Back to login
        </Link>
      </p>
    </form>
  );
}
