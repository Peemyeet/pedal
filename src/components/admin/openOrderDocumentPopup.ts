import {
  buildOrderDocumentHtml,
  type OrderDocumentPayload,
  type OrderDocumentType,
} from "@/lib/order-document-html";

const ERROR_MESSAGES: Record<OrderDocumentType, string> = {
  receipt: "โหลดข้อมูลใบเสร็จไม่สำเร็จ",
  quotation: "โหลดข้อมูลใบเสนอราคาไม่สำเร็จ",
};

export async function openOrderDocumentPopup(
  orderId: string,
  type: OrderDocumentType
) {
  const popup = window.open("", "_blank", "width=1024,height=900");
  if (!popup) return;

  try {
    const res = await fetch(`/api/admin/orders/${orderId}/receipt`);
    const data = (await res.json()) as OrderDocumentPayload | { error?: string };
    if (!res.ok || !("orderNumber" in data)) {
      popup.document.write(
        `<p style="font-family: Arial, sans-serif; padding: 20px;">${
          "error" in data && data.error ? data.error : ERROR_MESSAGES[type]
        }</p>`
      );
      popup.document.close();
      return;
    }

    popup.document.open();
    popup.document.write(buildOrderDocumentHtml(data, type));
    popup.document.close();
  } catch {
    popup.document.write(
      `<p style="font-family: Arial, sans-serif; padding: 20px;">เกิดข้อผิดพลาดระหว่างสร้างเอกสาร</p>`
    );
    popup.document.close();
  }
}
