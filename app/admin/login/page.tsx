import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { homeFor } from "@/lib/permissions";
import { getStaff } from "@/lib/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Connexion administrateur" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const staff = await getStaff();
  if (staff) redirect(homeFor(staff.role));

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Atelier Nord
          </h1>
          <p className="mt-1 text-sm text-slate">
            Accès réservé au personnel.
          </p>
        </div>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate underline-offset-4 hover:text-ink hover:underline"
          >
            <span aria-hidden>←</span> Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
}