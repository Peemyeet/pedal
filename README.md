# pedal

ระบบขาย · คลังสินค้า · ใบเสนอราคา (Next.js + Prisma)

## รันในเครื่อง

```bash
cp .env.example .env
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

1. ในโปรเจกต์ Vercel ไปที่ **Settings → Environment Variables**
2. เพิ่ม **`DATABASE_URL`** ให้ครบทุก environment ที่ใช้ (Production / Preview)
3. บน production แนะนำใช้ **PostgreSQL** (เช่น Neon, Vercel Postgres) แล้วเปลี่ยน `provider` ใน `prisma/schema.prisma` เป็น `postgresql` — **SQLite บนไฟล์ไม่เหมาะกับ serverless**
4. หลังตั้งค่า URL แล้วรัน migration / `db push` ตาม workflow ของโฮสต์

ถ้าไม่ตั้ง `DATABASE_URL` บนโฮสต์ ตอน **รันใช้งานจริง** จะ error ตอนเข้าหน้าที่อ่าน DB (แต่ `next build` จะผ่านได้หลังแก้ใน repo นี้แล้ว)

## License

Private / ตามที่เจ้าของ repo กำหนด
