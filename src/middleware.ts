import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { getAuthSecret } from "@/lib/auth-secret";
import { NextResponse, type NextRequest } from "next/server";

const authSecret = getAuthSecret();
const { auth } = NextAuth({ ...authConfig, secret: authSecret, providers: [] });

function isBackofficePath(pathname: string) {
  if (pathname === "/api/health" || pathname.startsWith("/api/auth/")) {
    return false;
  }
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return false;
  }
  const backoffice = ["/products", "/customers", "/quotations", "/sales", "/orders"] as const;
  for (const p of backoffice) {
    if (pathname === p) return true;
    if (pathname.startsWith(`${p}/`)) return true;
  }
  return false;
}

const authMiddleware = auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLogged = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname === "/checkout" || pathname.startsWith("/account")) {
    if (!isLogged) {
      const url = new URL("/auth/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isBackofficePath(pathname)) {
    if (!isLogged) {
      const url = new URL("/auth/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export default authSecret
  ? authMiddleware
  : (_req: NextRequest) => NextResponse.next();

export const config = {
  matcher: ["/((?!_next|[^/]+\\.\\w+).*)"],
};
