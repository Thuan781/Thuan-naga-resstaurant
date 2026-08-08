"use client";

import Link from "next/link";
import { useState } from "react";
import { requestOtpAction, verifyOtpAction } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";
import GoogleLoginButton from "./GoogleLoginButton";

export default function OtpLoginForm({
  mode = "customer",
  requireName = false,
  next,
  googleEnabled = false,
  emailPlaceholder = "you@example.com",
}: {
  mode?: "customer" | "admin";
  requireName?: boolean;
  next?: string;
  googleEnabled?: boolean;
  emailPlaceholder?: string;
}) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [shownCode, setShownCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handleRequest(formData: FormData) {
    setError(null);
    setSending(true);
    const res = await requestOtpAction(formData);
    setSending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    if (res?.ok && res.email) {
      setEmail(res.email);
      setShownCode(res.code ?? null);
      setCodeSent(!!res.sent);
      setCode("");
      setStep("otp");
    }
  }

  async function handleResend() {
    setError(null);
    setSending(true);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("mode", mode);
    const res = await requestOtpAction(fd);
    setSending(false);
    if (res?.error) setError(res.error);
    else {
      setShownCode(res?.code ?? null);
      setCodeSent(!!res?.sent);
    }
  }

  async function handleVerify(formData: FormData) {
    setError(null);
    setVerifying(true);
    const res = await verifyOtpAction(formData);
    setVerifying(false);
    if (res?.error) setError(res.error);
  }

  if (step === "email") {
    return (
      <div>
        <form action={handleRequest} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}
          {requireName && (
            <Field label="Full name">
              <input
                name="name"
                autoComplete="name"
                required
                placeholder="Your name"
                className={inputCls()}
              />
            </Field>
          )}
          <Field label="Email">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={emailPlaceholder}
              className={inputCls()}
            />
          </Field>
          <input type="hidden" name="mode" value={mode} />
          <SubmitButton pending={sending} className="w-full bg-primary-500 hover:bg-primary-600" pendingText="Sending code…">
            Send OTP
          </SubmitButton>
          <p className="text-center text-xs text-slate-400">
            We’ll email you a 6-digit code to log in. No password needed.
          </p>
        </form>
        {mode === "customer" && (
          <>
            <GoogleDivider />
            <GoogleLoginButton mode="customer" next={next} enabled={googleEnabled} />
            <p className="mt-4 text-center text-sm text-slate-500">
              {requireName ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                    className="font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  New here?{" "}
                  <Link
                    href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                    className="font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <form action={handleVerify} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        )}
        {codeSent ? (
          <div className="rounded-xl bg-accent-50 px-4 py-3 ring-1 ring-accent-200">
            <p className="text-xs font-bold uppercase tracking-wide text-accent-700">📧 Code sent</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              We emailed a 6-digit code to <span className="font-semibold">{email}</span>. Enter it
              below — it expires in 10 minutes.
            </p>
            <p className="mt-1 text-xs text-accent-700">
              Didn’t get it? Check spam, then press “Resend code”.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
              ⚠️ Email isn’t connected yet
            </p>
            <p className="mt-1 text-center text-3xl font-extrabold tracking-[0.35em] text-slate-900">
              {shownCode ?? "······"}
            </p>
            <p className="mt-1 text-xs text-amber-700">
              The owner needs to add email settings for codes to be sent to your inbox.
            </p>
          </div>
        )}
        <Field label="Email">
          <input name="email" value={email} readOnly className={inputCls(true)} />
        </Field>
        <Field label="6-digit code">
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputCls()}
          />
        </Field>
        <input type="hidden" name="mode" value={mode} />
        {next && <input type="hidden" name="next" value={next} />}
        <SubmitButton
          pending={verifying}
          disabled={code.trim().length !== 6}
          className="w-full bg-primary-500 py-3 hover:bg-primary-600 disabled:bg-slate-300"
          pendingText="Verifying…"
        >
          {mode === "admin" ? "Verify & log in to admin" : "Verify & log in"}
        </SubmitButton>
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className="font-semibold text-slate-500 hover:text-primary-600"
          >
            ← Change email
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </form>
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

function GoogleDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-medium text-slate-400">or continue with</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function inputCls(readOnly?: boolean) {
  return `h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
    readOnly
      ? "border-slate-200 bg-slate-50 text-slate-500"
      : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
  }`;
}
