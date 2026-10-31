import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Commande confirmée" };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string | string[] }>;
}) {
  const raw = (await searchParams).n;
  const n = Number.parseInt(Array.isArray(raw) ? raw[0] : (raw ?? ""), 10);
  // Only the order number is shown: no customer data is read from the database on this public page.

  return (
    <div className="container-page py-20 text-center">
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Merci pour votre commande</h1>
      <p className="mx-auto mt-4 max-w-md text-slate">
        {Number.isFinite(n) && n > 0 ? (
          <>Votre commande <strong className="text-ink">n°{n}</strong> a bien été enregistrée.</>
        ) : (
          "Votre commande a bien été enregistrée."
        )}{" "}
        Conservez ce numéro si vous nous contactez.
      </p>
      <Link href="/shop" className="btn-primary mt-8">Continuer vos achats</Link>
    </div>
  );
}
