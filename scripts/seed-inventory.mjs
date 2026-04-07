/**
 * ซิงก์คลังสินค้า (รหัส + จำนวนตามไวท์บอร์ด)
 * รัน: npm run db:seed-inventory
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** ราคาในระบบ 0 — กำหนดราคาตอนสร้างใบเสนอราคา */
const ROWS = [
  { sku: "11", name: "แดงเผ็ดจัด", stock: 30 },
  { sku: "12", name: "ดำเผ็ดจัด", stock: 76 },
  { sku: "13", name: "ดำเผ็ดสมุนไพร", stock: 8 },
  { sku: "21", name: "แดงมาตรฐาน", stock: 117 },
  { sku: "22", name: "ดำมาตรฐาน", stock: 152 },
  { sku: "23", name: "ดำมาตรฐานสมุนไพร", stock: 28 },
];

async function main() {
  for (const r of ROWS) {
    await prisma.product.upsert({
      where: { sku: r.sku },
      create: {
        sku: r.sku,
        name: r.name,
        stock: r.stock,
        price: 0,
        active: true,
      },
      update: {
        name: r.name,
        stock: r.stock,
      },
    });
    console.log(`OK ${r.sku} ${r.name} → คงเหลือ ${r.stock}`);
  }
  console.log("เสร็จสิ้น:", ROWS.length, "รายการ");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
