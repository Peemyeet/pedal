"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const productionNotes = String(formData.get("productionNotes") ?? "").trim() || null;
  const stock = Number(formData.get("stock"));
  if (!name || Number.isNaN(stock) || stock < 0) {
    return;
  }
  if (sku) {
    const taken = await prisma.product.findUnique({ where: { sku } });
    if (taken) return;
  }
  await prisma.product.create({
    data: {
      name,
      sku,
      description,
      productionNotes,
      price: 0,
      stock,
    },
  });
  revalidatePath("/products");
  revalidatePath("/sales/new");
}

export async function updateProductProduction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;
  const productionNotes = String(formData.get("productionNotes") ?? "").trim() || null;
  if (!id) return;
  await prisma.product.update({
    where: { id },
    data: { description, productionNotes },
  });
  revalidatePath("/products");
  revalidatePath("/sales/new");
}

export async function toggleProductActive(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "1";
  if (!id) return;
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/products");
  revalidatePath("/sales/new");
}

export async function updateProductStock(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const stock = Number(formData.get("stock"));
  if (!id || Number.isNaN(stock) || stock < 0) return;
  await prisma.product.update({ where: { id }, data: { stock } });
  revalidatePath("/products");
  revalidatePath("/sales/new");
}
