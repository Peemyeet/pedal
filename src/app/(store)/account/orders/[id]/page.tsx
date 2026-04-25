import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderReceipt } from "./OrderReceipt";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

function formatOrderNo(n: number) {
  return `pdl${n.toString().padStart(5, "0")}`;
}

export default async function MyOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await auth();
  if (!s?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/orders");
  }
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: s.user.id },
    include: {
      lines: { include: { product: { select: { name: true, sku: true } } } },
    },
  });
  if (!order) {
    notFound();
  }

  const hasShipping = Boolean(
    order.shippingName || order.shippingAddress || order.shippingPostalCode,
  );

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Link
          href="/account/orders"
          className="text-sm font-semibold text-[var(--accent)] transition hover:underline"
        >
          ← ออเดอร์ของฉัน
        </Link>
        <h1 className="app-page-title mt-3">รายละเอียดออเดอร์</h1>
        <p className="app-page-lead mt-2 max-w-2xl text-base">
          เลขที่คำสั่งซื้อ {formatOrderNo(order.number)} — ดูคำสั่งซื้อ ที่อยู่/รหัสไปรษณีย์ และพิมพ์เก็บได้
        </p>
        <div className="mt-4">
          <PrintButton />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">1) ใบเสนอราคา</h2>
        <OrderReceipt
          number={order.number}
          status={order.status}
          createdAt={order.createdAt}
          paymentNote={order.paymentNote}
          paymentSubmittedAt={order.paymentSubmittedAt}
          subtotal={order.subtotal}
          shippingTotal={order.shippingTotal}
          grandTotal={order.grandTotal}
          hasShipping={hasShipping}
          shippingName={order.shippingName}
          shippingAddress={order.shippingAddress}
          shippingPostalCode={order.shippingPostalCode}
          shippingPhone={order.shippingPhone}
          lines={order.lines.map((line) => ({
            id: line.id,
            sku: line.product.sku,
            name: line.product.name,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            lineShipping: line.lineShipping,
          }))}
        />
      </section>

      <section className="app-card space-y-3 p-5 sm:p-6 print:hidden">
        <h2 className="text-xl font-bold">2) ช่องทางการชำระเงิน (หลักฐาน)</h2>
        <p className="text-base text-[var(--muted)]">
          ชำระผ่าน QR และแนบหลักฐานได้ในหน้าชำระเงินของออเดอร์นี้
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/account/orders/${order.id}/pay`} className="app-btn-primary">
            ไปหน้าชำระเงิน / แนบสลิป
          </Link>
          {order.paymentNote ? (
            <span className="text-sm text-[var(--muted)]">หมายเหตุล่าสุด: {order.paymentNote}</span>
          ) : null}
        </div>
      </section>

      <section className="app-card space-y-3 p-5 sm:p-6 print:hidden">
        <h2 className="text-xl font-bold">3) ช่องทางการส่งของ</h2>
        {hasShipping ? (
          <div className="space-y-1 text-base">
            <p className="font-medium">{order.shippingName || "—"}</p>
            <p className="whitespace-pre-wrap text-[var(--muted)]">{order.shippingAddress || "—"}</p>
            <p className="text-[var(--muted)]">
              รหัสไปรษณีย์ {order.shippingPostalCode || "—"}
              {order.shippingPhone ? ` · โทร ${order.shippingPhone}` : ""}
            </p>
            <p className="pt-2">
              <span className="text-[var(--muted)]">เลข Tracking:</span>{" "}
              <span className="font-mono font-semibold">
                {order.trackingNumber || "รอแอดมินอัปเดตเลขพัสดุ"}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-[var(--muted)]">ยังไม่มีข้อมูลจัดส่งในออเดอร์นี้</p>
        )}
      </section>
    </div>
  );
}
