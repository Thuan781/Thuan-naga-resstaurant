import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/");

  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <Logo size={56} glow />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Log in to order from <span className="font-semibold text-slate-700">Thuan Naga Restaurant</span>.
        </p>
        {error === "google_not_configured" && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
            Google sign-in isn’t configured yet — the restaurant owner needs to add the Google OAuth keys.
          </p>
        )}
        {error === "google_failed" && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            Google sign-in failed. Please try again.
          </p>
        )}
        <LoginForm next={next} googleEnabled={googleEnabled} />
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">
        Demo account: <span className="font-mono">demo@thuannaga.com</span> /{" "}
        <span className="font-mono">demo123</span>
      </p>
      <Link href="/" className="mt-3 text-center text-sm font-medium text-slate-500 hover:text-primary-600">
        ← Back to site
      </Link>
    </div>
  );
}
