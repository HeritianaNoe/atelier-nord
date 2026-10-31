import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Pagination from "@/components/Pagination";
import StockNav from "@/components/StockNav";
import { PAGE_SIZE, clampRedirect, parsePage, totalPagesOf } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { formatDateTime, toDayKey } from "@/lib/utils";

export const metadata: Metadata = { title: "Mouvements de stock · Admin" };

const BASE = "/admin/stock/movements";

const TYPE_LABEL = { IN: "Entrée", OUT: "Vente", ADJUST: "Ajustement" } as const;
const TYPE_STYLE = {
  IN: "bg-cobalt/10 text-cobalt",
  OUT: "bg-mist text-slate",
  ADJUST: "bg-ink/10 text-ink",
} as const;

export default async function StockMovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  await requireAccess("stock");
  const page = parsePage((await searchParams).page);
  const total = await prisma.stockMovement.count();
  const totalPages = totalPagesOf(total);
  if (page > totalPages) redirect(clampRedirect(BASE, totalPages));

  const movements = await prisma.stockMovement.findMany({
    include: { product: { select: { title: true } }, user: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Stock</h1>
      <p className="mb-6 mt-1 text-sm text-slate">Journal de toutes les entrées, ventes et ajustements.</p>
      <StockNav current={BASE} />

      {total === 0 ? (
        <div className="rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">Aucun mouvement</p>
          <p className="mt-1 text-sm text-slate">Les entrées, ventes et ajustements apparaîtront ici.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line bg-mist text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 text-right font-semibold">Quantité</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock après</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                  <th className="px-4 py-3 font-semibold">Par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {movements.map((m) => {
                  const dayKey = toDayKey(m.createdAt);
                  return (
                    <tr key={m.id}>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link
                          href={`/admin/stock/movements/day/${dayKey}`}
                          className="font-semibold text-cobalt underline-offset-2 hover:underline"
                          title="Voir tous les mouvements de ce jour"
                        >
                          {formatDateTime(m.createdAt)}
                        </Link>
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} basePath={BASE} />
        </>
      )}
    </>
  );
}
