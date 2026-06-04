import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { deleteLocalProductImage, isLocalProductImage } from "@/lib/product-image";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  image: z
    .union([
      z.string().url(),
      z.string().regex(/^\/uploads\/products\/[\w.-]+$/),
    ])
    .optional(),
  category: z.enum(["fresh", "dried", "processed"]).optional(),
  heatLevel: z.number().int().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
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
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }

  if (
    parsed.data.image &&
    parsed.data.image !== existing.image &&
    isLocalProductImage(existing.image)
  ) {
    await deleteLocalProductImage(existing.image);
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(product);
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
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
