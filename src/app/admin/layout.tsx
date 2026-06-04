import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAdminSidebarOrderCounts } from "@/lib/admin-order-counts";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "ระบบหลังบ้าน",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  if (!admin) {
    return <>{children}</>;
  }

  const orderCounts = await getAdminSidebarOrderCounts();

  return (
    <AdminShell email={admin.email} name={admin.name} orderCounts={orderCounts}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </AdminShell>
  );
}
