import type { Customer, Product, Quotation, QuotationLine } from "@prisma/client";
import type { AppOrder, AppOrderItem } from "./types";
import { quotationNumber } from "./constants";
import { mapProduct } from "./map-product";

type QuotationWithLines = Quotation & {
  QuotationLine: (QuotationLine & { Product: Product })[];
  Customer: Customer | null;
};

type QuotationSummaryLine = Pick<
  QuotationLine,
  "id" | "productId" | "unitPrice" | "quantity" | "shippingFee"
>;

type QuotationSummary = Quotation & {
  QuotationLine: QuotationSummaryLine[];
  Customer: Customer | null;
};

export function mapQuotationStatus(
  q: Pick<Quotation, "status" | "paymentConfirmedAt" | "shippedAt">
): string {
  if (q.status === "CANCELLED") return "CANCELLED";
  if (q.status === "DRAFT" || q.status === "QUOTED") return "QUOTATION";
  if (q.status === "CONFIRMED") {
    if (q.shippedAt) return "SHIPPED";
    if (q.paymentConfirmedAt) return "PAID";
    return "CONFIRMED";
  }
  return "PENDING";
}

export function isQuotationArchived(q: Quotation): boolean {
  return q.status === "CONFIRMED" && !!q.shippedAt;
}

function quotationShippingFee(
  q: Pick<Quotation, "shippingFee">,
  lines: QuotationSummaryLine[]
) {
  const lineShip = lines.reduce((s, l) => s + l.shippingFee, 0);
  if (lineShip > 0) return Math.round(lineShip);
  return Math.round(q.shippingFee);
}

function quotationTotal(
  q: Pick<Quotation, "shippingFee">,
  lines: QuotationSummaryLine[]
) {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  return Math.round(subtotal + quotationShippingFee(q, lines));
}

export function mapQuotationToAppOrderSummary(q: QuotationSummary): AppOrder {
  const lines = q.QuotationLine;
  const customer = q.Customer;

  return {
    id: q.id,
    orderNumber: quotationNumber(q.number),
    source: "WHOLESALE",
    shopName: customer
      ? `${customer.category} · ${customer.customerCode}`
      : null,
    customerName: q.customerName ?? customer?.name ?? "ลูกค้า",
    phone: q.customerContact ?? extractPhone(customer?.address) ?? "-",
    email: null,
    address:
      q.fulfillmentAddressText ??
      customer?.address ??
      q.note ??
      "-",
    notes: q.note,
    trackingNumber: q.trackingNumber,
    status: mapQuotationStatus(q),
    archived: isQuotationArchived(q),
    total: quotationTotal(q, lines),
    shippingFee: quotationShippingFee(q, lines),
    stockDeducted: q.status === "CONFIRMED",
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    items: [],
    legacyKind: "quotation",
  };
}

export function mapQuotationToAppOrder(q: QuotationWithLines): AppOrder {
  const lines = q.QuotationLine;
  const total = quotationTotal(q, lines);
  const customer = q.Customer;

  const items: AppOrderItem[] = lines.map((l) => ({
    id: l.id,
    productId: l.productId,
    productName: l.Product.name,
    productSlug: mapProduct(l.Product).slug,
    quantity: l.quantity,
    priceAtOrder: Math.round(l.unitPrice),
    lineShipping: Math.round(l.shippingFee),
  }));

  return {
    id: q.id,
    orderNumber: quotationNumber(q.number),
    source: "WHOLESALE",
    shopName: customer
      ? `${customer.category} · ${customer.customerCode}`
      : null,
    customerName: q.customerName ?? customer?.name ?? "ลูกค้า",
    phone: q.customerContact ?? extractPhone(customer?.address) ?? "-",
    email: null,
    address:
      q.fulfillmentAddressText ??
      customer?.address ??
      q.note ??
      "-",
    notes: q.note,
    trackingNumber: q.trackingNumber,
    status: mapQuotationStatus(q),
    archived: isQuotationArchived(q),
    total,
    shippingFee: quotationShippingFee(q, lines),
    stockDeducted: q.status === "CONFIRMED",
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    items,
    legacyKind: "quotation",
  };
}

function extractPhone(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/0\d[\d\s-]{7,12}\d/);
  return m ? m[0].replace(/\s/g, "") : null;
}

function encodeQuotationPaymentRef(
  reference: string,
  slipPath?: string | null
) {
  const ref = reference.trim();
  const slip = slipPath?.trim();
  if (ref && slip) return JSON.stringify({ ref, slip });
  return ref || slip || null;
}

/** แปลงสถานะจาก UI กลับเป็นฟิลด์ Quotation */
export function appStatusToQuotationPatch(
  status: string,
  trackingNumber?: string | null,
  paymentSlipPath?: string | null,
  paymentReference?: string | null
): Partial<Quotation> {
  const now = new Date();
  switch (status) {
    case "QUOTATION":
      return { status: "QUOTED" };
    case "CONFIRMED":
      return { status: "CONFIRMED" };
    case "PAID":
    case "WAITING_SHIPMENT":
      return {
        status: "CONFIRMED",
        paymentConfirmedAt: now,
        ...(paymentReference?.trim() || paymentSlipPath
          ? {
              paymentTransactionRef: encodeQuotationPaymentRef(
                paymentReference ?? "",
                paymentSlipPath
              ),
            }
          : {}),
      };
    case "SHIPPED":
    case "DELIVERED":
      return {
        status: "CONFIRMED",
        paymentConfirmedAt: now,
        shippedAt: now,
        ...(trackingNumber ? { trackingNumber } : {}),
      };
    case "CANCELLED":
      return { status: "CANCELLED" };
    default:
      return { status: "QUOTED" };
  }
}
