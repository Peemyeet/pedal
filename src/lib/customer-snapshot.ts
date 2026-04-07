/** สร้างข้อมูลชื่อ/ติดต่อ/หมายเหตุสำหรับใบเสนอราคาจากเรคคอร์ดลูกค้า (ใช้ฝั่งเซิร์ฟเวอร์) */
export function extractPhone(text: string): string {
  if (!text) return "";
  const normalized = text.replace(/\s+/g, " ");
  const m1 = normalized.match(/(?:โทร\.?|Tel\.?)\s*([0-9\- ]{9,})/i);
  if (m1) return m1[1].replace(/[\s-]/g, "").slice(0, 20);
  const m2 = normalized.match(/\b0[0-9][\d\- ]{8,}\b/);
  if (m2) return m2[0].replace(/[\s-]/g, "").slice(0, 20);
  return "";
}

export function snapshotFromCustomer(c: {
  name: string | null;
  address: string | null;
  orderNote: string | null;
  lastPurchaseNote: string | null;
}) {
  const addr = c.address ?? "";
  const customerName = (c.name ?? "").trim() || null;
  const contact = extractPhone(addr);
  const note =
    [addr, c.orderNote, c.lastPurchaseNote].filter(Boolean).join("\n\n") || null;
  return {
    customerName,
    customerContact: contact || null,
    note,
  };
}
