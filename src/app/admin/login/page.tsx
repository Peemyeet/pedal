"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Link href="/" className="text-sm text-red-600 hover:underline">
          ← กลับหน้าร้าน
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">
          PEDLAI Admin
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
