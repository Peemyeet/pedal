"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminNavigationProgress } from "./AdminNavigationProgress";
import { AdminSidebar } from "./AdminSidebar";
import { cn } from "@/lib/utils";

export function AdminShell({
  email,
  name,
  orderCounts,
  children,
}: {
  email: string;
  name: string;
  orderCounts?: { toShip: number; unpaid: number };
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-stone-100">
      <Suspense fallback={null}>
        <AdminNavigationProgress />
      </Suspense>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar email={email} name={name} orderCounts={orderCounts} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-stone-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700"
            aria-label="เปิดเมนู"
          >
            เมนู
          </button>
          <span className="font-bold text-red-600">PEDLAI Admin</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
