import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listAppProducts, listB2BCustomers } from "@/lib/legacy";
import { CreateWholesaleOrderForm } from "@/components/admin/CreateWholesaleOrderForm";

export default async function NewWholesaleOrderPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const appProducts = await listAppProducts(true);
  const products = appProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
  }));

  const customers = await listB2BCustomers();

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
