import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export default async function AdminWebOrdersHistoryPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    where: { source: "WEBSITE", archived: true },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ประวัติออเดอร์หน้าเว็บ</h1>
          <p className="text-stone-600">รายการออเดอร์หน้าเว็บที่ถูกจัดเก็บแล้ว</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/orders/history" className="text-sm text-red-600 hover:underline">
            ← กลับหน้าประวัติออเดอร์
          </Link>
          <Link href="/admin/orders/all" className="text-sm text-red-600 hover:underline">
            ไปหน้าออเดอร์ทั้งหมด
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <AdminOrdersTable orders={orders} backSource="web" />
      </div>
    </div>
  );
}
