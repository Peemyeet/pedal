import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { lineItemsSubtotal, shippingTotalFromQuotation } from "@/lib/quotation-totals";

export const dynamic = "force-dynamic";

export default async function FulfillmentPage() {
  const items = await prisma.quotation.findMany({
    where: { status: "CONFIRMED" },
    orderBy: { updatedAt: "desc" },
    include: {
      lines: { include: { product: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-title">ยืนยันแล้ว · ชำระเงินและส่งของ</h1>
        <p className="app-page-lead">
          หลังลูกค้ายืนยันซื้อ ข้อมูลการชำระเงินและการจัดส่งจะอัปเดตจากฐานข้อมูลและแสดงที่นี่
        </p>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="app-card px-6 py-14 text-center text-base text-[var(--muted)]">
            ยังไม่มีใบที่ลูกค้ายืนยัน — ไปที่ &quot;เสนอราคาแล้ว&quot; แล้วกดยืนยันการซื้อ
          </p>
        ) : (
          items.map((q) => {
            const sub = lineItemsSubtotal(q.lines);
            const total = sub + shippingTotalFromQuotation(q);
            const paid = !!q.paymentConfirmedAt;
            const sent = !!q.shippedAt;
            return (
              <Link
                key={q.id}
                href={`/quotations/${q.id}`}
                className="app-card group block p-6 transition hover:border-[var(--accent)] hover:shadow-[0_16px_40px_rgba(28,25,23,0.12)] sm:p-7"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-lg font-bold text-[var(--foreground)]">
                    ใบเลขที่ {q.number}
                  </span>
                  <span className="text-base font-medium text-[var(--muted)]">
                    {q.customerName ?? "ไม่ระบุชื่อ"}
                  </span>
                </div>
                <p className="mt-3 text-base text-[var(--muted)]">
                  รวม{" "}
                  <span className="font-semibold tabular-nums text-[var(--foreground)]">
                    {total.toLocaleString("th-TH")}
                  </span>{" "}
                  บาท
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <span
                    className={
                      paid
                        ? "inline-flex rounded-full bg-emerald-100 px-3 py-1.5 font-medium text-emerald-900"
                        : "inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1.5 font-medium text-[var(--muted)]"
                    }
                  >
                    {paid
                      ? `ชำระแล้ว · ${q.paymentConfirmedAt?.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}${q.paymentTransactionRef ? ` · ${q.paymentTransactionRef}` : ""}`
                      : "ยังไม่ชำระเงิน"}
                  </span>
                  <span
                    className={
                      sent
                        ? "inline-flex rounded-full bg-sky-100 px-3 py-1.5 font-medium text-sky-900"
                        : "inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1.5 font-medium text-[var(--muted)]"
                    }
                  >
                    {sent
                      ? `ส่งแล้ว · ${q.shippedAt?.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })} ${q.trackingNumber ? `· ${q.trackingNumber}` : ""}`
                      : "ยังไม่ส่งของ"}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-[var(--accent)] group-hover:underline">
                  เปิดใบนี้ →
                </p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
