import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-mist">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-extrabold">Atelier Nord</p>
          <p className="mt-2 max-w-xs text-sm text-slate">
            Des objets simples, fabriqués avec soin, pour la maison, la cuisine et le bureau.
          </p>
        </div>
        <nav aria-label="Pied de page">
          <p className="text-sm font-semibold">Navigation</p>
          <ul className="mt-3 space-y-2 text-sm text-slate">
            <li><Link className="hover:text-cobalt" href="/">Accueil</Link></li>
            <li><Link className="hover:text-cobalt" href="/shop">Boutique</Link></li>
            <li><Link className="hover:text-cobalt" href="/about">À propos</Link></li>
            <li><Link className="hover:text-cobalt" href="/cart">Panier</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold">Contact</p>
          <p className="mt-3 text-sm text-slate">rasolomananaheritiana@gmail.com</p>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-sm text-slate">
        © 2026 - Atelier Nord. Tous droits réservés.
      </div>
    </footer>
  );
}
