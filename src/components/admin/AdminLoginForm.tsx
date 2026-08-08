"use client";

import { useActionState } from "react";
import { adminLoginAction, type AuthState } from "@/actions/auth";
import { SubmitButton } from "../SubmitButton";
import GoogleLoginButton from "../GoogleLoginButton";

export default function AdminLoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const [state, action, pending] = useActionState(adminLoginAction, {} as AuthState);
  return (
    <div>
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
          placeholder="kthuan781@gmail.com"
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
        <span className="mt-1.5 block text-right">
          <a href="/forgot-password" className="text-xs font-semibold text-slate-500 hover:text-primary-600">
            Forgot password?
          </a>
        </span>
      </label>
      <SubmitButton pending={pending} className="w-full bg-slate-900 hover:bg-slate-700">
        Log in to admin
      </SubmitButton>
    </form>
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-medium text-slate-400">or continue with</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
    <GoogleLoginButton mode="admin" enabled={googleEnabled} />
    </div>
  );
}
