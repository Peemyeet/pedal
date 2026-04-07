import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { lineItemsSubtotal, shippingTotalFromQuotation } from "@/lib/quotation-totals";

export default async function QuotedPage() {
  const items = await prisma.quotation.findMany({
    where: { status: "QUOTED" },
    orderBy: { createdAt: "desc" },
    include: {
      lines: { include: { product: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-title">เสนอราคาแล้ว</h1>
        <p className="app-page-lead">
          ใบที่ส่งแล้ว รอลูกค้าตัดสินใจ — กดเข้าไปเพื่อดูรายละเอียดและกดยืนยันเมื่อลูกค้าตกลงซื้อ
        </p>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="app-card px-6 py-14 text-center text-base text-[var(--muted)]">
            ยังไม่มีใบเสนอราคาในสถานะนี้
          </p>
        ) : (
          items.map((q) => {
            const sub = lineItemsSubtotal(q.lines);
            const total = sub + shippingTotalFromQuotation(q);
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
                  <span className="text-base text-[var(--muted)]">
                    {q.createdAt.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </div>
                <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">
                  <span className="font-medium text-[var(--foreground)]">
                    {q.customerName ?? "ไม่ระบุชื่อ"}
                  </span>
                  {" · "}
                  {q.lines.length} รายการ · รวม{" "}
                  <span className="font-semibold tabular-nums text-[var(--foreground)]">
                    {total.toLocaleString("th-TH")}
                  </span>{" "}
                  บาท
                </p>
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
