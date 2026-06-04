import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
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

  const customers = await prisma.b2BCustomer.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(customers);
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
  const customer = await prisma.b2BCustomer.create({
    data: {
      shopName: data.shopName || null,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      taxId: data.taxId || null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
