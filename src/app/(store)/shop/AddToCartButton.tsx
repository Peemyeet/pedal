"use client";

import { useCart, type ProductForCart } from "@/components/CartProvider";

type Props = {
  product: ProductForCart;
};

export function AddToCartButton({ product }: Props) {
  const { addToCart, pushToast } = useCart();

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
          const added = addToCart(product, 1);
          if (added > 0) {
            pushToast("ok", `เพิ่ม ${product.name} จำนวน ${added} ชิ้นลงตะกร้าแล้ว`);
            return;
          }
          pushToast("warn", `${product.name} เต็มจำนวนในตะกร้าแล้ว`);
        }}
        className="app-btn-primary w-full min-h-12 py-2.5 text-sm font-semibold sm:w-auto"
      >
        เพิ่มลงตะกร้า
      </button>
    </div>
  );
}
