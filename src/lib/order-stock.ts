import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

type StockLine = {
  productId: string | null;
  quantity: number;
};

export async function deductStockForItems(tx: Tx, items: StockLine[]) {
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

export async function restoreStockForItems(tx: Tx, items: StockLine[]) {
  for (const item of items) {
    if (!item.productId) continue;
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}
