"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createCustomer(data: {
  category: string;
  customerCode: string;
  name: string;
  address: string;
}) {
  const category = data.category.trim();
  const customerCode = data.customerCode.trim();

  if (!category || !customerCode) {
    return { error: "กรุณากรอกกลุ่มและรหัสลูกค้า" } as const;
  }

  try {
    const created = await prisma.customer.create({
      data: {
        category,
        customerCode,
        name: data.name.trim() || null,
        address: data.address.trim() || null,
      },
      select: { id: true },
    });

    revalidatePath("/customers");
    return { ok: true, id: created.id } as const;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "มีลูกค้ากลุ่มและรหัสนี้อยู่แล้ว" } as const;
    }
    return { error: "บันทึกลูกค้าไม่สำเร็จ" } as const;
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name: string;
    address: string;
    orderNote: string;
    lastPurchaseNote: string;
    billingInfo: string;
  },
) {
  const c = await prisma.customer.findUnique({ where: { id } });
  if (!c) {
    return { error: "ไม่พบลูกค้า" };
  }

  await prisma.customer.update({
    where: { id },
    data: {
      name: data.name.trim() || null,
      address: data.address.trim() || null,
      orderNote: data.orderNote.trim() || null,
      lastPurchaseNote: data.lastPurchaseNote.trim() || null,
      billingInfo: data.billingInfo.trim() || null,
    },
  });

  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");
  return { ok: true };
}
