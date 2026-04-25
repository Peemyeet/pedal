import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function formatThb(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatOrderNo(n: number | string) {
  const asNum = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(asNum)) return String(n);
  return `pdl${Math.floor(asNum).toString().padStart(5, "0")}`;
}

export const dynamic = "force-dynamic";

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const s = await auth();
  if (!s?.user?.id) {
    return (
      <p className="app-card p-6">
        กรุณา <Link className="font-semibold text-[var(--accent)]" href="/auth/login">เข้าสู่ระบบ</Link>
      </p>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: s.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      {q?.ok ? (
        <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 sm:text-base">
          รับออเดอร์สำเร็จ
          {q.no != null
            ? ` (เลขที่คำสั่งซื้อ ${formatOrderNo(Array.isArray(q.no) ? q.no[0] : q.no)})`
            : ""}
        </p>
      ) : null}
      {q?.paid ? (
        <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 sm:text-base">
          แจ้งชำระเงินเรียบร้อยแล้ว
          {q.no != null
            ? ` (เลขที่คำสั่งซื้อ ${formatOrderNo(Array.isArray(q.no) ? q.no[0] : q.no)})`
            : ""}
        </p>
      ) : null}
      <h1 className="app-page-title">ออเดอร์ของฉัน</h1>
      {orders.length === 0 ? (
        <p className="app-card p-6 text-[var(--muted)]">ยังไม่มีออเดอร์</p>
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-base">
            <thead className="app-thead">
              <tr>
                <th className="app-th">เลขที่คำสั่งซื้อ</th>
                <th className="app-th">วันที่</th>
                <th className="app-th">สถานะ</th>
                <th className="app-th text-right">ยอดรวม</th>
                <th className="app-th w-52 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)]">
                  <td className="px-2 py-3 font-mono sm:px-4">
                    <Link
                      className={[
                        "font-semibold hover:underline",
                        o.status === "PENDING" && !o.paymentSubmittedAt
                          ? "text-red-600 hover:text-red-700"
                          : "text-emerald-700 hover:text-emerald-800",
                      ].join(" ")}
                      href={`/account/orders/${o.id}`}
                    >
                      {formatOrderNo(o.number)}
                    </Link>
                  </td>
                  <td className="px-2 py-3 tabular-nums sm:px-4">
                    {o.createdAt.toLocaleString("th-TH")}
                  </td>
                  <td className="px-2 py-3 sm:px-4">
                    {o.status === "PENDING"
                      ? o.paymentSubmittedAt
                        ? "ชำระเงินแล้ว"
                        : "รอดำเนินการ"
                      : o.status === "COMPLETED"
                        ? "เสร็จสิ้น"
                        : "ยกเลิก"}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-4">
                    {formatThb(o.grandTotal)} ฿
                  </td>
                  <td className="px-2 py-3 text-right sm:px-4">
                    <div className="flex justify-end gap-3">
                      {o.status === "PENDING" && !o.paymentSubmittedAt ? (
                        <Link
                          className="font-semibold text-emerald-700 hover:underline"
                          href={`/account/orders/${o.id}/pay`}
                        >
                          ชำระเงิน
                        </Link>
                      ) : null}
                      <Link
                        className="font-semibold text-[var(--accent)] hover:underline"
                        href={`/account/orders/${o.id}`}
                      >
                        รายละเอียด
                      </Link>
                    </div>
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
