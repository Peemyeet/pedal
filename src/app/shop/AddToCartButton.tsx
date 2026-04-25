"use client";

import { useState } from "react";
import { useCart, type ProductForCart } from "@/components/CartProvider";

type Props = {
  product: ProductForCart;
};

export function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();
  const [nudge, setNudge] = useState(false);

  if (product.stock < 1) {
    return (
      <p className="text-sm font-medium text-amber-800">สินค้าหมด</p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => {
          addToCart(product, 1);
          setNudge(true);
          window.setTimeout(() => setNudge(false), 2000);
        }}
        className="app-btn-primary w-full min-h-12 py-2.5 text-sm font-semibold sm:w-auto"
      >
        เพิ่มลงตะกร้า
      </button>
      {nudge ? (
        <span className="text-sm font-medium text-[var(--accent)]">เพิ่มในตะกร้าแล้ว</span>
      ) : null}
    </div>
  );
}
