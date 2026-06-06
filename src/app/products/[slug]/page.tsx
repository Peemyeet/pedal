import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAppProductBySlug } from "@/lib/legacy";
import { formatPrice, CATEGORY_LABEL } from "@/lib/utils";
import { productJsonLd } from "@/lib/seo";
import { HeatBadge } from "@/components/HeatBadge";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ShippingTierInfo } from "@/components/ShippingTierInfo";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getAppProductBySlug(slug);
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
  const product = await getAppProductBySlug(slug);
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
        <Link href="/products" className="text-sm text-red-600 hover:underline">
          ← กลับรายการสินค้า
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-red-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div>
            <p className="text-sm text-stone-500">
              {CATEGORY_LABEL[product.category] ?? product.category}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
            <div className="mt-3">
              <HeatBadge level={product.heatLevel} />
            </div>
            <p className="mt-4 text-2xl font-bold text-red-700">
              {formatPrice(product.price)}
              <span className="ml-2 text-base font-normal text-stone-500">/ กก.</span>
            </p>
            <p className="mt-4 text-stone-600">{product.description}</p>
            <div className="mt-4">
              <ShippingTierInfo />
            </div>
            <p className="mt-2 text-sm text-stone-500">
              {outOfStock ? "สินค้าหมดชั่วคราว" : `คงเหลือ ${product.stock} ชิ้น`}
            </p>
            <div className="mt-8">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: product.image,
                  stock: product.stock,
                }}
                disabled={outOfStock}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
