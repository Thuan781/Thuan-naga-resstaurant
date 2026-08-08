"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";
import GoogleLoginButton from "./GoogleLoginButton";

export default function LoginForm({
  next,
  googleEnabled = false,
}: {
  next?: string;
  googleEnabled?: boolean;
}) {
  const [state, action, pending] = useActionState(loginAction, {} as AuthState);

  return (
    <div>
      <form action={action} className="mt-6 space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {state.error}
          </p>
        )}
        <Field label="Email">
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={inputCls()}
          />
        </Field>
        <Field label="Password">
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={inputCls()}
          />
          <span className="mt-1.5 block text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </span>
        </Field>
        <SubmitButton pending={pending} className="w-full bg-primary-500 hover:bg-primary-600">
          Log in
        </SubmitButton>
        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link
            href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Create an account
          </Link>
        </p>
      </form>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">or continue with</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <GoogleLoginButton mode="customer" next={next} enabled={googleEnabled} />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

function inputCls(error?: boolean) {
  return `h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
  }`;
}
