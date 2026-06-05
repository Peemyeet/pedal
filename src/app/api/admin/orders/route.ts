import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getAppOrderById, listQuotations, listWebOrders } from "@/lib/legacy";
import { prisma } from "@/lib/prisma";
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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [web, wholesale] = await Promise.all([
    listWebOrders(),
    listQuotations({ status: { not: "CANCELLED" } }),
  ]);

  return NextResponse.json(
    [...wholesale, ...web].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  );
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

  const { customerName, phone, address, notes, isQuotation, items } = parsed.data;

  const productIds = items
    .map((i) => i.productId)
    .filter((id): id is string => Boolean(id));

  if (productIds.length !== items.length) {
    return NextResponse.json({ error: "ต้องเลือกสินค้าจากระบบ" }, { status: 400 });
  }

  const orderItems = items.map((item) => ({
    productId: item.productId!,
    productName: item.productName,
    quantity: item.quantity,
    priceAtOrder: item.priceAtOrder,
  }));

  const shippingFee = 0;

  try {
    const created = await prisma.$transaction(async (tx) => {
      if (!isQuotation) {
        await deductStockForItems(tx, orderItems);
      }

      const maxNum = await tx.quotation.aggregate({ _max: { number: true } });
      const number = (maxNum._max.number ?? 0) + 1;
      const id = `qt_${Date.now()}`;

      return tx.quotation.create({
        data: {
          id,
          number,
          customerName,
          customerContact: phone,
          note: [notes, address].filter(Boolean).join("\n"),
          shippingFee,
          status: isQuotation ? "DRAFT" : "CONFIRMED",
          updatedAt: new Date(),
          QuotationLine: {
            create: orderItems.map((item, index) => ({
              id: `${id}_line_${index}`,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.priceAtOrder,
              shippingFee: 0,
            })),
          },
        },
      });
    });

    const mapped = await getAppOrderById(created.id);
    return NextResponse.json(mapped, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK") {
      return NextResponse.json(
        { error: "สต๊อกไม่เพียงพอสำหรับรายการสินค้า" },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "สร้างใบเสนอราคาไม่สำเร็จ" }, { status: 500 });
  }
}
