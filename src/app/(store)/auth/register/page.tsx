"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { registerUser } from "@/lib/register-user";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="flex w-full min-h-[65vh] items-center justify-center px-4 py-4 sm:min-h-[70vh]">
      <form
        className="app-card w-full max-w-md shrink-0 space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          start(async () => {
            const res = await registerUser({
              name,
              username,
              password,
              email: email.trim() || undefined,
            });
            if ("error" in res) {
              setErr(res.error ?? "ลงทะเบียนไม่สำเร็จ");
              return;
            }
            const login = await signIn("credentials", {
              username: username.trim().toLowerCase(),
              password,
              redirect: false,
            });
            if (login?.error) {
              router.push("/auth/login?registered=1");
              return;
            }
            router.push("/");
            router.refresh();
          });
        }}
      >
        <h1 className="app-page-title text-2xl">ลงทะเบียน (ลูกค้า)</h1>
        {err ? (
          <p className="rounded-xl border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-800">{err}</p>
        ) : null}
        <div>
          <label className="app-label">ชื่อ</label>
          <input
            className="mt-2 w-full min-h-12 max-w-md px-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="app-label">ชื่อผู้ใช้</label>
          <input
            type="text"
            className="mt-2 w-full min-h-12 max-w-md px-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            spellCheck={false}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">3–32 ตัว: a–z ตัวเลข _ (จะแปลงเป็นตัวพิมพ์เล็ก)</p>
        </div>
        <div>
          <label className="app-label">อีเมล (ไม่บังคับ)</label>
          <input
            type="email"
            className="mt-2 w-full min-h-12 max-w-md px-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="app-label">รหัสผ่าน (อย่างน้อย 8 ตัว)</label>
          <input
            type="password"
            className="mt-2 w-full min-h-12 max-w-md px-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={pending} className="app-btn-primary disabled:opacity-60">
            {pending ? "กำลังบันทึก…" : "ลงทะเบียน"}
          </button>
          <Link className="text-sm font-medium text-[var(--accent)] hover:underline" href="/auth/login">
            มีบัญชีแล้ว
          </Link>
        </div>
      </form>
    </div>
  );
}
