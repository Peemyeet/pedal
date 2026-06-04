import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { StoreChrome } from "@/components/StoreChrome";
import { defaultMetadata, organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = organizationJsonLd();

  return (
    <html lang="th" data-scroll-behavior="smooth">
      <body
        className={`${sarabun.variable} min-h-screen bg-stone-50 font-sans text-stone-900 antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}
