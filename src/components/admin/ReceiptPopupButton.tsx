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
      className="inline-flex rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
    >
      {loading ? "กำลังสร้าง..." : "พิมพ์ใบเสร็จ"}
    </button>
  );
}
