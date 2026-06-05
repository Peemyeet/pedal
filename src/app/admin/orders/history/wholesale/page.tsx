import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listQuotations } from "@/lib/legacy";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export default async function AdminWholesaleOrderHistoryPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const orders = (
    await listQuotations({
      status: "CONFIRMED",
      shippedAt: { not: null },
    })
  ).filter((o) => o.archived);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ประวัติออเดอร์ร้านค้า / B2B</h1>
          <p className="text-stone-600">ใบเสนอราคาที่จัดส่งแล้ว</p>
        </div>
        <Link href="/admin/orders/all" className="text-sm text-red-600 hover:underline">
          ← กลับออเดอร์ทั้งหมด
        </Link>
      </div>
      <div className="mt-6">
        <AdminOrdersTable orders={orders} backSource="wholesale" />
      </div>
    </div>
  );
}
