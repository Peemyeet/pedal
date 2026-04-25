"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CartLink } from "@/components/CartLink";
import { BRAND } from "@/lib/brand";
import { MAIN_NAV_LINKS, SETTINGS_NAV_LINKS } from "@/lib/nav-links";

function navLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/quotations/fulfillment") {
    return (
      pathname === "/quotations/fulfillment" ||
      pathname.startsWith("/quotations/fulfillment/")
    );
  }
  if (href === "/quotations/quoted") {
    if (pathname === "/quotations/quoted") return true;
    if (
      pathname.startsWith("/quotations/") &&
      !pathname.startsWith("/quotations/fulfillment")
    ) {
      return true;
    }
    return false;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function settingsNavActive(pathname: string): boolean {
  return SETTINGS_NAV_LINKS.some(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`),
  );
}

function SettingsGearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  const navLinkClass = (active: boolean) =>
    active
      ? "app-nav-link-active shrink-0 rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 sm:px-4 sm:py-2.5 sm:text-base md:text-lg"
      : "shrink-0 rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--accent)] sm:px-4 sm:py-2.5 sm:text-base md:text-lg";

  const settingsActive = settingsNavActive(pathname);

  const settingsItemClass = (active: boolean) =>
    active
      ? "block rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700"
      : "block rounded-xl px-4 py-3 text-base font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--accent)]";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] shadow-[var(--shadow-sm)] backdrop-blur-md print:hidden">
      <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-4 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-4 sm:py-4 lg:max-w-7xl lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-[var(--foreground)] no-underline transition-opacity hover:opacity-90 sm:gap-3.5"
        >
          <Image
            src="/branding/logo.png"
            alt={BRAND.name}
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 rounded-xl object-contain shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]/60 sm:h-14 sm:w-14"
            priority
          />
          <span className="min-w-0 text-left leading-snug">
            <span className="block truncate text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
              {BRAND.shortName}
            </span>
            <span className="mt-0.5 block line-clamp-2 text-xs font-medium text-[var(--muted)] sm:text-sm md:text-base">
              {BRAND.tagline}
            </span>
          </span>
        </Link>
        <nav
          className="-mx-1 flex min-h-[2.75rem] min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
          aria-label="เมนูหลัก"
        >
          {MAIN_NAV_LINKS.map((l) => {
            const active = navLinkActive(pathname, l.href);
            return (
              <Link key={l.href} href={l.href} className={navLinkClass(active)}>
                {l.label}
              </Link>
            );
          })}

          <CartLink />

          <div className="relative shrink-0" ref={wrapRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className={
                settingsActive
                  ? "app-nav-link-active flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700 sm:h-14 sm:w-14"
                  : "flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--accent)] sm:h-14 sm:w-14"
              }
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="ตั้งค่า — ลูกค้าและคลังสินค้า"
            >
              <SettingsGearIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>

            {menuOpen ? (
              <div
                className="absolute right-0 top-full z-[60] mt-2 min-w-[13rem] rounded-2xl border border-[var(--border)] bg-[var(--card)] py-2 shadow-[var(--shadow-card)]"
                role="menu"
                aria-label="เมนูตั้งค่า"
              >
                <p className="border-b border-[var(--border)] px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  จัดการข้อมูล
                </p>
                <div className="flex flex-col gap-0.5 p-1">
                  {SETTINGS_NAV_LINKS.map((l) => {
                    const active = navLinkActive(pathname, l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        role="menuitem"
                        className={settingsItemClass(active)}
                        onClick={closeMenu}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
