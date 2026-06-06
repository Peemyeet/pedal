import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  getProductSummary,
  getWholesaleTabCounts,
  listRecentAppOrders,
} from "@/lib/legacy";
import { ORDER_STATUS_LABEL } from "@/lib/utils";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const [{ unpaidCount, unshippedCount, statusCounts }, { total: productCount, lowStock }, recentOrdersMerged] =
    await Promise.all([
      getWholesaleTabCounts(),
      getProductSummary(),
      listRecentAppOrders(8),
    ]);

  const primaryStats = [
    {
      label: ORDER_STATUS_LABEL.QUOTATION,
      value: statusCounts.QUOTATION ?? 0,
      href: "/admin/orders/wholesale?status=QUOTATION",
    },
    {
      label: ORDER_STATUS_LABEL.CONFIRMED,
      value: statusCounts.CONFIRMED ?? 0,
      href: "/admin/orders/wholesale?status=CONFIRMED",
    },
    {
      label: "ยังไม่ได้ชำระเงิน",
      value: unpaidCount,
      href: "/admin/orders/wholesale?filter=UNPAID",
    },
    {
      label: "ยืนยันชำระแล้ว/รอจัดส่งสินค้า",
      value: statusCounts.PAID ?? 0,
      href: "/admin/orders/wholesale?status=PAID",
    },
    {
      label: "ยังไม่ได้จัดส่ง",
      value: unshippedCount,
      href: "/admin/orders/wholesale?filter=UNSHIPPED",
    },
    {
      label: ORDER_STATUS_LABEL.SHIPPED,
      value: statusCounts.SHIPPED ?? 0,
      href: "/admin/orders/wholesale?status=SHIPPED",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">แดชบอร์ด</h1>
      <p className="text-stone-600">
        สวัสดี, {admin.name} — เชื่อมข้อมูลจากระบบเดิมบน Neon
      </p>

      <section className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          ภาพรวมสำคัญ
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {primaryStats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 transition hover:ring-red-200"
            >
              <p className="text-sm text-stone-500">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-red-700">{s.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href="/admin/products" className="text-stone-600 hover:text-red-600">
          สินค้าเปิดขาย {productCount} รายการ
        </Link>
        {lowStock > 0 && (
          <Link
            href="/admin/products"
            className="font-medium text-orange-600 hover:underline"
          >
            สต๊อกต่ำ {lowStock} รายการ
          </Link>
        )}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ออเดอร์ล่าสุด</h2>
          <Link href="/admin/orders/all" className="text-sm text-red-600 hover:underline">
            ดูทั้งหมด
          </Link>
        </div>
        <RecentOrdersTable orders={recentOrdersMerged} />
      </section>
    </div>
  );
}
