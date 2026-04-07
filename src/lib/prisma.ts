import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Missing DATABASE_URL. Copy .env.example to .env locally, or set DATABASE_URL in your host (e.g. Vercel → Project → Settings → Environment Variables).",
    );
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

/** Lazy proxy so importing this module does not require DATABASE_URL until first query (helps next build when pages are dynamic). */
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop as keyof PrismaClient);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
