"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton({
  variant = "inline",
}: {
  variant?: "inline" | "sidebar";
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={logout}
        className="w-full rounded-lg px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
      >
        ออกจากระบบ
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="text-red-600 hover:text-red-700"
    >
      ออกจากระบบ
    </button>
  );
}
