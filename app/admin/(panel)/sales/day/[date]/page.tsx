import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DaySalesActions from "@/components/DaySalesActions";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { formatLongDate, formatPrice, parseDayKey } from "@/lib/utils";

export const metadata: Metadata = { title: "Sorties du jour · Admin" };

export default async function SalesDayPage({ params }: { params: Promise<{ date: string }> }) {
  await requireAccess("sales");
  const { date } = await params;
  const range = parseDayKey(date);
  if (!range) notFound();

  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: range.start, lt: range.end } } },
    include: { order: { select: { id: true, number: true, createdAt: true, customerName: true } } },
    orderBy: [{ order: { createdAt: "asc" } }, { title: "asc" }],
  });

  const totalQty = items.reduce((n, i) => n + i.quantity, 0);
  const totalAmount = items.reduce((n, i) => n + i.quantity * i.unitPrice, 0);
  const orderCount = new Set(items.map((i) => i.order.id)).size;
  const time = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" });

  const kpis = [
    {
      label: "Ventes",
      value: String(orderCount),
      cardClass: "border-cobalt/30 bg-cobalt/5",
      valueClass: "text-cobalt",
    },
    {
      label: "Articles sortis",
      value: String(totalQty),
      cardClass: "border-amber-400/50 bg-amber-50",
      valueClass: totalQty > 0 ? "text-amber-700" : "text-slate",
    },
    {
      label: "Montant",
      value: formatPrice(totalAmount),
      cardClass: "border-emerald-400/40 bg-emerald-50",
      valueClass: totalAmount > 0 ? "text-emerald-700" : "text-slate",
    },
  ];

  return (
    <>
      <Link href="/admin/sales" className="text-sm font-semibold text-slate hover:text-ink print:hidden">
        ← Toutes les ventes
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold capitalize tracking-tight">
        {formatLongDate(range.start)}
      </h1>
      <p className="mt-1 text-sm text-slate">Articles sortis du stock ce jour-là.</p>

      <div className="mb-6 mt-6 grid gap-3 sm:grid-cols-3">
        {kpis.map((c) => (
          <div key={c.label} className={`rounded-md border p-4 ${c.cardClass}`}>
            <p className="text-sm text-slate">{c.label}</p>
            <p className={`mt-1 font-display text-3xl font-extrabold ${c.valueClass}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">Aucune sortie</p>
          <p className="mt-1 text-sm text-slate">Aucun article n’a été vendu à cette date.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-mist text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Heure</th>
                  <th className="px-4 py-3 font-semibold">Vente</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Article</th>
                  <th className="px-4 py-3 text-right font-semibold">Quantité sortie</th>
                  <th className="px-4 py-3 text-right font-semibold">Sous-total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((i) => (
                  <tr key={i.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate">{time.format(i.order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/sales/${i.order.id}`}
                        className="font-semibold text-cobalt underline-offset-2 hover:underline"
                      >
                        n°{i.order.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{i.order.customerName}</td>
                    <td className="px-4 py-3 font-semibold">{i.title}</td>
                    <td className="px-4 py-3 text-right font-semibold text-danger">−{i.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(i.unitPrice * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DaySalesActions
            report={{
              dateLabel: formatLongDate(range.start),
              dayKey: date,
              orderCount,
              totalQty,
              totalAmount,
              items: items.map((i) => ({
                time: time.format(i.order.createdAt),
                orderNumber: i.order.number,
                customerName: i.order.customerName,
                title: i.title,
                quantity: i.quantity,
                subtotal: i.unitPrice * i.quantity,
              })),
            }}
          />
        </>
      )}
    </>
  );
}
