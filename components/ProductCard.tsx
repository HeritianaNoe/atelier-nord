import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { stockLevel } from "@/lib/stock";
import { formatPrice } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";

export default function ProductCard({ product }: { product: ProductDTO }) {
  const level = stockLevel(product.stock);
  return (
    <article className="group flex flex-col rounded-lg border border-mist bg-white p-1 shadow-xs transition-all hover:shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded bg-mist">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={level === "out" ? "object-cover opacity-50" : "object-cover transition-transform duration-300 group-hover:scale-105"}
        />
        {level === "out" && (
          <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium text-paper z-10">
            Rupture de stock
          </span>
        )}
        {level === "low" && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-medium text-white shadow-xs z-10">
            Plus que {product.stock} en stock
          </span>
        )}
      </div>
      <div className="mt-2.5 px-1 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-semibold leading-tight">{product.title}</h3>
      </div>
      <p className="mt-0.5 px-1 text-xs text-slate">{product.categoryName}</p>
      <div className="mt-3 px-1 flex items-center justify-between gap-2">
        <p className="shrink-0 font-semibold text-base">{formatPrice(product.price)}</p>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}