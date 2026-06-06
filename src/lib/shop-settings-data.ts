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
