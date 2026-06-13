export const BRAND_NAME = "เผ็ดหลาย";
export const BRAND_NAME_EN = "PEDLAI";
export const LOGO_PATH = "/logo.jpg";
export const LOGO_WIDTH = 1024;
export const LOGO_HEIGHT = 578;

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function getLogoUrl() {
  return `${getSiteUrl()}${LOGO_PATH}`;
}
