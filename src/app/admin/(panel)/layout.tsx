import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-col bg-slate-100 lg:flex-row">
      <AdminNav userName={user.name} />
      <div className="flex-1 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
