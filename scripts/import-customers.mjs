/**
 * นำเข้าลูกค้าจากไฟล์ Excel (ชีต ทั่วไป, เสาวรีย์)
 * ใช้: node scripts/import-customers.mjs [path-to.xlsx]
 * หรือตั้ง CUSTOMER_XLSX ใน .env
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const k = m[1];
    let v = m[2].replace(/^["']|["']$/g, "");
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv();

const DEFAULT_XLSX = "/Users/p./Desktop/ลูกค้าพริกป่น.xlsx";

function cellStr(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

async function main() {
  const argPath = process.argv[2];
  const xlsxPath =
    argPath || process.env.CUSTOMER_XLSX || process.env.CUSTOMER_XLSX_PATH || DEFAULT_XLSX;

  if (!fs.existsSync(xlsxPath)) {
    console.error("ไม่พบไฟล์:", xlsxPath);
    console.error("ระบุ path: node scripts/import-customers.mjs /path/to/file.xlsx");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const wb = XLSX.readFile(xlsxPath);

  const catGeneral = "ทั่วไป";
  const catSaw = "เสาวรีย์";

  let generalCount = 0;

  // --- ชีต ทั่วไป: คอลัมน์ B = ข้อความลูกค้า/ที่อยู่, C = หมายเหตุการซื้อ ---
  const shGeneral = wb.Sheets[catGeneral];
  if (!shGeneral) {
    console.warn('ไม่พบชีต "ทั่วไป" — ข้าม');
  } else {
    const rows = XLSX.utils.sheet_to_json(shGeneral, { header: 1, defval: null, raw: false });
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const block = cellStr(row?.[1]);
      const lastPurchase = cellStr(row?.[2]);
      if (!block) continue;
      generalCount += 1;
      // ใช้เลขแถวในไฟล์เป็นส่วนหนึ่งของรหัส เพื่อให้ import ซ้ำได้คงที่
      const customerCode = `TG${String(i).padStart(3, "0")}`;
      const lines = block.split(/\r?\n/);
      const name = lines[0]?.trim() || null;

      await prisma.customer.upsert({
        where: {
          category_customerCode: { category: catGeneral, customerCode },
        },
        create: {
          category: catGeneral,
          customerCode,
          name,
          address: block,
          orderNote: null,
          lastPurchaseNote: lastPurchase,
          billingInfo: null,
        },
        update: {
          name,
          address: block,
          lastPurchaseNote: lastPurchase,
        },
      });
    }
    console.log(`ทั่วไป: นำเข้า/อัปเดต ${generalCount} แถว (มีข้อมูลคอลัมน์ B)`);
  }

  // --- ชีต เสาวรีย์ ---
  const shSaw = wb.Sheets[catSaw];
  if (!shSaw) {
    console.warn('ไม่พบชีต "เสาวรีย์" — ข้าม');
  } else {
    const rows = XLSX.utils.sheet_to_json(shSaw, { header: 1, defval: null, raw: false });
    let n = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const code = cellStr(row?.[0]);
      if (!code) continue;
      const name = cellStr(row?.[1]);
      const address = cellStr(row?.[2]);
      const orderNote = cellStr(row?.[3]);
      const lastPurchase = cellStr(row?.[4]);
      const billing = cellStr(row?.[5]);

      await prisma.customer.upsert({
        where: {
          category_customerCode: { category: catSaw, customerCode: code },
        },
        create: {
          category: catSaw,
          customerCode: code,
          name,
          address,
          orderNote,
          lastPurchaseNote: lastPurchase,
          billingInfo: billing,
        },
        update: {
          name,
          address,
          orderNote,
          lastPurchaseNote: lastPurchase,
          billingInfo: billing,
        },
      });
      n += 1;
    }
    console.log(`เสาวรีย์: นำเข้า/อัปเดต ${n} แถว`);
  }

  await prisma.$disconnect();
  console.log("เสร็จสิ้น:", xlsxPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
