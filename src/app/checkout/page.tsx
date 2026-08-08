import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStoreStatus } from "@/lib/store-status";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const [addresses, settings] = await Promise.all([
    prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
    prisma.restaurantSettings.findFirst(),
  ]);

  const status = getStoreStatus(settings ?? {
    storeStatus: "OPEN",
    hours: "[]",
    deliveryEnabled: true,
  });

  return (
    <CheckoutClient
      user={{ name: user.name, email: user.email, phone: user.phone }}
      addresses={addresses.map((a) => ({ id: a.id, label: a.label, fullAddress: a.fullAddress, phone: a.phone, isDefault: a.isDefault }))}
      settings={{
        deliveryFee: settings?.deliveryFee ?? 25,
        freeDeliveryAbove: settings?.freeDeliveryAbove ?? 300,
        minOrderValue: settings?.minOrderValue ?? 100,
        codMaxAmount: settings?.codMaxAmount ?? 1500,
        codEnabled: settings?.codEnabled ?? true,
        upiEnabled: settings?.upiEnabled ?? true,
        upiId: settings?.upiId ?? "kthuan781-1@okaxis",
      }}
      canOrder={status.canOrder}
      storeMessage={status.detail}
    />
  );
}
