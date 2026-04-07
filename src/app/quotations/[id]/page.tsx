import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lineItemsSubtotal, shippingTotalFromQuotation } from "@/lib/quotation-totals";
import { BahtTextBelow } from "@/components/BahtTextBelow";
import { ConfirmPurchaseSection } from "./ConfirmPurchaseSection";
import { FulfillmentPanel } from "./FulfillmentPanel";
import { QuotationExportBar } from "./QuotationExportBar";

const statusLabel: Record<string, string> = {
  DRAFT: "ร่าง",
  QUOTED: "เสนอราคาแล้ว",
  CONFIRMED: "ลูกค้ายืนยันแล้ว",
  CANCELLED: "ยกเลิก",
};

export const dynamic = "force-dynamic";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const q = await prisma.quotation.findUnique({
    where: { id },
    include: {
      lines: { include: { product: true } },
      customer: true,
    },
  });
  if (!q) notFound();

  const sub = lineItemsSubtotal(q.lines);
  const shipTotal = shippingTotalFromQuotation(q);
  const total = sub + shipTotal;

  return (
    <div className="space-y-10">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Link
          href="/quotations/quoted"
          className="shrink-0 text-base font-semibold text-[var(--accent)] hover:underline"
        >
          ← กลับรายการเสนอราคา
        </Link>
        <QuotationExportBar quotationNumber={q.number} />
      </div>

      <div
        id="quotation-print-root"
        className="app-card space-y-6 p-4 sm:space-y-8 sm:p-6 md:p-8 print:rounded-none print:border-0 print:shadow-none"
      >
        <div>
          <h1 className="app-page-title text-2xl sm:text-3xl">ใบเสนอราคาเลขที่ {q.number}</h1>
          <p className="app-page-lead mt-2 text-sm sm:text-base">
            สถานะ: <strong>{statusLabel[q.status] ?? q.status}</strong> · สร้างเมื่อ{" "}
            {q.createdAt.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-bold">ข้อมูลลูกค้า</h2>
          {q.customer ? (
            <p className="mb-4 text-sm print:hidden">
              <Link
                href={`/customers/${q.customer.id}`}
                className="font-medium text-[var(--accent)] hover:underline"
              >
                ฐานข้อมูลลูกค้า: [{q.customer.category}] {q.customer.customerCode}
                {q.customer.name ? ` · ${q.customer.name}` : ""}
              </Link>
            </p>
          ) : null}
          {q.customer ? (
            <p className="mb-4 hidden text-sm print:block">
              <span className="font-medium">
                ลูกค้า: [{q.customer.category}] {q.customer.customerCode}
                {q.customer.name ? ` · ${q.customer.name}` : ""}
              </span>
            </p>
          ) : null}
          <dl className="grid gap-3 text-base sm:grid-cols-2">
            <div>
              <dt className="text-[var(--muted)]">ชื่อ (ในใบ)</dt>
              <dd>{q.customerName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">ติดต่อ</dt>
              <dd>{q.customerContact ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--muted)]">หมายเหตุ</dt>
              <dd>{q.note ?? "—"}</dd>
            </div>
            {q.status === "CONFIRMED" && q.fulfillmentAddressText ? (
              <div className="sm:col-span-2">
                <dt className="text-[var(--muted)]">
                  ที่อยู่จัดส่งที่ใช้
                  {q.fulfillmentAddressSource === "billing"
                    ? " (จากที่อยู่ออกบิล)"
                    : q.fulfillmentAddressSource === "shipping"
                      ? " (จากที่อยู่จัดส่ง)"
                      : q.fulfillmentAddressSource === "quotation_note"
                        ? " (จากหมายเหตุในใบ)"
                        : ""}
                </dt>
                <dd className="whitespace-pre-wrap">{q.fulfillmentAddressText}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--border)] print:border-slate-300">
          <h2 className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-base font-bold sm:px-6 sm:py-4 sm:text-lg print:border-slate-300 print:bg-white">
            รายการสินค้า
          </h2>
          <div className="max-w-full overflow-x-auto print:overflow-visible [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[640px] text-left text-sm sm:text-base">
            <thead className="app-thead print:bg-white">
              <tr>
                <th className="app-th print:px-6 print:py-2">รหัส</th>
                <th className="app-th print:px-6 print:py-2">สินค้า</th>
                <th className="app-th print:px-6 print:py-2">จำนวน</th>
                <th className="app-th print:px-6 print:py-2">ราคา/หน่วย</th>
                <th className="app-th print:px-6 print:py-2">ค่าจัดส่ง</th>
                <th className="app-th text-right print:px-6 print:py-2">รวมแถว</th>
              </tr>
            </thead>
            <tbody>
              {q.lines.map((l) => {
                const lineGross = l.unitPrice * l.quantity + l.shippingFee;
                return (
                  <tr key={l.id} className="border-t border-[var(--border)] print:border-slate-200">
                    <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted)] sm:px-6 sm:py-3.5 sm:text-sm">
                      {l.product.sku ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 font-medium sm:px-6 sm:py-3.5">{l.product.name}</td>
                    <td className="px-3 py-2.5 tabular-nums sm:px-6 sm:py-3.5">{l.quantity}</td>
                    <td className="px-3 py-2.5 tabular-nums sm:px-6 sm:py-3.5">
                      {l.unitPrice.toLocaleString("th-TH")} บาท
                    </td>
                    <td className="px-3 py-2.5 tabular-nums sm:px-6 sm:py-3.5">
                      {l.shippingFee.toLocaleString("th-TH")} บาท
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums sm:px-6 sm:py-3.5">
                      {lineGross.toLocaleString("th-TH")} บาท
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <div className="border-t border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-4 text-sm sm:px-6 sm:py-5 sm:text-base print:border-slate-300 print:bg-white">
            <div className="flex justify-between gap-3">
              <span className="text-[var(--muted)]">ยอดสินค้า</span>
              <span className="tabular-nums">{sub.toLocaleString("th-TH")} บาท</span>
            </div>
            <div className="mt-3 flex justify-between gap-3">
              <span className="text-[var(--muted)]">ค่าขนส่งรวม</span>
              <span className="tabular-nums">{shipTotal.toLocaleString("th-TH")} บาท</span>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-base font-bold sm:flex-row sm:justify-between sm:gap-4 sm:text-lg">
              <span className="shrink-0">รวมทั้งสิ้น</span>
              <div className="font-normal sm:text-right">
                <span className="block tabular-nums text-lg font-bold sm:text-xl">
                  {total.toLocaleString("th-TH")} บาท
                </span>
                <BahtTextBelow
                  amount={total}
                  className="mt-1 max-w-md text-xs font-normal leading-relaxed text-[var(--muted)] print:max-w-none sm:text-sm sm:ml-auto"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="no-print space-y-10">
        {q.status === "QUOTED" ? (
          <ConfirmPurchaseSection
            quotationId={q.id}
            subtotal={sub}
            shippingTotal={shipTotal}
            grandTotal={total}
            hasCustomer={!!q.customer}
            billingAddress={q.customer?.billingInfo ?? null}
            shippingAddress={q.customer?.address ?? null}
            quotationNote={q.note}
          />
        ) : null}

        {q.status === "CONFIRMED" ? (
          <>
            <FulfillmentPanel
              quotationId={q.id}
              initialPaymentConfirmed={!!q.paymentConfirmedAt}
              initialPaymentTransactionRef={q.paymentTransactionRef}
              initialShipped={!!q.shippedAt}
              initialTracking={q.trackingNumber}
              hasCustomer={!!q.customer}
              billingAddress={q.customer?.billingInfo ?? null}
              shippingAddress={q.customer?.address ?? null}
              initialDispatchSource={q.fulfillmentAddressSource}
            />
            {q.paymentConfirmedAt && q.shippedAt ? (
              <p className="text-base">
                <Link
                  href={`/quotations/${q.id}/postal`}
                  className="font-semibold text-[var(--accent)] hover:underline"
                >
                  เปิดหน้าจัดส่งไปรษณีย์ (พิมพ์ / แนบกับพัสดุ)
                </Link>
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
