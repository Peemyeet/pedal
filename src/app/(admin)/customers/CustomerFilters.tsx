"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  category: string;
  q: string;
  categories: string[];
};

export function CustomerFilters({ category, q, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(nextCategory: string, nextQ: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory) params.set("category", nextCategory);
    else params.delete("category");

    if (nextQ) params.set("q", nextQ);
    else params.delete("q");

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form className="app-card flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5 sm:p-8">
      <div className="w-full sm:w-auto">
        <label className="app-label">กลุ่ม</label>
        <select
          name="category"
          defaultValue={category}
          onChange={(e) => updateParams(e.target.value, q)}
          className="mt-2 min-h-12 w-full min-w-0 px-3 text-base sm:min-w-[10rem] sm:w-auto"
        >
          <option value="">ทั้งหมด</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0 flex-1 sm:min-w-[200px]">
        <label className="app-label">ค้นหา (ชื่อ / รหัส / ที่อยู่)</label>
        <input
          name="q"
          defaultValue={q}
          placeholder="เช่น S01 หรือ เสาวรีย์"
          className="mt-2 min-h-12 w-full px-4 text-base"
        />
      </div>

      <button type="submit" className="app-btn-primary min-h-12 shrink-0">
        ค้นหา
      </button>
    </form>
  );
}
