import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AppB2BCustomer, AppOrder, AppProduct } from "./types";
import { mapProduct } from "./map-product";
import { mapQuotationToAppOrder, mapQuotationStatus, isQuotationArchived, appStatusToQuotationPatch } from "./map-quotation";
import {
  mapWebOrderToAppOrder,
  mapWebOrderStatus,
  isWebOrderArchived,
  appStatusToWebOrderPatch,
} from "./map-order";

const quotationInclude = {
  QuotationLine: { include: { Product: true } },
  Customer: true,
} satisfies Prisma.QuotationInclude;

const orderInclude = {
  OrderLine: { include: { Product: true } },
  User: true,
} satisfies Prisma.OrderInclude;

export async function listAppProducts(activeOnly = false): Promise<AppProduct[]> {
  const rows = await prisma.product.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getAppProductById(id: string) {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? mapProduct(row) : null;
}

export async function getAppProductBySlug(slug: string) {
  const products = await listAppProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function listQuotations(where?: Prisma.QuotationWhereInput) {
  const rows = await prisma.quotation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: quotationInclude,
  });
  return rows.map(mapQuotationToAppOrder);
}

export async function listWebOrders(where?: Prisma.OrderWhereInput) {
  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
  return rows.map(mapWebOrderToAppOrder);
}

export async function getAppOrderById(id: string): Promise<AppOrder | null> {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: quotationInclude,
  });
  if (quotation) return mapQuotationToAppOrder(quotation);

  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  if (order) return mapWebOrderToAppOrder(order);

  return null;
}

export async function countQuotationsByMappedStatus(status: string) {
  const all = await prisma.quotation.findMany({
    where: { status: { not: "CANCELLED" } },
    select: {
      status: true,
      paymentConfirmedAt: true,
      shippedAt: true,
    },
  });
  return all.filter((q) => mapQuotationStatus(q) === status).length;
}

export async function countWebOrdersByMappedStatus(status: string) {
  const all = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" } },
    select: {
      status: true,
      paymentSubmittedAt: true,
      paymentSlipPath: true,
    },
  });
  return all.filter((o) => mapWebOrderStatus(o) === status).length;
}

export async function getSidebarCounts() {
  const quotations = await prisma.quotation.findMany({
    where: { status: { not: "CANCELLED" }, shippedAt: null },
    select: { status: true, paymentConfirmedAt: true, shippedAt: true },
  });
  const webOrders = await prisma.order.findMany({
    where: { status: "PENDING" },
    select: {
      status: true,
      paymentSubmittedAt: true,
      paymentSlipPath: true,
    },
  });

  const toShip =
    quotations.filter((q) => mapQuotationStatus(q) === "PAID").length +
    webOrders.filter((o) => mapWebOrderStatus(o) === "WAITING_SHIPMENT").length;

  const unpaid =
    quotations.filter((q) =>
      ["QUOTATION", "CONFIRMED"].includes(mapQuotationStatus(q))
    ).length +
    webOrders.filter((o) => mapWebOrderStatus(o) === "PENDING").length;

  return { toShip, unpaid };
}

export async function listB2BCustomers(): Promise<AppB2BCustomer[]> {
  const rows = await prisma.customer.findMany({
    orderBy: [{ category: "asc" }, { customerCode: "asc" }],
  });
  return rows.map((c) => ({
    id: c.id,
    shopName: `${c.category} · ${c.customerCode}`,
    customerName: c.name ?? c.customerCode,
    phone: extractPhone(c.address) ?? "-",
    email: null,
    address: c.address ?? "",
    taxId: extractTaxId(c.billingInfo),
    notes: [c.orderNote, c.lastPurchaseNote].filter(Boolean).join("\n") || null,
  }));
}

function extractPhone(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/0\d[\d\s-]{7,12}\d/);
  return m ? m[0].replace(/\s/g, "") : null;
}

function extractTaxId(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/\d{13}/);
  return m ? m[0] : null;
}

export async function updateAppOrderStatus(
  id: string,
  status: string,
  opts?: { trackingNumber?: string | null }
) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (quotation) {
    await prisma.quotation.update({
      where: { id },
      data: {
        ...appStatusToQuotationPatch(status, opts?.trackingNumber),
        updatedAt: new Date(),
      },
    });
    return getAppOrderById(id);
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (order) {
    await prisma.order.update({
      where: { id },
      data: {
        ...appStatusToWebOrderPatch(status, opts?.trackingNumber),
        updatedAt: new Date(),
      },
    });
    return getAppOrderById(id);
  }

  return null;
}

export function buildQuotationWhereFromFilter(filter?: string | null): Prisma.QuotationWhereInput {
  if (filter === "UNPAID") {
    return {
      status: { in: ["DRAFT", "QUOTED", "CONFIRMED"] },
      paymentConfirmedAt: null,
      shippedAt: null,
    };
  }
  if (filter === "UNSHIPPED") {
    return {
      status: "CONFIRMED",
      paymentConfirmedAt: { not: null },
      shippedAt: null,
    };
  }
  return {};
}

export function filterAppOrdersByStatus(orders: AppOrder[], status?: string) {
  if (!status) return orders;
  return orders.filter((o) => o.status === status);
}

export function filterArchivedWholesale(orders: AppOrder[]) {
  return orders.filter((o) => o.archived);
}

export function filterArchivedWeb(orders: AppOrder[]) {
  return orders.filter((o) => o.archived);
}

export function searchAppOrders(orders: AppOrder[], q?: string) {
  const query = q?.trim().toLowerCase();
  if (!query) return orders;
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      (o.shopName?.toLowerCase().includes(query) ?? false) ||
      o.phone.includes(query) ||
      o.address.toLowerCase().includes(query)
  );
}

export async function countArchived() {
  const [q, o] = await Promise.all([
    prisma.quotation.count({
      where: { status: "CONFIRMED", shippedAt: { not: null } },
    }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
  ]);
  return { wholesale: q, web: o, total: q + o };
}
