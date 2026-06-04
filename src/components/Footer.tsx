import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-red-100 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">PEDLAI</p>
          <p className="mt-2 text-sm leading-relaxed">
            ร้านพริกคุณภาพ ส่งตรงจากฟาร์ม คัดสรรทุกเม็ด เผ็ดร้อนครบรสชาติ
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">ลิงก์</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/products" className="hover:text-red-400">
                สินค้าทั้งหมด
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-red-400">
                เกี่ยวกับเรา
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">ติดต่อ</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>โทร: 08x-xxx-xxxx</li>
            <li>Line: @pedlai</li>
            <li>อีเมล: hello@pedlai.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} PEDLAI. สงวนลิขสิทธิ์.
      </div>
    </footer>
  );
}
