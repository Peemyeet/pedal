"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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
