import type { Metadata } from "next";

const siteName = "PEDLAI";
const defaultDescription =
  "PEDLAI ร้านพริกคุณภาพ ส่งตรงจากฟาร์ม พริกสด แห้ง น้ำพริก และซอสพริก สั่งออนไลน์ได้ทุกวัน";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteName} | ร้านพริกคุณภาพ ส่งตรงจากฟาร์ม`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "พริก",
    "พริกขี้หนู",
    "พริกแห้ง",
    "น้ำพริก",
    "ซอสพริก",
    "PEDLAI",
    "ซื้อพริกออนไลน์",
    "พริกสด",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName,
    title: `${siteName} | ร้านพริกคุณภาพ`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export function productJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
}) {
  const url = `${getSiteUrl()}/products/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "THB",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url,
    },
    brand: {
      "@type": "Brand",
      name: "PEDLAI",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PEDLAI",
    url: getSiteUrl(),
    description: defaultDescription,
    logo: `${getSiteUrl()}/icon.svg`,
  };
}
