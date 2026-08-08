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
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <Logo size={56} glow />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Log in to order from <span className="font-semibold text-slate-700">Thuan Naga Restaurant</span>.
        </p>
        <LoginForm next={next} />
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
