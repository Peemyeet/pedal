import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { listB2BCustomers } from "@/lib/legacy";
import { prisma } from "@/lib/prisma";

const customerSchema = z.object({
  shopName: z.string().trim().max(200).optional(),
  customerName: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
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
  await prisma.customer.update({
    where: { id },
    data: {
      name: data.customerName,
      address: `${data.address}\nโทร. ${data.phone}`,
      orderNote: data.notes || null,
      billingInfo: data.taxId ? `เลขประจำตัวผู้เสียภาษี ${data.taxId}` : null,
      updatedAt: new Date(),
    },
  });

  const updated = (await listB2BCustomers()).find((c) => c.id === id);
  return NextResponse.json(updated);
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
