import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { listAppProducts, mapProduct } from "@/lib/legacy";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await listAppProducts());
}

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
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
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        sku: parsed.data.slug,
        description: parsed.data.description,
        price: parsed.data.price,
        stock: parsed.data.stock,
        active: parsed.data.isActive ?? true,
      },
    });
    return NextResponse.json(mapProduct(product), { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เพิ่มไม่สำเร็จ — SKU อาจซ้ำกับสินค้าอื่น" },
      { status: 409 }
    );
  }
}
