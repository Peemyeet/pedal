import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "pedlai_admin_session";

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const isAdmin = pathname.startsWith("/admin");

  if (!isAdmin) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const loggedIn = await hasValidSession(request);

  if (isLogin) {
    const response = NextResponse.next();
    if (token) {
      return clearSessionCookie(response);
    }
    return response;
  }

  if (!loggedIn) {
    return clearSessionCookie(
      NextResponse.redirect(new URL("/admin/login", request.url))
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
