import { NextResponse } from "next/server";
import { z } from "zod";
import { mapWebOrderToAppOrder } from "@/lib/legacy";
import { prisma } from "@/lib/prisma";
import { deductStockForItems } from "@/lib/order-stock";

const orderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(10),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = orderSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" },
        { status: 400 }
      );
    }

    const { customerName, phone, email, address, notes, items } = parsed.data;

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "มีสินค้าที่ไม่พบในระบบ" }, { status: 400 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems: {
      productId: string;
      productName: string;
      quantity: number;
      priceAtOrder: number;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "สินค้าไม่ถูกต้อง" }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `สินค้า "${product.name}" มีไม่พอ (คงเหลือ ${product.stock})`,
          },
          { status: 400 }
        );
      }
      const price = Math.round(product.price);
      subtotal += price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        priceAtOrder: price,
      });
    }

    const guestUser =
      (await prisma.user.findFirst({ where: { role: "CUSTOMER" } })) ??
      (await prisma.user.findFirst());

    if (!guestUser) {
      return NextResponse.json({ error: "ระบบยังไม่พร้อมรับออเดอร์เว็บ" }, { status: 503 });
    }

    const order = await prisma.$transaction(async (tx) => {
      await deductStockForItems(tx, orderItems);

      const maxNum = await tx.order.aggregate({ _max: { number: true } });
      const number = (maxNum._max.number ?? 0) + 1;
      const id = `ord_${Date.now()}`;

      const created = await tx.order.create({
        data: {
          id,
          number,
          userId: guestUser.id,
          status: "PENDING",
          subtotal,
          shippingTotal: 0,
          grandTotal: subtotal,
          shippingName: customerName,
          shippingPhone: phone,
          shippingAddress: address,
          paymentNote: notes || null,
          updatedAt: new Date(),
          OrderLine: {
            create: orderItems.map((oi, index) => ({
              id: `${id}_line_${index}`,
              productId: oi.productId,
              quantity: oi.quantity,
              unitPrice: oi.priceAtOrder,
              lineShipping: 0,
            })),
          },
        },
        include: {
          OrderLine: { include: { Product: true } },
          User: true,
        },
      });

      return created;
    });

    const mapped = mapWebOrderToAppOrder(order);

    return NextResponse.json({
      orderNumber: mapped.orderNumber,
      id: mapped.id,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK") {
      return NextResponse.json(
        { error: "สต๊อกไม่เพียงพอ กรุณาตรวจสอบตะกร้าอีกครั้ง" },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดของระบบ" }, { status: 500 });
  }
}
