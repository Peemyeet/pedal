import Link from "next/link";

export function QuotationExportBar({
  quotationId,
}: {
  quotationId: string;
}) {
  const primaryToolBtn =
    "app-btn-primary min-h-11 px-4 py-2.5 text-sm font-semibold print:hidden";

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
      <Link href={`/quotations/${quotationId}/quote`} className={primaryToolBtn}>
        สร้างใบเสนอราคา
      </Link>
    </div>
  );
}
