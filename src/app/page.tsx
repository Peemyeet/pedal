import Link from "next/link";
import { listAppProducts } from "@/lib/legacy";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = (await listAppProducts(true))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-orange-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="text-sm font-medium uppercase tracking-widest text-red-100">
            พริกคุณภาพ ส่งตรงจากฟาร์ม
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            PEDLAI — เผ็ดร้อนครบรส สดใหม่ทุกวัน
          </h1>
          <p className="mt-4 max-w-xl text-lg text-red-50">
            พริกสด แห้ง น้ำพริก และซอสพริก คัดสรรจากเกษตรกรไทย
            สั่งออนไลน์ จัดส่งถึงบ้าน
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-red-700 shadow transition hover:bg-red-50"
            >
              ดูสินค้าทั้งหมด
            </Link>
            <Link
              href="/about"
              className="rounded-xl border-2 border-white/80 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              เรื่องราวของเรา
            </Link>
          </div>
        </div>
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">สินค้าแนะนำ</h2>
            <p className="mt-1 text-stone-600">ขายดีประจำสัปดาห์</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-red-600 hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-red-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          {[
            {
              title: "สดจากฟาร์ม",
              desc: "เก็บเกี่ยวและจัดส่งอย่างรวดเร็ว รักษาความสด",
            },
            {
              title: "คุณภาพคัดเกรด",
              desc: "คัดทุกเม็ด ไม่ปน ไม่เน่า มาตรฐาน PEDLAI",
            },
            {
              title: "ส่งทั่วไทย",
              desc: "แพ็คกันกระแทก ปลอดภัยถึงมือคุณ",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-red-100"
            >
              <span className="text-3xl" aria-hidden>
                🌶️
              </span>
              <h3 className="mt-3 font-semibold text-stone-900">{f.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
