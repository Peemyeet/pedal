import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { parseOrderStatusParam } from "@/lib/order-status";
import { WEBSITE_ORDER_TAB_STATUSES, getOrderStatusLabel } from "@/lib/utils";
import { buildOrderSearchFilter, mergeOrderWhere } from "@/lib/order-audit";
import { OrderSearchBar } from "@/components/admin/OrderSearchBar";
import { Suspense } from "react";

export default async function AdminWebOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; filter?: string; q?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { status: statusParam, filter, q } = await searchParams;
  const status = parseOrderStatusParam(statusParam);
  const isProcessingFilter = filter === "PROCESSING";
  const isPaidFilter = filter === "PAID";
  const isUnshippedFilter = filter === "UNSHIPPED";
  const where: Prisma.OrderWhereInput = {
    source: "WEBSITE",
    archived: false,
    ...(!isProcessingFilter && !isPaidFilter && !isUnshippedFilter && status
      ? { status }
      : {}),
  };

  if (isProcessingFilter) {
    where.status = { in: ["PENDING", "CONFIRMED"] };
  }

  if (isPaidFilter) {
    where.status = "WAITING_SHIPMENT";
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
    prisma.order.count({ where: { source: "WEBSITE", archived: false } }),
    prisma.order.groupBy({
      by: ["status"],
      where: { source: "WEBSITE", archived: false },
      _count: { _all: true },
    }),
  ]);
  const statusCountMap = new Map(
    groupedStatusCounts.map((item) => [item.status, item._count._all])
  );
  const processingCount =
    (statusCountMap.get("PENDING") ?? 0) + (statusCountMap.get("CONFIRMED") ?? 0);
  const unshippedCount = statusCountMap.get("WAITING_SHIPMENT") ?? 0;

  const statusTabs = [
    {
      key: "all",
      label: `ทั้งหมด (${allCount})`,
      href: "/admin/orders/web",
    },
    {
      key: "pending",
      label: `รอดำเนินการ (${processingCount})`,
      href: "/admin/orders/web?filter=PROCESSING",
    },
    ...WEBSITE_ORDER_TAB_STATUSES.flatMap((s) => {
      if (s === "SHIPPED") {
        return [
          {
            key: "paid",
            label: `ชำระเงินแล้ว (${unshippedCount})`,
            href: "/admin/orders/web?filter=PAID",
          },
          {
            key: "unshipped",
            label: `ยังไม่ได้จัดส่ง (${unshippedCount})`,
            href: "/admin/orders/web?filter=UNSHIPPED",
          },
          {
            key: s,
            label: `${getOrderStatusLabel(s, "WEBSITE")} (${statusCountMap.get(s) ?? 0})`,
            href: `/admin/orders/web?status=${s}`,
          },
        ];
      }
      return [
        {
          key: s,
          label: `${getOrderStatusLabel(s, "WEBSITE")} (${statusCountMap.get(s) ?? 0})`,
          href: `/admin/orders/web?status=${s}`,
        },
      ];
    }),
  ];

  const activeKey = isProcessingFilter
    ? "pending"
    : isPaidFilter
      ? "paid"
      : isUnshippedFilter
      ? "unshipped"
      : status ?? "all";

  return (
    <div>
      <h1 className="text-2xl font-bold">ออเดอร์จากหน้าเว็บ</h1>
      <p className="text-stone-600">
        ลูกค้าสั่งซื้อออนไลน์ ราคาตามที่แสดงบนเว็บไซต์
      </p>

      <div className="mt-4">
        <Suspense fallback={null}>
          <OrderSearchBar />
        </Suspense>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
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
        <AdminOrdersTable orders={orders} backSource="web" />
      </div>
    </div>
  );
}
