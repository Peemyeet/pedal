import Image from "next/image";
import Link from "next/link";
import { formatPrice, heatLabel, CATEGORY_LABEL } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  heatLevel: number;
};

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-red-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white">
            สินค้าหมด
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </span>
          <span className="text-sm" title={`ความเผ็ด ${product.heatLevel}/5`}>
            {heatLabel(product.heatLevel)}
          </span>
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 font-semibold text-stone-900 transition group-hover:text-red-700">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-stone-500">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-red-700">{formatPrice(product.price)}</p>
          <AddToCartButton product={product} disabled={outOfStock} compact />
        </div>
      </div>
    </article>
  );
}
