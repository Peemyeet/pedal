import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { price: true } } },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
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
        สถานะ: {ORDER_STATUS_LABEL[order.status]} ·{" "}
        {ORDER_SOURCE_LABEL[order.source]}
        {!order.stockDeducted && order.source === "WHOLESALE" && (
          <span className="text-amber-700"> · ยังไม่ตัดสต๊อก</span>
        )}
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
            {order.email && (
              <div>
                <dt className="text-stone-500">อีเมล</dt>
                <dd>{order.email}</dd>
              </div>
            )}
            <div>
              <dt className="text-stone-500">ที่อยู่</dt>
              <dd className="whitespace-pre-wrap">{order.address}</dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-stone-500">หมายเหตุ</dt>
                <dd>{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
          <h2 className="font-semibold">รายการสินค้า</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => {
              const webPrice = item.product?.price;
              const diff =
                webPrice != null && webPrice !== item.priceAtOrder;
              return (
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
                    {diff && webPrice != null && (
                      <span className="ml-2 text-amber-700">
                        (ราคาเว็บ {formatPrice(webPrice)})
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
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

      {order.auditLogs.length > 0 && (
        <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
          <h2 className="font-semibold">ประวัติการเปลี่ยนแปลง</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.auditLogs.map((log) => (
              <li key={log.id} className="border-b border-stone-50 pb-2 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-stone-800">{log.action}</span>
                  <span className="text-xs text-stone-500">
                    {new Date(log.createdAt).toLocaleString("th-TH")}
                  </span>
                </div>
                {log.detail && <p className="mt-1 text-stone-600">{log.detail}</p>}
                <p className="mt-0.5 text-xs text-stone-400">โดย {log.adminName}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
