"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type CartItem, loadCartItems, saveCartItems } from "@/lib/cart-storage";
import { shippingFeeForUnitQuantity } from "@/lib/shipping-tiers";

export type ProductForCart = {
  id: string;
  name: string;
  price: number;
  sku: string | null;
  stock: number;
};

type CartToast = {
  id: number;
  kind: "ok" | "warn";
  message: string;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  itemCount: number;
  subtotal: number;
  shippingTotal: number;
  grandTotal: number;
  addToCart: (product: ProductForCart, quantity?: number) => number;
  pushToast: (kind: "ok" | "warn", message: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function mergeItem(
  prev: CartItem[],
  product: ProductForCart,
  addQty: number,
): CartItem[] {
  const cap = (q: number) => Math.max(0, Math.min(q, product.stock));
  const nextQty = (existing: number) => cap(existing + addQty);
  const i = prev.findIndex((x) => x.productId === product.id);
  if (i < 0) {
    const q = cap(addQty);
    if (q < 1) return prev;
    return [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        sku: product.sku,
        stock: product.stock,
        quantity: q,
      },
    ];
  }
  const copy = [...prev];
  const row = copy[i]!;
  const q = nextQty(row.quantity);
  if (q < 1) {
    copy.splice(i, 1);
    return copy;
  }
  copy[i] = {
    ...row,
    name: product.name,
    price: product.price,
    sku: product.sku,
    stock: product.stock,
    quantity: q,
  };
  return copy;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<CartToast[]>([]);

  useEffect(() => {
    setItems(loadCartItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveCartItems(items);
  }, [items, ready]);

  const addToCart = useCallback((product: ProductForCart, quantity = 1) => {
    if (product.stock < 1) return 0;
    const add = Math.max(1, Math.floor(quantity) || 1);
    let added = 0;
    setItems((prev) => {
      const row = prev.find((x) => x.productId === product.id);
      const existing = row?.quantity ?? 0;
      const next = Math.min(product.stock, existing + add);
      added = Math.max(0, next - existing);
      return mergeItem(prev, product, add);
    });
    return added;
  }, []);

  const pushToast = useCallback((kind: "ok" | "warn", message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === productId);
      if (i < 0) return prev;
      const row = prev[i]!;
      const q = Math.max(0, Math.min(Math.floor(quantity) || 0, row.stock));
      if (q < 1) {
        const next = [...prev];
        next.splice(i, 1);
        return next;
      }
      const next = [...prev];
      next[i] = { ...row, quantity: q };
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const { itemCount, subtotal, shippingTotal, grandTotal } = useMemo(() => {
    let count = 0;
    let sub = 0;
    let ship = 0;
    for (const row of items) {
      count += row.quantity;
      sub += row.price * row.quantity;
      ship += shippingFeeForUnitQuantity(row.quantity);
    }
    return {
      itemCount: count,
      subtotal: sub,
      shippingTotal: ship,
      grandTotal: sub + ship,
    };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      itemCount,
      subtotal,
      shippingTotal,
      grandTotal,
      addToCart,
      pushToast,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      ready,
      itemCount,
      subtotal,
      shippingTotal,
      grandTotal,
      addToCart,
      pushToast,
      setQuantity,
      removeItem,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 top-24 z-[70] flex w-[min(92vw,26rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-2xl border-2 border-black bg-white px-4 py-3.5 text-sm text-black shadow-2xl ring-1 ring-black/40 backdrop-blur-md transition-all duration-200 ease-out sm:text-base"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-base leading-none sm:text-lg" aria-hidden>
                🛒
              </span>
              <p className="font-semibold leading-relaxed">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
