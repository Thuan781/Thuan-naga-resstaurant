import type { Metadata } from "next";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 sm:px-6">
      <Logo />
      <h1 className="mt-6 text-2xl font-extrabold text-slate-900">Set a new password</h1>
      <p className="mt-2 text-center text-sm leading-6 text-slate-500">
        Enter your email, the 6-digit reset code, and your new password.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
