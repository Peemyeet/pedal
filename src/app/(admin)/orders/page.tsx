import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function formatThb(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatOrderNo(n: number) {
  return `pdl${n.toString().padStart(5, "0")}`;
}

export const dynamic = "force-dynamic";

export default async function WebOrdersPage() {
  const s = await auth();
  if (s?.user?.role !== "ADMIN") {
    redirect("/");
  }
  const orders = await prisma.order.findMany({
    where: { status: { not: "COMPLETED" } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { username: true, email: true, name: true } } },
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="app-page-title">ออเดอร์เว็บ</h1>
        <p className="app-page-lead mt-2 text-base sm:text-lg">
          ออเดอร์ที่ลูกค้าใส่ตะกร้า ล็อกอิน แล้วยืนยันหน้า &quot;ชำระเงิน&quot; (สต็อกหักตอนออเดอร์)
        </p>
      </div>
      {orders.length === 0 ? (
        <p className="app-card p-6 text-[var(--muted)]">ยังไม่มีออเดอร์จากร้านออนไลน์</p>
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <table className="w-full min-w-[min(100%,_720px)] text-left text-base">
            <thead className="app-thead">
              <tr>
                <th className="app-th">เลขที่คำสั่งซื้อ</th>
                <th className="app-th">ลูกค้า</th>
                <th className="app-th">วันที่</th>
                <th className="app-th">สถานะ</th>
                <th className="app-th text-right">รวม</th>
                <th className="app-th min-w-[8rem]">หมายเหตุ</th>
                <th className="app-th min-w-[10rem]">หลักฐานชำระเงิน</th>
                <th className="app-th w-28 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)]">
                  <td className="px-2 py-3 font-mono sm:px-4">{formatOrderNo(o.number)}</td>
                  <td className="px-2 py-3 sm:px-4">
                    {o.user.name ?? o.user.username}
                    <br />
                    <span className="text-sm text-[var(--muted)]">
                      @{o.user.username}
                      {o.user.email ? ` · ${o.user.email}` : ""}
                    </span>
                  </td>
                  <td className="px-2 py-3 tabular-nums sm:px-4">
                    {o.createdAt.toLocaleString("th-TH")}
                  </td>
                  <td className="px-2 py-3 sm:px-4">
                    {o.status === "PENDING"
                      ? "รอดำเนินการ"
                      : o.status === "COMPLETED"
                        ? "เสร็จสิ้น"
                        : "ยกเลิก"}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-4">
                    {formatThb(o.grandTotal)} ฿
                  </td>
                  <td className="px-2 py-3 text-sm sm:px-4">
                    {o.paymentNote || "—"}
                  </td>
                  <td className="px-2 py-3 text-sm sm:px-4">
                    {o.paymentSlipPath ? (
                      <a
                        href={o.paymentSlipPath}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[var(--accent)] hover:underline"
                      >
                        เปิดหลักฐาน
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2 py-3 text-right sm:px-4">
                    <Link
                      href={`/orders/${o.id}`}
                      className="inline-flex font-semibold text-[var(--accent)] hover:underline"
                    >
                      จัดการ
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
