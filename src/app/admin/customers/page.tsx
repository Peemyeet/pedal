import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { B2BCustomerManager } from "@/components/admin/B2BCustomerManager";

export default async function AdminCustomersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const customers = await prisma.b2BCustomer.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ลูกค้า B2B</h1>
          <p className="text-stone-600">เก็บข้อมูลร้านค้าเพื่อสร้างใบเสนอราคาได้เร็วขึ้น</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          + สร้างใบเสนอราคา
        </Link>
      </div>
      <div className="mt-6">
        <B2BCustomerManager initialCustomers={customers} />
      </div>
    </div>
  );
}
