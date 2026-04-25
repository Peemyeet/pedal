import { prisma } from "@/lib/prisma";
import {
  createProduct,
  toggleProductActive,
  updateProductPrice,
  updateProductStock,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ sku: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-12">
      <div>
        <h1 className="app-page-title">คลังสินค้า</h1>
      </div>

      <section className="app-card p-4 sm:p-6 md:p-8">
        <h2 className="mb-6 text-xl font-bold">เพิ่มรายการใหม่</h2>
        <form action={createProduct} className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-[var(--foreground)]">โซน · คลังสินค้า</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="app-label">รหัส (ไม่บังคับ แต่ห้ามซ้ำ)</label>
                <input
                  name="sku"
                  placeholder="เช่น 11"
                  className="mt-2 min-h-12 w-full px-4 text-base"
                />
              </div>
              <div>
                <label className="app-label">จำนวนในคลังเริ่มต้น</label>
                <input
                  name="stock"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className="mt-2 min-h-12 w-full px-4 text-base"
                />
              </div>
              <div>
                <label className="app-label">ราคา (บาท)</label>
                <input
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={0}
                  className="mt-2 min-h-12 w-full px-4 text-base"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="app-label">ชื่อรายการ</label>
                <input
                  name="name"
                  required
                  className="mt-2 min-h-12 w-full px-4 text-base"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="app-btn-primary">
            บันทึกรายการ
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-bold">โซน · คลังสินค้า</h2>
        <p className="mb-4 text-base text-[var(--muted)]">รหัส ชื่อ ราคา และจำนวนคงเหลือ — ราคานี้ใช้ในหน้าร้าน</p>
        <div className="app-table-shell">
          <table className="w-full min-w-[min(100%,_880px)] text-left text-base">
            <thead className="app-thead">
              <tr>
                <th className="app-th">รหัส</th>
                <th className="app-th">ชื่อ</th>
                <th className="app-th">ราคา (฿)</th>
                <th className="app-th">คงเหลือ</th>
                <th className="app-th">สถานะ</th>
                <th className="app-th w-28 text-right" />
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">
                    ยังไม่มีรายการ
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-2 py-3 font-mono text-xs sm:px-4 sm:py-4 sm:text-sm">{p.sku ?? "—"}</td>
                    <td className="px-2 py-3 font-medium sm:px-4 sm:py-4">{p.name}</td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4">
                      <form action={updateProductPrice} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          name="price"
                          type="number"
                          min={0}
                          step="0.01"
                          defaultValue={p.price}
                          className="w-32 px-3 py-2 text-base"
                        />
                        <button
                          type="submit"
                          className="shrink-0 text-sm font-semibold text-[var(--accent)] hover:underline"
                        >
                          บันทึก
                        </button>
                      </form>
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4">
                      <form action={updateProductStock} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          name="stock"
                          type="number"
                          min={0}
                          defaultValue={p.stock}
                          className="w-28 px-3 py-2 text-base"
                        />
                        <button
                          type="submit"
                          className="text-sm font-semibold text-[var(--accent)] hover:underline"
                        >
                          บันทึก
                        </button>
                      </form>
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4">
                      {p.active ? (
                        <span className="font-medium text-emerald-700">ใช้งาน</span>
                      ) : (
                        <span className="text-[var(--muted)]">ปิด</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-right sm:px-4 sm:py-4">
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="active" value={p.active ? "0" : "1"} />
                        <button
                          type="submit"
                          className="text-sm font-semibold text-[var(--accent)] hover:underline"
                        >
                          {p.active ? "ปิดการใช้งาน" : "เปิดใช้งาน"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
