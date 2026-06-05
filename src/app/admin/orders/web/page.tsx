import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  filterAppOrdersByStatus,
  listWebOrders,
  searchAppOrders,
} from "@/lib/legacy";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { WEBSITE_ORDER_TAB_STATUSES, getOrderStatusLabel } from "@/lib/utils";
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
  const isProcessingFilter = filter === "PROCESSING";
  const isUnshippedFilter = filter === "UNSHIPPED";

  let orders = await listWebOrders({ status: { not: "CANCELLED" } });
  orders = orders.filter((o) => !o.archived);

  if (isProcessingFilter) {
    orders = orders.filter((o) => ["PENDING", "CONFIRMED"].includes(o.status));
  } else if (isUnshippedFilter) {
    orders = orders.filter((o) => o.status === "WAITING_SHIPMENT");
  } else if (statusParam) {
    orders = filterAppOrdersByStatus(orders, statusParam);
  }

  orders = searchAppOrders(orders, q);

  const all = await listWebOrders();
  const active = all.filter((o) => !o.archived);
  const countBy = (s: string) => active.filter((o) => o.status === s).length;
  const allCount = active.length;
  const processingCount = active.filter((o) =>
    ["PENDING", "CONFIRMED"].includes(o.status)
  ).length;
  const unshippedCount = countBy("WAITING_SHIPMENT");

  const activeKey = isProcessingFilter
    ? "pending"
    : isUnshippedFilter
      ? "unshipped"
      : statusParam ?? "all";

  const statusTabs = [
    { key: "all", label: `ทั้งหมด (${allCount})`, href: "/admin/orders/web" },
    {
      key: "pending",
      label: `รอดำเนินการ (${processingCount})`,
      href: "/admin/orders/web?filter=PROCESSING",
    },
    ...WEBSITE_ORDER_TAB_STATUSES.flatMap((s) => {
      if (s === "SHIPPED") {
        return [
          {
            key: "unshipped",
            label: `ยังไม่ได้จัดส่ง (${unshippedCount})`,
            href: "/admin/orders/web?filter=UNSHIPPED",
          },
          {
            key: s,
            label: `${getOrderStatusLabel(s, "WEBSITE")} (${countBy(s)})`,
            href: `/admin/orders/web?status=${s}`,
          },
        ];
      }
      return [
        {
          key: s,
          label: `${getOrderStatusLabel(s, "WEBSITE")} (${countBy(s)})`,
          href: `/admin/orders/web?status=${s}`,
        },
      ];
    }),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ออเดอร์หน้าเว็บ</h1>
          <p className="text-stone-600">ข้อมูลจากระบบเดิม — ออเดอร์เว็บ {allCount} รายการ</p>
        </div>
      </div>

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
        <AdminOrdersTable orders={orders} backSource="web" />
      </div>
    </div>
  );
}
