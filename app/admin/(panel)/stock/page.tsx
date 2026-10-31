import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { EyeIcon, PlusIcon } from "@/components/icons";
import Pagination from "@/components/Pagination";
import StockBadge from "@/components/StockBadge";
import StockNav from "@/components/StockNav";
import { PAGE_SIZE, clampRedirect, parsePage, totalPagesOf } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Stock · Admin" };

const BASE = "/admin/stock";

type StockFilter = "all" | "low" | "out";

function parseFilter(value: string | string[] | undefined): StockFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "low" || raw === "out") return raw;
  return "all";
}

function filterHref(filter: StockFilter) {
  if (filter === "all") return BASE;
  return `${BASE}?filter=${filter}`;
}

function stockWhere(filter: StockFilter): Prisma.ProductWhereInput {
  if (filter === "out") return { stock: { lte: 0 } };
  if (filter === "low") return { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } };
  return {};
}

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; filter?: string | string[] }>;
}) {
  await requireAccess("stock");
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const filter = parseFilter(sp.filter);

  const [total, outCount, lowCount, filteredTotal] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: 0 } } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
    prisma.product.count({ where: stockWhere(filter) }),
  ]);
  const totalPages = totalPagesOf(filteredTotal);
  if (page > totalPages) {
    const base = filter === "all" ? BASE : `${BASE}?filter=${filter}`;
    redirect(clampRedirect(base, totalPages));
  }

  // Lowest stock first, so what needs restocking is on page 1.
  const products = await prisma.product.findMany({
    where: stockWhere(filter),
    include: { category: { select: { name: true } } },
    orderBy: [{ stock: "asc" }, { title: "asc" }, { id: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const kpis: {
    label: string;
    value: number;
    filter: StockFilter;
    cardClass: string;
    valueClass: string;
  }[] = [
    {
      label: "Articles",
      value: total,
      filter: "all",
      cardClass: "border-cobalt/30 bg-cobalt/5 hover:border-cobalt",
      valueClass: "text-cobalt",
    },
    {
      label: "Stock faible (≤ " + LOW_STOCK_THRESHOLD + ")",
      value: lowCount,
      filter: "low",
      cardClass: "border-amber-400/50 bg-amber-50 hover:border-amber-500",
      valueClass: lowCount > 0 ? "text-amber-700" : "text-slate",
    },
    {
      label: "En rupture",
      value: outCount,
      filter: "out",
      cardClass: "border-danger/40 bg-danger/5 hover:border-danger",
      valueClass: outCount > 0 ? "text-danger" : "text-slate",
    },
  ];

  const paginationBase = filter === "all" ? BASE : `${BASE}?filter=${filter}`;

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Stock</h1>
      <p className="mb-6 mt-1 text-sm text-slate">Quantités disponibles, du plus bas au plus haut.</p>
      <StockNav current={BASE} />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {kpis.map((c) => {
          const active = filter === c.filter;
          return (
            <Link
              key={c.filter}
              href={filterHref(c.filter)}
              className={cn(
                "rounded-md border p-4 transition-colors",
                c.cardClass,
                active && "ring-2 ring-offset-1 ring-ink/20",
              )}
              aria-current={active ? "page" : undefined}
            >
              <p className="text-sm text-slate">{c.label}</p>
              <p className={cn("mt-1 font-display text-3xl font-extrabold", c.valueClass)}>{c.value}</p>
              <p className="mt-1 text-xs font-medium text-slate">
                {active ? "Filtre actif" : "Cliquer pour filtrer"}
              </p>
            </Link>
          );
        })}
      </div>

      {filteredTotal === 0 ? (
        <div className="rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">
            {filter === "out"
              ? "Aucune rupture de stock"
              : filter === "low"
                ? "Aucun stock faible"
                : "Aucun produit"}
          </p>
          <p className="mt-1 text-sm text-slate">
            {filter === "all"
              ? "Créez d’abord des produits dans la section Produits."
              : "Tous les articles sont hors de ce filtre."}
          </p>
          {filter !== "all" && (
            <Link href={BASE} className="mt-4 inline-block text-sm font-semibold text-cobalt underline-offset-2 hover:underline">
              Voir tous les articles
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-mist text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Catégorie</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-mist">
                          <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                        </div>
                        <span className="font-semibold">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate">{p.category.name}</td>
                    <td className="px-4 py-3">
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/stock/${p.id}`}
                          className="icon-btn"
                          aria-label={`Voir les entrées de « ${p.title} »`}
                          title="Voir les entrées par date"
                        >
                          <EyeIcon />
                        </Link>
                        <Link
                          href={`/admin/stock/new?product=${p.id}`}
                          className="icon-btn"
                          aria-label={`Entrée ou ajustement de stock pour « ${p.title} »`}
                          title="Entrée / ajustement"
                        >
                          <PlusIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredTotal}
            pageSize={PAGE_SIZE}
            basePath={paginationBase}
          />
        </>
      )}
    </>
  );
}
