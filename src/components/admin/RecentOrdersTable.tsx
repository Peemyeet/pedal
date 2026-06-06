"use client";

import Link from "next/link";
import type { AppOrder } from "@/lib/legacy/types";
import {
  formatPrice,
  getOrderStatusLabel,
} from "@/lib/utils";
import { OrderSourceBadge } from "./OrderSourceBadge";
import { QuotationPopupLink } from "./QuotationPopupLink";

export function RecentOrdersTable({ orders }: { orders: AppOrder[] }) {
  if (orders.length === 0) {
    return (
      <p className="rounded-2xl bg-white py-8 text-center text-stone-500 ring-1 ring-stone-200">
        ยังไม่มีออเดอร์
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-stone-50 text-stone-600">
          <tr>
            <th className="px-4 py-3">เลขที่</th>
            <th className="px-4 py-3">ช่องทาง</th>
            <th className="px-4 py-3">ลูกค้า</th>
            <th className="px-4 py-3">ยอด</th>
            <th className="px-4 py-3">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const from = o.source === "WHOLESALE" ? "wholesale" : "web";
            const isQuotation = o.status === "QUOTATION";

            return (
              <tr key={o.id} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  {o.source === "WHOLESALE" ? (
                    <QuotationPopupLink orderId={o.id} orderNumber={o.orderNumber} />
                  ) : (
                    <Link
                      href={`/admin/orders/${o.id}?from=${from}`}
                      className="font-mono text-red-600 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3">
                  <OrderSourceBadge source={o.source} />
                </td>
                <td className="px-4 py-3">{o.shopName || o.customerName}</td>
                <td className="px-4 py-3">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isQuotation
                        ? "rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800"
                        : ""
                    }
                  >
                    {getOrderStatusLabel(o.status, o.source)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
