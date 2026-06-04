import type { OrderItem, Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export async function deductStockForItems(
  tx: Tx,
  items: Pick<OrderItem, "productId" | "quantity">[]
) {
  for (const item of items) {
    if (!item.productId) continue;
    const updated = await tx.product.updateMany({
      where: {
        id: item.productId,
        stock: { gte: item.quantity },
      },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count === 0) {
      throw new Error("STOCK");
    }
  }
}

export async function restoreStockForItems(
  tx: Tx,
  items: Pick<OrderItem, "productId" | "quantity">[]
) {
  for (const item of items) {
    if (!item.productId) continue;
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}
