"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { SaleFormState } from "@/app/admin/(panel)/sales/actions";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { formatPrice } from "@/lib/utils";

type ProductOption = { id: string; title: string; price: number; stock: number };
type Row = { key: number; productId: string; quantity: number };

type Props = {
  action: (prev: SaleFormState, formData: FormData) => Promise<SaleFormState>;
  products: ProductOption[];
};

export default function SaleForm({ action, products }: Props) {
  const [state, formAction, pending] = useActionState<SaleFormState, FormData>(action, {});
  const errors = state.errors ?? {};
  const v = state.values;

  const [rows, setRows] = useState<Row[]>([{ key: 1, productId: "", quantity: 1 }]);
  const [nextKey, setNextKey] = useState(2);

  const byId = new Map(products.map((p) => [p.id, p]));
  const total = rows.reduce((sum, r) => sum + (byId.get(r.productId)?.price ?? 0) * (r.quantity || 0), 0);

  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <form action={formAction} className="grid max-w-3xl gap-6" noValidate>
      {errors.form && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger">{errors.form[0]}</p>}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="customerName" className="mb-1.5 block text-sm font-semibold">
            Client <span className="font-normal text-slate">(optionnel)</span>
          </label>
          <input id="customerName" name="customerName" className="field" placeholder="Client comptoir" defaultValue={v?.customerName ?? ""} />
          {errors.customerName?.[0] && <p role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors.customerName[0]}</p>}
        </div>
        <div>
          <label htmlFor="customerPhone" className="mb-1.5 block text-sm font-semibold">
            Téléphone <span className="font-normal text-slate">(optionnel)</span>
          </label>
          <input id="customerPhone" name="customerPhone" type="tel" className="field" defaultValue={v?.customerPhone ?? ""} />
          {errors.customerPhone?.[0] && <p role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors.customerPhone[0]}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Articles vendus</legend>
        <ul className="grid gap-3">
          {rows.map((r, index) => {
            const p = byId.get(r.productId);
            return (
              <li key={r.key} className="grid grid-cols-[1fr_5.5rem_auto] items-center gap-3 sm:grid-cols-[1fr_6rem_7rem_auto]">
                <select
                  name="productId"
                  aria-label={`Produit, ligne ${index + 1}`}
                  className="field"
                  value={r.productId}
                  onChange={(e) => update(r.key, { productId: e.target.value, quantity: 1 })}
                >
                  <option value="">Choisir un produit</option>
                  {products.map((o) => (
                    <option key={o.id} value={o.id} disabled={o.stock <= 0}>
                      {o.title} — {formatPrice(o.price)} ({o.stock <= 0 ? "rupture" : `${o.stock} en stock`})
                    </option>
                  ))}
                </select>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  max={p?.stock}
                  step={1}
                  aria-label={`Quantité, ligne ${index + 1}`}
                  className="field"
                  value={r.quantity}
                  onChange={(e) => update(r.key, { quantity: Number.parseInt(e.target.value, 10) || 0 })}
                />
                <span className="hidden text-right text-sm font-semibold sm:block">{p ? formatPrice(p.price * r.quantity) : "—"}</span>
                <button
                  type="button"
                  className="icon-btn-danger"
                  aria-label={`Retirer la ligne ${index + 1}`}
                  title="Retirer la ligne"
                  disabled={rows.length === 1}
                  onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                >
                  <TrashIcon />
                </button>
              </li>
            );
          })}
        </ul>
        {errors.lines?.[0] && <p role="alert" className="mt-2 text-sm font-medium text-danger">{errors.lines[0]}</p>}

        <button
          type="button"
          className="btn-ghost mt-4"
          onClick={() => {
            setRows((rs) => [...rs, { key: nextKey, productId: "", quantity: 1 }]);
            setNextKey((k) => k + 1);
          }}
        >
          <PlusIcon /> Ajouter une ligne
        </button>
      </fieldset>

      <div className="flex items-center justify-between rounded-md bg-mist p-4 text-lg font-semibold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Enregistrement…" : "Enregistrer la vente"}</button>
        <Link href="/admin/sales" className="btn-ghost">Annuler</Link>
      </div>
      <p className="-mt-2 text-sm text-slate">Le stock des articles vendus est décompté automatiquement.</p>
    </form>
  );
}
