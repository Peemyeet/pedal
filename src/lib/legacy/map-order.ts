import type { Order, OrderLine, Product, User } from "@prisma/client";
import type { AppOrder, AppOrderItem } from "./types";
import { webOrderNumber } from "./constants";
import { mapProduct } from "./map-product";

type OrderWithLines = Order & {
  OrderLine: (OrderLine & { Product: Product })[];
  User: User;
};

export function mapWebOrderStatus(
  o: Pick<Order, "status" | "paymentSubmittedAt" | "paymentSlipPath">
): string {
  if (o.status === "CANCELLED") return "CANCELLED";
  if (o.status === "COMPLETED") return "DELIVERED";
  if (o.paymentSubmittedAt || o.paymentSlipPath) return "WAITING_SHIPMENT";
  return "PENDING";
}

export function isWebOrderArchived(o: Order): boolean {
  return o.status === "COMPLETED";
}

export function mapWebOrderToAppOrderSummary(
  o: Order & { User: Pick<User, "name" | "email"> }
): AppOrder {
  return {
    id: o.id,
    orderNumber: webOrderNumber(o.number),
    source: "WEBSITE",
    shopName: null,
    customerName: o.shippingName ?? o.User.name,
    phone: o.shippingPhone ?? "-",
    email: o.User.email,
    address: o.shippingAddress ?? "-",
    notes: o.paymentNote,
    trackingNumber: o.trackingNumber,
    status: mapWebOrderStatus(o),
    archived: isWebOrderArchived(o),
    total: Math.round(o.grandTotal),
    shippingFee: Math.round(o.shippingTotal),
    stockDeducted: o.status !== "CANCELLED",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items: [],
    legacyKind: "order",
  };
}

export function mapWebOrderToAppOrder(o: OrderWithLines): AppOrder {
  const items: AppOrderItem[] = o.OrderLine.map((l) => ({
    id: l.id,
    productId: l.productId,
    productName: l.Product.name,
    productSlug: mapProduct(l.Product).slug,
    quantity: l.quantity,
    priceAtOrder: Math.round(l.unitPrice),
  }));

  return {
    id: o.id,
    orderNumber: webOrderNumber(o.number),
    source: "WEBSITE",
    shopName: null,
    customerName: o.shippingName ?? o.User.name,
    phone: o.shippingPhone ?? "-",
    email: o.User.email,
    address: o.shippingAddress ?? "-",
    notes: o.paymentNote,
    trackingNumber: o.trackingNumber,
    status: mapWebOrderStatus(o),
    archived: isWebOrderArchived(o),
    total: Math.round(o.grandTotal),
    shippingFee: Math.round(o.shippingTotal),
    stockDeducted: o.status !== "CANCELLED",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items,
    legacyKind: "order",
  };
}

export function appStatusToWebOrderPatch(
  status: string,
  trackingNumber?: string | null
): Partial<Order> {
  switch (status) {
    case "WAITING_SHIPMENT":
      return { paymentSubmittedAt: new Date() };
    case "SHIPPED":
      return {
        status: "PENDING",
        trackingNumber: trackingNumber ?? undefined,
      };
    case "DELIVERED":
      return { status: "COMPLETED", trackingNumber: trackingNumber ?? undefined };
    case "CANCELLED":
      return { status: "CANCELLED" };
    default:
      return { status: "PENDING" };
  }
}
