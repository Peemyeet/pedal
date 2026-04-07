"use server";

import { revalidatePath } from "next/cache";
import { snapshotFromCustomer } from "@/lib/customer-snapshot";
import { prisma } from "@/lib/prisma";
import { shippingFeeForUnitQuantity } from "@/lib/shipping-tiers";

type LineQty = {
  productId: string;
  quantity: number;
  shippingFee: number;
  /** ราคาต่อหน่วยที่กำหนดในใบ (ไม่ผูกกับราคาในระบบ) */
  unitPrice: number;
};
type LineForStock = { productId: string; quantity: number };

function aggregateQtyByProduct(lines: LineForStock[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of lines) {
    m.set(l.productId, (m.get(l.productId) ?? 0) + l.quantity);
  }
  return m;
}

function stockErrorMessage(
  lines: LineForStock[],
  products: { id: string; name: string; sku: string | null; stock: number }[],
): string | null {
  const need = aggregateQtyByProduct(lines);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  for (const [productId, qty] of need) {
    const p = byId[productId];
    if (!p) return "ไม่พบสินค้าในคลัง";
    if (p.stock < qty) {
      const code = p.sku ? `รหัส ${p.sku} · ` : "";
      return `${code}${p.name} คงเหลือ ${p.stock} ไม่พอสำหรับจำนวน ${qty}`;
    }
  }
  return null;
}

async function nextQuotationNumber(): Promise<number> {
  const last = await prisma.quotation.findFirst({ orderBy: { number: "desc" } });
  return (last?.number ?? 0) + 1;
}

export async function createAndQuoteQuotation(input: {
  customerId?: string | null;
  lines: LineQty[];
}) {
  if (!input.lines.length) {
    return { error: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ" };
  }
  const uniqueProductIds = [...new Set(input.lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: uniqueProductIds }, active: true },
    select: { id: true, name: true, price: true, sku: true, stock: true },
  });
  if (products.length !== uniqueProductIds.length) {
    return { error: "มีสินค้าที่ไม่พบหรือถูกปิดใช้งาน" };
  }
  const stockErr = stockErrorMessage(input.lines, products);
  if (stockErr) return { error: stockErr };

  const number = await nextQuotationNumber();
  const priceById = Object.fromEntries(products.map((p) => [p.id, p.price]));

  let customerId: string | null = null;
  let customerName: string | null = null;
  let customerContact: string | null = null;
  let note: string | null = null;

  if (input.customerId) {
    const c = await prisma.customer.findUnique({ where: { id: input.customerId } });
    if (c) {
      customerId = c.id;
      const snap = snapshotFromCustomer(c);
      customerName = snap.customerName;
      customerContact = snap.customerContact;
      note = snap.note;
    }
  }

  const linesForCreate = input.lines.map((l) => {
    const qty = Math.max(1, Math.floor(Number(l.quantity)) || 1);
    const ship = shippingFeeForUnitQuantity(qty);
    const catalog = priceById[l.productId];
    const quoted =
      Number.isFinite(l.unitPrice) && l.unitPrice >= 0 ? l.unitPrice : catalog;
    return {
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: quoted,
      shippingFee: ship,
    };
  });
  const totalShipping = linesForCreate.reduce((s, l) => s + l.shippingFee, 0);

  await prisma.quotation.create({
    data: {
      number,
      customerId,
      customerName,
      customerContact,
      note,
      shippingFee: totalShipping,
      status: "QUOTED",
      lines: {
        create: linesForCreate,
      },
    },
  });

  revalidatePath("/quotations/quoted");
  revalidatePath("/quotations/fulfillment");
  revalidatePath("/products");
  if (customerId) {
    revalidatePath(`/customers/${customerId}`);
  }
  return { ok: true };
}

export async function confirmPurchase(
  quotationId: string,
  input?: { addressSource?: "billing" | "shipping" },
) {
  const q = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { lines: true, customer: true },
  });
  if (!q || q.status !== "QUOTED") {
    return { error: "ไม่พบใบเสนอราคาหรือสถานะไม่ถูกต้อง" };
  }
  const lines = q.lines.map((l) => ({ productId: l.productId, quantity: l.quantity }));
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, stock: true },
  });
  const stockErr = stockErrorMessage(lines, products);
  if (stockErr) return { error: stockErr };

  let fulfillmentAddressSource: string | null = null;
  let fulfillmentAddressText: string | null = null;

  if (q.customer) {
    const bill = q.customer.billingInfo?.trim() || "";
    const shipAddr = q.customer.address?.trim() || "";
    const hasBill = !!bill;
    const hasShip = !!shipAddr;

    if (hasBill && hasShip) {
      const src = input?.addressSource;
      if (src !== "billing" && src !== "shipping") {
        return { error: "กรุณาเลือกที่อยู่สำหรับจัดส่ง: ที่อยู่ออกบิล หรือ ที่อยู่จัดส่ง" };
      }
      fulfillmentAddressSource = src;
      fulfillmentAddressText = src === "billing" ? bill : shipAddr;
    } else if (hasBill) {
      fulfillmentAddressSource = "billing";
      fulfillmentAddressText = bill;
    } else if (hasShip) {
      fulfillmentAddressSource = "shipping";
      fulfillmentAddressText = shipAddr;
    } else {
      const note = q.note?.trim() || "";
      if (!note) {
        return {
          error:
            "ไม่มีที่อยู่ออกบิล / ที่อยู่จัดส่ง ในลูกค้า และไม่มีหมายเหตุในใบ — กรุณาแก้ข้อมูลก่อนยืนยัน",
        };
      }
      fulfillmentAddressSource = "quotation_note";
      fulfillmentAddressText = note;
    }
  } else {
    const note = q.note?.trim() || "";
    if (note) {
      fulfillmentAddressSource = "quotation_note";
      fulfillmentAddressText = note;
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const need = aggregateQtyByProduct(lines);
      for (const [productId, qty] of need) {
        const p = await tx.product.findUnique({ where: { id: productId } });
        if (!p || p.stock < qty) throw new Error("stock");
        await tx.product.update({
          where: { id: productId },
          data: { stock: p.stock - qty },
        });
      }
      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          status: "CONFIRMED",
          fulfillmentAddressSource,
          fulfillmentAddressText,
        },
      });
    });
  } catch {
    return { error: "หักสต็อกไม่สำเร็จ — กรุณาตรวจสอบคงคลังอีกครั้ง" };
  }

  revalidatePath("/quotations/quoted");
  revalidatePath("/quotations/fulfillment");
  revalidatePath(`/quotations/${quotationId}`);
  revalidatePath("/products");
  if (q.customerId) {
    revalidatePath(`/customers/${q.customerId}`);
  }
  return { ok: true };
}

export async function updateFulfillment(
  quotationId: string,
  data: {
    paymentConfirmed: boolean;
    paymentTransactionRef: string;
    shipped: boolean;
    trackingNumber: string;
    /** เมื่อลูกค้ามีทั้งที่อยู่ออกบิลและจัดส่ง ต้องเลือก; กรณีมีอย่างใดอย่างหนึ่งระบบจะตั้งให้อัตโนมัติ */
    dispatchAddressSource?: "billing" | "shipping";
  },
) {
  const q = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { customer: true },
  });
  if (!q || q.status !== "CONFIRMED") {
    return { error: "บันทึกได้เฉพาะใบที่ลูกค้ายืนยันแล้ว" };
  }
  const tracking = data.trackingNumber.trim() || null;
  const payRef = data.paymentTransactionRef.trim();
  if (data.paymentConfirmed && !payRef) {
    return {
      error:
        "กรุณากรอกเลขที่อ้างอิงการโอน / ใบทำธุรกรรม เมื่อยืนยันการชำระเงิน",
    };
  }

  let fulfillmentAddressSource: string | null | undefined = undefined;
  let fulfillmentAddressText: string | null | undefined = undefined;
  const c = q.customer;
  if (c) {
    const bill = c.billingInfo?.trim() || "";
    const shipAddr = c.address?.trim() || "";
    const hasBill = !!bill;
    const hasShip = !!shipAddr;
    if (hasBill && hasShip) {
      const choice = data.dispatchAddressSource;
      if (choice !== "billing" && choice !== "shipping") {
        return { error: "กรุณาเลือกที่อยู่สำหรับจัดส่ง: ที่อยู่ออกบิล หรือ ที่อยู่จัดส่ง" };
      }
      fulfillmentAddressSource = choice;
      fulfillmentAddressText = choice === "billing" ? bill : shipAddr;
    } else if (hasBill) {
      fulfillmentAddressSource = "billing";
      fulfillmentAddressText = bill;
    } else if (hasShip) {
      fulfillmentAddressSource = "shipping";
      fulfillmentAddressText = shipAddr;
    }
  }

  await prisma.quotation.update({
    where: { id: quotationId },
    data: {
      paymentConfirmedAt: data.paymentConfirmed ? q.paymentConfirmedAt ?? new Date() : null,
      paymentTransactionRef: data.paymentConfirmed ? payRef : null,
      shippedAt: data.shipped ? q.shippedAt ?? new Date() : null,
      trackingNumber: data.shipped ? tracking : null,
      ...(fulfillmentAddressSource != null && fulfillmentAddressText != null
        ? {
            fulfillmentAddressSource,
            fulfillmentAddressText,
          }
        : {}),
    },
  });
  revalidatePath("/quotations/fulfillment");
  revalidatePath(`/quotations/${quotationId}`);
  if (q.customerId) {
    revalidatePath(`/customers/${q.customerId}`);
  }
  return { ok: true };
}
