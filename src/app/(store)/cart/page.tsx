"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BahtTextBelow } from "@/components/BahtTextBelow";
import { useCart } from "@/components/CartProvider";
import { loadLastOrderNumber } from "@/lib/cart-storage";
import { shippingFeeForUnitQuantity } from "@/lib/shipping-tiers";

function formatThb(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatOrderNo(n: number) {
  return `pdl${n.toString().padStart(5, "0")}`;
}

export default function CartPage() {
  const { data: session } = useSession();
  const { items, ready, subtotal, shippingTotal, grandTotal, setQuantity, removeItem, clearCart } =
    useCart();
  const [lastOrderNo, setLastOrderNo] = useState<number | null>(null);
  const hasOverStock = items.some((i) => i.quantity > i.stock);
  const isAdmin = session?.user?.role === "ADMIN";
  const paymentHref = session ? "/checkout" : "/auth/login?callbackUrl=/checkout";

  useEffect(() => {
    if (!ready) return;
    setLastOrderNo(loadLastOrderNumber());
  }, [ready]);

  if (!ready) {
    return (
      <div className="app-card p-6">
        <p className="text-base text-[var(--muted)]">กำลังโหลดตะกร้า…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="app-page-title">ตะกร้า</h1>
          <p className="app-page-lead mt-2 text-base sm:text-lg">
            ตรวจรายการ แล้วกดไปหน้าชำระเงิน (ต้องล็อกอินก่อน)
          </p>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("ล้างรายการทั้งหมดในตะกร้า?")) clearCart();
            }}
            className="app-btn-secondary w-full shrink-0 sm:w-auto"
          >
            ล้างตะกร้า
          </button>
        ) : null}
      </div>

      {lastOrderNo ? (
        <p className="rounded-2xl border border-sky-200/80 bg-sky-50/90 px-4 py-3 text-sm text-sky-900 sm:text-base">
          เลขที่ใบเสนอราคานี้:{" "}
          <span className="font-mono font-semibold">{formatOrderNo(lastOrderNo)}</span>
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="app-card p-6 sm:p-8">
          <p className="text-base">ตะกร้าว่าง</p>
          <p className="mt-2 text-[var(--muted)]">ไปที่ร้านค้าเพื่อเลือกสินค้า</p>
          <Link href="/shop" className="app-btn-primary mt-6 inline-block">
            ไปร้านค้า
          </Link>
        </div>
      ) : (
        <>
          <div className="app-table-shell overflow-x-auto">
            <table className="w-full min-w-[min(100%,_640px)] text-left text-base">
              <thead className="app-thead">
                <tr>
                  <th className="app-th">สินค้า</th>
                  <th className="app-th w-32">ราคา/หน่วย</th>
                  <th className="app-th w-32">จำนวน</th>
                  <th className="app-th w-32">ค่าจัดส่ง (แถว)</th>
                  <th className="app-th text-right w-32">รวมแถว</th>
                  <th className="app-th w-16" />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const over = row.quantity > row.stock;
                  const lineSub = row.price * row.quantity;
                  const lineShip = shippingFeeForUnitQuantity(row.quantity);
                  return (
                    <tr key={row.productId} className="border-t border-[var(--border)]">
                      <td className="px-2 py-3 align-top sm:px-4">
                        <p className="font-medium">
                          {row.sku ? <span className="text-[var(--muted)]">[{row.sku}] </span> : null}
                          {row.name}
                        </p>
                        {over ? (
                          <p className="mt-1 text-sm font-medium text-amber-800">
                            จำนวนในตะกร้าเกินสต็อก (คงเหลือ {row.stock} ชิ้น) — กรุณาแก้ก่อนออกใบ
                          </p>
                        ) : null}
                      </td>
                      <td className="px-2 py-3 tabular-nums sm:px-4">
                        {formatThb(row.price)} ฿
                      </td>
                      <td className="px-2 py-3 sm:px-4">
                        <input
                          type="number"
                          min={1}
                          max={row.stock}
                          value={row.quantity}
                          onChange={(e) =>
                            setQuantity(row.productId, Number(e.target.value) || 1)
                          }
                          className="min-h-10 w-20 max-w-full px-2 text-base"
                          aria-label={`จำนวน ${row.name}`}
                        />
                        <p className="mt-1 text-xs text-[var(--muted)]">สูงสุด {row.stock}</p>
                      </td>
                      <td className="px-2 py-3 tabular-nums sm:px-4">
                        {lineShip.toLocaleString("th-TH")} ฿
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums sm:px-4">
                        {formatThb(lineSub + lineShip)} ฿
                      </td>
                      <td className="px-1 py-3 sm:px-2">
                        <button
                          type="button"
                          onClick={() => removeItem(row.productId)}
                          className="min-h-10 min-w-10 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <section className="app-card p-5 sm:p-6">
            <div className="space-y-2 text-base">
              <div className="flex justify-between gap-4">
                <span className="text-[var(--muted)]">ยอดสินค้า</span>
                <span className="tabular-nums font-medium">{formatThb(subtotal)} บาท</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[var(--muted)]">ค่าขนส่งรวม</span>
                <span className="tabular-nums font-medium">
                  {formatThb(shippingTotal)} บาท
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-end sm:justify-between">
              <span className="text-lg font-bold sm:text-xl">รวมทั้งสิ้น</span>
              <div className="text-right">
                <span className="block text-xl font-bold tabular-nums sm:text-2xl">
                  {formatThb(grandTotal)} บาท
                </span>
                <BahtTextBelow
                  amount={grandTotal}
                  className="mt-2 text-sm text-[var(--muted)]"
                />
              </div>
            </div>
          </section>

          {hasOverStock ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 sm:text-base">
              กรุณาแก้จำนวนให้ไม่เกินสต็อก หรือลดรายการ ก่อนไปชำระ
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/shop" className="app-btn-secondary text-center sm:inline-block">
              เลือกสินค้าเพิ่ม
            </Link>
            {hasOverStock ? (
              <span
                className="app-btn-primary text-center opacity-50 sm:inline-block"
                role="text"
                title="ลดจำนวนให้ไม่เกินสต็อกก่อน"
              >
                ยืนยันคำสั่งซื้อ
              </span>
            ) : (
              <Link href={paymentHref} className="app-btn-primary text-center sm:inline-block">
                {session ? "ยืนยันคำสั่งซื้อ" : "ล็อกอินก่อนยืนยันคำสั่งซื้อ"}
              </Link>
            )}
            {isAdmin && !hasOverStock ? (
              <Link
                href="/sales/new?fromCart=1"
                className="text-center text-sm font-semibold text-[var(--accent)] hover:underline sm:ml-1"
              >
                (แอดมิน) ลากไปสร้างใบเสนอราคา
              </Link>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
