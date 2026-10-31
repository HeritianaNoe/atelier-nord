"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { StockFormState } from "@/app/admin/(panel)/stock/actions";

type ProductOption = { id: string; title: string; stock: number };

type Props = {
  action: (prev: StockFormState, formData: FormData) => Promise<StockFormState>;
  products: ProductOption[];
  initialProductId?: string;
};

export default function StockEntryForm({ action, products, initialProductId }: Props) {
  const [state, formAction, pending] = useActionState<StockFormState, FormData>(action, {});
  const errors = state.errors ?? {};
  const v = state.values;

  const [productId, setProductId] = useState(v?.productId ?? initialProductId ?? "");
  const [type, setType] = useState<"IN" | "ADJUST">(v?.type === "ADJUST" ? "ADJUST" : "IN");
  const [quantity, setQuantity] = useState(v?.quantity ?? "");

  const product = products.find((p) => p.id === productId);
  const qty = Number.parseInt(quantity, 10);
  const preview = product && Number.isFinite(qty) ? product.stock + qty : null;

  const err = (key: "productId" | "type" | "quantity" | "note") =>
    errors[key]?.[0] ? <p role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors[key]![0]}</p> : null;

  return (
    <form action={formAction} className="grid max-w-xl gap-6" noValidate>
      {errors.form && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger">{errors.form[0]}</p>}

      <div>
        <label htmlFor="productId" className="mb-1.5 block text-sm font-semibold">Produit</label>
        <select id="productId" name="productId" className="field" value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="" disabled>Choisir un produit</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.title} (stock : {p.stock})</option>
          ))}
        </select>
        {err("productId")}
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Type de mouvement</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { value: "IN" as const, title: "Entrée", help: "Réception de marchandise, réapprovisionnement." },
            { value: "ADJUST" as const, title: "Ajustement", help: "Correction d’inventaire, casse, perte (peut être négatif)." },
          ].map((o) => (
            <label
              key={o.value}
              className={`cursor-pointer rounded-md border p-3 text-sm transition-colors ${type === o.value ? "border-ink bg-mist" : "border-line hover:border-ink"}`}
            >
              <input type="radio" name="type" value={o.value} checked={type === o.value} onChange={() => setType(o.value)} className="sr-only" />
              <span className="block font-semibold">{o.title}</span>
              <span className="text-slate">{o.help}</span>
            </label>
          ))}
        </div>
        {err("type")}
      </fieldset>

      <div>
        <label htmlFor="quantity" className="mb-1.5 block text-sm font-semibold">
          Quantité {type === "ADJUST" && <span className="font-normal text-slate">(ex. -2 pour retirer 2 unités)</span>}
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          step="1"
          inputMode="numeric"
          min={type === "IN" ? 1 : undefined}
          className="field"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        {err("quantity")}
        {product && (
          <p className="mt-1.5 text-sm text-slate">
            Stock actuel : <strong className="text-ink">{product.stock}</strong>
            {preview !== null && (
              <>
                {" "}→ après : <strong className={preview < 0 ? "text-danger" : "text-ink"}>{preview}</strong>
              </>
            )}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="note" className="mb-1.5 block text-sm font-semibold">
          Note {type === "IN" && <span className="font-normal text-slate">(optionnel : n° de bon de livraison, fournisseur…)</span>}
        </label>
        <input id="note" name="note" className="field" defaultValue={v?.note ?? ""} maxLength={200} required={type === "ADJUST"} />
        {err("note")}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Enregistrement…" : "Enregistrer le mouvement"}</button>
        <Link href="/admin/stock" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
