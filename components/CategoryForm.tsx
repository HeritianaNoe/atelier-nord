"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { CategoryFormState } from "@/app/admin/(panel)/categories/actions";

type Props = {
  action: (prev: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  defaultName?: string;
  submitLabel: string;
};

export default function CategoryForm({ action, defaultName = "", submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(action, {});
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="grid max-w-xl gap-6" noValidate>
      {errors.form && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger">{errors.form[0]}</p>}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Nom</label>
        <input id="name" name="name" className="field" defaultValue={state.values?.name ?? defaultName} required />
        {errors.name?.[0] && <p role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors.name[0]}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Enregistrement…" : submitLabel}</button>
        <Link href="/admin/categories" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
