import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";
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
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "มีสินค้าที่ไม่พบในระบบ" }, { status: 400 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = 0;
    const orderItems: {
      productId: string;
      productName: string;
      productSlug: string;
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
      total += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        quantity: item.quantity,
        priceAtOrder: product.price,
      });
    }

    const orderNumber = generateOrderNumber("WEBSITE");

    const order = await prisma.$transaction(async (tx) => {
      await deductStockForItems(tx, orderItems);

      return tx.order.create({
        data: {
          orderNumber,
          source: "WEBSITE",
          customerName,
          phone,
          email: email || null,
          address,
          notes: notes || null,
          total,
          status: "PENDING",
          stockDeducted: true,
          items: {
            create: orderItems.map((oi) => ({
              productId: oi.productId,
              productName: oi.productName,
              productSlug: oi.productSlug,
              quantity: oi.quantity,
              priceAtOrder: oi.priceAtOrder,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      id: order.id,
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
