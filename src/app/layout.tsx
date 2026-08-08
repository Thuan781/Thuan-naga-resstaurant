import type { Metadata } from "next";
import { Playfair_Display, Great_Vibes, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { getStoreStatus } from "@/lib/store-status";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: {
    default: "Thuan Naga Restaurant — Order Naga Food in Tamenglong",
    template: "%s · Thuan Naga Restaurant",
  },
  description:
    "Authentic Naga cuisine delivered in Tamenglong, Manipur. Smoked pork, king chilli chicken, bamboo shoot delicacies — order online with cash on delivery.",
};

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([
    getCurrentUser(),
    prisma.restaurantSettings.findFirst(),
  ]);

  const fallbackSettings = {
    storeStatus: "OPEN" as const,
    hours: "[]",
    deliveryEnabled: true,
  };

  return (
    <html lang="en" className={`${playfair.variable} ${greatVibes.variable} ${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header
          user={
            user
              ? { name: user.name, email: user.email, role: user.role }
              : null
          }
          status={getStoreStatus(settings ?? fallbackSettings)}
        />
        <main className="flex-1">{children}</main>
        <Footer phone={settings?.phone} address={settings?.address} />
      </body>
    </html>
  );
}
