import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lineItemsSubtotal, shippingTotalFromQuotation } from "@/lib/quotation-totals";
import { CustomerEditForm } from "./CustomerEditForm";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [c, purchaseHistory] = await Promise.all([
    prisma.customer.findUnique({
      where: { id },
      include: {
        quotations: {
          orderBy: { createdAt: "desc" },
          take: 30,
          select: { id: true, number: true, status: true, createdAt: true },
        },
      },
    }),
    prisma.quotation.findMany({
      where: { customerId: id, status: "CONFIRMED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { lines: { include: { product: true } } },
    }),
  ]);
  if (!c) notFound();

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between">
        <div className="min-w-0">
          <h1 className="app-page-title break-words text-2xl sm:text-3xl">
            [{c.category}] {c.customerCode}
          </h1>
          <p className="app-page-lead mt-2 text-sm sm:text-base">
            {c.name ?? "ไม่ระบุชื่อ"} · อัปเดตล่าสุด{" "}
            {c.updatedAt.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </div>
        <Link
          href="/customers"
          className="shrink-0 self-start text-base font-semibold text-[var(--accent)] hover:underline sm:self-auto"
        >
          ← กลับรายการลูกค้า
        </Link>
      </div>

      <CustomerEditForm
        customerId={c.id}
        initial={{
          name: c.name ?? "",
          address: c.address ?? "",
          orderNote: c.orderNote ?? "",
          lastPurchaseNote: c.lastPurchaseNote ?? "",
          billingInfo: c.billingInfo ?? "",
        }}
      />

      <section>
        <h2 className="mb-4 text-xl font-bold">ประวัติการซื้อขาย (ยืนยันการสั่งซื้อแล้ว)</h2>
        {purchaseHistory.length === 0 ? (
          <p className="text-base text-[var(--muted)]">ยังไม่มีใบที่ยืนยันแล้ว</p>
        ) : (
          <div className="space-y-5">
            {purchaseHistory.map((q) => {
              const sub = lineItemsSubtotal(q.lines);
              const ship = shippingTotalFromQuotation(q);
              const total = sub + ship;
              return (
                <article key={q.id} className="app-card p-5 sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <Link
                      href={`/quotations/${q.id}`}
                      className="text-lg font-bold text-[var(--accent)] hover:underline"
                    >
                      ใบเลขที่ {q.number}
                    </Link>
                    <span className="text-base text-[var(--muted)]">
                      {q.createdAt.toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2 text-base">
                    {q.lines.map((l) => (
                      <li key={l.id} className="flex flex-wrap gap-x-2 text-[var(--foreground)]">
                        <span>
                          {l.product.sku ? `[${l.product.sku}] ` : ""}
                          {l.product.name}
                        </span>
                        <span className="text-[var(--muted)]">
                          × {l.quantity} · {l.unitPrice.toLocaleString("th-TH")} บาท/หน่วย
                          {l.shippingFee > 0
                            ? ` · ค่าส่ง ${l.shippingFee.toLocaleString("th-TH")} บาท`
                            : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-base font-semibold tabular-nums">
                    รวม {total.toLocaleString("th-TH")} บาท
                    {q.paymentTransactionRef ? (
                      <span className="ml-2 font-normal text-[var(--muted)]">
                        · เลขธุรกรรม {q.paymentTransactionRef}
                      </span>
                    ) : null}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="app-card p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-bold">ใบเสนอราคาที่เชื่อมกับลูกค้ารายนี้</h2>
        {c.quotations.length === 0 ? (
          <p className="text-base text-[var(--muted)]">ยังไม่มี</p>
        ) : (
          <ul className="space-y-3">
            {c.quotations.map((q) => (
              <li key={q.id} className="text-base">
                <Link
                  href={`/quotations/${q.id}`}
                  className="font-semibold text-[var(--accent)] hover:underline"
                >
                  ใบเลขที่ {q.number}
                </Link>
                <span className="ml-2 text-[var(--muted)]">
                  {q.status} ·{" "}
                  {q.createdAt.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
