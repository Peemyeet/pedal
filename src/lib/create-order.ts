"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { shippingFeeForUnitQuantity } from "@/lib/shipping-tiers";

type Line = { productId: string; quantity: number };

export type CreateOrderInput = {
  paymentNote?: string | null;
  shippingName: string;
  shippingAddress: string;
  shippingPostalCode: string;
  shippingPhone?: string | null;
};

async function nextOrderNumber(): Promise<number> {
  const last = await prisma.order.findFirst({ orderBy: { number: "desc" } });
  return (last?.number ?? 0) + 1;
}

const TH_POSTAL = /^\d{5}$/;

/**
 * สร้างออเดอร์จากรายการในตะกร้า — หักสต็อกทันที, รอดำเนินการชำระ/ยืนยันทางแอดมิน
 */
export async function createOrderFromLines(lines: Line[], extra: CreateOrderInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "กรุณาเข้าสู่ระบบ" } as const;
  }
  if (!lines.length) {
    return { error: "ไม่มีรายการในตะกร้า" } as const;
  }
  const shipName = extra.shippingName?.trim() ?? "";
  const shipAddr = extra.shippingAddress?.trim() ?? "";
  const shipZip = extra.shippingPostalCode?.trim() ?? "";
  if (shipName.length < 2) {
    return { error: "กรุณากรอกชื่อผู้รับ" } as const;
  }
  if (shipAddr.length < 5) {
    return { error: "กรุณากรอกที่อยู่จัดส่ง" } as const;
  }
  if (!TH_POSTAL.test(shipZip)) {
    return { error: "รหัสไปรษณีย์ 5 หลัก" } as const;
  }

  const byProduct = new Map<string, number>();
  for (const l of lines) {
    const q = Math.max(1, Math.floor(l.quantity) || 1);
    byProduct.set(l.productId, (byProduct.get(l.productId) ?? 0) + q);
  }
  const merged: Line[] = [...byProduct.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
  const unique = merged.map((m) => m.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: unique }, active: true },
    select: { id: true, name: true, price: true, sku: true, stock: true },
  });
  if (products.length !== unique.length) {
    return { error: "มีสินค้าที่ไม่พบหรือปิดใช้งาน" } as const;
  }
  for (const m of merged) {
    const p = products.find((x) => x.id === m.productId);
    if (!p || p.stock < m.quantity) {
      const code = p?.sku ? `รหัส ${p.sku} · ` : "";
      return {
        error: `${code}${p?.name ?? "สินค้า"} คงเหลือ ${
          p?.stock ?? 0
        } ไม่พอสำหรับ ${m.quantity} ชิ้น`,
      } as const;
    }
  }

  const number = await nextOrderNumber();
  const priceById = Object.fromEntries(products.map((p) => [p.id, p.price]));

  const lineRows = merged.map((l) => {
    const up = priceById[l.productId] ?? 0;
    return {
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: up,
      lineShipping: shippingFeeForUnitQuantity(l.quantity),
    };
  });

  let subtotal = 0;
  let shipSum = 0;
  for (const r of lineRows) {
    subtotal += r.unitPrice * r.quantity;
    shipSum += r.lineShipping;
  }
  const grand = subtotal + shipSum;

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const row of lineRows) {
        const p = await tx.product.findUnique({ where: { id: row.productId } });
        if (!p || p.stock < row.quantity) {
          throw new Error("stock");
        }
        await tx.product.update({
          where: { id: row.productId },
          data: { stock: p.stock - row.quantity },
        });
      }
      return tx.order.create({
        data: {
          number,
          userId: session.user.id,
          status: "PENDING",
          subtotal,
          shippingTotal: shipSum,
          grandTotal: grand,
          paymentNote: extra.paymentNote?.trim() || null,
          shippingName: shipName,
          shippingAddress: shipAddr,
          shippingPostalCode: shipZip,
          shippingPhone: extra.shippingPhone?.trim() || null,
          lines: {
            create: lineRows.map((r) => ({
              productId: r.productId,
              quantity: r.quantity,
              unitPrice: r.unitPrice,
              lineShipping: r.lineShipping,
            })),
          },
        },
      });
    });
    revalidatePath("/orders");
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${order.id}`);
    revalidatePath("/products");
    return { ok: true as const, orderId: order.id, orderNumber: order.number };
  } catch {
    return { error: "บันทึกออเดอร์ไม่สำเร็จ — กรุณาลองอีกครั้ง" } as const;
  }
}
