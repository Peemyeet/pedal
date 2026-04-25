import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    username: string;
  }
  interface Session {
    user: {
      id: string;
      role: UserRole;
      username?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: import("@prisma/client").UserRole;
    username?: string;
  }
}
