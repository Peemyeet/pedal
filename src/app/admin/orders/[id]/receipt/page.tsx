import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAppOrderById } from "@/lib/legacy";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string }>;
};

export default async function AdminOrderReceiptPage({ params }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const order = await getAppOrderById(id);
  if (!order) notFound();

  redirect(`/api/admin/orders/${id}/document?type=receipt`);
}
