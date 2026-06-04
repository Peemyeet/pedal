"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RestoreProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function restore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error("กู้คืนไม่สำเร็จ");
      router.refresh();
    } catch {
      window.alert("กู้คืนไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={restore}
      disabled={loading}
      className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
    >
      {loading ? "กำลังกู้คืน..." : `เปิดขาย "${productName}" อีกครั้ง`}
    </button>
  );
}
