import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listQuotations, listWebOrders } from "@/lib/legacy";

export default async function AdminOrdersUnpaidSummaryPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const [webOrders, wholesaleOrders] = await Promise.all([
    listWebOrders({ status: "PENDING" }),
    listQuotations({
      status: { in: ["DRAFT", "QUOTED", "CONFIRMED"] },
      paymentConfirmedAt: null,
    }),
  ]);

  const webCount = webOrders.filter((o) => !o.archived && o.status === "PENDING").length;
  const wholesaleCount = wholesaleOrders.filter((o) =>
    !o.archived && ["QUOTATION", "CONFIRMED"].includes(o.status)
  ).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ยังไม่ได้ชำระเงิน</h1>
          <p className="text-stone-600">เลือกประเภทออเดอร์เพื่อดูรายละเอียด</p>
        </div>
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          ← กลับแดชบอร์ด
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/orders/web?filter=PROCESSING"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 transition hover:ring-red-200"
        >
          <p className="text-sm text-stone-500">ออเดอร์หน้าเว็บ</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{webCount}</p>
          <p className="mt-2 text-sm text-stone-600">คลิกเพื่อดูรายการยังไม่ได้ชำระเงินของหน้าเว็บ</p>
        </Link>
        <Link
          href="/admin/orders/wholesale?filter=UNPAID"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 transition hover:ring-red-200"
        >
          <p className="text-sm text-stone-500">ร้านค้า / B2B</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{wholesaleCount}</p>
          <p className="mt-2 text-sm text-stone-600">คลิกเพื่อดูรายการยังไม่ได้ชำระเงินของร้านค้า/B2B</p>
        </Link>
      </section>
    </div>
  );
}
