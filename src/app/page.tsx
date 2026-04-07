import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="app-card relative overflow-hidden px-4 py-8 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--accent-softer)] blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
            ระบบขาย · ใบเสนอราคา
          </p>
          <h1 className="mt-3 app-page-title">ยินดีต้อนรับสู่ {BRAND.shortName}</h1>
          <p className="app-page-lead mt-4 text-base sm:text-lg">
            จัดการคลังสินค้า สร้างใบเสนอราคา (รวมค่าขนส่งต่อใบ) ติดตามสถานะจนส่งมอบ — ออกแบบให้กดง่าย
            อ่านชัด เหมาะกับใช้งานจริงทุกวัน
          </p>
          <ul className="mt-8 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
            <li className="w-full sm:w-auto">
              <Link href="/sales/new" className="app-btn-primary">
                สร้างใบเสนอราคา
              </Link>
            </li>
            <li className="w-full sm:w-auto">
              <Link href="/products" className="app-btn-secondary">
                คลังสินค้า
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="flow-heading">
        <h2 id="flow-heading" className="sr-only">
          ลำดับการทำงาน
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          <article className="app-card flex flex-col p-6 sm:p-7">
            <span className="text-2xl" aria-hidden>
              ①
            </span>
            <h3 className="mt-3 text-lg font-bold">ส่งใบเสนอราคา</h3>
            <p className="mt-2 flex-1 text-base leading-relaxed text-[var(--muted)]">
              หลังสร้างและส่งใบ จะไปอยู่ที่เมนู <strong className="text-[var(--foreground)]">เสนอราคาแล้ว</strong>
            </p>
            <Link
              href="/quotations/quoted"
              className="mt-5 inline-flex text-base font-semibold text-[var(--accent)] hover:underline"
            >
              ดูรายการใบที่ส่งแล้ว →
            </Link>
          </article>
          <article className="app-card flex flex-col p-6 sm:p-7">
            <span className="text-2xl" aria-hidden>
              ②
            </span>
            <h3 className="mt-3 text-lg font-bold">ลูกค้าตัดสินใจ</h3>
            <p className="mt-2 flex-1 text-base leading-relaxed text-[var(--muted)]">
              เปิดใบเพื่อดูรายละเอียด เมื่อลูกค้าตกลงซื้อให้กดยืนยันการซื้อในใบ
            </p>
          </article>
          <article className="app-card flex flex-col p-6 sm:p-7">
            <span className="text-2xl" aria-hidden>
              ③
            </span>
            <h3 className="mt-3 text-lg font-bold">ชำระเงินและส่งของ</h3>
            <p className="mt-2 flex-1 text-base leading-relaxed text-[var(--muted)]">
              หลังยืนยันแล้ว ไปที่เมนู{" "}
              <strong className="text-[var(--foreground)]">ยืนยันแล้ว · ชำระเงินและส่งของ</strong> เพื่อบันทึกสลิปและเลขพัสดุ
            </p>
            <Link
              href="/quotations/fulfillment"
              className="mt-5 inline-flex text-base font-semibold text-[var(--accent)] hover:underline"
            >
              ไปหน้าจัดส่ง →
            </Link>
          </article>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:flex-wrap sm:pt-10">
        <Link href="/customers" className="app-btn-secondary">
          ลูกค้า
        </Link>
      </section>
    </div>
  );
}
