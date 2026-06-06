"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditProductDetailsForm({
  productId,
  initialName,
  initialDescription,
}: {
  productId: string;
  initialName: string;
  initialDescription: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleOpen() {
    setName(initialName);
    setDescription(initialDescription);
    setError("");
    setOpen(true);
  }

  function handleCancel() {
    setName(initialName);
    setDescription(initialDescription);
    setError("");
    setOpen(false);
  }

  async function save() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("ชื่อสินค้าต้องมีอย่างน้อย 2 ตัวอักษร");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          แก้ไขรายละเอียด
        </button>
      ) : (
        <div className="w-full rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              แก้ไขรายละเอียดสินค้า
            </p>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-stone-500 hover:text-stone-700"
            >
              ยกเลิก
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-stone-500 sm:col-span-2">
              ชื่อสินค้า
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                placeholder="ชื่อสินค้า"
              />
            </label>
            <label className="text-xs text-stone-500 sm:col-span-2">
              รายละเอียด
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                placeholder="คำอธิบายสินค้า"
              />
            </label>
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกรายละเอียด"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
