import type { OrderDocumentType } from "@/lib/order-document-html";

export function openOrderDocumentPopup(
  orderId: string,
  type: OrderDocumentType
) {
  const url = `/api/admin/orders/${encodeURIComponent(orderId)}/document?type=${type}`;
  window.open(url, "_blank", "width=1024,height=900");
}
