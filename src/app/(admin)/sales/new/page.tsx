import { prisma } from "@/lib/prisma";
import { NewQuotationForm } from "./NewQuotationForm";

export const dynamic = "force-dynamic";

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
      </div>
      <NewQuotationForm products={products} customers={customers} />
    </div>
  );
}
