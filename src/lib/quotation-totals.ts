/** ยอดค่าขนส่ง: รองรับใบเก่าที่ค่าส่งอยู่ระดับใบอย่างเดียว */
export function shippingTotalFromQuotation(q: {
  shippingFee: number;
  lines: { shippingFee: number }[];
}): number {
  const fromLines = q.lines.reduce((s, l) => s + l.shippingFee, 0);
  return fromLines > 0 ? fromLines : q.shippingFee;
}

export function lineItemsSubtotal(
  lines: { unitPrice: number; quantity: number }[],
): number {
  return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
}
