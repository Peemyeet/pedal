import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatusPanel } from "../OrderStatusPanel";
import { updateOrderTracking } from "../actions";

function formatThb(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatOrderNo(n: number) {
  return `pdl${n.toString().padStart(5, "0")}`;
}

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await auth();
  if (s?.user?.role !== "ADMIN") {
    redirect("/");
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, username: true, email: true } },
      lines: { include: { product: { select: { name: true, sku: true } } } },
    },
  });
  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/orders"
          className="text-sm font-semibold text-[var(--accent)] transition hover:underline"
        >
          ← ออเดอร์เว็บ
        </Link>
        <h1 className="app-page-title mt-3">ออเดอร์ {formatOrderNo(order.number)}</h1>
        <p className="app-page-lead mt-2 text-base sm:text-lg">
          วันที่ {order.createdAt.toLocaleString("th-TH")} · สถานะ{" "}
          {order.status === "PENDING"
            ? "รอดำเนินการ"
            : order.status === "COMPLETED"
              ? "เสร็จสิ้น"
              : "ยกเลิก"}
        </p>
      </div>

      <section className="app-card p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">ข้อมูลลูกค้า</h2>
        <dl className="grid gap-3 text-base sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">ชื่อ</dt>
            <dd>{order.user.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">ชื่อผู้ใช้</dt>
            <dd>@{order.user.username}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">อีเมล</dt>
            <dd>{order.user.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">สถานะออเดอร์</dt>
            <dd>
              {order.status === "PENDING"
                ? "รอดำเนินการ"
                : order.status === "COMPLETED"
                  ? "เสร็จสิ้น"
                  : "ยกเลิก"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--muted)]">หมายเหตุชำระเงิน</dt>
            <dd>{order.paymentNote || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--muted)]">หลักฐานการชำระเงิน</dt>
            <dd>
              {order.paymentSlipPath ? (
                <a
                  href={order.paymentSlipPath}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--accent)] hover:underline"
                >
                  เปิดไฟล์หลักฐาน
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          {(order.shippingName || order.shippingAddress || order.shippingPostalCode || order.shippingPhone) && (
            <>
              <div>
                <dt className="text-[var(--muted)]">ชื่อผู้รับ</dt>
                <dd>{order.shippingName || "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">โทร</dt>
                <dd>{order.shippingPhone || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[var(--muted)]">ที่อยู่จัดส่ง</dt>
                <dd className="whitespace-pre-wrap">{order.shippingAddress || "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">รหัสไปรษณีย์</dt>
                <dd className="font-mono tabular-nums">{order.shippingPostalCode || "—"}</dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <section className="app-card p-0 overflow-hidden sm:p-0">
        <h2 className="px-4 pt-4 text-lg font-bold sm:px-6 sm:pt-6">รายการ</h2>
        <div className="app-table-shell mt-3 max-sm:mx-0 max-sm:rounded-none">
          <table className="w-full min-w-[520px] text-left text-base">
            <thead className="app-thead">
              <tr>
                <th className="app-th">สินค้า</th>
                <th className="app-th w-32 text-right">ราคา/หน่วย</th>
                <th className="app-th w-24">จำนวน</th>
                <th className="app-th w-28 text-right">ส่ง/แถว</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => (
                <tr key={line.id} className="border-t border-[var(--border)]">
                  <td className="px-2 py-3 sm:px-4">
                    {line.product.sku ? (
                      <span className="text-[var(--muted)]">[{line.product.sku}] </span>
                    ) : null}
                    {line.product.name}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-4">
                    {formatThb(line.unitPrice)} ฿
                  </td>
                  <td className="px-2 py-3 sm:px-4">{line.quantity}</td>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-4">
                    {formatThb(line.lineShipping)} ฿
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 border-t border-[var(--border)] p-4 text-base sm:p-6">
          <div className="flex justify-between gap-4">
            <span className="text-[var(--muted)]">ยอดสินค้า</span>
            <span className="tabular-nums font-medium">{formatThb(order.subtotal)} ฿</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[var(--muted)]">ค่าส่ง</span>
            <span className="tabular-nums font-medium">{formatThb(order.shippingTotal)} ฿</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-3 text-lg font-bold sm:text-xl">
            <span>รวม</span>
            <span className="tabular-nums">{formatThb(order.grandTotal)} ฿</span>
          </div>
        </div>
      </section>

      <section className="app-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">จัดการสถานะ</h2>
        <div className="mt-3">
          <OrderStatusPanel orderId={order.id} status={order.status} />
        </div>
        <form action={updateOrderTracking} className="mt-5 space-y-2">
          <input type="hidden" name="orderId" value={order.id} />
          <label className="app-label">เลข Tracking (แอดมินกรอก)</label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              name="trackingNumber"
              defaultValue={order.trackingNumber ?? ""}
              placeholder="เช่น TH1234567890"
              className="min-h-11 w-full max-w-sm px-4 text-base"
            />
            <button type="submit" className="app-btn-secondary">
              บันทึกเลขพัสดุ
            </button>
          </div>
          <p className="text-sm text-[var(--muted)]">ลูกค้าจะเห็นเลขนี้ในหน้ารายละเอียดออเดอร์</p>
        </form>
      </section>
    </div>
  );
}
