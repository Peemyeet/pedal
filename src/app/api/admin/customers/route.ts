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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await listB2BCustomers());
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = customerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const data = parsed.data;
  const category = data.shopName?.split("·")[0]?.trim() || "ทั่วไป";
  const code = `N${Date.now().toString(36).slice(-4).toUpperCase()}`;

  const row = await prisma.customer.create({
    data: {
      id: `cust_${Date.now()}`,
      category,
      customerCode: code,
      name: data.customerName,
      address: `${data.address}\nโทร. ${data.phone}`,
      orderNote: data.notes || null,
      billingInfo: data.taxId ? `เลขประจำตัวผู้เสียภาษี ${data.taxId}` : null,
      updatedAt: new Date(),
    },
  });

  const customers = await listB2BCustomers();
  const created = customers.find((c) => c.id === row.id);
  return NextResponse.json(created ?? row, { status: 201 });
}
