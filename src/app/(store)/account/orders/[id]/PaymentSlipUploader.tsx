"use client";

import { useState } from "react";

type Props = {
  orderId: string;
  uploadAction: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
};

export function PaymentSlipUploader({ orderId, uploadAction, disabled = false }: Props) {
  const [fileName, setFileName] = useState("");

  return (
    <form action={uploadAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="app-btn-secondary cursor-pointer">
          เลือกไฟล์สลิป
          <input
            name="slip"
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFileName(f?.name ?? "");
            }}
          />
        </label>
        <button
          type="submit"
          disabled={disabled || !fileName}
          className="app-btn-primary disabled:opacity-50"
        >
          แนบสลิป
        </button>
      </div>
      <p className="text-sm text-[var(--muted)]">{fileName ? `ไฟล์ที่เลือก: ${fileName}` : "ยังไม่ได้เลือกไฟล์"}</p>
    </form>
  );
}
