import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listB2BCustomers } from "@/lib/legacy";
import { B2BCustomerManager } from "@/components/admin/B2BCustomerManager";

export default async function AdminCustomersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const customers = await listB2BCustomers();

  return (
    <div>
      <h1 className="text-2xl font-bold">ลูกค้า B2B</h1>
      <p className="text-stone-600">
        ข้อมูลลูกค้าจากระบบเดิม ({customers.length} ราย) — แก้ไขผ่านระบบเก่าหรือเพิ่มในนี้ได้
      </p>
      <div className="mt-6">
        <B2BCustomerManager initialCustomers={customers} />
      </div>
    </div>
  );
}
