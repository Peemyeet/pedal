/** เมนูหลัก (แถบนำทาง) */
export const MAIN_NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/sales/new", label: "สร้างใบเสนอราคา" },
  { href: "/quotations/quoted", label: "เสนอราคาแล้ว" },
  { href: "/quotations/fulfillment", label: "ยืนยันแล้ว · ชำระเงินและส่งของ" },
] as const;

/** ลิงก์ภายใต้ไอคอนตั้งค่า (เฟือง) */
export const SETTINGS_NAV_LINKS = [
  { href: "/customers", label: "ลูกค้า" },
  { href: "/products", label: "คลังสินค้า" },
] as const;
