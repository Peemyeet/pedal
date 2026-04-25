import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

/**
 * ฝั่ง API / Server — ใช้ Prisma + bcrypt แบบ dynamic import ใน authorize เท่านั้น
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "ชื่อผู้ใช้" },
        password: { label: "รหัสผ่าน" },
      },
      async authorize(cred) {
        const { prisma } = await import("@/lib/prisma");
        const bcrypt = await import("bcryptjs");
        const username = (cred?.username as string | undefined)?.trim().toLowerCase() ?? "";
        const password = cred?.password as string | undefined;
        if (!username || !password) return null;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
});
