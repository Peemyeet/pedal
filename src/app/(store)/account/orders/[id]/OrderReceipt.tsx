import type { OrderStatus } from "@prisma/client";
import { BRAND } from "@/lib/brand";

function formatThb(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatOrderNo(n: number) {
  return `pdl${n.toString().padStart(5, "0")}`;
}

function statusLabel(s: OrderStatus, paymentSubmittedAt?: Date | null) {
  if (s === "PENDING" && paymentSubmittedAt) return "ชำระเงินแล้ว";
  if (s === "PENDING") return "รอดำเนินการ";
  if (s === "COMPLETED") return "เสร็จสิ้น";
  return "ยกเลิก";
}

type Line = {
  id: string;
  sku: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  lineShipping: number;
};

type Props = {
  number: number;
  status: OrderStatus;
  createdAt: Date;
  paymentNote: string | null;
  paymentSubmittedAt?: Date | null;
  subtotal: number;
  shippingTotal: number;
  grandTotal: number;
  hasShipping: boolean;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingPostalCode: string | null;
  shippingPhone: string | null;
  lines: Line[];
};

export function OrderReceipt({
  number,
  status,
  createdAt,
  paymentNote,
  paymentSubmittedAt,
  subtotal,
  shippingTotal,
  grandTotal,
  hasShipping,
  shippingName,
  shippingAddress,
  shippingPostalCode,
  shippingPhone,
  lines,
}: Props) {
  return (
    <article
      className="app-card border border-[var(--border)] p-5 sm:p-7 print:shadow-none print:ring-0"
      data-order-receipt
    >
      <div className="mb-5 flex flex-col gap-1 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-bold sm:text-xl">{BRAND.name}</p>
          <p className="text-sm text-[var(--muted)]">ใบสรุปคำสั่งซื้อ</p>
        </div>
        <p className="text-right font-mono text-xl font-bold sm:text-2xl">เลขที่คำสั่งซื้อ {formatOrderNo(number)}</p>
      </div>

      <dl className="mb-5 grid gap-2 text-sm sm:grid-cols-2 sm:text-base">
        <div>
          <dt className="text-[var(--muted)]">วันที่</dt>
          <dd className="font-medium">{createdAt.toLocaleString("th-TH")}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">สถานะ</dt>
          <dd className="font-medium">{statusLabel(status, paymentSubmittedAt)}</dd>
        </div>
      </dl>

      {hasShipping ? (
        <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <h2 className="text-sm font-bold text-[var(--foreground)] sm:text-base">จัดส่ง (ที่อยู่/รหัสไปรษณีย์)</h2>
          {shippingName ? <p className="mt-2 font-medium">{shippingName}</p> : null}
          {shippingAddress ? (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed sm:text-base">{shippingAddress}</p>
          ) : null}
          <p className="mt-2 text-sm sm:text-base">
            <span className="text-[var(--muted)]">รหัสไปรษณีย์</span>{" "}
            <span className="font-mono font-semibold tabular-nums">
              {shippingPostalCode || "—"}
            </span>
            {shippingPhone ? (
              <>
                {" "}
                · <span className="text-[var(--muted)]">โทร</span> {shippingPhone}
              </>
            ) : null}
          </p>
        </section>
      ) : (
        <p className="mb-6 text-sm text-[var(--muted)]">ออเดอร์นี้ยังไม่มีข้อมูลที่อยู่จัดส่งในระบบ (สั่งก่อนอัปเดต)</p>
      )}

      <h2 className="mb-3 text-base font-bold sm:text-lg">รายการสินค้า</h2>
      <div className="app-table-shell overflow-x-auto print:mx-0 print:overflow-visible print:border-0">
        <table className="w-full min-w-[480px] text-left text-sm sm:text-base">
          <thead className="app-thead">
            <tr>
              <th className="app-th">สินค้า</th>
              <th className="app-th w-28 text-right">ราคา/หน่วย</th>
              <th className="app-th w-20">จำนวน</th>
              <th className="app-th w-24 text-right">ส่ง/แถว</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-t border-[var(--border)]">
                <td className="px-2 py-2.5 sm:px-3 sm:py-3">
                  {line.sku ? <span className="text-[var(--muted)]">[{line.sku}] </span> : null}
                  {line.name}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums sm:px-3 sm:py-3">{formatThb(line.unitPrice)} ฿</td>
                <td className="px-2 py-2.5 sm:px-3 sm:py-3">{line.quantity}</td>
                <td className="px-2 py-2.5 text-right tabular-nums sm:px-3 sm:py-3">{formatThb(line.lineShipping)} ฿</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-2 text-sm sm:mt-6 sm:text-base">
        <div className="flex justify-between gap-3">
          <span className="text-[var(--muted)]">ยอดสินค้า</span>
          <span className="tabular-nums font-medium">{formatThb(subtotal)} ฿</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[var(--muted)]">ค่าส่ง</span>
          <span className="tabular-nums font-medium">{formatThb(shippingTotal)} ฿</span>
        </div>
        <div className="border-t border-[var(--border)] pt-3 text-base font-bold sm:text-lg">
          <div className="flex justify-between gap-3">
            <span>รวม</span>
            <span className="tabular-nums text-[var(--accent)]">{formatThb(grandTotal)} ฿</span>
          </div>
        </div>
      </div>

      {paymentNote ? (
        <p className="mt-5 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-sm text-amber-950 sm:text-base">
          <span className="font-semibold">หมายเหตุชำระ:</span> {paymentNote}
        </p>
      ) : null}

      <p className="mt-6 text-center text-xs text-[var(--muted)] sm:text-sm print:mt-4">
        เอกสารนี้สร้างจากบัญชีของคุณที่ {BRAND.shortName} — เก็บไว้เป็นหลักฐาน
      </p>
    </article>
  );
}
