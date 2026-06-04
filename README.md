# PEDLAI — ร้านพริกออนไลน์

เว็บไซต์ E-commerce สำหรับขายพริก พร้อมระบบหลังบ้านจัดการออเดอร์และสต๊อก และรองรับ SEO

## คุณสมบัติ

### หน้าร้าน (Storefront)
- หน้าแรก + สินค้าแนะนำ
- รายการสินค้า แยกหมวด (สด / แห้ง / แปรรูป)
- หน้ารายละเอียดสินค้า + JSON-LD Product schema
- ตะกร้า (localStorage) + ชำระเงิน / สั่งซื้อ
- หน้ายืนยันออเดอร์

### หลังบ้าน (Admin) — `/admin`
- เข้าสู่ระบบด้วยอีเมล/รหัสผ่าน
- แดชบอร์ดสรุปออเดอร์และสต๊อกต่ำ
- จัดการออเดอร์ (เปลี่ยนสถานะ, ยกเลิกคืนสต๊อก)
- จัดการสต๊อก ราคา เปิด/ปิดขาย

### SEO
- Metadata ภาษาไทย + Open Graph
- `sitemap.xml` อัตโนมัติ (รวมสินค้า)
- `robots.txt`
- Schema.org: Organization + Product
- Canonical URLs

## เริ่มใช้งาน

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. ตั้งค่า environment
cp .env.example .env
# แก้ JWT_SECRET และ NEXT_PUBLIC_SITE_URL สำหรับ production

# 3. สร้างฐานข้อมูล + ข้อมูลตัวอย่าง
npm run db:setup

# 4. รัน dev server
npm run dev
```

เปิดเบราว์เซอร์:
- **หน้าร้าน:** http://localhost:3000
- **หลังบ้าน:** http://localhost:3000/admin/login

### บัญชี Admin เริ่มต้น
- อีเมล: `admin@pedlai.com`
- รหัสผ่าน: `admin123`

เปลี่ยนใน `.env` ก่อน `npm run db:setup` หรือแก้ใน seed

## Tech Stack
- **Next.js 15** (App Router)
- **TypeScript** + **Tailwind CSS 4**
- **Prisma** + **PostgreSQL** (Neon)
- **JWT** session สำหรับ admin

## แก้ปัญหาเว็บพัง / Error

ถ้าเจอ `ENOENT .next/...` หรือ `Internal Server Error`:

```bash
# หยุด server เก่าทั้งหมด (Ctrl+C) แล้วรัน:
npm run db:sync
npm run dev:clean
```

เปิด **http://localhost:3000** เท่านั้น (ถ้ามี server หลายตัว อาจไปพอร์ต 3002 แทน)

## Production
1. ตั้ง `NEXT_PUBLIC_SITE_URL` เป็นโดเมนจริง
2. ใช้ `JWT_SECRET` ที่สุ่มยาวและปลอดภัย
3. ตั้ง `DATABASE_URL` และ `DIRECT_URL` ใน Neon (ดู `.env.example`)
4. Deploy บน Vercel / Railway / Docker ได้

```bash
npm run build
npm start
```

## โครงสร้างหลัก

```
src/app/          # หน้าเว็บ + API routes
src/components/   # UI components
src/lib/          # prisma, auth, seo
prisma/           # schema + seed
```

© PEDLAI
