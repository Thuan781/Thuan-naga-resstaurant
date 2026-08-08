import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 sm:px-6">
      <Logo />
      <h1 className="mt-6 text-2xl font-extrabold text-slate-900">Forgot password</h1>
      <p className="mt-2 text-center text-sm leading-6 text-slate-500">
        Enter your account email and we will give you a 6-digit code to set a new password.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
