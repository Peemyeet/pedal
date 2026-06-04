"use client";

import { useState } from "react";
import { openOrderDocumentPopup } from "./openOrderDocumentPopup";

export function QuotationPopupLink({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    if (loading) return;
    setLoading(true);
    try {
      await openOrderDocumentPopup(orderId, "quotation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleOpen()}
      disabled={loading}
      className="font-mono text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "..." : orderNumber}
    </button>
  );
}
