"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function OrderSearchBar({ placeholder = "ค้นหาเลขที่, ชื่อลูกค้า, ร้าน, เบอร์โทร..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  }

  function handleClear() {
    setQ("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="min-w-[220px] flex-1 rounded-xl border border-stone-200 px-4 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
      />
      <button
        type="submit"
        className="rounded-xl bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-900"
      >
        ค้นหา
      </button>
      {searchParams.get("q") && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          ล้าง
        </button>
      )}
    </form>
  );
}
