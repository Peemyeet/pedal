"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, total, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-5xl" aria-hidden>
          🛒
        </p>
        <h1 className="mt-4 text-2xl font-bold">ตะกร้าว่าง</h1>
        <p className="mt-2 text-stone-600">ยังไม่มีสินค้าในตะกร้า</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
        >
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">ตะกร้าสินค้า</h1>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex gap-4 rounded-2xl border border-red-100 bg-white p-4"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-red-50">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href={`/products/${item.slug}`}
                  className="font-semibold hover:text-red-600"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-stone-500">
                  {formatPrice(item.price)} / ชิ้น
                </p>
              </div>
              <div className="mt-2 flex items-center gap-3 sm:mt-0">
                <div className="flex items-center rounded-lg border border-stone-200">
                  <button
                    type="button"
                    className="px-3 py-1 hover:bg-stone-50"
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    aria-label="ลดจำนวน"
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 hover:bg-stone-50"
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    aria-label="เพิ่มจำนวน"
                  >
                    +
                  </button>
                </div>
                <p className="min-w-[5rem] text-right font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  ลบ
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-red-100">
        <div className="flex justify-between text-lg font-bold">
          <span>รวมทั้งสิ้น</span>
          <span className="text-red-700">{formatPrice(total)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-xl bg-red-600 py-3 text-center font-semibold text-white hover:bg-red-700"
        >
          ดำเนินการชำระเงิน
        </Link>
      </div>
    </div>
  );
}
