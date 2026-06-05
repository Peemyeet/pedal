import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { mapProduct } from "@/lib/legacy";
import { prisma } from "@/lib/prisma";

/** ระบบเก่าไม่มีฟิลด์รูป — รับอัปโหลดแต่ไม่บันทึกลง DB (ใช้รูปตั้งต้นใน UI) */
export async function POST(
  _request: Request,
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

  const mapped = mapProduct(product);
  return NextResponse.json({
    image: mapped.image,
    message: "ระบบเก่าไม่เก็บรูปในฐานข้อมูล — แสดงรูปตั้งต้น",
  });
}
