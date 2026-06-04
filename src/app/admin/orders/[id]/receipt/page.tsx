import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const issueDate = new Date().toLocaleDateString("th-TH");
  const receiptNo = `RC-${order.orderNumber}`;

  return (
    <div className="mx-auto max-w-3xl">
      <AutoPrintOnLoad enabled={autoprint === "1"} />

      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/admin/orders/${order.id}?from=wholesale`} className="text-sm text-red-600 hover:underline">
          ← กลับหน้าออเดอร์
        </Link>
        <ReceiptPrintButton />
      </div>

      <div className="rounded-2xl bg-white p-8 ring-1 ring-stone-200 print:rounded-none print:p-0 print:ring-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">ใบเสร็จรับเงิน</h1>
            <p className="mt-1 text-sm text-stone-600">Receipt No: {receiptNo}</p>
          </div>
          <div className="text-right text-sm">
            <p>วันที่ออกเอกสาร: {issueDate}</p>
            <p>เลขที่ออเดอร์: {order.orderNumber}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-xl bg-stone-50 p-4 text-sm">
          <div>
            <p className="text-stone-500">ชื่อลูกค้า / ร้านค้า</p>
            <p className="font-medium">{order.shopName || order.customerName}</p>
          </div>
          <div>
            <p className="text-stone-500">ผู้ติดต่อ</p>
            <p>{order.customerName}</p>
          </div>
          <div>
            <p className="text-stone-500">ที่อยู่</p>
            <p className="whitespace-pre-wrap">{order.address}</p>
          </div>
          <div>
            <p className="text-stone-500">โทร</p>
            <p>{order.phone}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-600">
              <th className="py-2">รายการ</th>
              <th className="py-2 text-right">จำนวน</th>
              <th className="py-2 text-right">ราคา/หน่วย</th>
              <th className="py-2 text-right">รวม</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-stone-100">
                <td className="py-2">{item.productName}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatPrice(item.priceAtOrder)}</td>
                <td className="py-2 text-right">
                  {formatPrice(item.quantity * item.priceAtOrder)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-xs border-t border-stone-200 pt-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>ยอดสุทธิ</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
