/** เมนูหลัก แอดมิน / งานหลังบ้าน */
export const MAIN_NAV_LINKS = [
  { href: "/sales/new", label: "สร้างใบเสนอราคา" },
  { href: "/quotations/quoted", label: "ยืนยันคำสั่งซื้อ" },
  { href: "/quotations/unpaid", label: "ยังไม่ได้ชำระเงิน" },
  { href: "/quotations/fulfillment", label: "ชำระเงินและส่งของ" },
  { href: "/orders", label: "ออเดอร์เว็บ" },
] as const;

/** ลิงก์ภายใต้ไอคอนตั้งค่า (เฟือง) */
export const SETTINGS_NAV_LINKS = [
  { href: "/customers", label: "ลูกค้า" },
  { href: "/products", label: "คลังสินค้า" },
] as const;
