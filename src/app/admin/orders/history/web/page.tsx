import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listWebOrders } from "@/lib/legacy";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export default async function AdminWebOrderHistoryPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const orders = (await listWebOrders({ status: "COMPLETED" })).filter((o) => o.archived);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ประวัติออเดอร์หน้าเว็บ</h1>
          <p className="text-stone-600">ออเดอร์ที่เสร็จสมบูรณ์แล้ว</p>
        </div>
        <Link href="/admin/orders/all" className="text-sm text-red-600 hover:underline">
          ← กลับออเดอร์ทั้งหมด
        </Link>
      </div>
      <div className="mt-6">
        <AdminOrdersTable orders={orders} backSource="web" />
      </div>
    </div>
  );
}
