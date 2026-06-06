import { SHIPPING_TIER_LABELS } from "@/lib/shipping";

export function ShippingTierInfo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-stone-500">
        ค่าจัดส่งตามน้ำหนัก (1 ชิ้น = 1 กก.) — {SHIPPING_TIER_LABELS.join(" · ")}
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
      <p className="text-sm font-medium text-stone-800">ค่าจัดส่งตามน้ำหนัก</p>
      <p className="mt-1 text-xs text-stone-500">1 ชิ้น = 1 กก.</p>
      <ul className="mt-2 space-y-1 text-sm text-stone-600">
        {SHIPPING_TIER_LABELS.map((label) => (
          <li key={label}>• {label}</li>
        ))}
      </ul>
    </div>
  );
}
