"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

function navLinkClass(active: boolean) {
  return [
    "app-store-nav-link inline-flex min-h-10 items-center justify-center gap-1.5 sm:min-h-11",
    active ? "app-store-nav-link--active" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6.5 4h-2l-1.5 7h12l2-5H7.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CartLink() {
  const pathname = usePathname() ?? "";
  const { itemCount, ready } = useCart();
  const active = pathname === "/cart" || pathname.startsWith("/cart/");

  return (
    <Link
      href="/cart"
      className={navLinkClass(active)}
      title="ตะกร้า"
    >
      <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6" aria-hidden>
        <CartIcon className="h-full w-full" />
      </span>
      <span>ตะกร้า</span>
      {ready && itemCount > 0 ? (
        <span
          className="min-w-[1.25rem] rounded-full bg-[var(--accent)]/15 px-1.5 text-center text-xs font-bold tabular-nums text-[var(--accent)] sm:min-w-[1.5rem] sm:text-sm"
          aria-label={`${itemCount} ชิ้นในตะกร้า`}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
