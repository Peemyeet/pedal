"use client";

import { useState } from "react";
import {
  AdminActionIconButton,
  IconReceipt,
} from "./AdminActionIconButton";
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
    <AdminActionIconButton
      label="พิมพ์ใบเสร็จ"
      variant="receipt"
      loading={loading}
      onClick={() => void handleOpenReceiptPopup()}
    >
      <IconReceipt />
    </AdminActionIconButton>
  );
}
