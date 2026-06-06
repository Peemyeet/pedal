import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAppOrderById } from "@/lib/legacy";
import {
  buildOrderDocumentHtml,
  type OrderDocumentType,
} from "@/lib/order-document-html";
import { getShopSettings } from "@/lib/shop-settings";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type");
  const type: OrderDocumentType =
    typeParam === "quotation" ? "quotation" : "receipt";

  const order = await getAppOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  }

  try {
    const html = buildOrderDocumentHtml(
      {
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
        shippingFee: order.shippingFee,
        createdAt: order.createdAt.toISOString(),
        shopSettings: await getShopSettings(),
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          priceAtOrder: item.priceAtOrder,
          lineShipping: item.lineShipping,
        })),
      },
      type
    );

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("[document]", error);
    return NextResponse.json(
      { error: "สร้างเอกสารไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
