"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function markOrderPaid(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/orders");
  }
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) return;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: { id: true, number: true, status: true, paymentSubmittedAt: true },
  });
  if (!order || order.status !== "PENDING" || order.paymentSubmittedAt) {
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentSubmittedAt: new Date() },
  });

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${order.id}`);
  revalidatePath(`/account/orders/${order.id}/pay`);
  revalidatePath("/orders");
  revalidatePath(`/orders/${order.id}`);
  redirect(`/account/orders?paid=1&no=${order.number}`);
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPaymentSlip(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account/orders");
  }

  const orderId = String(formData.get("orderId") ?? "").trim();
  const file = formData.get("slip");
  if (!orderId || !(file instanceof File) || file.size <= 0) {
    return;
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: { id: true },
  });
  if (!order) return;

  const maxSize = 8 * 1024 * 1024;
  if (file.size > maxSize) {
    redirect(`/account/orders/${order.id}/pay?slip_error=size`);
  }

  const extFromMime =
    file.type === "image/jpeg"
      ? ".jpg"
      : file.type === "image/png"
        ? ".png"
        : file.type === "image/webp"
          ? ".webp"
          : file.type === "application/pdf"
            ? ".pdf"
            : "";
  const extFromName = path.extname(file.name || "").toLowerCase();
  const ext = extFromMime || extFromName || ".bin";
  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf"]);
  if (!allowed.has(ext)) {
    redirect(`/account/orders/${order.id}/pay?slip_error=type`);
  }

  const safeName = sanitizeFileName(path.basename(file.name || `slip${ext}`));
  const fileName = `${order.id}-${Date.now()}-${safeName}`;
  const relDir = "/uploads/payment-slips";
  const relPath = `${relDir}/${fileName}`;
  const absDir = path.join(process.cwd(), "public", "uploads", "payment-slips");
  const absPath = path.join(absDir, fileName);

  await mkdir(absDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(absPath, Buffer.from(bytes));

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentSlipPath: relPath,
      paymentSlipUploadedAt: new Date(),
    },
  });

  revalidatePath(`/account/orders/${order.id}/pay`);
  revalidatePath(`/account/orders/${order.id}`);
  revalidatePath("/orders");
  revalidatePath(`/orders/${order.id}`);
  redirect(`/account/orders/${order.id}/pay?slip=1`);
}
