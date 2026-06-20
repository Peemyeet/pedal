import type { Product } from "@prisma/client";
import type { AppProduct } from "./types";
import { DEFAULT_PRODUCT_IMAGE, productSlug } from "./constants";

export function mapProduct(p: Product): AppProduct {
  return {
    id: p.id,
    name: p.name,
    slug: productSlug(p.sku, p.id),
    description: p.description ?? p.productionNotes ?? "",
    price: Math.round(p.price),
    stock: p.stock,
    image: p.imageUrl ?? DEFAULT_PRODUCT_IMAGE,
    category: "processed",
    heatLevel: 3,
    isActive: p.active,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    sku: p.sku,
  };
}
