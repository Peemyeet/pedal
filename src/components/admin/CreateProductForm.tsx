"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  { value: "fresh", label: "พริกสด" },
  { value: "dried", label: "พริกแห้ง" },
  { value: "processed", label: "แปรรูป" },
] as const;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1599909533398-162deed711a4?w=800&q=80";

function suggestSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || `product-${Date.now()}`;
}

export function CreateProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "fresh" as (typeof CATEGORIES)[number]["value"],
    price: 100,
    stock: 0,
    heatLevel: 3,
    image: "",
  });

  function updateName(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug || suggestSlug(name),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || form.name.trim(),
          category: form.category,
          price: form.price,
          stock: form.stock,
          heatLevel: form.heatLevel,
          image: form.image.trim() || DEFAULT_IMAGE,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เพิ่มสินค้าไม่สำเร็จ");

      setForm({
        name: "",
        slug: "",
        description: "",
        category: "fresh",
        price: 100,
        stock: 0,
        heatLevel: 3,
        image: "",
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เพิ่มสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
      >
        + เพิ่มสินค้าใหม่
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">เพิ่มสินค้าใหม่</h2>
          <p className="text-sm text-stone-500">กรอกข้อมูลแล้วบันทึก — เปลี่ยนรูปได้ภายหลัง</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ยกเลิก
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-stone-500">
          ชื่อสินค้า *
          <input
            required
            value={form.name}
            onChange={(e) => updateName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            placeholder="เช่น พริกขี้หนูสด กก."
          />
        </label>
        <label className="text-xs text-stone-500">
          slug (URL) *
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            placeholder="prik-kee-noo-fresh-kg"
          />
        </label>
        <label className="text-xs text-stone-500 sm:col-span-2">
          รายละเอียด
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={2}
            className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            placeholder="คำอธิบายสินค้า"
          />
        </label>
        <label className="text-xs text-stone-500">
          หมวดหมู่
          <select
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                category: e.target.value as (typeof CATEGORIES)[number]["value"],
              }))
            }
            className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-stone-500">
          ระดับความเผ็ด (1–5)
          <input
            type="number"
            min={1}
            max={5}
            value={form.heatLevel}
            onChange={(e) => setForm((p) => ({ ...p, heatLevel: Number(e.target.value) }))}
            className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-stone-500">
          ราคา (บาท) *
          <input
            type="number"
            min={1}
            required
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
            className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-stone-500">
          สต๊อกเริ่มต้น
          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
            className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-stone-500 sm:col-span-2">
          URL รูป (ไม่ใส่จะใช้รูปตั้งต้น)
          <input
            type="url"
            value={form.image}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "กำลังเพิ่ม..." : "เพิ่มสินค้า"}
        </button>
      </div>
    </form>
  );
}
