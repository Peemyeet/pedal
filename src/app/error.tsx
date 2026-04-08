"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-[var(--foreground)]">โหลดหน้านี้ไม่สำเร็จ</h1>
      <p className="text-base leading-relaxed text-[var(--muted)]">
        ถ้าใช้งานบน Vercel สาเหตุที่พบบ่อยคือยังไม่ได้ตั้ง{" "}
        <code className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-sm">
          DATABASE_URL
        </code>{" "}
        ใน Environment Variables (ไฟล์{" "}
        <code className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-sm">.env</code>{" "}
        บนเครื่องไม่ถูกอัปโหลดไป Vercel) หรือยังไม่ได้สร้างตารางบน
        DB — รัน{" "}
        <code className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-sm">
          npx prisma db push
        </code>{" "}
        โดยใช้ URL เดียวกับ production
      </p>
      <p className="text-sm text-[var(--muted)]">
        ทดสอบการเชื่อมต่อ:{" "}
        <a href="/api/health" className="font-semibold text-[var(--accent)] underline underline-offset-2">
          /api/health
        </a>{" "}
        (ถ้าได้ 503 แปลว่าเชื่อม DB ไม่ได้)
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-[var(--muted)]">Digest: {error.digest}</p>
      ) : null}
      <button type="button" onClick={() => reset()} className="app-btn-primary">
        ลองโหลดใหม่
      </button>
    </div>
  );
}
