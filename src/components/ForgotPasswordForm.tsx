"use client";

import Link from "next/link";
import { useState } from "react";
import { requestResetAction } from "@/actions/password";
import { SubmitButton } from "./SubmitButton";
import OtpStatusPanel from "./OtpStatusPanel";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [shownCode, setShownCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleRequest(formData: FormData) {
    setError(null);
    setPending(true);
    const res = await requestResetAction(formData);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    if (res?.ok && res.email) {
      setEmail(res.email);
      setShownCode(res.code ?? null);
      setCodeSent(!!res.sent);
    }
  }

  async function handleResend() {
    setError(null);
    setPending(true);
    const fd = new FormData();
    fd.set("email", email);
    const res = await requestResetAction(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else {
      setShownCode(res?.code ?? null);
      setCodeSent(!!res?.sent);
    }
  }

  return (
    <div>
      <form action={handleRequest} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        )}
        {shownCode ? (
          <>
            <OtpStatusPanel sent={codeSent} email={email} code={shownCode} />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Code expires in 10 minutes.</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={pending}
                className="font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {pending ? "Sending…" : "Resend code"}
              </button>
            </div>
            <Link
              href="/reset-password"
              className="block w-full rounded-full bg-primary-500 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600"
            >
              Continue to reset password →
            </Link>
          </>
        ) : (
          <>
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
            <SubmitButton pending={pending} className="w-full bg-primary-500 hover:bg-primary-600" pendingText="Sending code…">
              Send reset code
            </SubmitButton>
          </>
        )}
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Back to login
        </Link>
      </p>
    </div>
  );
}
