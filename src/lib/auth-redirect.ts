import type { UserRole } from "@prisma/client";

/** แปลง callbackUrl จาก query ให้เป็น path ภายในเว็บเท่านั้น */
export function resolveCallbackUrl(raw: string | null, origin?: string): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      const u = new URL(value);
      const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
      if (base && u.origin !== base) return null;
      return `${u.pathname}${u.search}`;
    }
    return value.startsWith("/") ? value : null;
  } catch {
    return null;
  }
}

export function defaultPathForRole(role: UserRole | undefined): string {
  if (role === "ADMIN") return "/products";
  return "/shop";
}

export function resolvePostLoginPath(
  callbackUrl: string | null,
  role: UserRole | undefined,
  origin?: string,
): string {
  return resolveCallbackUrl(callbackUrl, origin) ?? defaultPathForRole(role);
}
