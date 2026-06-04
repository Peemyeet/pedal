import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_LABEL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด",
  description:
    "เลือกซื้อพริกสด แห้ง น้ำพริก และซอสพริกจาก PEDLAI คุณภาพคัดเกรด ส่งถึงบ้าน",
  alternates: { canonical: "/products" },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: { name: "asc" },
  });

  const categories = Object.entries(CATEGORY_LABEL);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">สินค้าทั้งหมด</h1>
      <p className="mt-2 text-stone-600">พริกคุณภาพจาก PEDLAI</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !category
              ? "bg-red-600 text-white"
              : "bg-white text-stone-700 ring-1 ring-red-100 hover:bg-red-50"
          }`}
        >
          ทั้งหมด
        </Link>
        {categories.map(([key, label]) => (
          <Link
            key={key}
            href={`/products?category=${key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              category === key
                ? "bg-red-600 text-white"
                : "bg-white text-stone-700 ring-1 ring-red-100 hover:bg-red-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <p className="col-span-full text-center text-stone-500">
            ไม่พบสินค้าในหมวดนี้
          </p>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}
