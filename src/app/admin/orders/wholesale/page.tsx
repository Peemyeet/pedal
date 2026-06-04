import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { parseOrderStatusParam } from "@/lib/order-status";
import { ORDER_STATUS_LABEL } from "@/lib/utils";
import { buildOrderSearchFilter, mergeOrderWhere } from "@/lib/order-audit";
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
  const status = parseOrderStatusParam(statusParam);
  const isUnpaidFilter = filter === "UNPAID";
  const isUnshippedFilter = filter === "UNSHIPPED";
  const where: Prisma.OrderWhereInput = {
    source: "WHOLESALE",
    archived: false,
    ...(!isUnpaidFilter && !isUnshippedFilter && status ? { status } : {}),
  };

  if (isUnpaidFilter) {
    where.status = { in: ["QUOTATION", "PENDING", "CONFIRMED"] };
  }
  if (isUnshippedFilter) {
    where.status = "WAITING_SHIPMENT";
  }

  const orders = await prisma.order.findMany({
    where: mergeOrderWhere(where, buildOrderSearchFilter(q)),
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  const [allCount, groupedStatusCounts] = await Promise.all([
    prisma.order.count({ where: { source: "WHOLESALE", archived: false } }),
    prisma.order.groupBy({
      by: ["status"],
      where: { source: "WHOLESALE", archived: false },
      _count: { _all: true },
    }),
  ]);
  const statusCountMap = new Map(
    groupedStatusCounts.map((item) => [item.status, item._count._all])
  );
  const unpaidCount =
    (statusCountMap.get("QUOTATION") ?? 0) +
    (statusCountMap.get("PENDING") ?? 0) +
    (statusCountMap.get("CONFIRMED") ?? 0);
  const unshippedCount = statusCountMap.get("WAITING_SHIPMENT") ?? 0;

  const activeKey = isUnpaidFilter
    ? "unpaid"
    : isUnshippedFilter
      ? "unshipped"
      : status ?? "all";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ร้านค้า / ใบเสนอราคา</h1>
          <p className="text-stone-600">
            ออเดอร์ร้านอาหารและลูกค้า B2B กำหนดราคาเองได้
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
            label: `${ORDER_STATUS_LABEL.QUOTATION} (${statusCountMap.get("QUOTATION") ?? 0})`,
          },
          {
            key: "PENDING",
            href: "/admin/orders/wholesale?status=PENDING",
            label: `${ORDER_STATUS_LABEL.PENDING} (${statusCountMap.get("PENDING") ?? 0})`,
          },
          {
            key: "CONFIRMED",
            href: "/admin/orders/wholesale?status=CONFIRMED",
            label: `${ORDER_STATUS_LABEL.CONFIRMED} (${statusCountMap.get("CONFIRMED") ?? 0})`,
          },
          {
            key: "unpaid",
            href: "/admin/orders/wholesale?filter=UNPAID",
            label: `ยังไม่ได้ชำระเงิน (${unpaidCount})`,
          },
          {
            key: "PAID",
            href: "/admin/orders/wholesale?status=PAID",
            label: `ยืนยันรับเงิน (${statusCountMap.get("PAID") ?? 0})`,
          },
          {
            key: "unshipped",
            href: "/admin/orders/wholesale?filter=UNSHIPPED",
            label: `ยังไม่ได้จัดส่ง (${unshippedCount})`,
          },
          {
            key: "SHIPPED",
            href: "/admin/orders/wholesale?status=SHIPPED",
            label: `${ORDER_STATUS_LABEL.SHIPPED} (${statusCountMap.get("SHIPPED") ?? 0})`,
          },
          {
            key: "DELIVERED",
            href: "/admin/orders/wholesale?status=DELIVERED",
            label: `${ORDER_STATUS_LABEL.DELIVERED} (${statusCountMap.get("DELIVERED") ?? 0})`,
          },
          {
            key: "CANCELLED",
            href: "/admin/orders/wholesale?status=CANCELLED",
            label: `${ORDER_STATUS_LABEL.CANCELLED} (${statusCountMap.get("CANCELLED") ?? 0})`,
          },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`rounded-full px-3 py-1 text-sm ${
              activeKey === tab.key
                ? "bg-red-600 text-white"
                : "bg-white ring-1 ring-stone-200"
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
