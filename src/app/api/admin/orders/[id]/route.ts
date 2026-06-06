import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getAppOrderById, updateAppOrderStatus } from "@/lib/legacy";

const updateSchema = z.object({
  status: z.enum([
    "QUOTATION",
    "PENDING",
    "WAITING_SHIPMENT",
    "PAID",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
  trackingNumber: z.string().trim().max(100).optional(),
  paymentSlipPath: z.string().trim().max(500).optional(),
  paymentReference: z.string().trim().max(200).optional(),
  archived: z.boolean().optional(),
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
    return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
  }

  const order = await getAppOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  }

  const trackingNumber = parsed.data.trackingNumber?.trim() || null;

  if (parsed.data.status === "SHIPPED" && !(trackingNumber || order.trackingNumber)) {
    return NextResponse.json(
      { error: "กรุณากรอกเลขพัสดุก่อนเปลี่ยนเป็นจัดส่งแล้ว" },
      { status: 400 }
    );
  }

  const updated = await updateAppOrderStatus(id, parsed.data.status, {
    trackingNumber,
    paymentSlipPath: parsed.data.paymentSlipPath?.trim() || null,
    paymentReference: parsed.data.paymentReference?.trim() || null,
  });

  if (!updated) {
    return NextResponse.json({ error: "อัปเดตไม่สำเร็จ" }, { status: 500 });
  }

  return NextResponse.json(updated);
}
