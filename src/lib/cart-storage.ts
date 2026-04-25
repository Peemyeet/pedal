/** ตะกร้าใน localStorage (ฝั่ง client เท่านั้น) */

export const CART_STORAGE_KEY = "pedlai-cart-v1";
export const LAST_ORDER_NUMBER_KEY = "pedlai-last-order-no";
export const CHECKOUT_ADDRESS_KEY = "pedlai-checkout-address-v1";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  sku: string | null;
  stock: number;
  quantity: number;
};

function isCartItem(x: unknown): x is CartItem {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    (o.sku === null || typeof o.sku === "string") &&
    typeof o.stock === "number" &&
    typeof o.quantity === "number"
  );
}

export function loadCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota / private mode
  }
}

export function clearCartStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(LAST_ORDER_NUMBER_KEY);
  } catch {
    // ignore
  }
}

export function saveLastOrderNumber(orderNumber: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_ORDER_NUMBER_KEY, String(orderNumber));
  } catch {
    // ignore
  }
}

export function loadLastOrderNumber(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_ORDER_NUMBER_KEY);
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1) return null;
    return Math.floor(n);
  } catch {
    return null;
  }
}

export type SavedCheckoutAddress = {
  shippingName: string;
  shippingAddress: string;
  shippingPostalCode: string;
  shippingPhone: string;
};

function isSavedCheckoutAddress(x: unknown): x is SavedCheckoutAddress {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.shippingName === "string" &&
    typeof o.shippingAddress === "string" &&
    typeof o.shippingPostalCode === "string" &&
    typeof o.shippingPhone === "string"
  );
}

export function saveCheckoutAddress(address: SavedCheckoutAddress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_ADDRESS_KEY, JSON.stringify(address));
  } catch {
    // ignore quota / private mode
  }
}

export function loadCheckoutAddress(): SavedCheckoutAddress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_ADDRESS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSavedCheckoutAddress(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
