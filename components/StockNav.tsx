import Link from "next/link";

const TABS = [
  { href: "/admin/stock", label: "Niveaux de stock" },
  { href: "/admin/stock/movements", label: "Mouvements" },
];

export default function StockNav({ current }: { current: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Stock" className="flex gap-1 rounded-full bg-mist p-1">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.href === current ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              t.href === current ? "bg-ink text-paper" : "text-slate hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Link href="/admin/stock/new" className="btn-primary">Nouvelle entrée de stock</Link>
    </div>
  );
}
