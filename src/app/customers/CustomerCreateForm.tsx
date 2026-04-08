"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCustomer } from "@/app/customers/actions";

export function CustomerCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createCustomer({ category, customerCode, name, address });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }

      setCategory("");
      setCustomerCode("");
      setName("");
      setAddress("");
      router.refresh();
    });
  }

  return (
    <section className="app-card p-4 sm:p-6 md:p-8">
      <h2 className="mb-5 text-xl font-bold">เพิ่มลูกค้า</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="app-label">กลุ่ม</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="เช่น ทั่วไป"
            className="mt-2 min-h-12 w-full px-4 text-base"
          />
        </div>
        <div>
          <label className="app-label">รหัสลูกค้า</label>
          <input
            value={customerCode}
            onChange={(e) => setCustomerCode(e.target.value)}
            placeholder="เช่น S01"
            className="mt-2 min-h-12 w-full px-4 text-base"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="app-label">ชื่อ (ไม่บังคับ)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 min-h-12 w-full px-4 text-base"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="app-label">ที่อยู่ (ไม่บังคับ)</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-2 w-full px-4 py-3 text-base"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-base font-medium text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="app-btn-primary mt-6 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก…" : "เพิ่มลูกค้า"}
      </button>
    </section>
  );
}
