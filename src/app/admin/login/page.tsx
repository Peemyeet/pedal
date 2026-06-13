"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 25_000);

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        signal: controller.signal,
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      window.clearTimeout(timeoutId);

      if (!res.ok) {
        let message = "เข้าสู่ระบบไม่สำเร็จ";
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          message = `เข้าสู่ระบบไม่สำเร็จ (HTTP ${res.status})`;
        }
        setError(message);
        return;
      }

      window.location.assign("/admin");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(
          "เชื่อมต่อเซิร์ฟเวอร์ช้าเกินไป — ตรวจ DATABASE_URL บน Vercel ว่าใช้ Neon pooler"
        );
      } else {
        setError("เข้าสู่ระบบไม่สำเร็จ — ลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Link href="/" className="text-sm text-red-600 hover:underline">
          ← กลับหน้าร้าน
        </Link>
        <div className="flex justify-center">
          <BrandLogo height={52} className="max-w-[220px]" />
        </div>
        <h1 className="mt-4 text-center text-xl font-bold text-stone-900">
          ระบบหลังบ้าน
        </h1>
        <p className="mt-1 text-sm text-stone-500">เข้าสู่ระบบหลังบ้าน</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              ชื่อผู้ใช้
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              autoComplete="username"
              defaultValue="pedlai"
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="password">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
