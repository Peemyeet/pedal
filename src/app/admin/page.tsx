import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  countArchived,
  getSidebarCounts,
  listAppProducts,
  listQuotations,
  listWebOrders,
} from "@/lib/legacy";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const products = await listAppProducts(true);
  const { toShip, unpaid } = await getSidebarCounts();
  const archived = await countArchived();

  const [webOrders, wholesaleOrders] = await Promise.all([
    listWebOrders(),
    listQuotations({ status: { not: "CANCELLED" } }),
  ]);

  const webActive = webOrders.filter((o) => !o.archived);
  const wholesaleActive = wholesaleOrders.filter((o) => !o.archived);
  const lowStock = products.filter((p) => p.stock <= 10).length;

  const recentQuotations = wholesaleActive
    .filter((o) => o.status === "QUOTATION")
    .slice(0, 5);
  const recentOthers = [...webActive, ...wholesaleActive.filter((o) => o.status !== "QUOTATION")]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const recentOrdersMerged = [...recentQuotations, ...recentOthers]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const primaryStats = [
    {
      label: "ออเดอร์ทั้งหมด",
      value: webActive.length + wholesaleActive.length,
      href: "/admin/orders/all",
    },
    { label: "ยังไม่ได้ชำระเงิน", value: unpaid, href: "/admin/orders/unpaid" },
    { label: "ที่ต้องจัดส่ง", value: toShip, href: "/admin/orders/to-ship" },
  ];

  const secondaryStats = [
    { label: "ประวัติออเดอร์", value: archived.total, href: "/admin/orders/history" },
    { label: "ออเดอร์เว็บ", value: webActive.length, href: "/admin/orders/web" },
    {
      label: "ร้านค้า / B2B",
      value: wholesaleActive.length,
      href: "/admin/orders/wholesale",
    },
    {
      label: "ใบเสนอราคารออยู่",
      value: wholesaleActive.filter((o) => o.status === "QUOTATION").length,
      href: "/admin/orders/wholesale?status=QUOTATION",
    },
    {
      label: "ลูกค้า B2B",
      value: await prisma.customer.count(),
      href: "/admin/customers",
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
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
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

      <section className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          รายการเพิ่มเติม
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {secondaryStats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-stone-200 transition hover:ring-red-200"
            >
              <p className="text-sm text-stone-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{s.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href="/admin/products" className="text-stone-600 hover:text-red-600">
          สินค้าเปิดขาย {products.length} รายการ
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
