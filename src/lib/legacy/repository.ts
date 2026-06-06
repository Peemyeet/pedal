import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AppB2BCustomer, AppOrder, AppProduct } from "./types";
import { mapProduct } from "./map-product";
import { productSlug } from "./constants";
import {
  mapQuotationToAppOrder,
  mapQuotationToAppOrderSummary,
  mapQuotationStatus,
  appStatusToQuotationPatch,
} from "./map-quotation";
import {
  mapWebOrderToAppOrder,
  mapWebOrderToAppOrderSummary,
  mapWebOrderStatus,
  appStatusToWebOrderPatch,
} from "./map-order";
const quotationInclude = {
  QuotationLine: { include: { Product: true } },
  Customer: true,
} satisfies Prisma.QuotationInclude;

const quotationListInclude = {
  QuotationLine: {
    select: {
      id: true,
      productId: true,
      unitPrice: true,
      quantity: true,
      shippingFee: true,
    },
  },
  Customer: true,
} satisfies Prisma.QuotationInclude;

const orderInclude = {
  OrderLine: { include: { Product: true } },
  User: true,
} satisfies Prisma.OrderInclude;

const orderListInclude = {
  User: { select: { name: true, email: true } },
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
  const normalized = slug.toLowerCase();

  if (normalized.startsWith("sku-")) {
    const row = await prisma.product.findFirst({
      where: { id: { startsWith: normalized.slice(4) } },
    });
    return row ? mapProduct(row) : null;
  }

  const candidates = await prisma.product.findMany({
    where: {
      sku: { not: null },
      OR: [
        { sku: { equals: slug, mode: "insensitive" } },
        { sku: { equals: slug.replace(/-/g, " "), mode: "insensitive" } },
      ],
    },
  });
  const row = candidates.find((p) => productSlug(p.sku, p.id) === normalized);
  return row ? mapProduct(row) : null;
}

export async function listQuotations(where?: Prisma.QuotationWhereInput) {
  const rows = await prisma.quotation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: quotationListInclude,
  });
  return rows.map(mapQuotationToAppOrderSummary);
}

export async function listWebOrders(where?: Prisma.OrderWhereInput) {
  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: orderListInclude,
  });
  return rows.map(mapWebOrderToAppOrderSummary);
}

export function buildWebOrderListWhere(opts: {
  filter?: string | null;
  status?: string | null;
}): Prisma.OrderWhereInput {
  if (opts.status === "CANCELLED") return { status: "CANCELLED" };
  if (opts.status === "DELIVERED") return { status: "COMPLETED" };

  if (opts.filter === "PROCESSING") {
    return { status: "PENDING" };
  }
  if (opts.filter === "UNSHIPPED") {
    return {
      status: "PENDING",
      OR: [
        { paymentSubmittedAt: { not: null } },
        { paymentSlipPath: { not: null } },
      ],
    };
  }
  if (opts.status === "PENDING") {
    return {
      status: "PENDING",
      paymentSubmittedAt: null,
      paymentSlipPath: null,
    };
  }
  if (opts.status === "SHIPPED") {
    return {
      status: "PENDING",
      trackingNumber: { not: null },
    };
  }
  if (opts.status === "CONFIRMED" || opts.status === "WAITING_SHIPMENT") {
    return {
      status: "PENDING",
      OR: [
        { paymentSubmittedAt: { not: null } },
        { paymentSlipPath: { not: null } },
      ],
    };
  }

  return { status: { notIn: ["CANCELLED", "COMPLETED"] } };
}

export async function getAppOrderByNumber(orderNumber: string): Promise<AppOrder | null> {
  if (orderNumber.startsWith("QT")) {
    const num = Number.parseInt(orderNumber.slice(2), 10);
    if (Number.isNaN(num)) return null;
    const row = await prisma.quotation.findFirst({
      where: { number: num },
      include: quotationInclude,
    });
    return row ? mapQuotationToAppOrder(row) : null;
  }

  if (orderNumber.startsWith("PD")) {
    const num = Number.parseInt(orderNumber.slice(2), 10);
    if (Number.isNaN(num)) return null;
    const row = await prisma.order.findFirst({
      where: { number: num },
      include: orderInclude,
    });
    return row ? mapWebOrderToAppOrder(row) : null;
  }

  return null;
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

type SidebarCountRow = {
  q_to_ship: number;
  q_unpaid_quoted: number;
  q_unpaid_confirmed: number;
  w_to_ship: number;
  w_unpaid: number;
};

export async function getSidebarCounts() {
  const [row] = await prisma.$queryRaw<SidebarCountRow[]>`
    SELECT
      (SELECT COUNT(*)::int FROM "Quotation"
        WHERE status = 'CONFIRMED'
          AND "paymentConfirmedAt" IS NOT NULL
          AND "shippedAt" IS NULL) AS q_to_ship,
      (SELECT COUNT(*)::int FROM "Quotation"
        WHERE status IN ('DRAFT', 'QUOTED')
          AND "shippedAt" IS NULL) AS q_unpaid_quoted,
      (SELECT COUNT(*)::int FROM "Quotation"
        WHERE status = 'CONFIRMED'
          AND "paymentConfirmedAt" IS NULL
          AND "shippedAt" IS NULL) AS q_unpaid_confirmed,
      (SELECT COUNT(*)::int FROM "Order"
        WHERE status = 'PENDING'
          AND ("paymentSubmittedAt" IS NOT NULL OR "paymentSlipPath" IS NOT NULL)) AS w_to_ship,
      (SELECT COUNT(*)::int FROM "Order"
        WHERE status = 'PENDING'
          AND "paymentSubmittedAt" IS NULL
          AND "paymentSlipPath" IS NULL) AS w_unpaid
  `;

  return {
    toShip: row.q_to_ship + row.w_to_ship,
    unpaid: row.q_unpaid_quoted + row.q_unpaid_confirmed + row.w_unpaid,
  };
}

export async function getUnpaidSummaryCounts() {
  const [webCount, wholesaleCount] = await Promise.all([
    prisma.order.count({
      where: {
        status: "PENDING",
        paymentSubmittedAt: null,
        paymentSlipPath: null,
      },
    }),
    prisma.quotation.count({
      where: {
        status: "CONFIRMED",
        paymentConfirmedAt: null,
        shippedAt: null,
      },
    }),
  ]);

  return { webCount, wholesaleCount };
}

export async function getToShipSummaryCounts() {
  const [webCount, wholesaleCount] = await Promise.all([
    prisma.order.count({
      where: {
        status: "PENDING",
        OR: [
          { paymentSubmittedAt: { not: null } },
          { paymentSlipPath: { not: null } },
        ],
      },
    }),
    prisma.quotation.count({
      where: {
        status: "CONFIRMED",
        paymentConfirmedAt: { not: null },
        shippedAt: null,
      },
    }),
  ]);

  return { webCount, wholesaleCount };
}

export async function getActiveOrderCounts() {
  const [webActive, wholesaleActive] = await Promise.all([
    prisma.order.count({ where: { status: { not: "COMPLETED" } } }),
    prisma.quotation.count({
      where: {
        OR: [{ status: { not: "CONFIRMED" } }, { shippedAt: null }],
      },
    }),
  ]);

  return { webActive, wholesaleActive, total: webActive + wholesaleActive };
}

export async function getProductSummary() {
  const [total, lowStock] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, stock: { lte: 10 } } }),
  ]);

  return { total, lowStock };
}

export async function getWebOrderTabCounts() {
  const [allCount, unshippedCount, pendingCount, shippedCount, deliveredCount, cancelledCount] =
    await Promise.all([
      prisma.order.count({ where: { status: { not: "COMPLETED" } } }),
      prisma.order.count({
        where: {
          status: "PENDING",
          OR: [
            { paymentSubmittedAt: { not: null } },
            { paymentSlipPath: { not: null } },
          ],
        },
      }),
      prisma.order.count({
        where: {
          status: "PENDING",
          paymentSubmittedAt: null,
          paymentSlipPath: null,
        },
      }),
      prisma.order.count({
        where: {
          status: "PENDING",
          trackingNumber: { not: null },
        },
      }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
    ]);

  const processingCount = pendingCount + unshippedCount;

  const statusCounts: Record<string, number> = {
    PENDING: pendingCount,
    CONFIRMED: processingCount,
    SHIPPED: shippedCount,
    DELIVERED: deliveredCount,
    CANCELLED: cancelledCount,
  };

  return { allCount, processingCount, unshippedCount, statusCounts };
}

export async function getWholesaleTabCounts() {
  const [allCount, quotationCount, confirmedCount, paidCount, shippedCount] =
    await Promise.all([
      prisma.quotation.count({
        where: { status: { not: "CANCELLED" }, shippedAt: null },
      }),
      prisma.quotation.count({
        where: {
          status: { in: ["DRAFT", "QUOTED"] },
          shippedAt: null,
        },
      }),
      prisma.quotation.count({
        where: {
          status: "CONFIRMED",
          paymentConfirmedAt: null,
          shippedAt: null,
        },
      }),
      prisma.quotation.count({
        where: {
          status: "CONFIRMED",
          paymentConfirmedAt: { not: null },
          shippedAt: null,
        },
      }),
      prisma.quotation.count({
        where: {
          status: "CONFIRMED",
          shippedAt: { not: null },
        },
      }),
    ]);

  const statusCounts: Record<string, number> = {
    QUOTATION: quotationCount,
    CONFIRMED: confirmedCount,
    PAID: paidCount,
    SHIPPED: shippedCount,
  };

  return {
    allCount,
    unpaidCount: confirmedCount,
    unshippedCount: paidCount,
    statusCounts,
  };
}

export async function listRecentAppOrders(limit = 8): Promise<AppOrder[]> {
  const [webRows, quotationRows] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "COMPLETED" } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: orderListInclude,
    }),
    prisma.quotation.findMany({
      where: {
        OR: [{ status: { not: "CONFIRMED" } }, { shippedAt: null }],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: quotationListInclude,
    }),
  ]);

  return [
    ...webRows.map(mapWebOrderToAppOrderSummary),
    ...quotationRows.map(mapQuotationToAppOrderSummary),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
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
      status: "CONFIRMED",
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
