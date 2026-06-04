"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ORDER_STATUS_LABEL,
  WEBSITE_ORDER_STATUSES,
  WHOLESALE_ORDER_STATUSES,
} from "@/lib/utils";

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentTrackingNumber,
  source,
  stockDeducted,
}: {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber: string | null;
  source: string;
  stockDeducted: boolean;
}) {
  const router = useRouter();
  const statuses =
    source === "WHOLESALE" ? WHOLESALE_ORDER_STATUSES : WEBSITE_ORDER_STATUSES;
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate() {
    setLoading(true);
    setError("");
    const payloadStatus = status;
    const payloadTracking = trackingNumber;
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: payloadStatus, trackingNumber: payloadTracking }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "อัปเดตไม่สำเร็จ");
      return;
    }
    setStatus(payloadStatus);
    setTrackingNumber(payloadTracking);
    router.refresh();
  }

  const isShippingStatus = status === "SHIPPED";
  const canSubmit =
    !loading &&
    (status !== currentStatus || trackingNumber !== (currentTrackingNumber ?? ""));

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-600">
            อัปเดตสถานะ
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 rounded-xl border border-stone-200 px-4 py-2"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600">
            เลขพัสดุ
          </label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder={
              isShippingStatus ? "กรอกก่อนเปลี่ยนเป็นจัดส่งแล้ว" : "ไม่บังคับ"
            }
            className="mt-1 rounded-xl border border-stone-200 px-4 py-2"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleUpdate()}
          disabled={!canSubmit}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "บันทึก..." : "บันทึก"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-3 space-y-1 text-xs text-stone-500">
        {source === "WEBSITE" && (
          <li>
            • โฟลวเว็บ: ยืนยันสั่งซื้อ → ยังไม่ได้ชำระเงิน → ยังไม่ได้จัดส่ง (ชำระแล้ว) →
            จัดส่งแล้ว
          </li>
        )}
        {source === "WHOLESALE" && !stockDeducted && (
          <li>
            • เปลี่ยนเป็น「ยืนยันแล้ว」จะตัดสต๊อกอัตโนมัติ (สำหรับใบเสนอราคา)
          </li>
        )}
        <li>• ยกเลิกออเดอร์จะคืนสต๊อก (ถ้าเคยตัดแล้ว)</li>
      </ul>

    </div>
  );
}
