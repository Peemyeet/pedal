/** ค่าจัดส่งตามน้ำหนักรวม (กก.) — 1 ชิ้น = 1 กก. */
export const SHIPPING_TIER_LABELS = [
  "1 กก. = 50 บาท",
  "2 กก. = 80 บาท",
  "3 กก. = 100 บาท",
  "4–8 กก. = 110 บาท",
  "9–10 กก. = 140 บาท",
  "11–12 กก. = 160 บาท",
  "13–14 กก. = 180 บาท",
  "15 กก. ขึ้นไป = 200 บาท",
] as const;

export function getShippingFeeByWeightKg(totalKg: number): number {
  const kg = Math.ceil(totalKg);
  if (kg <= 0) return 0;
  if (kg === 1) return 50;
  if (kg === 2) return 80;
  if (kg === 3) return 100;
  if (kg <= 8) return 110;
  if (kg <= 10) return 140;
  if (kg <= 12) return 160;
  if (kg <= 14) return 180;
  return 200;
}

export function calculateTotalWeightKg(
  items: { quantity: number; weightKgPerUnit?: number }[]
): number {
  return items.reduce(
    (sum, item) => sum + item.quantity * (item.weightKgPerUnit ?? 1),
    0
  );
}

export function calculateShippingFee(
  items: { quantity: number; weightKgPerUnit?: number }[]
): number {
  return getShippingFeeByWeightKg(calculateTotalWeightKg(items));
}
