"use client";

import { useState } from "react";
import { registerAction, verifyRegisterAction } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";
import GoogleLoginButton from "./GoogleLoginButton";
import OtpStatusPanel from "./OtpStatusPanel";

export default function RegisterForm({
  next,
  googleEnabled = false,
}: {
  next?: string;
  googleEnabled?: boolean;
}) {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [shownCode, setShownCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handleRegister(formData: FormData) {
    setError(null);
    setPending(true);
    const res = await registerAction(formData);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    if (res?.ok && res.email) {
      setName(res.name ?? "");
      setEmail(res.email);
      setPassword(res.password ?? "");
      setShownCode(res.code ?? null);
      setCodeSent(!!res.sent);
      setCode("");
      setStep("otp");
    }
  }

  async function handleResend() {
    setError(null);
    setPending(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("email", email);
    fd.set("password", password);
    if (next) fd.set("next", next);
    const res = await registerAction(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else {
      setShownCode(res?.code ?? null);
      setCodeSent(!!res?.sent);
    }
  }

  async function handleVerify(formData: FormData) {
    setError(null);
    setVerifying(true);
    const res = await verifyRegisterAction(formData);
    setVerifying(false);
    if (res?.error) setError(res.error);
  }

  if (step === "details") {
    return (
      <div>
        <form action={handleRegister} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}
          {next && <input type="hidden" name="next" value={next} />}
          <Field label="Full name">
            <input name="name" autoComplete="name" required placeholder="Your name" className={inputCls()} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={inputCls()} />
          </Field>
          <Field label="Password">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={inputCls()}
            />
          </Field>
          <SubmitButton pending={pending} className="w-full bg-primary-500 hover:bg-primary-600" pendingText="Sending code…">
            Create account
          </SubmitButton>
          <p className="text-center text-xs text-slate-400">
            We’ll email you a 6-digit code to verify your email. You’ll then log in with your password.
          </p>
        </form>
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">or continue with</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <GoogleLoginButton mode="customer" next={next} enabled={googleEnabled} />
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <a href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-primary-600 hover:text-primary-700">
            Log in
          </a>
        </p>
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
        <OtpStatusPanel sent={codeSent} email={email} code={shownCode} />
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
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="password" value={password} />
        {next && <input type="hidden" name="next" value={next} />}
        <SubmitButton
          pending={verifying}
          disabled={code.trim().length !== 6}
          className="w-full bg-primary-500 py-3 hover:bg-primary-600 disabled:bg-slate-300"
          pendingText="Verifying…"
        >
          Verify & create my account
        </SubmitButton>
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setStep("details");
              setError(null);
            }}
            className="font-semibold text-slate-500 hover:text-primary-600"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={pending}
            className="font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Resend code"}
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

function inputCls(readOnly?: boolean) {
  return `h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
    readOnly
      ? "border-slate-200 bg-slate-50 text-slate-500"
      : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
  }`;
}
