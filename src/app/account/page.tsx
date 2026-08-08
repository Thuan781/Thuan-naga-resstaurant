import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import AddressManager from "@/components/AddressManager";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const [addresses, orderCount] = await Promise.all([
    prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
    prisma.order.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-slate-900">My account</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Profile */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
              {user.phone && <p className="text-sm text-slate-500">{user.phone}</p>}
            </div>
          </div>
          <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Member since</dt><dd className="font-medium">{formatDateTime(user.createdAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Orders placed</dt><dd className="font-medium">{orderCount}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Role</dt><dd className="font-medium capitalize">{user.role.toLowerCase()}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/orders" className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100">
              My orders
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                Admin panel
              </Link>
            )}
            <form action={logoutAction}>
              <button type="submit" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Log out
              </button>
            </form>
          </div>
        </section>

        {/* Addresses */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Address book</h2>
          <p className="mt-1 text-sm text-slate-500">Save delivery addresses for one-tap checkout.</p>
          <div className="mt-4">
            <AddressManager
              addresses={addresses.map((a) => ({ id: a.id, label: a.label, fullAddress: a.fullAddress, phone: a.phone, isDefault: a.isDefault }))}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
