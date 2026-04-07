import { prisma } from "@/lib/prisma";
import {
  createProduct,
  toggleProductActive,
  updateProductProduction,
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
        <p className="app-page-lead">
          จัดการรหัสและจำนวนคงเหลือ — ราคาขายไม่แสดงในหน้านี้ (กำหนดตอนสร้างใบเสนอราคา) · รายการที่ปิดใช้งานจะไม่ให้เลือกในใบ
          · ซิงก์สต็อกจากไวท์บอร์ด:{" "}
          <code className="rounded-lg bg-[var(--surface-muted)] px-2 py-0.5 text-sm font-mono">
            npm run db:seed-inventory
          </code>
        </p>
      </div>

      <section className="app-card p-4 sm:p-6 md:p-8">
        <h2 className="mb-6 text-xl font-bold">เพิ่มรายการใหม่</h2>
        <form action={createProduct} className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-[var(--foreground)]">โซน · คลังสินค้า</h3>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="sm:col-span-2">
                <label className="app-label">ชื่อรายการ</label>
                <input
                  name="name"
                  required
                  className="mt-2 min-h-12 w-full px-4 text-base"
                />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-amber-200/90 bg-amber-50/50 p-5 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-[var(--foreground)]">โซน · ข้อมูลการผลิต</h3>
            <div className="grid gap-4">
              <div>
                <label className="app-label">รายละเอียด (ไม่บังคับ)</label>
                <textarea
                  name="description"
                  rows={2}
                  className="mt-2 w-full px-4 py-3 text-base"
                />
              </div>
              <div>
                <label className="app-label">หมายเหตุ / ข้อมูลการผลิต</label>
                <textarea
                  name="productionNotes"
                  rows={2}
                  placeholder="เช่น สูตร ขั้นตอน วัตถุดิบ ล็อต"
                  className="mt-2 w-full px-4 py-3 text-base"
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
        <p className="mb-4 text-base text-[var(--muted)]">
          รหัส ชื่อ และจำนวนคงเหลือ (ไม่แสดงราคาขาย)
        </p>
        <div className="app-table-shell">
          <table className="w-full min-w-[640px] text-left text-base">
            <thead className="app-thead">
              <tr>
                <th className="app-th">รหัส</th>
                <th className="app-th">ชื่อ</th>
                <th className="app-th">คงเหลือ</th>
                <th className="app-th">สถานะ</th>
                <th className="app-th w-28 text-right" />
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--muted)]">
                    ยังไม่มีรายการ — รัน{" "}
                    <code className="rounded bg-[var(--surface-muted)] px-1.5 text-sm">npm run db:seed-inventory</code>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-2 py-3 font-mono text-xs sm:px-4 sm:py-4 sm:text-sm">{p.sku ?? "—"}</td>
                    <td className="px-2 py-3 font-medium sm:px-4 sm:py-4">{p.name}</td>
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

      <section>
        <h2 className="mb-2 text-xl font-bold">โซน · ข้อมูลการผลิต</h2>
        <p className="mb-4 text-base text-[var(--muted)]">
          รายละเอียดและหมายเหตุการผลิตต่อรายการ (แยกจากตารางคงคลังด้านบน)
        </p>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="app-card px-6 py-10 text-center text-base text-[var(--muted)]">
              ยังไม่มีรายการ
            </p>
          ) : (
            products.map((p) => (
              <form
                key={p.id}
                action={updateProductProduction}
                className="app-card p-5 sm:p-6"
              >
                <input type="hidden" name="id" value={p.id} />
                <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-mono text-xs text-[var(--muted)]">{p.sku ?? "—"}</span>
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="app-label text-sm">รายละเอียด</label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={p.description ?? ""}
                      className="mt-2 w-full px-4 py-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="app-label text-sm">ข้อมูลการผลิต</label>
                    <textarea
                      name="productionNotes"
                      rows={3}
                      defaultValue={p.productionNotes ?? ""}
                      placeholder="สูตร ขั้นตอน วัตถุดิบ ฯลฯ"
                      className="mt-2 w-full px-4 py-3 text-base"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 text-base font-semibold text-[var(--accent)] hover:underline"
                >
                  บันทึกข้อมูลการผลิต
                </button>
              </form>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
