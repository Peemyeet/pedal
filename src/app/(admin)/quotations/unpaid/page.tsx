import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UnpaidSearchParams = {
  q?: string;
};

export default async function UnpaidPage({
  searchParams,
}: {
  searchParams?: Promise<UnpaidSearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const qText = (sp.q ?? "").trim();

  const items = await prisma.quotation.findMany({
    where: {
      status: "CONFIRMED",
      OR: [{ paymentConfirmedAt: null }, { shippedAt: null }],
      ...(qText
        ? {
            AND: [
              {
                OR: [
                  { customerName: { contains: qText, mode: "insensitive" } },
                  { trackingNumber: { contains: qText, mode: "insensitive" } },
                  { paymentTransactionRef: { contains: qText, mode: "insensitive" } },
                ],
              },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      lines: { include: { product: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="app-page-title">ยังไม่ได้ชำระเงิน</h1>
        <form className="w-full sm:w-auto">
          <input
            type="search"
            name="q"
            defaultValue={qText}
            placeholder="ค้นหา: ชื่อลูกค้า / tracking / ref"
            className="min-h-11 w-full px-4 text-base sm:w-[340px]"
          />
        </form>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="app-card px-6 py-14 text-center text-base text-[var(--muted)]">
            ยังไม่มีใบที่ค้างขั้นตอนชำระเงินหรือส่งของ
          </p>
        ) : (
          items.map((q) => {
            const paid = !!q.paymentConfirmedAt;
            const sent = !!q.shippedAt;
            return (
              <div
                key={q.id}
                className="app-card group p-6 transition hover:border-[var(--accent)] hover:shadow-[0_16px_40px_rgba(28,25,23,0.12)] sm:p-7"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-lg font-bold text-[var(--foreground)]">ใบเลขที่ {q.number}</span>
                  <span className="text-base font-medium text-[var(--muted)]">
                    {q.customerName ?? "ไม่ระบุชื่อ"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Link
                    href={`/quotations/${q.id}?from=unpaid`}
                    className={
                      paid
                        ? "inline-flex rounded-full border border-emerald-400 bg-emerald-100 px-3 py-1.5 font-medium text-emerald-950 transition hover:bg-emerald-300"
                        : "inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 font-medium text-[var(--muted)] transition hover:border-slate-400 hover:bg-slate-200 hover:text-slate-900"
                    }
                  >
                    {paid
                      ? `ชำระแล้ว · ${q.paymentConfirmedAt?.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}${q.paymentTransactionRef ? ` · ${q.paymentTransactionRef}` : ""}`
                      : "ยังไม่ชำระเงิน"}
                  </Link>
                  <Link
                    href={sent ? `/quotations/${q.id}/postal` : `/quotations/${q.id}?from=unpaid`}
                    className={
                      sent
                        ? "inline-flex rounded-full border border-sky-400 bg-sky-100 px-3 py-1.5 font-medium text-sky-950 transition hover:bg-sky-300"
                        : "inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 font-medium text-[var(--muted)] transition hover:border-slate-400 hover:bg-slate-200 hover:text-slate-900"
                    }
                  >
                    {sent
                      ? `ส่งแล้ว · ${q.shippedAt?.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })} ${q.trackingNumber ? `· ${q.trackingNumber}` : ""}`
                      : "ยังไม่ส่งของ"}
                  </Link>
                </div>
                <Link
                  href={`/quotations/${q.id}?from=unpaid`}
                  className="app-quotation-card-cta mt-4 inline-flex text-sm font-semibold text-[var(--accent)]"
                >
                  เปิดใบนี้ →
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
