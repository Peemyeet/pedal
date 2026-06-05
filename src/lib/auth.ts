import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "pedlai_admin_session";

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(adminId: string, loginId: string) {
  const token = await new SignJWT({ sub: adminId, email: loginId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ adminId: string; email: string } | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { adminId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findFirst({
    where: { id: session.adminId, role: "ADMIN" },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? user.username,
    name: user.name,
  };
}

/** เข้าสู่ระบบด้วย username หรืออีเมลจากตาราง User (ระบบเก่า) */
export async function verifyAdminLogin(
  login: string,
  password: string
): Promise<AdminSessionUser | null> {
  const normalized = login.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      OR: [
        { username: { equals: normalized, mode: "insensitive" } },
        { email: { equals: normalized, mode: "insensitive" } },
      ],
    },
  });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  return {
    id: user.id,
    email: user.email ?? user.username,
    name: user.name,
  };
}
