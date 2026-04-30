import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lineItemsSubtotal, shippingTotalFromQuotation } from "@/lib/quotation-totals";
import { PrintButton } from "../postal/PrintButton";

export const dynamic = "force-dynamic";

function docAddress(q: {
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

function backHref(id: string, from?: string): string {
  if (from === "fulfillment") return "/quotations/fulfillment";
  return `/quotations/${id}`;
}

export default async function ReceiptDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const from = sp.from;

  const q = await prisma.quotation.findUnique({
    where: { id },
    include: {
      lines: { include: { product: true } },
      customer: true,
    },
  });
  if (!q) notFound();
  if (!q.paymentConfirmedAt) {
    redirect(`/quotations/${id}`);
  }

  const sub = lineItemsSubtotal(q.lines);
  const shipTotal = shippingTotalFromQuotation(q);
  const total = sub + shipTotal;
  const addr = docAddress(q);

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={backHref(id, from)} className="text-base font-semibold text-[var(--accent)] hover:underline">
          ← กลับ
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-4xl rounded-xl border-2 border-emerald-900 bg-white p-6 text-slate-900 shadow-sm print:border-2 print:p-4 print:shadow-none">
        <header className="border-b-2 border-emerald-900 pb-3">
          <h1 className="text-2xl font-bold tracking-wide">ใบเสร็จรับเงิน</h1>
          <p className="mt-1 text-base text-slate-700">
            อ้างอิงใบเสนอราคาเลขที่ <span className="font-semibold tabular-nums">{q.number}</span>
          </p>
        </header>

        <section className="mt-4 rounded-lg border border-emerald-700 bg-emerald-50/80 p-3 text-base">
          <h2 className="mb-2 font-semibold text-emerald-950">การชำระเงิน</h2>
          <p>
            <span className="font-semibold">ชำระเมื่อ:</span>{" "}
            {q.paymentConfirmedAt.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
          </p>
          {q.paymentTransactionRef ? (
            <p className="mt-1">
              <span className="font-semibold">เลขที่อ้างอิง / ช่องทาง:</span> {q.paymentTransactionRef}
            </p>
          ) : null}
        </section>

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
          <div className="ml-auto w-full max-w-[210px] rounded-md border-2 border-emerald-900 p-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-white">
              <Image
                src="/branding/logo.png"
                alt="โลโก้"
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
              <dt>รับชำระทั้งสิ้น</dt>
              <dd className="tabular-nums">{total.toLocaleString("th-TH")} บาท</dd>
            </div>
          </dl>
        </section>
      </article>
    </div>
  );
}
