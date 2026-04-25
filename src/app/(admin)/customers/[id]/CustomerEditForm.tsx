"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateCustomer } from "@/app/(admin)/customers/actions";

type Props = {
  customerId: string;
  initial: {
    name: string;
    address: string;
    orderNote: string;
    lastPurchaseNote: string;
    billingInfo: string;
  };
};

export function CustomerEditForm({ customerId, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [orderNote, setOrderNote] = useState(initial.orderNote);
  const [lastPurchaseNote, setLastPurchaseNote] = useState(initial.lastPurchaseNote);
  const [billingInfo, setBillingInfo] = useState(initial.billingInfo);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateCustomer(customerId, {
        name,
        address,
        orderNote,
        lastPurchaseNote,
        billingInfo,
      });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="app-card p-4 sm:p-6 md:p-8">
      <h2 className="mb-2 text-xl font-bold">แก้ไขข้อมูลลูกค้า</h2>
      <p className="mb-6 text-base leading-relaxed text-[var(--muted)]">
        บันทึกลงฐานข้อมูล — กลุ่มและรหัสลูกค้าจากไฟล์นำเข้าไม่แก้ที่นี่
      </p>
      <div className="space-y-5">
        <div>
          <label className="app-label">ชื่อที่แสดงในใบ</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 min-h-12 w-full max-w-xl px-4 text-base"
          />
        </div>
        <div>
          <label className="app-label">ที่อยู่ / ข้อมูลจัดส่ง</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={5}
            className="mt-2 w-full max-w-2xl px-4 py-3 font-sans text-base"
          />
        </div>
        <div>
          <label className="app-label">หมายเหตุออเดอร์</label>
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            rows={3}
            className="mt-2 w-full max-w-2xl px-4 py-3 font-sans text-base"
          />
        </div>
        <div>
          <label className="app-label">ซื้อครั้งสุดท้าย / หมายเหตุ</label>
          <textarea
            value={lastPurchaseNote}
            onChange={(e) => setLastPurchaseNote(e.target.value)}
            rows={3}
            className="mt-2 w-full max-w-2xl px-4 py-3 font-sans text-base"
          />
        </div>
        <div>
          <label className="app-label">ข้อมูลออกบิล</label>
          <textarea
            value={billingInfo}
            onChange={(e) => setBillingInfo(e.target.value)}
            rows={3}
            className="mt-2 w-full max-w-2xl px-4 py-3 font-sans text-base"
          />
        </div>
      </div>
      {error ? <p className="mt-4 text-base font-medium text-red-600">{error}</p> : null}
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="app-btn-primary mt-8 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}
      </button>
    </section>
  );
}
