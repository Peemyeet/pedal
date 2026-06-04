import { PrismaClient } from "@prisma/client";

/** Bump when schema changes so dev server picks up a new client after `prisma generate`. */
const PRISMA_CLIENT_VERSION = "6-postgres-neon";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaVersion?: string;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaVersion !== PRISMA_CLIENT_VERSION
  ) {
    void globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
