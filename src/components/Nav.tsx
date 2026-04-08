"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { NAV_LINKS } from "@/lib/nav-links";

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

export function Nav() {
  const pathname = usePathname() ?? "";

  const navLinkClass = (active: boolean) =>
    active
      ? "app-nav-link-active shrink-0 rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 sm:px-4 sm:py-2.5 sm:text-base md:text-lg"
      : "shrink-0 rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--accent)] sm:px-4 sm:py-2.5 sm:text-base md:text-lg";

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
          className="-mx-1 flex min-h-[2.75rem] min-w-0 gap-2 overflow-x-auto overflow-y-hidden px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
          aria-label="เมนูหลัก"
        >
          {NAV_LINKS.map((l) => {
            const active = navLinkActive(pathname, l.href);
            return (
              <Link key={l.href} href={l.href} className={navLinkClass(active)}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
