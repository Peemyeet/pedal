"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useEffect, useState, useTransition } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const callback = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    const remembered = window.localStorage.getItem("remembered-username");
    if (remembered) {
      setUsername(remembered);
      setRemember(true);
    }
  }, []);

  return (
    <form
      className="app-card w-full max-w-md shrink-0 space-y-4 p-6"
      autoComplete="on"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        start(async () => {
          const normalized = username.trim().toLowerCase();
          if (remember && normalized) {
            window.localStorage.setItem("remembered-username", normalized);
          } else {
            window.localStorage.removeItem("remembered-username");
          }
          const res = await signIn("credentials", {
            username: normalized,
            password,
            redirect: false,
          });
          if (res?.error) {
            setErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
            return;
          }
          router.push(callback);
          router.refresh();
        });
      }}
    >
      <h1 className="app-page-title text-2xl">เข้าสู่ระบบ</h1>
      <p className="text-sm text-[var(--muted)]">ก่อนไปหน้าชำระเงิน ต้องเข้าสู่ระบบ</p>
      {err ? (
        <p className="rounded-xl border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-800">{err}</p>
      ) : null}
      <div>
        <label className="app-label">ชื่อผู้ใช้</label>
        <input
          type="text"
          name="username"
          className="mt-2 w-full min-h-12 max-w-md px-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          spellCheck={false}
        />
      </div>
      <div>
        <label className="app-label">รหัสผ่าน</label>
        <input
          type="password"
          name="password"
          className="mt-2 w-full min-h-12 max-w-md px-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
        />
        จำชื่อผู้ใช้ในเครื่องนี้
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="app-btn-primary disabled:opacity-60">
          {pending ? "กำลังเข้า…" : "เข้าสู่ระบบ"}
        </button>
        <Link className="text-sm font-medium text-[var(--accent)] hover:underline" href="/auth/register">
          ลงทะเบียน
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex w-full min-h-[65vh] items-center justify-center px-4 py-4 sm:min-h-[70vh]">
      <Suspense fallback={<p className="text-[var(--muted)]">กำลังโหลด…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
