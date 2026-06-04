import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use"
>;

export async function logOrderAudit(
  orderId: string,
  payload: {
    adminId?: string | null;
    adminName: string;
    action: string;
    detail?: string | null;
  },
  tx?: Tx
) {
  const client = tx ?? prisma;
  return client.orderAuditLog.create({
    data: {
      orderId,
      adminId: payload.adminId ?? null,
      adminName: payload.adminName,
      action: payload.action,
      detail: payload.detail ?? null,
    },
  });
}

export function buildOrderSearchFilter(q?: string): Prisma.OrderWhereInput | undefined {
  const query = q?.trim();
  if (!query) return undefined;

  return {
    OR: [
      { orderNumber: { contains: query } },
      { customerName: { contains: query } },
      { shopName: { contains: query } },
      { phone: { contains: query } },
      { address: { contains: query } },
    ],
  };
}

export function mergeOrderWhere(
  base: Prisma.OrderWhereInput,
  search?: Prisma.OrderWhereInput
): Prisma.OrderWhereInput {
  if (!search) return base;
  return { AND: [base, search] };
}
