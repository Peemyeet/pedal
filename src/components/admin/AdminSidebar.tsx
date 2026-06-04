"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { cn } from "@/lib/utils";

type SidebarLink = {
  href: string;
  label: string;
  exact?: boolean;
  countKey?: "toShip" | "unpaid";
};

const links: SidebarLink[] = [
  { href: "/admin", label: "แดชบอร์ด", exact: true },
  { href: "/admin/orders/all", label: "ออเดอร์ทั้งหมด" },
  { href: "/admin/orders/to-ship", label: "ที่ต้องจัดส่ง", countKey: "toShip" },
  { href: "/admin/orders/unpaid", label: "ยังไม่ชำระ", countKey: "unpaid" },
  { href: "/admin/orders/web", label: "ออเดอร์เว็บ" },
  { href: "/admin/orders/wholesale", label: "ร้านค้า / ใบเสนอราคา" },
  { href: "/admin/customers", label: "ลูกค้า B2B" },
  { href: "/admin/orders/history", label: "ประวัติออเดอร์" },
  { href: "/admin/products", label: "สต๊อก / สินค้า" },
  { href: "/admin/settings", label: "ตั้งค่าร้าน" },
];

export function AdminSidebar({
  email,
  name,
  orderCounts,
}: {
  email: string;
  name: string;
  orderCounts?: { toShip: number; unpaid: number };
}) {
  const pathname = usePathname();

  function isActive(link: SidebarLink) {
    if (link.exact) return pathname === link.href;
    if (link.href === "/admin/orders/wholesale") {
      return (
        pathname.startsWith("/admin/orders/wholesale") ||
        pathname === "/admin/orders/new"
      );
    }
    if (link.href === "/admin/orders/web") {
      return pathname.startsWith("/admin/orders/web");
    }
    if (link.href === "/admin/orders/history") {
      return pathname.startsWith("/admin/orders/history");
    }
    if (link.href === "/admin/orders/all") {
      return pathname === "/admin/orders/all";
    }
    if (link.href === "/admin/orders/to-ship") {
      return pathname === "/admin/orders/to-ship";
    }
    if (link.href === "/admin/orders/unpaid") {
      return pathname === "/admin/orders/unpaid";
    }
    if (link.href === "/admin/customers") {
      return pathname.startsWith("/admin/customers");
    }
    if (link.href === "/admin/settings") {
      return pathname.startsWith("/admin/settings");
    }
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-5 py-5">
        <Link href="/admin" className="block">
          <p className="text-lg font-bold text-red-600">PEDLAI</p>
          <p className="text-sm text-stone-500">ระบบหลังบ้าน</p>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-base transition",
                    active
                      ? "bg-red-50 font-semibold text-red-700"
                      : "text-stone-700 hover:bg-stone-50"
                  )}
                >
                  <span>{link.label}</span>
                  {link.countKey && orderCounts && orderCounts[link.countKey] > 0 && (
                    <span
                      className={cn(
                        "min-w-[1.5rem] rounded-full px-2 py-0.5 text-center text-xs font-bold",
                        active
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {orderCounts[link.countKey]}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-stone-100 px-5 py-4">
        <p className="text-sm font-medium text-stone-800">{name}</p>
        <p className="mt-0.5 truncate text-sm text-stone-500">{email}</p>
        <div className="mt-4 space-y-2 text-sm">
          <Link
            href="/"
            className="block rounded-lg border border-stone-200 px-4 py-2.5 text-center text-stone-700 hover:bg-stone-50"
          >
            ดูหน้าร้าน
          </Link>
          <AdminLogoutButton variant="sidebar" />
        </div>
      </div>
    </aside>
  );
}
