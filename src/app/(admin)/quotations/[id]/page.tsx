import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lineItemsSubtotal, shippingTotalFromQuotation } from "@/lib/quotation-totals";
import { BahtTextBelow } from "@/components/BahtTextBelow";
import { ConfirmPurchaseSection } from "./ConfirmPurchaseSection";
import { FulfillmentPanel } from "./FulfillmentPanel";

const statusLabel: Record<string, string> = {
  DRAFT: "ร่าง",
  QUOTED: "ยืนยันคำสั่งซื้อ",
  CONFIRMED: "ลูกค้ายืนยันแล้ว",
  CANCELLED: "ยกเลิก",
};

export const dynamic = "force-dynamic";

export default async function QuotationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: "fulfillment" | "unpaid" }>;
}) {
  const { id } = await params;
  const qs = (await searchParams) ?? {};
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
  const fromUnpaid = qs.from === "unpaid";
  const fromFulfillment = qs.from === "fulfillment" || (!fromUnpaid && q.status === "CONFIRMED");
  const backHref = fromUnpaid
    ? "/quotations/unpaid"
    : fromFulfillment
      ? "/quotations/fulfillment"
      : "/quotations/quoted";
  const backLabel = fromUnpaid
    ? "← กลับหน้ายังไม่ได้ชำระเงิน"
    : fromFulfillment
      ? "← กลับหน้าชำระเงินและส่งของ"
      : "← กลับหน้ายืนยันคำสั่งซื้อ";

  return (
    <div className="space-y-10">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Link href={backHref} className="shrink-0 text-base font-semibold text-[var(--accent)] hover:underline">
          {backLabel}
        </Link>
      </div>

      <div
        id="quotation-print-root"
        className="app-card space-y-8 p-5 sm:p-8 print:space-y-7 print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        <div className="space-y-2 border-b border-[var(--border)] pb-5 print:border-slate-300 print:pb-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl print:text-[28px]">
            ใบเสนอราคาเลขที่ {q.number}
          </h1>
          <p className="text-base text-[var(--muted)] print:text-[16px] print:leading-snug print:text-slate-700">
            สถานะ: <strong>{statusLabel[q.status] ?? q.status}</strong> · สร้างเมื่อ{" "}
            {q.createdAt.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold print:text-[22px]">ข้อมูลลูกค้า</h2>
          {q.customer ? (
            <p className="text-sm text-[var(--muted)] print:hidden">
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
            <p className="hidden text-base print:block print:text-[15px]">
              <span className="font-semibold">
                ลูกค้า: [{q.customer.category}] {q.customer.customerCode}
                {q.customer.name ? ` · ${q.customer.name}` : ""}
              </span>
            </p>
          ) : null}
          <dl className="grid gap-x-8 gap-y-4 text-lg sm:grid-cols-2 print:text-[18px] print:leading-tight">
            <div className="space-y-1">
              <dt className="text-sm font-semibold text-[var(--muted)] print:text-[13px] print:font-normal print:text-slate-600">
                ชื่อ
              </dt>
              <dd className="font-medium">{q.customerName ?? "—"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-semibold text-[var(--muted)] print:text-[13px] print:font-normal print:text-slate-600">
                ติดต่อ
              </dt>
              <dd className="font-medium">{q.customerContact ?? "—"}</dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-sm font-semibold text-[var(--muted)] print:text-[13px] print:font-normal print:text-slate-600">
                หมายเหตุ / ที่อยู่
              </dt>
              <dd className="whitespace-pre-wrap">{q.note ?? "—"}</dd>
            </div>
            {q.status === "CONFIRMED" && q.fulfillmentAddressText ? (
              <div className="space-y-1 sm:col-span-2">
                <dt className="text-sm font-semibold text-[var(--muted)] print:text-[13px] print:font-normal print:text-slate-600">
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

        <section className="overflow-hidden rounded-3xl border border-[var(--border)] print:rounded-[18px] print:border-slate-300">
          <h2 className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 text-2xl font-bold sm:px-6 print:border-slate-300 print:bg-white print:text-[24px]">
            รายการสินค้า
          </h2>
          <div className="max-w-full overflow-x-auto print:overflow-visible [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[640px] text-left text-sm sm:text-base print:text-[16px]">
            <thead className="app-thead print:bg-white">
              <tr>
                <th className="app-th print:px-6 print:py-3 print:text-[12px]">รหัส</th>
                <th className="app-th print:px-6 print:py-3 print:text-[12px]">สินค้า</th>
                <th className="app-th print:px-6 print:py-3 print:text-[12px]">จำนวน</th>
                <th className="app-th print:px-6 print:py-3 print:text-[12px]">ราคา/หน่วย</th>
                <th className="app-th print:px-6 print:py-3 print:text-[12px]">ค่าจัดส่ง</th>
                <th className="app-th text-right print:px-6 print:py-3 print:text-[12px]">รวมแถว</th>
              </tr>
            </thead>
            <tbody>
              {q.lines.map((l) => {
                const lineGross = l.unitPrice * l.quantity + l.shippingFee;
                return (
                  <tr key={l.id} className="border-t border-[var(--border)] print:border-slate-200">
                    <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted)] sm:px-6 sm:py-3.5 sm:text-sm print:text-[14px] print:text-slate-700">
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
          <div className="border-t border-[var(--border)] bg-[var(--surface-muted)]/50 px-5 py-5 text-sm sm:px-6 sm:text-base print:border-slate-300 print:bg-white print:text-[18px]">
            <div className="flex justify-between gap-3">
              <span className="text-[var(--muted)]">ยอดสินค้า</span>
              <span className="tabular-nums">{sub.toLocaleString("th-TH")} บาท</span>
            </div>
            <div className="mt-3 flex justify-between gap-3">
              <span className="text-[var(--muted)]">ค่าขนส่งรวม</span>
              <span className="tabular-nums">{shipTotal.toLocaleString("th-TH")} บาท</span>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-base font-bold sm:flex-row sm:justify-between sm:gap-4 sm:text-lg print:mt-6 print:text-[22px]">
              <span className="shrink-0">รวมทั้งสิ้น</span>
              <div className="font-normal sm:text-right print:text-right">
                <span className="block tabular-nums text-xl font-bold sm:text-2xl print:text-[30px]">
                  {total.toLocaleString("th-TH")} บาท
                </span>
                <BahtTextBelow
                  amount={total}
                  className="mt-1 max-w-md text-xs font-normal leading-relaxed text-[var(--muted)] print:max-w-none print:text-[13px] print:leading-snug sm:text-sm sm:ml-auto"
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
