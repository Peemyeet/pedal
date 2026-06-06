import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppOrderByNumber } from "@/lib/legacy";
import { formatPrice, ORDER_STATUS_LABEL } from "@/lib/utils";

type Props = { params: Promise<{ orderNumber: string }> };

export default async function OrderStatusPage({ params }: Props) {
  const { orderNumber } = await params;

  const order = await getAppOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-sm text-stone-500">เลขที่ออเดอร์</p>
      <h1 className="mt-2 font-mono text-2xl font-bold">{order.orderNumber}</h1>
      <p className="mt-4 text-lg">
        สถานะ: {ORDER_STATUS_LABEL[order.status] ?? order.status}
      </p>
      <p className="mt-2 text-stone-600">ยอดรวม {formatPrice(order.total)}</p>
      <Link href="/" className="mt-8 inline-block text-red-600 hover:underline">
        กลับหน้าร้าน
      </Link>
    </div>
  );
}
