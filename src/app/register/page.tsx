import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import OtpLoginForm from "@/components/OtpLoginForm";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/");

  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <Logo size={56} glow />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your name and email — we’ll email you a code to set up your account.
        </p>
        <OtpLoginForm mode="customer" requireName next={next} googleEnabled={googleEnabled} />
      </div>
      <Link href="/" className="mt-3 text-center text-sm font-medium text-slate-500 hover:text-primary-600">
        ← Back to site
      </Link>
    </div>
  );
}
