import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  buildQuotationWhereFromFilter,
  filterAppOrdersByStatus,
  listQuotations,
  searchAppOrders,
} from "@/lib/legacy";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { ORDER_STATUS_LABEL } from "@/lib/utils";
import { OrderSearchBar } from "@/components/admin/OrderSearchBar";
import { Suspense } from "react";

export default async function AdminWholesaleOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; filter?: string; q?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { status: statusParam, filter, q } = await searchParams;
  const isUnpaidFilter = filter === "UNPAID";
  const isUnshippedFilter = filter === "UNSHIPPED";

  const baseWhere: Prisma.QuotationWhereInput = isUnpaidFilter
    ? buildQuotationWhereFromFilter("UNPAID")
    : isUnshippedFilter
      ? buildQuotationWhereFromFilter("UNSHIPPED")
      : statusParam === "SHIPPED"
        ? { status: "CONFIRMED", shippedAt: { not: null } }
        : { status: { not: "CANCELLED" }, shippedAt: null };

  let orders = await listQuotations(baseWhere);
  orders = orders.filter((o) =>
    statusParam === "SHIPPED" ? o.archived || o.status === "SHIPPED" : !o.archived
  );
  if (!isUnpaidFilter && !isUnshippedFilter && statusParam) {
    orders = filterAppOrdersByStatus(orders, statusParam);
  }
  orders = searchAppOrders(orders, q);

  const allQuotations = await listQuotations({
    status: { not: "CANCELLED" },
  });
  const active = allQuotations.filter((o) => !o.archived);
  const countBy = (s: string) => active.filter((o) => o.status === s).length;
  const allCount = active.length;
  const unpaidCount = active.filter((o) =>
    ["QUOTATION", "CONFIRMED", "PENDING"].includes(o.status)
  ).length;
  const unshippedCount = countBy("PAID");

  const activeKey = isUnpaidFilter
    ? "unpaid"
    : isUnshippedFilter
      ? "unshipped"
      : statusParam ?? "all";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ร้านค้า / ใบเสนอราคา</h1>
          <p className="text-stone-600">
            ข้อมูลจากระบบเดิม — ใบเสนอราคา {allCount} รายการ
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          + สร้างใบเสนอราคา / ออเดอร์
        </Link>
      </div>

      <div className="mt-4">
        <Suspense fallback={null}>
          <OrderSearchBar />
        </Suspense>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { key: "all", href: "/admin/orders/wholesale", label: `ทั้งหมด (${allCount})` },
          {
            key: "QUOTATION",
            href: "/admin/orders/wholesale?status=QUOTATION",
            label: `${ORDER_STATUS_LABEL.QUOTATION} (${countBy("QUOTATION")})`,
          },
          {
            key: "CONFIRMED",
            href: "/admin/orders/wholesale?status=CONFIRMED",
            label: `${ORDER_STATUS_LABEL.CONFIRMED} (${countBy("CONFIRMED")})`,
          },
          {
            key: "unpaid",
            href: "/admin/orders/wholesale?filter=UNPAID",
            label: `ยังไม่ได้ชำระเงิน (${unpaidCount})`,
          },
          {
            key: "PAID",
            href: "/admin/orders/wholesale?status=PAID",
            label: `ยืนยันรับเงิน (${countBy("PAID")})`,
          },
          {
            key: "unshipped",
            href: "/admin/orders/wholesale?filter=UNSHIPPED",
            label: `ยังไม่ได้จัดส่ง (${unshippedCount})`,
          },
          {
            key: "SHIPPED",
            href: "/admin/orders/wholesale?status=SHIPPED",
            label: `${ORDER_STATUS_LABEL.SHIPPED} (${countBy("SHIPPED")})`,
          },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm ${
              activeKey === tab.key
                ? "bg-red-600 font-semibold text-white"
                : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <AdminOrdersTable orders={orders} backSource="wholesale" />
      </div>
    </div>
  );
}
