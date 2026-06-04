import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateWholesaleOrderForm } from "@/components/admin/CreateWholesaleOrderForm";

export default async function NewWholesaleOrderPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, stock: true },
  });

  const customers = await prisma.b2BCustomer.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      shopName: true,
      customerName: true,
      phone: true,
      email: true,
      address: true,
      taxId: true,
      notes: true,
    },
  });

  return (
    <div>
      <Link
        href="/admin/orders/wholesale"
        className="text-sm text-red-600 hover:underline"
      >
        ← กลับรายการร้านค้า
      </Link>
      <h1 className="mt-4 text-2xl font-bold">สร้างใบเสนอราคา / ออเดอร์ร้านค้า</h1>
      <p className="mt-1 text-stone-600">
        กำหนดราคาพิเศษให้ร้านอาหารหรือลูกค้าประจำ
      </p>

      <div className="mt-8">
        <CreateWholesaleOrderForm products={products} customers={customers} />
      </div>
    </div>
  );
}
