"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ProductFormState } from "@/app/admin/(panel)/products/actions";
import type { CategoryDTO } from "@/lib/types";

type Defaults = {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: string;
  isFeatured: boolean;
  stock?: string;
};

type Props = {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: CategoryDTO[];
  defaults?: Defaults;
  submitLabel: string;
  /** Edit mode: stock is read-only here and changed from the Stock section. */
  stockInfo?: { productId: string; current: number };
};

const empty: Defaults = { title: "", description: "", price: "", imageUrl: "", categoryId: "", isFeatured: false, stock: "10" };

export default function ProductForm({ action, categories, defaults = empty, submitLabel, stockInfo }: Props) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, {});
  const errors = state.errors ?? {};
  const v = state.values;

  const [featured, setFeatured] = useState(v ? v.isFeatured === "on" : defaults.isFeatured);
  const [imageUrl, setImageUrl] = useState(v?.imageUrl ?? defaults.imageUrl);

  const err = (key: keyof typeof errors) =>
    errors[key]?.[0] ? <p role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors[key]![0]}</p> : null;

  return (
    <form action={formAction} className="grid max-w-3xl gap-6" noValidate>
      {errors.form && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger">{errors.form[0]}</p>}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-semibold">Titre</label>
        <input id="title" name="title" className="field" defaultValue={v?.title ?? defaults.title} required />
        {err("title")}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-semibold">Prix (€)</label>
          <input id="price" name="price" type="number" step="0.01" min="0" inputMode="decimal" className="field" defaultValue={v?.price ?? defaults.price} required />
          {err("price")}
        </div>
        <div>
          <label htmlFor="categoryId" className="mb-1.5 block text-sm font-semibold">Catégorie</label>
          <select id="categoryId" name="categoryId" className="field" defaultValue={v?.categoryId ?? defaults.categoryId} required>
            <option value="" disabled>Choisir une catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {err("categoryId")}
        </div>
      </div>

      {stockInfo ? (
        <p className="rounded-md bg-mist p-3 text-sm">
          <span className="font-semibold">Stock actuel : {stockInfo.current}</span>
          <span className="text-slate"> · pour le modifier, enregistrez </span>
          <Link href={`/admin/stock/new?product=${stockInfo.productId}`} className="font-semibold text-cobalt underline">
            une entrée ou un ajustement de stock
          </Link>
          .
        </p>
      ) : (
        <div className="sm:max-w-[calc(50%-0.75rem)]">
          <label htmlFor="stock" className="mb-1.5 block text-sm font-semibold">Stock initial</label>
          <input id="stock" name="stock" type="number" step="1" min="0" inputMode="numeric" className="field" defaultValue={v?.stock ?? defaults.stock ?? "10"} required />
          {err("stock")}
        </div>
      )}

      <div>
        <label htmlFor="imageUrl" className="mb-1.5 block text-sm font-semibold">URL de l’image</label>
        <input id="imageUrl" name="imageUrl" type="text" placeholder="https://… ou /products/mon-image.jpg" className="field" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        {err("imageUrl")}
        {/^(https?:\/\/|\/)/.test(imageUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Aperçu de l’image" className="mt-3 h-32 w-32 rounded-md border border-line object-cover" />
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-semibold">Description</label>
        <textarea id="description" name="description" rows={5} className="field" defaultValue={v?.description ?? defaults.description} required />
        {err("description")}
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" name="isFeatured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="sr-only" id="isFeatured" />
        <button
          type="button"
          role="switch"
          aria-checked={featured}
          aria-labelledby="featured-label"
          onClick={() => setFeatured((f) => !f)}
          className={`relative h-6 w-11 rounded-full transition-colors ${featured ? "bg-cobalt" : "bg-line"}`}
        >
          <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${featured ? "translate-x-5" : ""}`} />
        </button>
        <span id="featured-label" className="text-sm font-semibold">Afficher « À la Une » sur l’accueil</span>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        <Link href="/admin/products" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
