import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, CATEGORY_LABEL } from "@/lib/utils";
import { productJsonLd } from "@/lib/seo";
import { HeatBadge } from "@/components/HeatBadge";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "ไม่พบสินค้า" };

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.isActive) notFound();

  const jsonLd = productJsonLd(product);
  const outOfStock = product.stock <= 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav className="text-sm text-stone-500">
          <Link href="/products" className="hover:text-red-600">
            สินค้า
          </Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-red-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
              {CATEGORY_LABEL[product.category] ?? product.category}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-stone-900">
              {product.name}
            </h1>
            <div className="mt-3">
              <HeatBadge level={product.heatLevel} />
            </div>
            <p className="mt-6 text-2xl font-bold text-red-700">
              {formatPrice(product.price)}
            </p>
            <p className="mt-2 text-sm text-stone-500">
              {outOfStock ? (
                <span className="font-medium text-red-600">สินค้าหมดชั่วคราว</span>
              ) : (
                <>คงเหลือ {product.stock} ชิ้น</>
              )}
            </p>
            <p className="mt-6 leading-relaxed text-stone-600">
              {product.description}
            </p>
            <div className="mt-8 max-w-sm">
              <AddToCartButton product={product} disabled={outOfStock} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
