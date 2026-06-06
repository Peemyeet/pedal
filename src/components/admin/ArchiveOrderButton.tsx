"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminActionIconButton,
  IconArchive,
} from "./AdminActionIconButton";

export function ArchiveOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleArchive() {
    if (loading) return;
    const ok = window.confirm("ยืนยันจัดเก็บออเดอร์นี้ใช่ไหม");
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELIVERED", archived: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        window.alert(data.error ?? "จัดเก็บไม่สำเร็จ");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminActionIconButton
      label="จัดเก็บ"
      variant="archive"
      loading={loading}
      onClick={() => void handleArchive()}
    >
      <IconArchive />
    </AdminActionIconButton>
  );
}
