import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAppOrderById } from "@/lib/legacy";
import { formatPrice, ORDER_SOURCE_LABEL, ORDER_STATUS_LABEL } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { OrderSourceBadge } from "@/components/admin/OrderSourceBadge";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function AdminOrderDetailPage({ params, searchParams }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const { from } = await searchParams;

  const order = await getAppOrderById(id);
  if (!order) notFound();

  const backHref =
    from === "wholesale" || order.source === "WHOLESALE"
      ? "/admin/orders/wholesale"
      : "/admin/orders/web";

  return (
    <div>
      <Link href={backHref} className="text-sm text-red-600 hover:underline">
        ← กลับรายการออเดอร์
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold font-mono">{order.orderNumber}</h1>
        <OrderSourceBadge source={order.source} />
        {order.status === "QUOTATION" && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
            ใบเสนอราคา
          </span>
        )}
      </div>
      <p className="text-stone-600">
        สถานะ: {ORDER_STATUS_LABEL[order.status] ?? order.status} ·{" "}
        {ORDER_SOURCE_LABEL[order.source]}
      </p>
      {order.trackingNumber && (
        <p className="mt-1 text-sm text-stone-600">
          เลขพัสดุ: <span className="font-mono">{order.trackingNumber}</span>
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
          <h2 className="font-semibold">ข้อมูลลูกค้า</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {order.shopName && (
              <div>
                <dt className="text-stone-500">ชื่อร้าน</dt>
                <dd className="font-medium">{order.shopName}</dd>
              </div>
            )}
            <div>
              <dt className="text-stone-500">ผู้ติดต่อ</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-stone-500">โทร</dt>
              <dd>{order.phone}</dd>
            </div>
            <div>
              <dt className="text-stone-500">ที่อยู่</dt>
              <dd className="whitespace-pre-wrap">{order.address}</dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-stone-500">หมายเหตุ</dt>
                <dd className="whitespace-pre-wrap">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
          <h2 className="font-semibold">รายการสินค้า</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="border-b border-stone-50 pb-2">
                <div className="flex justify-between gap-2">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(item.priceAtOrder * item.quantity)}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  {formatPrice(item.priceAtOrder)} / หน่วย
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t pt-4 text-lg font-bold">
            รวม {formatPrice(order.total)}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
        <OrderStatusForm
          orderId={order.id}
          currentStatus={order.status}
          currentTrackingNumber={order.trackingNumber}
          source={order.source}
          stockDeducted={order.stockDeducted}
        />
      </div>
    </div>
  );
}
