import type { Customer } from "@prisma/client";
import type { AppB2BCustomer } from "./types";

function extractPhone(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/0\d[\d\s-]{7,12}\d/);
  return m ? m[0].replace(/[\s-]/g, "") : null;
}

function extractTaxId(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/\d{13}/);
  return m ? m[0] : null;
}

export function splitAddressAndPhone(text: string | null | undefined) {
  if (!text) return { address: "", phone: null as string | null };
  const phoneMatch = text.match(/(?:^|\n)โทร\.\s*(0\d[\d\s-]{7,12}\d)/);
  const phone = phoneMatch
    ? phoneMatch[1].replace(/[\s-]/g, "")
    : extractPhone(text);
  let address = text;
  if (phoneMatch) {
    address = text.replace(/\n?\s*โทร\.\s*0\d[\d\s-]{7,12}\d\s*/, "").trim();
  }
  return { address, phone };
}

export function formatCustomerAddress(address: string, phone: string) {
  const clean = address.trim();
  const tel = phone.trim();
  if (!tel || tel === "-") return clean;
  return `${clean}\nโทร. ${tel}`;
}

export function mapCustomerRow(
  c: Pick<
    Customer,
    | "id"
    | "category"
    | "customerCode"
    | "name"
    | "address"
    | "orderNote"
    | "lastPurchaseNote"
    | "billingInfo"
  >
): AppB2BCustomer {
  const { address, phone } = splitAddressAndPhone(c.address);
  return {
    id: c.id,
    shopName: `${c.category} · ${c.customerCode}`,
    customerName: c.name ?? c.customerCode,
    phone: phone ?? "-",
    email: null,
    address,
    taxId: extractTaxId(c.billingInfo),
    notes: [c.orderNote, c.lastPurchaseNote].filter(Boolean).join("\n") || null,
  };
}

export function parseShopName(shopName: string | undefined) {
  if (!shopName?.includes("·")) return null;
  const [category, customerCode] = shopName.split("·").map((s) => s.trim());
  if (!category || !customerCode) return null;
  return { category, customerCode };
}
