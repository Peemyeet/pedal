import Link from "next/link";
import type { AppOrder } from "@/lib/legacy";
import { formatPrice, getOrderStatusLabel } from "@/lib/utils";
import { NextStatusButton } from "./NextStatusButton";
import { PrintParcelButton } from "./PrintParcelButton";
import { ArchiveOrderButton } from "./ArchiveOrderButton";
import { ReceiptPopupButton } from "./ReceiptPopupButton";
import { QuotationPopupLink } from "./QuotationPopupLink";

export function AdminOrdersTable({
  orders,
  backSource,
  wholesaleUnpaid,
}: {
  orders: AppOrder[];
  backSource: "web" | "wholesale";
  wholesaleUnpaid?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <p className="rounded-2xl bg-white py-12 text-center text-stone-500 ring-1 ring-stone-200">
        ยังไม่มีออเดอร์ในหมวดนี้
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-stone-50">
          <tr>
            <th className="px-4 py-3">เลขที่</th>
            <th className="px-4 py-3">วันที่</th>
            {backSource === "wholesale" && (
              <th className="px-4 py-3">ร้าน / ลูกค้า</th>
            )}
            {backSource === "web" && (
              <>
                <th className="px-4 py-3">ลูกค้า</th>
                <th className="px-4 py-3">โทร</th>
              </>
            )}
            <th className="px-4 py-3">ยอด</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-stone-100">
              <td className="px-4 py-3">
                {backSource === "wholesale" ? (
                  <QuotationPopupLink orderId={o.id} orderNumber={o.orderNumber} />
                ) : (
                  <Link
                    href={`/admin/orders/${o.id}?from=${backSource}`}
                    className="font-mono text-red-600 hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                )}
              </td>
              <td className="px-4 py-3 text-stone-500">
                {new Date(o.createdAt).toLocaleDateString("th-TH")}
              </td>
              {backSource === "wholesale" && (
                <td className="px-4 py-3">
                  <p className="font-medium">{o.shopName || o.customerName}</p>
                  {o.shopName && (
                    <p className="text-xs text-stone-500">{o.customerName}</p>
                  )}
                </td>
              )}
              {backSource === "web" && (
                <>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">{o.phone}</td>
                </>
              )}
              <td className="px-4 py-3">{formatPrice(o.total)}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    o.status === "QUOTATION"
                      ? "rounded-full bg-amber-50 px-2 py-0.5 text-amber-800"
                      : ""
                  }
                >
                  {getOrderStatusLabel(
                    o.status,
                    backSource === "web" ? "WEBSITE" : "WHOLESALE",
                    { wholesaleUnpaid }
                  )}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  {backSource === "wholesale" &&
                    ["PAID", "WAITING_SHIPMENT", "SHIPPED", "DELIVERED"].includes(
                      o.status
                    ) && (
                      <ReceiptPopupButton orderId={o.id} />
                    )}
                  {(o.status === "WAITING_SHIPMENT" || o.status === "SHIPPED") && (
                    <PrintParcelButton
                      orderNumber={o.orderNumber}
                      customerName={o.customerName}
                      phone={o.phone}
                      address={o.address}
                      total={o.total}
                      items={o.items.map((item) => ({
                        productName: item.productName,
                        quantity: item.quantity,
                      }))}
                      trackingNumber={o.trackingNumber}
                      shopName={o.shopName}
                      updatedAt={o.updatedAt.toISOString()}
                    />
                  )}
                  {o.status === "SHIPPED" && <ArchiveOrderButton orderId={o.id} />}
                  <NextStatusButton
                    orderId={o.id}
                    source={backSource}
                    currentStatus={o.status}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
