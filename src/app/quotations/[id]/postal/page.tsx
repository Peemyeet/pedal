import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import { lineItemsSubtotal, shippingTotalFromQuotation } from "@/lib/quotation-totals";
import { PrintButton } from "./PrintButton";

function recipientAddressBlock(q: {
  fulfillmentAddressText: string | null;
  note: string | null;
  customer: { address: string | null } | null;
}): string {
  const snap = q.fulfillmentAddressText?.trim();
  if (snap) return snap;
  const fromCustomer = q.customer?.address?.trim();
  if (fromCustomer) return fromCustomer;
  return (q.note ?? "").trim() || "—";
}

export default async function PostalDispatchPage({
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
  if (q.status !== "CONFIRMED" || !q.paymentConfirmedAt || !q.shippedAt) {
    redirect(`/quotations/${id}`);
  }

  const sub = lineItemsSubtotal(q.lines);
  const shipTotal = shippingTotalFromQuotation(q);
  const total = sub + shipTotal;
  const addr = recipientAddressBlock(q);
  const lineSummary = q.lines
    .map((l) => `${l.product.name} × ${l.quantity}`)
    .join(" · ");

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/quotations/${id}`}
          className="text-base font-semibold text-[var(--accent)] hover:underline"
        >
          ← กลับใบเสนอราคา
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-3xl rounded-xl border-2 border-slate-800 bg-white p-6 text-slate-900 shadow-sm print:border-2 print:shadow-none print:p-4">
        <header className="border-b-2 border-slate-800 pb-3 text-center">
          <h1 className="text-xl font-bold tracking-wide">ใบจัดส่งไปรษณีย์</h1>
          <p className="mt-1 text-sm text-slate-600">
            อ้างอิงใบเสนอราคาเลขที่ <span className="font-semibold tabular-nums">{q.number}</span>
          </p>
        </header>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <section className="rounded-lg border border-slate-400 p-3">
            <h2 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              ผู้ส่ง
            </h2>
            <p className="mt-2 text-sm font-semibold">{BRAND.shortName}</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
              {BRAND.addressLines.join("\n")}
            </p>
            <p className="mt-2 text-sm">{BRAND.phoneDisplay}</p>
          </section>

          <section className="rounded-lg border border-slate-400 p-3">
            <h2 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              ผู้รับ
            </h2>
            <p className="mt-2 text-sm font-semibold">{q.customerName ?? "—"}</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{addr}</p>
            {q.customerContact ? (
              <p className="mt-2 text-sm">โทร. {q.customerContact}</p>
            ) : null}
          </section>
        </div>

        <section className="mt-4 rounded-lg border border-slate-400 p-3">
          <h2 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            พัสดุ / ขนส่ง
          </h2>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-600">เลขพัสดุ / ขนส่ง</dt>
              <dd className="font-mono font-medium tabular-nums">
                {q.trackingNumber?.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-600">เลขอ้างอิงชำระเงิน</dt>
              <dd className="font-mono font-medium">{q.paymentTransactionRef ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-600">รายการสินค้าในพัสดุ</dt>
              <dd className="mt-0.5">{lineSummary}</dd>
            </div>
            <div>
              <dt className="text-slate-600">ยอดรวม (อ้างอิง)</dt>
              <dd className="tabular-nums font-medium">{total.toLocaleString("th-TH")} บาท</dd>
            </div>
            <div>
              <dt className="text-slate-600">บันทึกส่งของ</dt>
              <dd className="tabular-nums text-slate-800">
                {q.shippedAt.toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          </dl>
        </section>

        <p className="mt-6 border-t border-slate-200 pt-3 text-center text-xs text-slate-500 print:mt-4">
          ใช้สำหรับนำไปลงทะเบียนหรือติดกับพัสดุที่จุดรับฝากไปรษณีย์
        </p>
      </article>
    </div>
  );
}
