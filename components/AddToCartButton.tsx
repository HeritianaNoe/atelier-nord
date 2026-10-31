"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { ProductDTO } from "@/lib/types";

export default function AddToCartButton({ product }: { product: ProductDTO }) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(t);
  }, [added]);

  const inCart = items.find((i) => i.id === product.id)?.quantity ?? 0;

  if (product.stock <= 0) {
    return (
      <button type="button" className="btn-ghost btn-sm px-3 py-1.5 text-xs font-medium" disabled>
        Rupture de stock
      </button>
    );
  }

  if (inCart >= product.stock) {
    return (
      <button type="button" className="btn-ghost" disabled>
        Maximum dans le panier
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn ${added ? "btn-ghost !bg-ink !text-paper" : "btn-primary"} btn-sm px-3 py-1.5 text-xs font-medium`}
      onClick={() => {
        add({ id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl, stock: product.stock });
        setAdded(true);
      }}
      aria-live="polite"
    >
      {added ? "Ajouté" : "Ajouter au panier"}
    </button>
  );
}
