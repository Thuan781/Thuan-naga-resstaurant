import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/admin/SettingsForm";
import { parseHours } from "@/lib/store-status";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function AdminSettingsPage() {
  const settings = await prisma.restaurantSettings.findFirst();

  const defaults = {
    storeStatus: "OPEN",
    emergencyMessage: "",
    hours: JSON.stringify(Array.from({ length: 7 }, (_, day) => ({ day, open: "10:00", close: "21:30", closed: false }))),
    deliveryEnabled: true,
    deliveryFee: 25,
    freeDeliveryAbove: 300,
    minOrderValue: 100,
    codEnabled: true,
    codMaxAmount: 1500,
    upiEnabled: true,
    upiId: "kthuan781-1@okaxis",
  };

  const data = settings
    ? {
        storeStatus: settings.storeStatus,
        emergencyMessage: settings.emergencyMessage ?? "",
        hours: settings.hours,
        deliveryEnabled: settings.deliveryEnabled,
        deliveryFee: settings.deliveryFee,
        freeDeliveryAbove: settings.freeDeliveryAbove,
        minOrderValue: settings.minOrderValue,
        codEnabled: settings.codEnabled,
        codMaxAmount: settings.codMaxAmount,
        upiEnabled: settings.upiEnabled,
        upiId: settings.upiId,
      }
    : defaults;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-extrabold text-slate-900">Store settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        These changes take effect for customers immediately.
      </p>
      <div className="mt-6">
        <SettingsForm settings={{ ...data, hours: parseHours(data.hours) }} />
      </div>
    </div>
  );
}
