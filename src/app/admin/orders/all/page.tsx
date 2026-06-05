import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { countArchived } from "@/lib/legacy";

export default async function AdminOrdersAllSummaryPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { web, wholesale, total } = await countArchived();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ออเดอร์ทั้งหมด</h1>
          <p className="text-stone-600">เลือกประเภทออเดอร์เพื่อดูรายละเอียด</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/orders/history" className="text-sm text-red-600 hover:underline">
            ดูหน้าประวัติออเดอร์โดยตรง
          </Link>
          <Link href="/admin" className="text-sm text-red-600 hover:underline">
            ← กลับแดชบอร์ด
          </Link>
        </div>
      </div>

      <div className="mt-3">
        <Link href="/admin/orders/history" className="text-sm text-red-600 hover:underline">
          ดูประวัติที่จัดเก็บแล้ว ({total})
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/orders/history/web"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 transition hover:ring-red-200"
        >
          <p className="text-sm text-stone-500">ประวัติออเดอร์หน้าเว็บ</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{web}</p>
          <p className="mt-2 text-sm text-stone-600">คลิกเพื่อดูรายการประวัติของหน้าเว็บ</p>
        </Link>

        <Link
          href="/admin/orders/history/wholesale"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 transition hover:ring-red-200"
        >
          <p className="text-sm text-stone-500">ประวัติออเดอร์ร้านค้า / B2B</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{wholesale}</p>
          <p className="mt-2 text-sm text-stone-600">คลิกเพื่อดูรายการประวัติของร้านค้า/B2B</p>
        </Link>
      </section>
    </div>
  );
}
