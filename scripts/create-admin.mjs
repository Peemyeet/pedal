/**
 * สร้าง/อัปเดตบัญชีแอดมิน (UserRole.ADMIN)
 * ต้องตั้ง ADMIN_USERNAME (หรือค่าเริ่มต้น pedlai), ADMIN_PASSWORD ใน .env
 * รัน: npm run db:create-admin
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const envPath = resolve(__dirname, "../.env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n#]*)"?$/i);
    if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const prisma = new PrismaClient();

const username = (process.env.ADMIN_USERNAME || "pedlai").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = (process.env.ADMIN_NAME || "Admin").trim();
const email = process.env.ADMIN_EMAIL?.trim() || null;

if (!password) {
  console.error("Set ADMIN_PASSWORD in .env (and optionally ADMIN_USERNAME)");
  process.exit(1);
}
if (password.length < 8) {
  console.error("ADMIN_PASSWORD should be at least 8 characters");
  process.exit(1);
}

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { username },
    create: {
      username,
      email,
      name,
      password: passwordHash,
      role: "ADMIN",
    },
    update: { name, email, password: passwordHash, role: "ADMIN" },
  });
  console.log("OK — admin user:", user.username, user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
