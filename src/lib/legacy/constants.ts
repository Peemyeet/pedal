export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80";

export function productSlug(sku: string | null | undefined, id: string) {
  if (sku?.trim()) return sku.trim().toLowerCase().replace(/\s+/g, "-");
  return `sku-${id.slice(0, 8)}`;
}

export function quotationNumber(n: number) {
  return `QT${String(n).padStart(6, "0")}`;
}

export function webOrderNumber(n: number) {
  return `PD${String(n).padStart(6, "0")}`;
}
