"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestResetAction, type PasswordState } from "@/actions/password";
import { SubmitButton } from "./SubmitButton";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestResetAction, {} as PasswordState);

  if (state.ok && state.code) {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl bg-accent-50 p-5 ring-1 ring-accent-200">
          <p className="text-sm font-bold text-accent-800">Reset code generated</p>
          <p className="mt-2 text-3xl font-extrabold tracking-[0.35em] text-slate-900">
            {state.code}
          </p>
          <p className="mt-2 text-xs leading-5 text-accent-700">
            Enter this 6-digit code on the reset page. It expires in 30 minutes.
          </p>
        </div>
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 ring-1 ring-amber-200">
          ℹ️ An email service is not connected yet, so the code is shown here. In production it
          would be sent to your inbox — this screen would only say “check your email”.
        </p>
        <Link
          href="/reset-password"
          className="inline-flex w-full items-center justify-center rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-600"
        >
          Continue to reset password →
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
          placeholder="you@example.com"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </label>
      <SubmitButton pending={pending} className="w-full bg-primary-500 hover:bg-primary-600">
        Get reset code
      </SubmitButton>
      <p className="text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Back to login
        </Link>
      </p>
    </form>
  );
}
