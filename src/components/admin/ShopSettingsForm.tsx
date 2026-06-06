"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ShopSettingsData } from "@/lib/shop-settings-data";

export function ShopSettingsForm({ initial }: { initial: ShopSettingsData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initial,
    phonesText: initial.phones.join(", "),
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const phones = form.phonesText
      .split(/[,，]/)
      .map((p) => p.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shortName: form.shortName,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        address: form.address,
        addressEn: form.addressEn,
        taxId: form.taxId,
        phones,
        fax: form.fax,
        email: form.email,
        website: form.website,
        logoInitials: form.logoInitials,
        quotationNote: form.quotationNote,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    setMessage("บันทึกการตั้งค่าเรียบร้อย");
    router.refresh();
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <section className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
        <h2 className="font-semibold">ข้อมูลร้าน / บริษัท</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อสั้น (บนใบเอกสาร)" value={form.shortName} onChange={(v) => setForm({ ...form, shortName: v })} />
          <Field label="ชื่อเต็ม" value={form.nameTh} onChange={(v) => setForm({ ...form, nameTh: v })} />
          <Field label="ชื่อภาษาอังกฤษ" value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} />
          <Field label="ตัวย่อโลโก้" value={form.logoInitials} onChange={(v) => setForm({ ...form, logoInitials: v })} />
          <div className="sm:col-span-2">
            <Field label="ที่อยู่ (ไทย)" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          </div>
          <div className="sm:col-span-2">
            <Field label="ที่อยู่ (อังกฤษ)" value={form.addressEn} onChange={(v) => setForm({ ...form, addressEn: v })} />
          </div>
          <Field label="เบอร์โทร (คั่นด้วย ,)" value={form.phonesText} onChange={(v) => setForm({ ...form, phonesText: v })} />
          <Field label="เลขประจำตัวผู้เสียภาษี" value={form.taxId} onChange={(v) => setForm({ ...form, taxId: v })} />
          <Field label="อีเมล" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="เว็บไซต์" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
        <h2 className="font-semibold">ใบเสนอราคา</h2>
        <label className="mt-4 block text-sm font-medium text-stone-600">
          หมายเหตุเริ่มต้น (แสดงเมื่อออเดอร์ไม่มีหมายเหตุ)
        </label>
        <textarea
          value={form.quotationNote}
          onChange={(e) => setForm({ ...form, quotationNote: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2 text-sm"
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2 text-sm"
      />
    </div>
  );
}
