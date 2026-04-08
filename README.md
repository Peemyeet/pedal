# pedal

ระบบขาย · คลังสินค้า · ใบเสนอราคา (Next.js + Prisma)

## รันในเครื่อง

ต้องมี **PostgreSQL** (เช่น [Neon](https://neon.tech) ฟรี, Docker, หรือ Postgres ในเครื่อง) แล้วใส่ connection string ใน `DATABASE_URL`

```bash
cp .env.example .env
# แก้ .env ให้ DATABASE_URL ชี้ไปที่ Postgres จริง
npm install
npx prisma db push
npm run dev
```

## ทำไม GitHub Pages ถึงขึ้น 404 / ไม่ใช่ตัวแอป

GitHub Pages โฮสต์ได้แค่ **ไฟล์คงที่** (HTML/CSS/JS) ไม่ใช่เซิร์ฟเวอร์ Node.js

โปรเจกต์นี้ต้องรัน **Next.js + Prisma** บนเซิร์ฟเวอร์ จึงไม่สามารถ deploy แอปจริงขึ้น GitHub Pages ได้โดยตรง

- ถ้าเปิด **GitHub Pages** แล้วอยากให้มีหน้าแนะนำแทน 404: ตั้งค่าให้โหลดจากโฟลเดอร์ **`/docs`** (มี `docs/index.html` อยู่แล้ว)
- ถ้าต้องการให้ **แอปใช้งานจริงบนอินเทอร์เน็ต** แนะนำ [Vercel](https://vercel.com) หรือบริการโฮสต์ Node.js อื่น

## Deploy (เช่น Vercel)

โปรเจกต์นี้ใช้ **PostgreSQL** กับ Prisma — **ห้ามพึ่ง SQLite บนไฟล์** บน Vercel (ไฟล์ไม่ถาวร / มักไม่อยู่ใน deployment)

**หมายเหตุ:** ไฟล์ **`.env` ในเครื่องถูก `.gitignore`** — การใส่ `DATABASE_URL` แค่ใน `.env` **ไม่ทำให้ production บน Vercel ได้ค่านั้น** ต้องไปใส่ที่ Vercel ด้วย หรือเชื่อม **Vercel Postgres / Neon** ในแดชบอร์ด (แอปรองรับ `POSTGRES_PRISMA_URL` / `NEON_DATABASE_URL` อัตโนมัติ)

1. สร้างฐาน Postgres (แนะนำ [Neon](https://neon.tech) หรือ Vercel Postgres) แล้วคัดลอก connection string
2. ใน Vercel: **Settings → Environment Variables** → เพิ่ม **`DATABASE_URL`** (ค่าเดียวกับใน `.env` ของคุณ) ให้ครบ **Production** และ **Preview** (ถ้าใช้) — ถ้ายังไม่มี URL ใดๆ ที่รองรับ **build บน Vercel จะล้มทันที** พร้อมข้อความ `[pedlai] No database URL on Vercel`
3. Deploy แล้วสร้างตารางบน DB จริงครั้งหนึ่ง จากเครื่องที่มี `DATABASE_URL` ชี้ไปที่ production (หรือใช้ Neon SQL Editor ร่วมกับ `prisma migrate` ตามที่คุณถนัด):

   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   ```

4. (ถ้าต้องการข้อมูลเริ่มต้น) รัน `npm run db:seed-inventory` / `npm run import:customers` โดยตั้ง `DATABASE_URL` ชี้ไปที่ DB เดียวกัน

ถ้าไม่ตั้ง `DATABASE_URL` หรือชี้ไป SQLite บนไฟล์บนโฮสต์ หน้าแรกจะยังเปิดได้ แต่หน้าที่อ่าน DB จะ error ตอนรันจริง

### ยังขึ้น Application error ทุกหน้ายกเว้นหน้าแรก

1. เปิด **`https://<โดเมน-vercel>/api/health`** — ถ้าได้ **503** แปลว่าแอปเชื่อม DB ไม่ได้ (ค่าแวริเอิลผิด / ยังไม่มีตาราง)
2. ตรวจใน Vercel ว่า **`DATABASE_URL`** เป็น `postgresql://` หรือ `postgres://` และใส่ครบ **Production** (และ **Preview** ถ้าเปิด preview deploy)
3. กับ **Neon** ให้ใช้ connection string แบบ **Pooled / มี pooler ใน hostname** ตามที่ Neon แนะนำสำหรับ serverless และให้มี `sslmode=require` ใน query string ถ้าผู้ให้บริการระบุ
4. หลังแก้ URL แล้ว รัน **`DATABASE_URL="..." npx prisma db push`** อีกครั้งกับ DB ชุดนั้น แล้วค่อย **Redeploy** บน Vercel (หรือ push commit ใหม่)
5. ดูรายละเอียด error จริงได้ที่ Vercel → โปรเจกต์ → **Logs** (ใช้ **Digest** คู่กับเวลาใน log)

## License

Private / ตามที่เจ้าของ repo กำหนด
