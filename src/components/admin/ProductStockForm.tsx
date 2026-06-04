"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductStockForm({
  productId,
  initialStock,
  initialPrice,
  initialActive,
}: {
  productId: string;
  initialStock: number;
  initialPrice: number;
  initialActive: boolean;
}) {
  const router = useRouter();
  const [stock, setStock] = useState(initialStock);
  const [price, setPrice] = useState(initialPrice);
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock, price, isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        จัดการสต๊อกและราคา
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[120px_140px_auto] sm:items-end">
        <label className="text-xs text-stone-500">
          สต๊อก
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-stone-500">
          ราคา (บาท)
          <input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            เปิดขาย
          </label>
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
