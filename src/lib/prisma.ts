import "server-only";
import { PrismaClient } from "@prisma/client";

/** Bump when schema changes so dev server picks up a new client after `prisma generate`. */
const PRISMA_CLIENT_VERSION = "6-postgres-neon";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaVersion?: string;
};

function withPoolLimits(url: string) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("connection_limit")) {
    parsed.searchParams.set(
      "connection_limit",
      process.env.NODE_ENV === "production" ? "10" : "8"
    );
  }
  if (!parsed.searchParams.has("pool_timeout")) {
    parsed.searchParams.set("pool_timeout", "30");
  }
  if (!parsed.searchParams.has("connect_timeout")) {
    parsed.searchParams.set("connect_timeout", "15");
  }
  return parsed.toString();
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url
      ? {
          datasources: {
            db: { url: withPoolLimits(url) },
          },
        }
      : {}),
  });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
