import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false } };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <Logo size={64} glow className="mx-auto" />
          <h1 className="mt-4 text-xl font-extrabold text-slate-900">Staff login</h1>
          <p className="mt-1 text-sm text-slate-500">Thuan Naga Restaurant · Admin</p>
        </div>
        <AdminLoginForm />
        <p className="mt-4 text-center text-xs text-slate-400">
          Demo admin: <span className="font-mono">admin@thuannaga.com</span> /{" "}
          <span className="font-mono">admin123</span>
        </p>
      </div>
    </div>
  );
}
