import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DayMovementsActions from "@/components/DayMovementsActions";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { formatLongDate, parseDayKey } from "@/lib/utils";

export const metadata: Metadata = { title: "Mouvements du jour · Admin" };

const TYPE_LABEL = { IN: "Entrée", OUT: "Vente", ADJUST: "Ajustement" } as const;
const TYPE_STYLE = {
  IN: "bg-cobalt/10 text-cobalt",
  OUT: "bg-mist text-slate",
  ADJUST: "bg-ink/10 text-ink",
} as const;

export default async function StockMovementsDayPage({ params }: { params: Promise<{ date: string }> }) {
  await requireAccess("stock");
  const { date } = await params;
  const range = parseDayKey(date);
  if (!range) notFound();

  const movements = await prisma.stockMovement.findMany({
    where: { createdAt: { gte: range.start, lt: range.end } },
    include: { product: { select: { title: true } }, user: { select: { name: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const inQty = movements.filter((m) => m.type === "IN").reduce((n, m) => n + m.quantity, 0);
  const outQty = movements.filter((m) => m.type === "OUT").reduce((n, m) => n + Math.abs(m.quantity), 0);
  const adjustQty = movements.filter((m) => m.type === "ADJUST").reduce((n, m) => n + m.quantity, 0);
  const time = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" });

  const kpis = [
    {
      label: "Mouvements",
      value: String(movements.length),
      cardClass: "border-cobalt/30 bg-cobalt/5",
      valueClass: "text-cobalt",
    },
    {
      label: "Entrées",
      value: inQty > 0 ? `+${inQty}` : "0",
      cardClass: "border-emerald-400/40 bg-emerald-50",
      valueClass: inQty > 0 ? "text-emerald-700" : "text-slate",
    },
    {
      label: "Sorties (ventes)",
      value: outQty > 0 ? `−${outQty}` : "0",
      cardClass: "border-danger/40 bg-danger/5",
      valueClass: outQty > 0 ? "text-danger" : "text-slate",
    },
    {
      label: "Ajustements",
      value: adjustQty === 0 ? "0" : adjustQty > 0 ? `+${adjustQty}` : String(adjustQty),
      cardClass: "border-amber-400/50 bg-amber-50",
      valueClass: adjustQty !== 0 ? "text-amber-700" : "text-slate",
    },
  ];

  return (
    <>
      <Link href="/admin/stock/movements" className="text-sm font-semibold text-slate hover:text-ink print:hidden">
        ← Tous les mouvements
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold capitalize tracking-tight">
        {formatLongDate(range.start)}
      </h1>
      <p className="mt-1 text-sm text-slate">Entrées, ventes et ajustements de ce jour.</p>

      <div className="mb-6 mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((c) => (
          <div key={c.label} className={`rounded-md border p-4 ${c.cardClass}`}>
            <p className="text-sm text-slate">{c.label}</p>
            <p className={`mt-1 font-display text-3xl font-extrabold ${c.valueClass}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {movements.length === 0 ? (
        <div className="rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">Aucun mouvement</p>
          <p className="mt-1 text-sm text-slate">Aucun mouvement de stock à cette date.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line bg-mist text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Heure</th>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 text-right font-semibold">Quantité</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock après</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                  <th className="px-4 py-3 font-semibold">Par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate">{time.format(m.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold">{m.product.title}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLE[m.type]}`}>
                        {TYPE_LABEL[m.type]}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${m.quantity < 0 ? "text-danger" : ""}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="px-4 py-3 text-right">{m.stockAfter}</td>
                    <td className="px-4 py-3 text-slate">{m.note ?? "—"}</td>
                    <td className="px-4 py-3 text-slate">{m.user?.name ?? (m.type === "OUT" ? "Site web" : "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DayMovementsActions
            report={{
              dateLabel: formatLongDate(range.start),
              dayKey: date,
              movementCount: movements.length,
              inQty,
              outQty,
              adjustQty,
              items: movements.map((m) => ({
                time: time.format(m.createdAt),
                productTitle: m.product.title,
                typeLabel: TYPE_LABEL[m.type],
                quantity: m.quantity,
                stockAfter: m.stockAfter,
                note: m.note,
                by: m.user?.name ?? (m.type === "OUT" ? "Site web" : "—"),
              })),
            }}
          />
        </>
      )}
    </>
  );
}
