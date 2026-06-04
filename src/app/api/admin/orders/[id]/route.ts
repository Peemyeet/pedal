import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logOrderAudit } from "@/lib/order-audit";
import {
  deductStockForItems,
  restoreStockForItems,
} from "@/lib/order-stock";

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
  archived: z.boolean().optional(),
});

function canMarkAsPaid(oldStatus: string) {
  return ["CONFIRMED", "PAID", "SHIPPED", "DELIVERED"].includes(oldStatus);
}

function canMoveToWaitingShipment(source: string, oldStatus: string) {
  if (source === "WEBSITE") {
    return ["PENDING", "CONFIRMED"].includes(oldStatus);
  }
  return ["PENDING", "CONFIRMED", "PAID", "WAITING_SHIPMENT"].includes(oldStatus);
}

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

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  }

  const newStatus = parsed.data.status;
  const oldStatus = order.status;
  const trackingNumber = parsed.data.trackingNumber?.trim() || null;
  const trackingChanged = trackingNumber !== order.trackingNumber;
  const archived =
    newStatus === "DELIVERED" ? true : parsed.data.archived;
  const archivedChanged = archived !== undefined && archived !== order.archived;

  if (newStatus === oldStatus && !trackingChanged && !archivedChanged) {
    return NextResponse.json(order);
  }

  if (order.source === "WEBSITE" && newStatus === "PAID") {
    return NextResponse.json(
      { error: "ออเดอร์หน้าเว็บใช้สถานะ \"รอจัดส่ง\" หลังชำระเงิน" },
      { status: 400 }
    );
  }

  if (
    order.source === "WEBSITE" &&
    newStatus === "WAITING_SHIPMENT" &&
    !canMoveToWaitingShipment(order.source, oldStatus)
  ) {
    return NextResponse.json(
      {
        error:
          order.source === "WEBSITE"
            ? "ต้องชำระเงินก่อน จึงจะเปลี่ยนเป็น「ยังไม่ได้จัดส่ง」ได้ (จากยืนยันสั่งซื้อหรือยังไม่ได้ชำระเงิน)"
            : "เปลี่ยนเป็นรอจัดส่งได้จากรอดำเนินการ/ยืนยันแล้ว/ชำระเงินแล้วเท่านั้น",
      },
      { status: 400 }
    );
  }

  if (
    order.source === "WEBSITE" &&
    newStatus === "SHIPPED" &&
    !["WAITING_SHIPMENT", "SHIPPED"].includes(oldStatus)
  ) {
    return NextResponse.json(
      { error: "ต้องชำระเงินและอยู่ในสถานะ「ยังไม่ได้จัดส่ง」ก่อนจึงจะจัดส่งแล้วได้" },
      { status: 400 }
    );
  }

  if (newStatus === "SHIPPED" && !(trackingNumber || order.trackingNumber)) {
    return NextResponse.json(
      { error: "กรุณากรอกเลขพัสดุก่อนเปลี่ยนเป็นจัดส่งแล้ว" },
      { status: 400 }
    );
  }

  if (newStatus === "PAID" && !canMarkAsPaid(oldStatus)) {
    return NextResponse.json(
      { error: "ต้องยืนยันออเดอร์ก่อน จึงจะอัปเดตเป็นชำระเงินแล้วได้" },
      { status: 400 }
    );
  }

  const shouldDeduct =
    !order.stockDeducted &&
    newStatus === "CONFIRMED" &&
    (oldStatus === "QUOTATION" ||
      oldStatus === "PENDING" ||
      oldStatus === "PAID");

  const shouldRestore =
    order.stockDeducted &&
    newStatus === "CANCELLED" &&
    oldStatus !== "CANCELLED";

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (shouldRestore) {
        await restoreStockForItems(tx, order.items);
      }

      if (shouldDeduct) {
        await deductStockForItems(tx, order.items);
      }

      const result = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
          ...(trackingChanged ? { trackingNumber } : {}),
          ...(archivedChanged ? { archived } : {}),
          stockDeducted: shouldRestore
            ? false
            : shouldDeduct
              ? true
              : order.stockDeducted,
        },
        include: { items: true },
      });

      const auditParts: string[] = [];
      if (newStatus !== oldStatus) {
        auditParts.push(`สถานะ: ${oldStatus} → ${newStatus}`);
      }
      if (trackingChanged) {
        auditParts.push(`เลขพัสดุ: ${trackingNumber ?? "-"}`);
      }
      if (archivedChanged && archived !== undefined) {
        auditParts.push(`จัดเก็บ: ${archived ? "ใช่" : "ไม่"}`);
      }

      if (auditParts.length > 0) {
        await logOrderAudit(
          id,
          {
            adminId: admin.id,
            adminName: admin.name,
            action: "UPDATE_ORDER",
            detail: auditParts.join(" · "),
          },
          tx
        );
      }

      return result;
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK") {
      return NextResponse.json(
        { error: "สต๊อกไม่เพียงพอ — ไม่สามารถยืนยันออเดอร์ได้" },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "อัปเดตไม่สำเร็จ" }, { status: 500 });
  }
}
