import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");

  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <Logo size={64} glow className="mx-auto" />
          <h1 className="mt-4 text-xl font-extrabold text-slate-900">Staff login</h1>
          <p className="mt-1 text-sm text-slate-500">Thuan Naga Restaurant · Admin</p>
        </div>
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
        {error === "not_admin" && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            This Google account doesn’t have admin access. Ask the owner to add it in Admin → Settings.
          </p>
        )}
        <AdminLoginForm googleEnabled={googleEnabled} />
        <p className="mt-4 text-center text-xs text-slate-400">
          Only accounts added by the owner can access the admin panel.
        </p>
      </div>
    </div>
  );
}
