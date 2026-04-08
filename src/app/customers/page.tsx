import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CustomerCreateForm } from "./CustomerCreateForm";
import { CustomerFilters } from "./CustomerFilters";

export const dynamic = "force-dynamic";

type SearchParams = { category?: string; q?: string };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = sp.category?.trim() ?? "";
  const q = sp.q?.trim() ?? "";

  const where = {
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { customerCode: { contains: q } },
            { address: { contains: q } },
          ],
        }
      : {}),
  };

  const customers = await prisma.customer.findMany({
    where,
    orderBy: [{ category: "asc" }, { customerCode: "asc" }],
  });

  const categories = await prisma.customer.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const cats = categories.map((c) => c.category).sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-title">ลูกค้า</h1>
      </div>

      <CustomerCreateForm />
      <CustomerFilters category={category} q={q} categories={cats} />

      <p className="text-base font-medium text-[var(--muted)]">พบ {customers.length} รายการ</p>

      <div className="app-table-shell">
        <table className="w-full min-w-[720px] text-left text-base">
          <thead className="app-thead">
            <tr>
              <th className="app-th">กลุ่ม</th>
              <th className="app-th">รหัส</th>
              <th className="app-th">ชื่อ</th>
              <th className="app-th">ที่อยู่ / หมายเหตุ (ย่อ)</th>
              <th className="app-th w-24 text-right" />
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-base text-[var(--muted)]">
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const preview = (c.address ?? "").replace(/\s+/g, " ").slice(0, 80);
                return (
                  <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap px-2 py-3 sm:px-4 sm:py-4">{c.category}</td>
                    <td className="px-2 py-3 font-mono text-xs sm:px-4 sm:py-4 sm:text-sm">
                      {c.customerCode}
                    </td>
                    <td className="max-w-[200px] px-2 py-3 font-medium sm:px-4 sm:py-4">{c.name ?? "—"}</td>
                    <td className="max-w-md truncate px-2 py-3 text-[var(--muted)] sm:px-4 sm:py-4">
                      {preview || "—"}
                    </td>
                    <td className="px-2 py-3 text-right sm:px-4 sm:py-4">
                      <Link
                        href={`/customers/${c.id}`}
                        className="font-semibold text-[var(--accent)] hover:underline"
                      >
                        ดู
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
