import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logOrderAudit } from "@/lib/order-audit";
import { generateOrderNumber } from "@/lib/orders";
import { parseOrderStatusParam } from "@/lib/order-status";
import { deductStockForItems } from "@/lib/order-stock";

const lineItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1),
  quantity: z.number().int().min(1).max(9999),
  priceAtOrder: z.number().int().min(0),
});

const createSchema = z.object({
  shopName: z.string().optional(),
  customerName: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(5),
  notes: z.string().optional(),
  isQuotation: z.boolean().default(true),
  items: z.array(lineItemSchema).min(1),
});

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = parseOrderStatusParam(searchParams.get("status"));
  const source = searchParams.get("source");

  const orders = await prisma.order.findMany({
    where: {
      archived: false,
      ...(status ? { status } : {}),
      ...(source === "WEBSITE" || source === "WHOLESALE"
        ? { source: source as never }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 200,
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const {
    shopName,
    customerName,
    phone,
    email,
    address,
    notes,
    isQuotation,
    items,
  } = parsed.data;

  const productIds = items
    .map((i) => i.productId)
    .filter((id): id is string => Boolean(id));

  const products =
    productIds.length > 0
      ? await prisma.product.findMany({ where: { id: { in: productIds } } })
      : [];
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItems = items.map((item) => {
    const product = item.productId ? productMap.get(item.productId) : null;
    return {
      productId: product?.id ?? null,
      productName: item.productName,
      productSlug: product?.slug ?? null,
      quantity: item.quantity,
      priceAtOrder: item.priceAtOrder,
    };
  });

  const total = orderItems.reduce(
    (sum, i) => sum + i.priceAtOrder * i.quantity,
    0
  );

  const orderNumber = generateOrderNumber("WHOLESALE");
  const status = isQuotation ? "QUOTATION" : "PENDING";
  const shouldDeduct = !isQuotation;

  try {
    const order = await prisma.$transaction(async (tx) => {
      if (shouldDeduct) {
        await deductStockForItems(tx, orderItems);
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          source: "WHOLESALE",
          shopName: shopName?.trim() || null,
          customerName,
          phone,
          email: email || null,
          address,
          notes: notes || null,
          total,
          status,
          stockDeducted: shouldDeduct,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      await logOrderAudit(
        created.id,
        {
          adminId: admin.id,
          adminName: admin.name,
          action: "CREATE_ORDER",
          detail: `สร้าง${isQuotation ? "ใบเสนอราคา" : "ออเดอร์"} ${orderNumber}`,
        },
        tx
      );

      return created;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK") {
      return NextResponse.json(
        { error: "สต๊อกไม่เพียงพอสำหรับรายการสินค้า" },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "สร้างออเดอร์ไม่สำเร็จ" }, { status: 500 });
  }
}
