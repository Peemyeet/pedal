import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAppOrderById } from "@/lib/legacy";
import { getShopSettings } from "@/lib/shop-settings";
import { formatPrice } from "@/lib/utils";
import { AutoPrintOnLoad } from "@/components/admin/AutoPrintOnLoad";
import { ReceiptPrintButton } from "@/components/admin/ReceiptPrintButton";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string }>;
};

export default async function AdminOrderReceiptPage({ params, searchParams }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const { autoprint } = await searchParams;

  const order = await getAppOrderById(id);
  if (!order) notFound();

  const shop = await getShopSettings();
  const issueDate = new Date().toLocaleDateString("th-TH");
  const receiptNo = `RC-${order.orderNumber}`;

  return (
    <div className="mx-auto max-w-3xl">
      <AutoPrintOnLoad enabled={autoprint === "1"} />

      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/admin/orders/${order.id}?from=wholesale`}
          className="text-sm text-red-600 hover:underline"
        >
          ← กลับหน้าออเดอร์
        </Link>
        <ReceiptPrintButton />
      </div>

      <article className="rounded-2xl bg-white p-8 ring-1 ring-stone-200 print:ring-0">
        <header className="border-b border-stone-200 pb-4 text-center">
          <h1 className="text-xl font-bold">{shop.nameTh}</h1>
          <p className="text-sm text-stone-600">{shop.address}</p>
          <p className="mt-4 text-lg font-semibold">ใบเสร็จรับเงิน</p>
          <p className="font-mono text-sm">{receiptNo}</p>
          <p className="text-sm text-stone-500">วันที่ {issueDate}</p>
        </header>

        <section className="mt-6 text-sm">
          <p>
            <strong>ลูกค้า:</strong> {order.customerName}
          </p>
          <p>
            <strong>โทร:</strong> {order.phone}
          </p>
          <p className="whitespace-pre-wrap">
            <strong>ที่อยู่:</strong> {order.address}
          </p>
        </section>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-stone-500">
              <th className="py-2">รายการ</th>
              <th className="py-2 text-right">จำนวน</th>
              <th className="py-2 text-right">ราคา</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-stone-100">
                <td className="py-2">{item.productName}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">
                  {formatPrice(item.priceAtOrder * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 text-right text-lg font-bold">
          รวม {formatPrice(order.total)}
        </p>
      </article>
    </div>
  );
}
