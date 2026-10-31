import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EyeIcon } from "@/components/icons";
import Pagination from "@/components/Pagination";
import { PAGE_SIZE, clampRedirect, parsePage, totalPagesOf } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { formatDateTime, formatPrice, toDayKey } from "@/lib/utils";

export const metadata: Metadata = { title: "Ventes · Admin" };

const BASE = "/admin/sales";

export default async function AdminSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  await requireAccess("sales");
  const page = parsePage((await searchParams).page);
  const total = await prisma.order.count();
  const totalPages = totalPagesOf(total);
  if (page > totalPages) redirect(clampRedirect(BASE, totalPages));

  const orders = await prisma.order.findMany({
    include: { items: { select: { quantity: true } }, createdBy: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Ventes</h1>
          <p className="mt-1 text-sm text-slate">{total} vente{total > 1 ? "s" : ""} (site web et comptoir)</p>
        </div>
        <Link href="/admin/sales/new" className="btn-primary">Nouvelle vente</Link>
      </div>

      {total === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">Aucune vente</p>
          <p className="mt-1 text-sm text-slate">Les commandes du site et les ventes saisies ici apparaîtront dans cette liste.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-mist text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">N°</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Origine</th>
                  <th className="px-4 py-3 text-right font-semibold">Articles</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-semibold">{o.number}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/admin/sales/day/${toDayKey(o.createdAt)}`}
                        className="font-semibold text-cobalt underline-offset-2 hover:underline"
                        title="Voir les articles sortis ce jour-là"
                      >
                        {formatDateTime(o.createdAt)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.customerName}</td>
                    <td className="px-4 py-3 text-slate">
                      {o.source === "WEB" ? "Site web" : `Comptoir${o.createdBy ? ` · ${o.createdBy.name}` : ""}`}
                    </td>
                    <td className="px-4 py-3 text-right">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Link href={`/admin/sales/${o.id}`} className="icon-btn" aria-label={`Voir la vente n°${o.number}`} title="Voir le détail">
                          <EyeIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} basePath={BASE} />
        </>
      )}
    </>
  );
}
