"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string;
};

export function AddToCartButton({
  product,
  disabled,
  compact,
}: {
  product: Product;
  disabled?: boolean;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={
        compact
          ? "rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          : "w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300"
      }
    >
      {disabled ? "หมด" : added ? "เพิ่มแล้ว ✓" : "ใส่ตะกร้า"}
    </button>
  );
}
