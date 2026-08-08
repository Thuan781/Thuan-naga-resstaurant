"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthState } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";

const initial: AuthState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <Field label="Email" error={state.fieldErrors?.email}>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputCls(!!state.fieldErrors?.email)}
        />
      </Field>
      <Field label="Password" error={state.fieldErrors?.password}>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputCls(!!state.fieldErrors?.password)}
        />
      </Field>
      <SubmitButton pending={pending} className="w-full bg-primary-500 hover:bg-primary-600">
        Log in
      </SubmitButton>
      <p className="text-center text-sm text-slate-500">
        New here?{" "}
        <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-primary-600 hover:text-primary-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <Field label="Full name" error={state.fieldErrors?.name}>
        <input name="name" autoComplete="name" placeholder="Your name" className={inputCls(!!state.fieldErrors?.name)} />
      </Field>
      <Field label="Email" error={state.fieldErrors?.email}>
        <input name="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputCls(!!state.fieldErrors?.email)} />
      </Field>
      <Field label="Phone (optional)" error={state.fieldErrors?.phone}>
        <input name="phone" type="tel" autoComplete="tel" placeholder="+91 …" className={inputCls(!!state.fieldErrors?.phone)} />
      </Field>
      <Field label="Password" error={state.fieldErrors?.password}>
        <input name="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" className={inputCls(!!state.fieldErrors?.password)} />
      </Field>
      <SubmitButton pending={pending} className="w-full bg-primary-500 hover:bg-primary-600">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-primary-600 hover:text-primary-700">
          Log in
        </Link>
      </p>
    </form>
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
