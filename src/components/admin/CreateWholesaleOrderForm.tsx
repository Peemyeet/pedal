"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { calculateShippingFee, calculateTotalWeightKg } from "@/lib/shipping";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type LineItem = {
  key: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number;
};

function newLine(product?: Product): LineItem {
  return {
    key: Math.random().toString(36).slice(2),
    productId: product?.id ?? "",
    productName: product?.name ?? "",
    quantity: 1,
    priceAtOrder: product?.price ?? 0,
  };
}

type Customer = {
  id: string;
  shopName: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  taxId: string | null;
  notes: string | null;
};

export function CreateWholesaleOrderForm({
  products,
  customers = [],
}: {
  products: Product[];
  customers?: Customer[];
}) {
  const router = useRouter();
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [shopName, setShopName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isQuotation, setIsQuotation] = useState(true);
  const [lines, setLines] = useState<LineItem[]>([
    newLine(products[0] ?? undefined),
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.priceAtOrder * l.quantity, 0),
    [lines]
  );
  const totalWeightKg = useMemo(
    () =>
      calculateTotalWeightKg(
        lines.filter((l) => l.quantity > 0).map((l) => ({ quantity: l.quantity }))
      ),
    [lines]
  );
  const shipping = useMemo(
    () =>
      calculateShippingFee(
        lines.filter((l) => l.quantity > 0).map((l) => ({ quantity: l.quantity }))
      ),
    [lines]
  );
  const total = subtotal + shipping;

  function updateLine(key: string, patch: Partial<LineItem>) {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l))
    );
  }

  function onProductPick(key: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateLine(key, {
      productId: product.id,
      productName: product.name,
      priceAtOrder: product.price,
    });
  }

  function onCustomerPick(customerId: string) {
    setSelectedCustomerId(customerId);
    if (!customerId) return;
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    setShopName(customer.shopName ?? "");
    setCustomerName(customer.customerName);
    setPhone(customer.phone);
    setEmail(customer.email ?? "");
    setAddress(customer.address);
    setNotes(customer.notes ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validLines = lines.filter(
      (l) => l.productName.trim() && l.quantity > 0
    );
    if (validLines.length === 0) {
      setError("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: shopName.trim() || undefined,
          customerName,
          phone,
          email: email || undefined,
          address,
          notes: notes || undefined,
          isQuotation,
          items: validLines.map((l) => ({
            productId: l.productId || undefined,
            productName: l.productName.trim(),
            quantity: l.quantity,
            priceAtOrder: l.priceAtOrder,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      router.push(`/admin/orders/${data.id}?from=wholesale`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
        <h2 className="font-semibold text-stone-900">ข้อมูลร้าน / ลูกค้า</h2>
        <p className="mt-1 text-sm text-stone-500">
          สำหรับร้านอาหารหรือลูกค้า B2B ที่ราคาต่างจากหน้าเว็บ
        </p>
        {customers.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium" htmlFor="customerPick">
              เลือกจากลูกค้า B2B ที่บันทึกไว้
            </label>
            <select
              id="customerPick"
              value={selectedCustomerId}
              onChange={(e) => onCustomerPick(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            >
              <option value="">— กรอกใหม่ —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shopName ? `${c.shopName} (${c.customerName})` : c.customerName}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium" htmlFor="shopName">
              ชื่อร้าน (ถ้ามี)
            </label>
            <input
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="เช่น ร้านส้มตำป้าแดง"
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="customerName">
              ชื่อผู้ติดต่อ *
            </label>
            <input
              id="customerName"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="phone">
              โทร *
            </label>
            <input
              id="phone"
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium" htmlFor="address">
              ที่อยู่จัดส่ง *
            </label>
            <textarea
              id="address"
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium" htmlFor="notes">
              หมายเหตุ
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-stone-900">รายการสินค้า</h2>
            <p className="text-sm text-stone-500">
              กำหนดราคาต่อร้านได้ (ไม่จำเป็นต้องเท่าราคาหน้าเว็บ)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, newLine()])}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50"
          >
            + เพิ่มรายการ
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {lines.map((line) => {
            const product = products.find((p) => p.id === line.productId);
            return (
              <div
                key={line.key}
                className="grid gap-3 rounded-xl border border-stone-100 bg-stone-50 p-4 sm:grid-cols-12"
              >
                <div className="sm:col-span-4">
                  <label className="text-xs text-stone-500">สินค้า</label>
                  <select
                    value={line.productId}
                    onChange={(e) => onProductPick(line.key, e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-2 text-sm"
                  >
                    <option value="">— เลือกสินค้า —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (เว็บ {formatPrice(p.price)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-stone-500">จำนวน (กก.)</label>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.key, {
                        quantity: Number(e.target.value),
                      })
                    }
                    className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs text-stone-500">
                    ราคา/หน่วย (บาท)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={line.priceAtOrder}
                    onChange={(e) =>
                      updateLine(line.key, {
                        priceAtOrder: Number(e.target.value),
                      })
                    }
                    className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-2 text-sm"
                  />
                  {product && line.priceAtOrder !== product.price && (
                    <p className="mt-0.5 text-xs text-amber-700">
                      ราคาเว็บ {formatPrice(product.price)}
                    </p>
                  )}
                </div>
                <div className="flex items-end justify-between sm:col-span-3">
                  <p className="text-sm font-medium">
                    {formatPrice(line.priceAtOrder * line.quantity)}
                  </p>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setLines((prev) => prev.filter((l) => l.key !== line.key))
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      ลบ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-1 text-right text-sm text-stone-600">
          <p>ราคาสินค้า {formatPrice(subtotal)}</p>
          <p>ค่าจัดส่ง ({totalWeightKg} กก.) {formatPrice(shipping)}</p>
          <p className="text-lg font-bold text-red-700">รวม {formatPrice(total)}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={isQuotation}
            onChange={(e) => setIsQuotation(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-stone-900">
              บันทึกเป็นใบเสนอราคา
            </span>
            <span className="mt-1 block text-sm text-stone-600">
              ยังไม่ตัดสต๊อก — เมื่อลูกค้ายืนยันแล้วเปลี่ยนสถานะเป็น「ยืนยันแล้ว」
              ระบบจะตัดสต๊อกให้
            </span>
          </span>
        </label>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {loading
          ? "กำลังบันทึก..."
          : isQuotation
            ? "บันทึกใบเสนอราคา"
            : "บันทึกออเดอร์ร้านค้า"}
      </button>
    </form>
  );
}
