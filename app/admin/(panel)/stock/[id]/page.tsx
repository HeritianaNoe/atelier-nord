import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Pagination from "@/components/Pagination";
import StockBadge from "@/components/StockBadge";
import { PAGE_SIZE, clampRedirect, parsePage, totalPagesOf } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Entrées de stock · Admin" };

export default async function StockProductEntriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  await requireAccess("stock");
  const { id } = await params;
  const page = parsePage((await searchParams).page);

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
  if (!product) notFound();

  const where = { productId: id, type: "IN" as const };
  const [total, sum] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.aggregate({ where, _sum: { quantity: true } }),
  ]);
  const base = `/admin/stock/${id}`;
  const totalPages = totalPagesOf(total);
  if (page > totalPages) redirect(clampRedirect(base, totalPages));

  const entries = await prisma.stockMovement.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <Link href="/admin/stock" className="text-sm font-semibold text-slate hover:text-ink">← Retour au stock</Link>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-mist">
          <Image src={product.imageUrl} alt="" fill sizes="56px" className="object-cover" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{product.title}</h1>
          <p className="mt-1 text-sm text-slate">{product.category.name} · Entrées de stock par date</p>
        </div>
      </div>

      <div className="mb-6 mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-line bg-white p-4">
          <p className="text-sm text-slate">Stock actuel</p>
          <div className="mt-2"><StockBadge stock={product.stock} /></div>
        </div>
        <div className="rounded-md border border-line bg-white p-4">
          <p className="text-sm text-slate">Nombre d’entrées</p>
          <p className="mt-1 font-display text-3xl font-extrabold">{total}</p>
        </div>
        <div className="rounded-md border border-line bg-white p-4">
          <p className="text-sm text-slate">Total entré</p>
          <p className="mt-1 font-display text-3xl font-extrabold">{sum._sum.quantity ?? 0}</p>
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">Aucune entrée</p>
          <p className="mt-1 text-sm text-slate">Les réceptions de stock de ce produit apparaîtront ici.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-mist text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Quantité entrée</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock après</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                  <th className="px-4 py-3 font-semibold">Par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((m) => (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatDateTime(m.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-cobalt">+{m.quantity}</td>
                    <td className="px-4 py-3 text-right">{m.stockAfter}</td>
                    <td className="px-4 py-3 text-slate">{m.note ?? "—"}</td>
                    <td className="px-4 py-3 text-slate">{m.user?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} basePath={base} />
        </>
      )}
    </>
  );
}
