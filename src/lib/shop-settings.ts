import { prisma } from "@/lib/prisma";

export type ShopSettingsData = {
  shortName: string;
  nameTh: string;
  nameEn: string;
  address: string;
  addressEn: string;
  taxId: string;
  phones: string[];
  fax: string;
  email: string;
  website: string;
  logoInitials: string;
  quotationNote: string;
};

export const DEFAULT_SHOP_SETTINGS: ShopSettingsData = {
  shortName: "เผ็ดหลาย",
  nameTh: "เผ็ดหลาย",
  nameEn: "PEDLAI",
  address: "เลขที่ 576 หมู่ที่ 1 ต.วัฒนานคร อ.วัฒนานคร จ.สระแก้ว 27160",
  addressEn: "576 Moo 1, Wattananakorn, Wattananakorn, Sa Kaeo 27160",
  taxId: "",
  phones: ["094-428-9199"],
  fax: "",
  email: "",
  website: "",
  logoInitials: "PHL",
  quotationNote: "",
};

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
