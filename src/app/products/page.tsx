import type { Metadata } from "next";
import Link from "next/link";
import { listAppProducts } from "@/lib/legacy";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด",
  description:
    "เลือกซื้อสินค้าเผ็ดหลาย คัดเกรด ส่งถึงบ้าน",
  alternates: { canonical: "/products" },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listAppProducts(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">สินค้าทั้งหมด</h1>
      <p className="mt-2 text-stone-600">สินค้าเผ็ดหลาย</p>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-stone-500">ยังไม่มีสินค้าเปิดขาย</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <p className="mt-10 text-center">
        <Link href="/" className="text-red-600 hover:underline">
          ← กลับหน้าแรก
        </Link>
      </p>
    </div>
  );
}
