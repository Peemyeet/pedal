import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getShopSettings } from "@/lib/shop-settings";
import { ShopSettingsForm } from "@/components/admin/ShopSettingsForm";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const settings = await getShopSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold">ตั้งค่าร้าน</h1>
      <p className="text-stone-600">ข้อมูลที่ใช้บนใบเสนอราคา ใบเสร็จ และใบจัดส่ง</p>
      <div className="mt-6">
        <ShopSettingsForm initial={settings} />
      </div>
    </div>
  );
}
