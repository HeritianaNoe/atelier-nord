import type { Metadata } from "next";
import { PasswordForm, PhotoForm } from "@/components/ProfileForms";
import UserAvatar from "@/components/UserAvatar";
import { GENDER_LABEL } from "@/lib/avatars";
import { ROLE_HELP, ROLE_LABEL } from "@/lib/permissions";
import { requireStaff } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mon profil · Admin" };

// Accessible à tout membre du personnel connecté (pas de section requise) :
// la page n'affiche et ne modifie que SON compte.
export default async function ProfilePage() {
  const me = await requireStaff();

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Mon profil</h1>

      <section className="mt-8 flex max-w-2xl flex-wrap items-center gap-6 rounded-md border border-line bg-white p-6">
        <UserAvatar user={me} size={96} />
        <dl className="grid flex-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate">Nom</dt><dd className="font-semibold">{me.name}</dd></div>
          <div><dt className="text-slate">Email</dt><dd className="break-all font-semibold">{me.email}</dd></div>
          <div>
            <dt className="text-slate">Rôle</dt>
            <dd className="font-semibold">{ROLE_LABEL[me.role]}</dd>
            <dd className="text-xs text-slate">{ROLE_HELP[me.role]}</dd>
          </div>
          <div><dt className="text-slate">Sexe</dt><dd className="font-semibold">{GENDER_LABEL[me.gender]}</dd></div>
          <div><dt className="text-slate">Membre depuis</dt><dd className="font-semibold">{formatDate(me.createdAt)}</dd></div>
        </dl>
        <p className="w-full rounded-md bg-mist p-3 text-xs text-slate">
          Le rôle est géré par un administrateur et ne peut pas être modifié depuis cette page.
        </p>
      </section>

      <div className="mt-8 grid max-w-5xl gap-8 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-white p-6">
          <h2 className="mb-5 font-display text-xl font-extrabold">Photo</h2>
          <PhotoForm gender={me.gender} currentUrl={me.photoUrl} />
        </section>
        <section className="rounded-md border border-line bg-white p-6">
          <h2 className="mb-5 font-display text-xl font-extrabold">Mot de passe</h2>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
