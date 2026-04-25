import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lineItemsSubtotal, shippingTotalFromQuotation } from "@/lib/quotation-totals";
import { PrintButton } from "../postal/PrintButton";

export const dynamic = "force-dynamic";

function quoteAddress(q: {
  fulfillmentAddressText: string | null;
  note: string | null;
  customer: { address: string | null; billingInfo: string | null } | null;
}): string {
  const snap = q.fulfillmentAddressText?.trim();
  if (snap) return snap;
  const shipping = q.customer?.address?.trim();
  if (shipping) return shipping;
  const billing = q.customer?.billingInfo?.trim();
  if (billing) return billing;
  return (q.note ?? "").trim() || "—";
}

export default async function QuoteDocumentPage({
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
  const addr = quoteAddress(q);

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/quotations/${id}`} className="text-base font-semibold text-[var(--accent)] hover:underline">
          ← กลับใบเสนอราคา
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-4xl rounded-xl border-2 border-slate-800 bg-white p-6 text-slate-900 shadow-sm print:border-2 print:p-4 print:shadow-none">
        <header className="border-b-2 border-slate-800 pb-3">
          <h1 className="text-2xl font-bold tracking-wide">ใบเสนอราคาเลขที่ {q.number}</h1>
        </header>

        <section className="mt-4 grid gap-4 sm:grid-cols-[1fr_210px] sm:items-start">
          <div className="space-y-2 text-base">
            <p>
              <span className="font-semibold">ชื่อลูกค้า:</span> {q.customerName ?? "—"}
            </p>
            <p>
              <span className="font-semibold">ติดต่อ:</span> {q.customerContact ?? "—"}
            </p>
            <p className="whitespace-pre-wrap">
              <span className="font-semibold">ที่อยู่:</span> {addr}
            </p>
          </div>
          <div className="ml-auto w-full max-w-[210px] rounded-md border-2 border-slate-900 p-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-white">
              <Image
                src="/branding/logo.png"
                alt="โลโก้ใบเสนอราคา"
                fill
                className="object-contain"
                sizes="210px"
                priority
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-400 p-3">
          <h2 className="mb-3 text-xl font-bold">รายการสินค้า</h2>
          <table className="w-full border-collapse text-left text-base">
            <thead>
              <tr className="border-y border-slate-300">
                <th className="px-2 py-2">รหัส</th>
                <th className="px-2 py-2">สินค้า</th>
                <th className="px-2 py-2">จำนวน</th>
                <th className="px-2 py-2">ราคา/หน่วย</th>
                <th className="px-2 py-2">ค่าจัดส่ง</th>
                <th className="px-2 py-2 text-right">รวมแถว</th>
              </tr>
            </thead>
            <tbody>
              {q.lines.map((l) => {
                const lineGross = l.unitPrice * l.quantity + l.shippingFee;
                return (
                  <tr key={l.id} className="border-b border-slate-200">
                    <td className="px-2 py-2">{l.product.sku ?? "—"}</td>
                    <td className="px-2 py-2">{l.product.name}</td>
                    <td className="px-2 py-2">{l.quantity}</td>
                    <td className="px-2 py-2">{l.unitPrice.toLocaleString("th-TH")} บาท</td>
                    <td className="px-2 py-2">{l.shippingFee.toLocaleString("th-TH")} บาท</td>
                    <td className="px-2 py-2 text-right">{lineGross.toLocaleString("th-TH")} บาท</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="mt-5 border-t border-slate-300 pt-4">
          <dl className="space-y-2 text-base">
            <div className="flex items-center justify-between">
              <dt>ยอดสินค้า</dt>
              <dd className="tabular-nums">{sub.toLocaleString("th-TH")} บาท</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>ค่าขนส่งรวม</dt>
              <dd className="tabular-nums">{shipTotal.toLocaleString("th-TH")} บาท</dd>
            </div>
            <div className="flex items-center justify-between text-2xl font-bold">
              <dt>ยอดรวมทั้งหมด</dt>
              <dd className="tabular-nums">{total.toLocaleString("th-TH")} บาท</dd>
            </div>
          </dl>
        </section>
      </article>
    </div>
  );
}
