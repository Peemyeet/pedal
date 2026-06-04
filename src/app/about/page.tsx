import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "PEDLAI คือแบรนด์พริกไทยที่มุ่งมั่นส่งมอบพริกคุณภาพจากฟาร์มสู่โต๊ะอาหารของคุณ",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900">เกี่ยวกับ PEDLAI</h1>
      <div className="prose prose-stone mt-6 max-w-none space-y-4 text-stone-600">
        <p>
          PEDLAI เกิดจากความรักในพริกไทยและความตั้งใจที่จะเชื่อมเกษตรกรกับผู้บริโภคโดยตรง
          เราคัดสรรพริกทุกล็อตด้วยมาตรฐานคุณภาพ ตั้งแต่พริกสดจนถึงผลิตภัณฑ์แปรรูป
        </p>
        <p>
          ทุกคำสั่งซื้อช่วยสนับสนุนเกษตรกรในชุมชน และมั่นใจได้ว่าคุณได้รับพริกที่สด
          สะอาด และปลอดภัย
        </p>
        <h2 className="text-xl font-semibold text-stone-900">วิสัยทัศน์</h2>
        <p>
          เป็นแบรนด์พริกไทยชั้นนำที่คนไทยและต่างชาติไว้วางใจ — เผ็ดร้อน คุณภาพดี
          และยั่งยืน
        </p>
      </div>
    </div>
  );
}
