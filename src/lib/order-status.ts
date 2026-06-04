import { OrderStatus } from "@prisma/client";

const ORDER_STATUSES = new Set<string>(Object.values(OrderStatus));

export function parseOrderStatusParam(
  value: string | undefined | null
): OrderStatus | undefined {
  if (!value || !ORDER_STATUSES.has(value)) return undefined;
  return value as OrderStatus;
}
