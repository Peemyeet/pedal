/** ตะกร้าใน localStorage (ฝั่ง client เท่านั้น) */

export const CART_STORAGE_KEY = "pedlai-cart-v1";

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
  } catch {
    // ignore
  }
}
