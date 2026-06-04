/** ค่าจัดส่งต่อแถวตามจำนวนหน่วย (ชิ้น) — 1=50, 2=80, 3=100, 4–8=110, 9–10=140, 11–12=160, 13–14=180, 15–16=200 */
export function shippingFeeForUnitQuantity(units: number): number {
  const q = Math.max(1, Math.floor(Number(units)) || 1);
  if (q === 1) return 50;
  if (q === 2) return 80;
  if (q === 3) return 100;
  if (q >= 4 && q <= 8) return 110;
  if (q >= 9 && q <= 10) return 140;
  if (q >= 11 && q <= 12) return 160;
  if (q >= 13 && q <= 14) return 180;
  return 200;
}

/** ค่าที่อาจปรากฏในระบบ (รวมใบเก่าที่อาจมี 110, 300) */
export const SHIPPING_TIERS = [50, 80, 100, 110, 120, 140, 160, 180, 200, 300] as const;

export type ShippingTier = (typeof SHIPPING_TIERS)[number];

export const DEFAULT_SHIPPING_TIER: ShippingTier = 50;

const tierSet = new Set<number>(SHIPPING_TIERS);

/** ใช้กับข้อมูลเก่าหรือค่าที่ส่งมาจากฟอร์ม — ค่าใหม่ควรใช้ shippingFeeForUnitQuantity จากจำนวนจริง */
export function normalizeShippingTier(fee: number): ShippingTier {
  if (tierSet.has(fee)) return fee as ShippingTier;
  return DEFAULT_SHIPPING_TIER;
}
