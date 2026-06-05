import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listAppProducts } from "@/lib/legacy";
import { formatPrice, CATEGORY_LABEL } from "@/lib/utils";
import { CreateProductForm } from "@/components/admin/CreateProductForm";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { ProductStockForm } from "@/components/admin/ProductStockForm";
import { ProductImageForm } from "@/components/admin/ProductImageForm";
import { RestoreProductButton } from "@/components/admin/RestoreProductButton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ showHidden?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { showHidden } = await searchParams;
  const showHiddenProducts = showHidden === "1";

  const allProducts = await listAppProducts();
  const products = allProducts.filter((p) =>
    showHiddenProducts ? !p.isActive : p.isActive
  );
  const hiddenCount = allProducts.filter((p) => !p.isActive).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">จัดการสต๊อก / สินค้า</h1>
          <p className="text-stone-600">
            ข้อมูลสินค้าจากระบบเดิม — เพิ่ม ลบ เปลี่ยนสต๊อกและราคาได้
          </p>
        </div>
        {!showHiddenProducts && <CreateProductForm />}
      </div>

      {!showHiddenProducts && hiddenCount > 0 && (
        <p className="mt-4 text-sm text-stone-500">
          <Link
            href="/admin/products?showHidden=1"
            className="font-medium text-red-600 hover:underline"
          >
            ดูสินค้าที่ปิดขายแล้ว ({hiddenCount})
          </Link>
        </p>
      )}

      {showHiddenProducts && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-stone-100 px-4 py-3 text-sm">
          <span className="text-stone-600">แสดงสินค้าที่ปิดขายแล้ว</span>
          <Link href="/admin/products" className="font-medium text-red-600 hover:underline">
            ← กลับรายการสินค้าปกติ
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {products.length === 0 && (
          <p className="rounded-xl bg-white p-8 text-center text-stone-500 ring-1 ring-stone-200">
            {showHiddenProducts ? "ไม่มีสินค้าที่ปิดขายแล้ว" : "ยังไม่มีสินค้า — กดเพิ่มสินค้าใหม่ด้านบน"}
          </p>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${
              p.stock <= 10 ? "ring-orange-300" : "ring-stone-200"
            }`}
          >
            <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
              <ProductImageForm
                productId={p.id}
                initialImage={p.image}
                productName={p.name}
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">{p.name}</p>
                    <p className="text-xs text-stone-500">
                      {CATEGORY_LABEL[p.category] ?? p.category}
                      {p.sku ? ` · SKU ${p.sku}` : ""} · {p.slug}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      ราคาปัจจุบัน {formatPrice(p.price)}
                      {p.stock <= 10 && (
                        <span className="ml-2 font-medium text-orange-600">
                          ⚠ สต๊อกต่ำ
                        </span>
                      )}
                    </p>
                  </div>
                  {showHiddenProducts ? (
                    <RestoreProductButton productId={p.id} productName={p.name} />
                  ) : (
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  )}
                </div>

                {!showHiddenProducts && (
                  <div className="mt-4">
                    <ProductStockForm
                      productId={p.id}
                      initialStock={p.stock}
                      initialPrice={p.price}
                      initialActive={p.isActive}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
