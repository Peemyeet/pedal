"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ShippingTierInfo } from "@/components/ShippingTierInfo";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, totalWeightKg, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      customerName: String(form.get("customerName")),
      phone: String(form.get("phone")),
      email: form.get("email") ? String(form.get("email")) : undefined,
      address: String(form.get("address")),
      notes: form.get("notes") ? String(form.get("notes")) : undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "สั่งซื้อไม่สำเร็จ");
      clearCart();
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-stone-600">ไม่มีสินค้าในตะกร้า</p>
        <Link href="/products" className="mt-4 inline-block text-red-600 hover:underline">
          กลับไปเลือกสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">ชำระเงิน / สั่งซื้อ</h1>
      <p className="mt-1 text-stone-600">
        กรอกข้อมูลจัดส่ง เราจะติดต่อยืนยันออเดอร์ทางโทรศัพท์
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="customerName">
            ชื่อ-นามสกุล *
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="phone">
            เบอร์โทร *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="email">
            อีเมล
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="address">
            ที่อยู่จัดส่ง *
          </label>
          <textarea
            id="address"
            name="address"
            required
            rows={3}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="notes">
            หมายเหตุ
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div className="rounded-2xl bg-red-50 p-4">
          <div className="space-y-1 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>{items.length} รายการ · ราคาสินค้า</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ค่าจัดส่ง ({totalWeightKg} กก.)</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-red-700">
              <span>รวมทั้งสิ้น</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            ชำระเงินปลายทาง (COD) หรือโอนตามที่แจ้งหลังยืนยันออเดอร์
          </p>
        </div>

        <ShippingTierInfo compact />

        {error && (
          <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "กำลังส่งคำสั่งซื้อ..." : "ยืนยันสั่งซื้อ"}
        </button>
      </form>
    </div>
  );
}
