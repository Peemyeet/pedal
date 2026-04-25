"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateWebOrderStatus } from "./actions";

type Props = {
  orderId: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
};

export function OrderStatusPanel({ orderId, status }: Props) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (status !== "PENDING") {
    return (
      <p className="text-sm text-[var(--muted)]">ออเดอร์นี้ดำเนินการแล้ว ไม่สามารถเปลี่ยนสถานะซ้ำได้</p>
    );
  }

  function run(next: "COMPLETED" | "CANCELLED") {
    if (next === "CANCELLED" && !window.confirm("ยกเลิกออเดอร์นี้? สต็อกสินค้าจะถูกคืนเข้าคลัง")) {
      return;
    }
    setErr(null);
    const fd = new FormData();
    fd.set("orderId", orderId);
    fd.set("status", next);
    start(async () => {
      const res = await updateWebOrderStatus(fd);
      if ("error" in res && res.error) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {err ? <p className="rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-800">{err}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run("COMPLETED")}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50 sm:min-h-11 sm:px-5 sm:text-base"
        >
          {pending ? "กำลังบันทึก…" : "ทำเครื่องหมายเสร็จสิ้น"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run("CANCELLED")}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-red-600 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 sm:min-h-11 sm:px-5 sm:text-base"
        >
          ยกเลิกออเดอร์
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">ยกเลิก = คืนจำนวนเข้าสต็อก (เฉพาะออเดอร์ที่รอดำเนินการ)</p>
    </div>
  );
}
