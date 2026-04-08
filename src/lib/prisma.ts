import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/**
 * Prisma อ่านแค่ DATABASE_URL จาก schema — บน Vercel ถ้าเชื่อม Postgres/Neon ผ่านแดชบอร์ด
 * บางทีจะได้ POSTGRES_PRISMA_URL / NEON_DATABASE_URL แทน จึงคัดลอกมาใส่ DATABASE_URL ก่อนสร้าง client
 */
function ensureDatabaseUrl(): void {
  if (process.env.DATABASE_URL?.trim()) return;
  const fromHost =
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.NEON_DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim();
  if (fromHost) {
    process.env.DATABASE_URL = fromHost;
  }
}

function getClient(): PrismaClient {
  ensureDatabaseUrl();
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error(
      "Missing database URL. Set DATABASE_URL in .env locally, or on Vercel: Environment Variables — or connect Vercel Postgres/Neon so POSTGRES_PRISMA_URL / NEON_DATABASE_URL exists.",
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
