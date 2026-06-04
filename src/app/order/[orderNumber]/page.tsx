import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, ORDER_STATUS_LABEL } from "@/lib/utils";

type Props = { params: Promise<{ orderNumber: string }> };

export const metadata: Metadata = {
  title: "ยืนยันคำสั่งซื้อ",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-5xl" aria-hidden>
        ✅
      </p>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">
        สั่งซื้อสำเร็จ!
      </h1>
      <p className="mt-2 text-stone-600">
        เลขที่ออเดอร์:{" "}
        <span className="font-mono font-semibold text-red-700">
          {order.orderNumber}
        </span>
      </p>
      <p className="mt-1 text-sm text-stone-500">
        สถานะ: {ORDER_STATUS_LABEL[order.status]}
      </p>

      <div className="mt-8 rounded-2xl border border-red-100 bg-white p-6 text-left text-sm">
        <p>
          <span className="text-stone-500">ชื่อ:</span> {order.customerName}
        </p>
        <p className="mt-1">
          <span className="text-stone-500">โทร:</span> {order.phone}
        </p>
        <ul className="mt-4 space-y-2 border-t border-stone-100 pt-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{formatPrice(item.priceAtOrder * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-stone-100 pt-4 font-bold">
          <span>รวม</span>
          <span className="text-red-700">{formatPrice(order.total)}</span>
        </p>
      </div>

      <p className="mt-6 text-sm text-stone-600">
        เราจะติดต่อยืนยันออเดอร์ที่ {order.phone} โดยเร็วที่สุด
      </p>
      <Link
        href="/products"
        className="mt-6 inline-block rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
      >
        ช้อปต่อ
      </Link>
    </div>
  );
}
