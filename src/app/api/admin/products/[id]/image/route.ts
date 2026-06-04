import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteLocalProductImage,
  isLocalProductImage,
  saveProductImageFile,
} from "@/lib/product-image";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "กรุณาเลือกไฟล์รูป" }, { status: 400 });
  }

  try {
    const imagePath = await saveProductImageFile(id, file);

    if (isLocalProductImage(product.image)) {
      await deleteLocalProductImage(product.image);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { image: imagePath },
    });

    return NextResponse.json({ image: updated.image });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "UNSUPPORTED_TYPE") {
        return NextResponse.json(
          { error: "รองรับเฉพาะ JPG, PNG, WebP, GIF" },
          { status: 400 }
        );
      }
      if (e.message === "TOO_LARGE") {
        return NextResponse.json(
          { error: "ไฟล์ใหญ่เกินไป (สูงสุด 5 MB)" },
          { status: 400 }
        );
      }
    }
    console.error(e);
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 });
  }
}
