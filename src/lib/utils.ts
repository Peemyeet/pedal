export function formatPrice(baht: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(baht);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  QUOTATION: "ใบเสนอราคา",
  PENDING: "รอดำเนินการ",
  WAITING_SHIPMENT: "รอจัดส่ง",
  CONFIRMED: "ยืนยันแล้ว",
  PAID: "ชำระเงินแล้ว",
  SHIPPED: "จัดส่งแล้ว",
  DELIVERED: "ส่งสำเร็จ",
  CANCELLED: "ยกเลิก",
};

export const WEBSITE_ORDER_STATUSES = [
  "CONFIRMED",
  "PENDING",
  "WAITING_SHIPMENT",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const WHOLESALE_ORDER_STATUSES = [
  "QUOTATION",
  "PENDING",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const ORDER_SOURCE_LABEL: Record<string, string> = {
  WEBSITE: "หน้าเว็บ",
  WHOLESALE: "ร้านค้า / B2B",
};

const WEBSITE_ORDER_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "ยืนยันสั่งซื้อ",
  PENDING: "ยังไม่ได้ชำระเงิน",
  WAITING_SHIPMENT: "ยังไม่ได้จัดส่ง",
};

/** สถานะที่แสดงเป็นแท็บแยก (ไม่รวม WAITING_SHIPMENT — ใช้แท็บ "ยังไม่ได้จัดส่ง") */
export const WEBSITE_ORDER_TAB_STATUSES = [
  "CONFIRMED",
  "PENDING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export function getOrderStatusLabel(
  status: string,
  source?: string,
  opts?: { wholesaleUnpaid?: boolean }
): string {
  if (opts?.wholesaleUnpaid && status === "CONFIRMED") {
    return "ยืนยันแล้ว(ยังไม่ได้ชำระเงิน)";
  }
  if (source === "WEBSITE") {
    return WEBSITE_ORDER_STATUS_LABEL[status] ?? ORDER_STATUS_LABEL[status] ?? status;
  }
  return ORDER_STATUS_LABEL[status] ?? status;
}

export const CATEGORY_LABEL: Record<string, string> = {
  fresh: "พริกสด",
  dried: "พริกแห้ง",
  processed: "แปรรูป",
};

export function heatLabel(level: number): string {
  return "🌶️".repeat(Math.min(5, Math.max(1, level)));
}
