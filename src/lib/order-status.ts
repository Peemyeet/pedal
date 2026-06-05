const ORDER_STATUSES = new Set([
  "QUOTATION",
  "PENDING",
  "WAITING_SHIPMENT",
  "PAID",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export function parseOrderStatusParam(
  value: string | undefined | null
): string | undefined {
  if (!value || !ORDER_STATUSES.has(value)) return undefined;
  return value;
}
