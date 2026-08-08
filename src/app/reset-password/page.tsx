import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <Logo size={56} glow />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Set a new password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email, the 6-digit reset code, and your new password.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
