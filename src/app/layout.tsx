import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/AppProviders";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: `${BRAND.shortName} — ร้าน & งานหลังบ้าน`,
  description: `${BRAND.name} — ร้านออนไลน์ · งานหลังบ้าน`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="flex min-h-screen flex-col antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
