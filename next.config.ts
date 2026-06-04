import type { NextConfig } from "next";

function hasDatabaseConnectionEnv(): boolean {
  return !!(
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.NEON_DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim()
  );
}

/**
 * บน Vercel ถ้าไม่มี URL ฐานข้อมูล (โดยตรงหรือจาก Storage) การ build จะล้มทันที
 */
if (process.env.VERCEL === "1" && !hasDatabaseConnectionEnv()) {
  throw new Error(
    "[pedlai] No database URL on Vercel. Add DATABASE_URL in Environment Variables, or connect Vercel Postgres/Neon (POSTGRES_PRISMA_URL / NEON_DATABASE_URL). Enable for Production (+ Preview). Then redeploy.",
  );
}

const nextConfig: NextConfig = {};

export default nextConfig;
