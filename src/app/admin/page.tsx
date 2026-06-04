import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const [
    totalOrders,
    archivedOrders,
    webOrders,
    webPending,
    wholesaleOrders,
    quotations,
    unpaidOrders,
    totalOrdersToShip,
    webOrdersToShip,
    wholesaleOrdersToShip,
    productCount,
    lowStock,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { archived: true } }),
    prisma.order.count({ where: { source: "WEBSITE", archived: false } }),
    prisma.order.count({
      where: { source: "WEBSITE", status: "PENDING", archived: false },
    }),
    prisma.order.count({ where: { source: "WHOLESALE", archived: false } }),
    prisma.order.count({
      where: { source: "WHOLESALE", status: "QUOTATION", archived: false },
    }),
    prisma.order.count({
      where: {
        OR: [
          { source: "WHOLESALE", status: "QUOTATION", archived: false },
          { status: { in: ["PENDING", "CONFIRMED"] }, archived: false },
        ],
      },
    }),
    prisma.order.count({
      where: { status: "WAITING_SHIPMENT", archived: false },
    }),
    prisma.order.count({
      where: { source: "WEBSITE", status: "WAITING_SHIPMENT", archived: false },
    }),
    prisma.order.count({
      where: { source: "WHOLESALE", status: "WAITING_SHIPMENT", archived: false },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
  ]);

  const [recentOrders, recentQuotations] = await Promise.all([
    prisma.order.findMany({
      where: { archived: false, status: { not: "QUOTATION" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.order.findMany({
      where: { archived: false, status: "QUOTATION" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
  ]);

  const recentOrdersMerged = [...recentQuotations, ...recentOrders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const primaryStats = [
    { label: "ออเดอร์ทั้งหมด", value: totalOrders, href: "/admin/orders/all" },
    {
      label: "ยังไม่ได้ชำระเงิน",
      value: unpaidOrders,
      href: "/admin/orders/unpaid",
    },
    {
      label: "ที่ต้องจัดส่ง",
      value: totalOrdersToShip,
      href: "/admin/orders/to-ship",
    },
  ];

  const secondaryStats = [
    { label: "ประวัติออเดอร์", value: archivedOrders, href: "/admin/orders/history" },
    { label: "ออเดอร์เว็บ", value: webOrders, href: "/admin/orders/web" },
    {
      label: "เว็บรอดำเนินการ",
      value: webPending,
      href: "/admin/orders/web?status=PENDING",
    },
    {
      label: "ร้านค้า / B2B",
      value: wholesaleOrders,
      href: "/admin/orders/wholesale",
    },
    {
      label: "ส่งเว็บ",
      value: webOrdersToShip,
      href: "/admin/orders/web?filter=UNSHIPPED",
    },
    {
      label: "ส่งร้านค้า/B2B",
      value: wholesaleOrdersToShip,
      href: "/admin/orders/wholesale?filter=UNSHIPPED",
    },
    {
      label: "ใบเสนอราคารออยู่",
      value: quotations,
      href: "/admin/orders/wholesale?status=QUOTATION",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">แดชบอร์ด</h1>
      <p className="text-stone-600">สวัสดี, {admin.name}</p>

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
        <Link
          href="/admin/products"
          className="text-stone-600 hover:text-red-600"
        >
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
        <Link
          href="/admin/orders/new"
          className="font-medium text-red-600 hover:underline"
        >
          + สร้างใบเสนอราคา
        </Link>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ออเดอร์ล่าสุด</h2>
          <Link
            href="/admin/orders/all"
            className="text-sm text-red-600 hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>
        <RecentOrdersTable orders={recentOrdersMerged} />
      </section>
    </div>
  );
}
