/** รูปแบบออเดอร์ที่ UI ชุดใหม่ใช้ — map จาก Order / Quotation ของระบบเก่า */
export type AppOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  quantity: number;
  priceAtOrder: number;
};

export type AppOrder = {
  id: string;
  orderNumber: string;
  source: "WEBSITE" | "WHOLESALE";
  shopName: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  notes: string | null;
  trackingNumber: string | null;
  status: string;
  archived: boolean;
  total: number;
  stockDeducted: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: AppOrderItem[];
  /** ชนิดข้อมูลจริงในฐานข้อมูลเก่า */
  legacyKind: "order" | "quotation";
};

export type AppProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  heatLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sku: string | null;
};

export type AppB2BCustomer = {
  id: string;
  shopName: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  taxId: string | null;
  notes: string | null;
};
