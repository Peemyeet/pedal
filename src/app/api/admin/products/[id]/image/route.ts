import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { mapProduct } from "@/lib/legacy";
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
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์รูป" }, { status: 400 });
  }

  try {
    const imagePath = await saveProductImageFile(id, file);

    if (existing.imageUrl && isLocalProductImage(existing.imageUrl)) {
      await deleteLocalProductImage(existing.imageUrl);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { imageUrl: imagePath },
    });

    return NextResponse.json({ image: mapProduct(updated).image });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNSUPPORTED_TYPE") {
        return NextResponse.json({ error: "ชนิดไฟล์ไม่รองรับ" }, { status: 400 });
      }
      if (error.message === "TOO_LARGE") {
        return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5 MB" }, { status: 400 });
      }
      if (error.message === "READ_ONLY_FS") {
        return NextResponse.json(
          {
            error:
              "อัปโหลดไฟล์ไม่ได้บนเซิร์ฟเวอร์ — ใช้ URL รูปแทน หรือตั้งค่า BLOB_READ_WRITE_TOKEN",
          },
          { status: 503 }
        );
      }
    }
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 });
  }
}
