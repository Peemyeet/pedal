import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getToShipSummaryCounts } from "@/lib/legacy";

export default async function AdminOrdersToShipPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { webCount, wholesaleCount } = await getToShipSummaryCounts();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ที่ต้องจัดส่งทั้งหมด</h1>
          <p className="text-stone-600">รวมออเดอร์หน้าเว็บและร้านค้า / B2B</p>
        </div>
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          ← กลับแดชบอร์ด
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/orders/web?filter=UNSHIPPED"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 transition hover:ring-red-200"
        >
          <p className="text-sm text-stone-500">ออเดอร์หน้าเว็บ</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{webCount}</p>
          <p className="mt-2 text-sm text-stone-600">คลิกเพื่อดูรายละเอียดรายการที่ต้องจัดส่ง</p>
        </Link>

        <Link
          href="/admin/orders/wholesale?filter=UNSHIPPED"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 transition hover:ring-red-200"
        >
          <p className="text-sm text-stone-500">ร้านค้า / B2B</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{wholesaleCount}</p>
          <p className="mt-2 text-sm text-stone-600">คลิกเพื่อดูรายละเอียดรายการที่ต้องจัดส่ง</p>
        </Link>
      </section>
    </div>
  );
}
