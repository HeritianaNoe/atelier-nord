"use client";

import { useActionState, useState } from "react";
import {
  changeMyPassword,
  changeMyPhoto,
  type ProfileFormState,
} from "@/app/admin/(panel)/profile/actions";
import { DEFAULT_AVATARS, type Gender } from "@/lib/avatars";

function Feedback({ state }: { state: ProfileFormState }) {
  if (state.ok) return <p role="status" className="rounded-md bg-cobalt/10 p-3 text-sm font-medium text-cobalt">{state.ok}</p>;
  if (state.error) return <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger">{state.error}</p>;
  return null;
}

export function PhotoForm({ gender, currentUrl }: { gender: Gender; currentUrl: string | null }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(changeMyPhoto, {});
  const [preview, setPreview] = useState<string | null>(null);
  const options = DEFAULT_AVATARS[gender];

  return (
    <form action={action} className="grid gap-5" encType="multipart/form-data">
      <Feedback state={state} />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Choisir un avatar</legend>
        <div className="flex flex-wrap items-center gap-4">
          {options.map((src) => (
            <label key={src} className="cursor-pointer">
              <input type="radio" name="choice" value={src} defaultChecked={currentUrl === src} className="peer sr-only" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Avatar proposé" className="h-16 w-16 rounded-full ring-2 ring-line peer-checked:ring-cobalt peer-focus-visible:ring-cobalt" />
            </label>
          ))}
          <label className="cursor-pointer text-sm">
            <input type="radio" name="choice" value="default" className="mr-1.5" />
            Automatique
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="photo" className="mb-1.5 block text-sm font-semibold">
          Ou téléverser ma photo <span className="font-normal text-slate">(PNG, JPG, WEBP · 2 Mo max)</span>
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="field"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="mt-3 h-20 w-20 rounded-full object-cover ring-1 ring-line" />
        )}
      </div>

      <div>
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Enregistrement…" : "Enregistrer la photo"}</button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(changeMyPassword, {});
  const [show, setShow] = useState(false);
  const fe = state.fieldErrors ?? {};
  const type = show ? "text" : "password";
  const err = (k: string) => (fe[k] ? <p role="alert" className="mt-1.5 text-sm font-medium text-danger">{fe[k]}</p> : null);

  return (
    <form action={action} className="grid gap-5" autoComplete="off" key={state.ok ? "done" : "form"}>
      <Feedback state={state} />
      <div>
        <label htmlFor="current" className="mb-1.5 block text-sm font-semibold">Mot de passe actuel</label>
        <input id="current" name="current" type={type} className="field" autoComplete="current-password" required />
        {err("current")}
      </div>
      <div>
        <label htmlFor="next" className="mb-1.5 block text-sm font-semibold">Nouveau mot de passe</label>
        <input id="next" name="next" type={type} className="field" autoComplete="new-password" placeholder="8 caractères minimum" required />
        {err("next")}
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold">Confirmer le nouveau mot de passe</label>
        <input id="confirm" name="confirm" type={type} className="field" autoComplete="new-password" required />
        {err("confirm")}
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Enregistrement…" : "Changer le mot de passe"}</button>
        <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} className="text-xs font-semibold text-slate hover:text-ink">
          {show ? "Masquer" : "Afficher"}
        </button>
      </div>
    </form>
  );
}
