import { prisma } from "@/lib/prisma";

export async function getAdminSidebarOrderCounts() {
  const [toShip, unpaid] = await Promise.all([
    prisma.order.count({
      where: { status: "WAITING_SHIPMENT", archived: false },
    }),
    prisma.order.count({
      where: {
        OR: [
          { source: "WHOLESALE", status: "QUOTATION", archived: false },
          { status: { in: ["PENDING", "CONFIRMED"] }, archived: false },
        ],
      },
    }),
  ]);

  return { toShip, unpaid };
}
