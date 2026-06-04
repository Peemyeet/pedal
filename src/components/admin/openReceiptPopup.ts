import { openOrderDocumentPopup } from "./openOrderDocumentPopup";

export async function openReceiptPopup(orderId: string) {
  await openOrderDocumentPopup(orderId, "receipt");
}
