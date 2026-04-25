"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { clearCartStorage } from "@/lib/cart-storage";

export function AdminSessionBar() {
  const { data: s } = useSession();
  const handleSignOut = () => {
    clearCartStorage();
    signOut({ callbackUrl: "/" });
  };
  if (s?.user?.role !== "ADMIN") {
    return null;
  }
  return (
    <div
      className="relative z-10 border-b border-slate-700/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            aria-hidden
          />
          <p className="min-w-0 text-sm sm:text-base">
            <span className="text-white/70">งานหลังบ้าน</span>{" "}
            <span className="font-medium text-white/95">
              {s.user?.username ?? s.user?.name ?? s.user?.email}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-sky-200/95 transition hover:bg-white/10 sm:px-3"
          >
            กลับร้าน
          </Link>
          <span className="text-white/25" aria-hidden>
            ·
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border-2 border-red-500 bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-md transition hover:border-red-400 hover:bg-red-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-300 sm:px-3"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
