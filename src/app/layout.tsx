import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: `${BRAND.shortName} — ${BRAND.tagline} · ระบบขาย`,
  description: `${BRAND.name} — คลังสินค้าและใบเสนอราคา`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="flex min-h-screen flex-col antialiased">
        <Nav />
        <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 py-8 sm:px-6 sm:py-10 lg:max-w-7xl lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
