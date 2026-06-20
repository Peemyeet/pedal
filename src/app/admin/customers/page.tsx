import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listB2BCustomers } from "@/lib/legacy";
import { B2BCustomerManager } from "@/components/admin/B2BCustomerManager";
import { AdminPageLoader } from "@/components/admin/AdminPageLoader";

async function CustomersPanel() {
  const customers = await listB2BCustomers();
  return <B2BCustomerManager initialCustomers={customers} />;
}

export default async function AdminCustomersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">ลูกค้า B2B</h1>
      <p className="text-stone-600">จัดการข้อมูลลูกค้า B2B — เพิ่ม แก้ไข หรือลบได้จากหน้านี้</p>
      <div className="mt-6">
        <Suspense fallback={<AdminPageLoader />}>
          <CustomersPanel />
        </Suspense>
      </div>
    </div>
  );
}
