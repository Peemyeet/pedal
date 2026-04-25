"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
type TargetStatus = "COMPLETED" | "CANCELLED";

/**
 * ออเดอร์ PENDING → COMPLETED หรือ CANCELLED (ยกเลิกคืนสต็อก)
 */
export async function updateWebOrderStatus(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "ไม่มีสิทธิ์" } as const;
  }
  const id = String(formData.get("orderId") ?? "").trim();
  const next = String(formData.get("status") ?? "").trim() as TargetStatus;
  if (!id || (next !== "COMPLETED" && next !== "CANCELLED")) {
    return { error: "คำสั่งไม่ถูกต้อง" } as const;
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { lines: { select: { productId: true, quantity: true } } },
  });
  if (!order) {
    return { error: "ไม่พบออเดอร์" } as const;
  }
  if (order.status !== "PENDING") {
    return { error: "ออเดอร์นี้ดำเนินการแล้ว" } as const;
  }

  try {
    if (next === "COMPLETED") {
      await prisma.order.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        for (const line of order.lines) {
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { increment: line.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
      });
    }
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${id}`);
    revalidatePath("/products");
    revalidatePath("/shop");
    return { ok: true as const };
  } catch {
    return { error: "อัปเดตไม่สำเร็จ" } as const;
  }
}

export async function updateOrderTracking(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return;
  }
  const id = String(formData.get("orderId") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  if (!id) return;

  try {
    await prisma.order.update({
      where: { id },
      data: { trackingNumber: trackingNumber || null },
    });
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${id}`);
  } catch {
    return;
  }
}
