"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { UserFormState } from "@/app/admin/(panel)/users/actions";
import { GENDER_LABEL, type Gender } from "@/lib/avatars";
import { ROLE_HELP, ROLE_LABEL, type Role } from "@/lib/permissions";

type Defaults = { name: string; email: string; role: Role; gender: Gender; photoUrl?: string };

type Props = {
  action: (prev: UserFormState, formData: FormData) => Promise<UserFormState>;
  defaults?: Defaults;
  submitLabel: string;
  /** New user: password is mandatory. Edit: leave empty to keep the current one. */
  passwordRequired?: boolean;
  /** Editing your own account: email and role are locked. */
  isSelf?: boolean;
};

const empty: Defaults = { name: "", email: "", role: "VENTE", gender: "MALE", photoUrl: "" };

export default function UserForm({ action, defaults = empty, submitLabel, passwordRequired = false, isSelf = false }: Props) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const errors = state.errors ?? {};
  const v = state.values;

  const err = (key: "name" | "email" | "role" | "gender" | "password" | "photoUrl") =>
    errors[key]?.[0] ? <p role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors[key]![0]}</p> : null;

  return (
    <form action={formAction} className="grid max-w-xl gap-6" noValidate autoComplete="off">
      {errors.form && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger">{errors.form[0]}</p>}
      {isSelf && (
        <p className="rounded-md bg-mist p-3 text-sm text-slate">
          C’est votre compte : l’email et le rôle ne peuvent pas être modifiés ici.
        </p>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Nom</label>
        <input id="name" name="name" className="field" defaultValue={v?.name ?? defaults.name} required />
        {err("name")}
      </div>

      <div>
        <label htmlFor="gender" className="mb-1.5 block text-sm font-semibold">Sexe</label>
        <select id="gender" name="gender" className="field" defaultValue={v?.gender ?? defaults.gender}>
          {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
            <option key={g} value={g}>{GENDER_LABEL[g]}</option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slate">Sert à choisir l’avatar par défaut quand aucune photo n’est définie.</p>
        {err("gender")}
      </div>

      <div>
        <label htmlFor="photoUrl" className="mb-1.5 block text-sm font-semibold">
          Photo <span className="font-normal text-slate">(optionnel)</span>
        </label>
        <input
          id="photoUrl"
          name="photoUrl"
          className="field"
          placeholder="https://… ou /avatars/moi.jpg"
          defaultValue={v?.photoUrl ?? defaults.photoUrl ?? ""}
        />
        <p className="mt-1.5 text-xs text-slate">URL ou chemin de l’image. Laissez vide pour utiliser l’avatar par défaut (selon le sexe).</p>
        {err("photoUrl")}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
        <input id="email" name="email" type="email" className="field" defaultValue={v?.email ?? defaults.email} disabled={isSelf} required />
        {err("email")}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
          Mot de passe{!passwordRequired && <span className="ml-1 font-normal text-slate">(optionnel)</span>}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="field pr-24"
            autoComplete="new-password"
            placeholder={passwordRequired ? "8 caractères minimum" : "Laisser vide pour ne pas le changer"}
            required={passwordRequired}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-slate hover:text-ink"
          >
            {showPassword ? "Masquer" : "Afficher"}
          </button>
        </div>
        {!passwordRequired && (
          <p className="mt-1.5 text-xs text-slate">Le mot de passe est chiffré : l’ancien ne peut pas être affiché.</p>
        )}
        {err("password")}
      </div>

      <div>
        <label htmlFor="role" className="mb-1.5 block text-sm font-semibold">Rôle</label>
        <select id="role" name="role" className="field" defaultValue={v?.role ?? defaults.role} disabled={isSelf}>
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </select>
        <ul className="mt-2 space-y-0.5 text-xs text-slate">
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <li key={r}><span className="font-semibold">{ROLE_LABEL[r]}</span> : {ROLE_HELP[r]}</li>
          ))}
        </ul>
        {err("role")}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Enregistrement…" : submitLabel}</button>
        <Link href="/admin/users" className="btn-ghost">Annuler</Link>
      </div>
    </form>
  );
}
