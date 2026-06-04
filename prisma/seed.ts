import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "พริกขี้หนูสด กก.",
    slug: "prik-kee-noo-fresh-kg",
    description:
      "พริกขี้หนูสดคัดเกรด หอมเผ็ดร้อนจัด เก็บเกี่ยวทุกเช้า เหมาะทำน้ำพริก ต้มยำ และยำ",
    price: 120,
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1599909533398-162deed711a4?w=800&q=80",
    category: "fresh",
    heatLevel: 5,
  },
  {
    name: "พริกจาดีแห้ง",
    slug: "prik-jinda-dried",
    description:
      "พริกจาดีแห้งคุณภาพส่งออก แดดลมธรรมชาติ เก็บได้นาน ใช้ทำพริกแกงและน้ำพริก",
    price: 85,
    stock: 80,
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",
    category: "dried",
    heatLevel: 4,
  },
  {
    name: "พริกแห้งเม็ดใหญ่",
    slug: "prik-dried-large",
    description: "พริกแห้งเม็ดใหญ่ สีแดงสด หอมเผ็ดกลมกล่อม เหมาะทอดกรอบและทำซอส",
    price: 95,
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1606914501507-6c933c704aa1?w=800&q=80",
    category: "dried",
    heatLevel: 3,
  },
  {
    name: "น้ำพริก PEDLAI สูตรเด็ด",
    slug: "pedlai-chili-paste",
    description:
      "น้ำพริกสูตรลับ PEDLAI เผ็ดกลมกล่อม หอมกะปิ ไม่ใส่สารกันบูด อร่อยทุกมื้อ",
    price: 65,
    stock: 100,
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80",
    category: "processed",
    heatLevel: 4,
  },
  {
    name: "ซอสพริก PEDLAI",
    slug: "pedlai-chili-sauce",
    description:
      "ซอสพริกเข้มข้น ใช้ได้หลากหลาย ทั้งจิ้ม ผัด และมาริเนด ขวดพลาสติกปลอดภัย",
    price: 89,
    stock: 75,
    image:
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&q=80",
    category: "processed",
    heatLevel: 3,
  },
  {
    name: "พริกหยวกสด",
    slug: "prik-yuak-fresh",
    description: "พริกหยวกสด เนื้อหนา ไม่เผ็ดมาก เหมาะผัดกะเพราและทำยำ",
    price: 45,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80",
    category: "fresh",
    heatLevel: 2,
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@pedlai.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "PEDLAI Admin" },
  });

  await prisma.shopSettings.upsert({
    where: { id: "default" },
    update: {
      shortName: "เผ็ดหลาย",
      nameTh: "เผ็ดหลาย",
      nameEn: "PEDLAI",
    },
    create: {
      id: "default",
      shortName: "เผ็ดหลาย",
      nameTh: "เผ็ดหลาย",
      nameEn: "PEDLAI",
    },
  });

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  await prisma.order.updateMany({
    data: { source: "WEBSITE", stockDeducted: true },
  });

  console.log("Seed complete:", products.length, "products");
  console.log("Admin:", email, "/", password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
