const PLACEHOLDER_SECRETS = new Set([
  "change-me-to-a-long-random-string",
  "your-secret-here",
  "secret",
]);

/** Auth.js / NextAuth — รองรับ AUTH_SECRET (v5) และ NEXTAUTH_SECRET (v4) */
export function getAuthSecret(): string | undefined {
  const value = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (!value || PLACEHOLDER_SECRETS.has(value)) return undefined;
  return value;
}
