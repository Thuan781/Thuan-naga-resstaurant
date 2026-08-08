import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStoreStatus } from "@/lib/store-status";
import CartClient from "@/components/CartClient";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const settings = await prisma.restaurantSettings.findFirst();
  const status = getStoreStatus(settings ?? {
    storeStatus: "OPEN",
    hours: "[]",
    deliveryEnabled: true,
  });

  return (
    <CartClient
      settings={{
        deliveryFee: settings?.deliveryFee ?? 25,
        freeDeliveryAbove: settings?.freeDeliveryAbove ?? 300,
        minOrderValue: settings?.minOrderValue ?? 100,
        canOrder: status.canOrder,
      }}
    />
  );
}
