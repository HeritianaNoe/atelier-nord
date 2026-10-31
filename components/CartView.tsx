"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder, type CheckoutResult } from "@/app/(shop)/cart/actions";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";

export default function CartView() {
  const { items, total, setQuantity, remove, clear } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Extract<CheckoutResult, { ok: false }> | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line p-12 text-center">
        <p className="font-semibold">Votre panier est vide</p>
        <p className="mt-1 text-sm text-slate">Ajoutez des produits depuis la boutique.</p>
        <Link href="/shop" className="btn-primary mt-5">
          Aller à la boutique
        </Link>
      </div>
    );
  }

  const fieldError = (key: "name" | "email" | "phone") =>
    result?.fieldErrors?.[key]?.[0] ? (
      <p role="alert" className="mt-1 text-sm font-medium text-danger">{result.fieldErrors[key]![0]}</p>
    ) : null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await placeOrder({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      if (res.ok) {
        clear();
        router.push(`/cart/confirmation?n=${res.number}`);
      } else {
        setResult(res);
      }
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => {
          const atMax = item.stock !== undefined && item.quantity >= item.stock;
          return (
            <li key={item.id} className="flex gap-4 py-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-mist">
                <Image src={item.imageUrl} alt={item.title} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <p className="font-display text-lg font-semibold">{item.title}</p>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button type="button" aria-label={`Retirer une unité de ${item.title}`} className="h-9 w-9 text-lg" onClick={() => setQuantity(item.id, item.quantity - 1)}>
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Ajouter une unité de ${item.title}`}
                        className="h-9 w-9 text-lg disabled:cursor-not-allowed disabled:opacity-30"
                        disabled={atMax}
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    {atMax && <span className="text-xs font-medium text-slate">Stock maximum atteint</span>}
                  </div>
                  <button type="button" onClick={() => remove(item.id)} className="text-sm font-medium text-slate underline hover:text-danger">
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-md bg-mist p-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Nom complet</label>
            <input id="name" name="name" autoComplete="name" required className="field" />
            {fieldError("name")}
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="field" />
            {fieldError("email")}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">
              Téléphone <span className="font-normal text-slate">(optionnel)</span>
            </label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" />
            {fieldError("phone")}
          </div>

          {result?.error && (
            <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger">{result.error}</p>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Validation…" : "Passer la commande"}
          </button>
        </form>

        <button type="button" onClick={clear} disabled={pending} className="btn-ghost mt-3 w-full">
          Vider le panier
        </button>
      </aside>
    </div>
  );
}
