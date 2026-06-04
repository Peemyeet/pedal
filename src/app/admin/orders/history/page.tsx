import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export default async function AdminOrdersHistoryPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const [webOrders, wholesaleOrders] = await Promise.all([
    prisma.order.findMany({
      where: { source: "WEBSITE", archived: true },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: { source: "WHOLESALE", archived: true },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ประวัติออเดอร์</h1>
          <p className="text-stone-600">รายการที่จัดเก็บแล้ว (รวมที่ส่งสำเร็จ)</p>
        </div>
        <Link href="/admin/orders/all" className="text-sm text-red-600 hover:underline">
          ← กลับออเดอร์ทั้งหมด
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">ออเดอร์หน้าเว็บ</h2>
        <AdminOrdersTable orders={webOrders} backSource="web" />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">ร้านค้า / B2B</h2>
        <AdminOrdersTable orders={wholesaleOrders} backSource="wholesale" />
      </section>
    </div>
  );
}
