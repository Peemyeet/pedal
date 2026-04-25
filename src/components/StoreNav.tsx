"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { CartLink } from "@/components/CartLink";
import { BRAND } from "@/lib/brand";
import { clearCartStorage } from "@/lib/cart-storage";

function storeLinkClass(active: boolean) {
  return ["app-store-nav-link sm:min-h-11", active ? "app-store-nav-link--active" : null]
    .filter(Boolean)
    .join(" ");
}

const signOutButtonClass =
  "inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border-2 border-red-600 bg-red-600 px-3.5 text-sm font-semibold text-white shadow-md transition hover:border-red-700 hover:bg-red-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-500/80 sm:min-h-11 sm:px-4 sm:text-base";

export function StoreNav() {
  const pathname = usePathname() ?? "";
  const { data: session, status } = useSession();
  const [unpaidOrderCount, setUnpaidOrderCount] = useState(0);
  const isAdmin = session?.user?.role === "ADMIN";
  const showGreeting = pathname !== "/shop" && !pathname.startsWith("/shop/");
  const greetingName = session?.user?.username ?? session?.user?.name;
  const handleSignOut = () => {
    clearCartStorage();
    signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    if (!session || isAdmin) {
      setUnpaidOrderCount(0);
      return;
    }
    const ctl = new AbortController();
    fetch("/api/my/orders/unpaid-count", {
      method: "GET",
      cache: "no-store",
      signal: ctl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ count: 0 })))
      .then((d: { count?: number }) => {
        setUnpaidOrderCount(Math.max(0, d.count ?? 0));
      })
      .catch(() => {
        setUnpaidOrderCount(0);
      });
    return () => ctl.abort();
  }, [session, isAdmin, pathname]);

  return (
    <header className="sticky top-0 z-50 print:hidden">
      <div className="mx-auto max-w-6xl px-2 pt-2 sm:px-4 sm:pt-3 lg:max-w-7xl">
        <div
          className="rounded-2xl border border-white/70 bg-[var(--nav-glass)] shadow-[var(--shadow-elevate)] ring-1 ring-stone-900/5 backdrop-blur-xl"
          style={{ boxShadow: "0 4px 24px rgba(15, 23, 42, 0.05), 0 1px 0 rgba(255,255,255,0.8) inset" }}
        >
          <div className="flex min-w-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3.5">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-2.5 text-[var(--foreground)] no-underline sm:gap-3"
            >
              <span className="relative shrink-0">
                <span
                  className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-white to-stone-100/80 shadow-sm ring-1 ring-stone-200/80"
                  aria-hidden
                />
                <Image
                  src="/branding/logo.png"
                  alt={BRAND.name}
                  width={56}
                  height={56}
                  className="relative h-12 w-12 rounded-xl object-contain sm:h-[3.15rem] sm:w-[3.15rem]"
                  priority
                />
              </span>
              <span className="min-w-0 text-left leading-tight">
                <span className="block truncate text-base font-bold tracking-tight sm:text-lg md:text-xl">
                  {BRAND.shortName}
                </span>
                <span className="mt-0.5 block line-clamp-1 text-xs font-medium text-[var(--muted)] sm:text-sm">
                  ร้านออนไลน์ · สั่งง่าย ส่งตรง
                </span>
              </span>
            </Link>
            <nav
              className="flex min-h-10 min-w-0 items-center gap-1 overflow-x-auto overflow-y-hidden py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-end sm:gap-1.5 sm:py-0 [&::-webkit-scrollbar]:hidden"
              aria-label="เมนูร้าน"
            >
              {status !== "loading" && greetingName && showGreeting ? (
                <span className="mr-1 shrink-0 rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-sm font-medium text-[var(--foreground)] sm:text-base">
                  สวัสดี {greetingName}
                </span>
              ) : null}
              {status === "loading" ? (
                <span className="px-2 text-sm text-[var(--muted)]">…</span>
              ) : isAdmin ? (
                <>
                  <Link className={storeLinkClass(pathname === "/")} href="/">
                    หน้าร้าน
                  </Link>
                  <Link
                    className="app-store-nav-link--active inline-flex min-h-10 items-center justify-center gap-1 rounded-full border border-[var(--accent)]/25 bg-gradient-to-b from-white to-slate-50/90 px-3.5 text-sm font-semibold text-[var(--accent)] shadow-sm sm:min-h-11 sm:text-base"
                    href="/products"
                  >
                    หลังบ้าน
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={signOutButtonClass}
                  >
                    ออก
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className={storeLinkClass(pathname === "/shop" || pathname.startsWith("/shop/"))}
                    href="/shop"
                  >
                    ร้าน
                  </Link>
                  <CartLink />
                  <Link
                    className={storeLinkClass(
                      pathname === "/checkout" || pathname.startsWith("/checkout/"),
                    )}
                    href="/checkout"
                  >
                    ยืนยันคำสั่งซื้อ
                  </Link>
                  {session ? (
                    <>
                      <Link
                        className={storeLinkClass(
                          pathname === "/account/orders" || pathname.startsWith("/account/"),
                        )}
                        href="/account/orders"
                      >
                        ออเดอร์
                        {unpaidOrderCount > 0 ? (
                          <span
                            className="ml-1 inline-flex min-w-[1.3rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white sm:text-sm"
                            aria-label={`${unpaidOrderCount} ออเดอร์ที่ยังไม่ได้ชำระเงิน`}
                            title={`${unpaidOrderCount} ออเดอร์ที่ยังไม่ได้ชำระเงิน`}
                          >
                            {unpaidOrderCount > 99 ? "99+" : unpaidOrderCount}
                          </span>
                        ) : null}
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className={signOutButtonClass}
                      >
                        ออก
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        className={storeLinkClass(
                          pathname === "/auth/login" || pathname.startsWith("/auth/login"),
                        )}
                        href="/auth/login"
                      >
                        เข้าสู่ระบบ
                      </Link>
                      <Link
                        className={storeLinkClass(
                          pathname === "/auth/register" || pathname.startsWith("/auth/register"),
                        )}
                        href="/auth/register"
                      >
                        ลงทะเบียน
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
