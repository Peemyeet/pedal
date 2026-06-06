"use client";

import { useState } from "react";
import { openReceiptPopup } from "./openReceiptPopup";

export function ReceiptPopupButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleOpenReceiptPopup() {
    if (loading) return;
    setLoading(true);
    try {
      await openReceiptPopup(orderId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleOpenReceiptPopup()}
      disabled={loading}
      className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-50"
    >
      {loading ? "กำลังสร้าง..." : "พิมพ์ใบเสร็จ"}
    </button>
  );
}
