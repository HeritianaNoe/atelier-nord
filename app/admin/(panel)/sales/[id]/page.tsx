import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SaleActions from "@/components/SaleActions";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Détail de la vente · Admin" };

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAccess("sales");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { orderBy: { title: "asc" } }, createdBy: { select: { name: true } } },
  });
  if (!order) notFound();

  const originLabel = order.source === "WEB" ? "Site web" : `Comptoir${order.createdBy ? ` · ${order.createdBy.name}` : ""}`;

  return (
    <>
      <Link href="/admin/sales" className="text-sm font-semibold text-slate hover:text-ink print:hidden">← Toutes les ventes</Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Vente n°{order.number}</h1>

      <dl className="mt-6 grid max-w-3xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        <div><dt className="text-slate">Date</dt><dd className="font-semibold">{formatDateTime(order.createdAt)}</dd></div>
        <div>
          <dt className="text-slate">Origine</dt>
          <dd className="font-semibold">{originLabel}</dd>
        </div>
        <div><dt className="text-slate">Client</dt><dd className="font-semibold">{order.customerName}</dd></div>
        <div><dt className="text-slate">Email</dt><dd className="font-semibold">{order.customerEmail ?? "—"}</dd></div>
        <div><dt className="text-slate">Téléphone</dt><dd className="font-semibold">{order.customerPhone ?? "—"}</dd></div>
      </dl>

      <div className="mt-8 max-w-3xl overflow-x-auto rounded-md border border-line bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-line bg-mist text-slate">
            <tr>
              <th className="px-4 py-3 font-semibold">Article</th>
              <th className="px-4 py-3 text-right font-semibold">Prix unitaire</th>
              <th className="px-4 py-3 text-right font-semibold">Quantité</th>
              <th className="px-4 py-3 text-right font-semibold">Sous-total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 font-semibold">{i.title}</td>
                <td className="px-4 py-3 text-right">{formatPrice(i.unitPrice)}</td>
                <td className="px-4 py-3 text-right">{i.quantity}</td>
                <td className="px-4 py-3 text-right">{formatPrice(i.unitPrice * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-line">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total</td>
              <td className="px-4 py-3 text-right text-base font-extrabold">{formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <SaleActions
        sale={{
          number: order.number,
          dateLabel: formatDateTime(order.createdAt),
          originLabel,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          items: order.items.map((i) => ({ title: i.title, unitPrice: i.unitPrice, quantity: i.quantity })),
          total: order.total,
        }}
      />
    </>
  );
}
