import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAppOrderById } from "@/lib/legacy";
import { getShopSettings } from "@/lib/shop-settings";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getAppOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    source: order.source,
    shopName: order.shopName,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    address: order.address,
    notes: order.notes,
    total: order.total,
    createdAt: order.createdAt,
    shopSettings: await getShopSettings(),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      priceAtOrder: item.priceAtOrder,
      lineShipping: item.lineShipping,
    })),
  });
}
