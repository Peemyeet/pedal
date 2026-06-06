import "server-only";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SHOP_SETTINGS,
  type ShopSettingsData,
} from "@/lib/shop-settings-data";

export type { ShopSettingsData } from "@/lib/shop-settings-data";
export { DEFAULT_SHOP_SETTINGS } from "@/lib/shop-settings-data";

function parsePhones(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((p): p is string => typeof p === "string");
    }
  } catch {
    /* use default */
  }
  return DEFAULT_SHOP_SETTINGS.phones;
}

export async function getShopSettings(): Promise<ShopSettingsData> {
  const row = await prisma.shopSettings.findUnique({ where: { id: "default" } });
  if (!row) {
    await prisma.shopSettings.create({
      data: {
        id: "default",
        shortName: DEFAULT_SHOP_SETTINGS.shortName,
        nameTh: DEFAULT_SHOP_SETTINGS.nameTh,
        nameEn: DEFAULT_SHOP_SETTINGS.nameEn,
      },
    });
    return DEFAULT_SHOP_SETTINGS;
  }

  return {
    shortName: row.shortName,
    nameTh: row.nameTh,
    nameEn: row.nameEn,
    address: row.address,
    addressEn: row.addressEn,
    taxId: row.taxId,
    phones: parsePhones(row.phonesJson),
    fax: row.fax,
    email: row.email,
    website: row.website,
    logoInitials: row.logoInitials,
    quotationNote: row.quotationNote,
  };
}

export async function updateShopSettings(data: ShopSettingsData) {
  return prisma.shopSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      shortName: data.shortName,
      nameTh: data.nameTh,
      nameEn: data.nameEn,
      address: data.address,
      addressEn: data.addressEn,
      taxId: data.taxId,
      phonesJson: JSON.stringify(data.phones),
      fax: data.fax,
      email: data.email,
      website: data.website,
      logoInitials: data.logoInitials,
      quotationNote: data.quotationNote,
    },
    update: {
      shortName: data.shortName,
      nameTh: data.nameTh,
      nameEn: data.nameEn,
      address: data.address,
      addressEn: data.addressEn,
      taxId: data.taxId,
      phonesJson: JSON.stringify(data.phones),
      fax: data.fax,
      email: data.email,
      website: data.website,
      logoInitials: data.logoInitials,
      quotationNote: data.quotationNote,
    },
  });
}

/** @deprecated use getShopSettings() — kept for static fallbacks */
export const RECEIPT_COMPANY = DEFAULT_SHOP_SETTINGS;
