import { prisma } from "@/lib/prisma";
import { NewQuotationForm } from "./NewQuotationForm";

export default async function NewSalePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ sku: "asc" }, { name: "asc" }],
    select: { id: true, name: true, price: true, sku: true, stock: true },
  });

  const customers = await prisma.customer.findMany({
    orderBy: [{ category: "asc" }, { customerCode: "asc" }],
    select: {
      id: true,
      category: true,
      customerCode: true,
      name: true,
      address: true,
      orderNote: true,
      lastPurchaseNote: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-title">สร้างใบเสนอราคา</h1>
        <p className="app-page-lead">
          เลือกลูกค้าจากฐานข้อมูล — กำหนดสินค้า จำนวน และค่าส่งแยกต่อแต่ละรายการ จากนั้นกดดูสรุปก่อนยืนยันส่งใบ
          ใบจะไปแสดงที่เมนู <strong className="font-semibold text-[var(--foreground)]">เสนอราคาแล้ว</strong>
        </p>
      </div>
      <NewQuotationForm products={products} customers={customers} />
    </div>
  );
}
