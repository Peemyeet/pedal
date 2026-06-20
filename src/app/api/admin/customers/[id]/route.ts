import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  formatCustomerAddress,
  mapCustomerRow,
  parseShopName,
} from "@/lib/legacy";
import { prisma } from "@/lib/prisma";

const customerSchema = z.object({
  shopName: z.string().trim().max(200).optional(),
  customerName: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(30),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  address: z.string().trim().min(1).max(500),
  taxId: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json();
  const parsed = customerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const data = parsed.data;
  const shop = parseShopName(data.shopName);

  try {
    const row = await prisma.customer.update({
      where: { id },
      data: {
        name: data.customerName,
        address: formatCustomerAddress(data.address, data.phone),
        orderNote: data.notes || null,
        billingInfo: data.taxId
          ? `เลขประจำตัวผู้เสียภาษี ${data.taxId}`
          : null,
        ...(shop
          ? { category: shop.category, customerCode: shop.customerCode }
          : {}),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(mapCustomerRow(row));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "ไม่พบลูกค้า" }, { status: 404 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "รหัสลูกค้าซ้ำ — เปลี่ยนชื่อร้านหรือรหัส" },
        { status: 409 }
      );
    }
    throw error;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const used = await prisma.quotation.count({ where: { customerId: id } });
  if (used > 0) {
    return NextResponse.json(
      { error: "ลบไม่ได้ — ลูกค้านี้มีใบเสนอราคาในระบบแล้ว" },
      { status: 409 }
    );
  }
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
