import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAppOrderById } from "@/lib/legacy";
import { savePaymentSlipFile } from "@/lib/payment-slip";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getAppOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "กรุณาแนบหลักฐานการชำระเงิน" },
      { status: 400 }
    );
  }

  try {
    const path = await savePaymentSlipFile(id, file);
    return NextResponse.json({ path });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNSUPPORTED_TYPE") {
        return NextResponse.json(
          { error: "รองรับเฉพาะ JPG, PNG, WEBP, GIF หรือ PDF" },
          { status: 400 }
        );
      }
      if (error.message === "TOO_LARGE") {
        return NextResponse.json(
          { error: "ไฟล์ใหญ่เกิน 8 MB" },
          { status: 400 }
        );
      }
    }
    console.error("[payment-slip]", error);
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 });
  }
}
