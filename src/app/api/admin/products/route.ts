import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  image: z.string().url(),
  category: z.enum(["fresh", "dried", "processed"]),
  heatLevel: z.number().int().min(1).max(5),
  isActive: z.boolean().optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เพิ่มไม่สำเร็จ — slug อาจซ้ำกับสินค้าอื่น" },
      { status: 409 }
    );
  }
}
