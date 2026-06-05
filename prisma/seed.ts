import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  console.log("Shop settings ready (เผ็ดหลาย)");
  console.log("Using existing Neon data — products, quotations, customers unchanged.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
