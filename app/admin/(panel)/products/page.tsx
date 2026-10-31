import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteIconButton from "@/components/DeleteIconButton";
import EditIconLink from "@/components/EditIconLink";
import Pagination from "@/components/Pagination";
import StockBadge from "@/components/StockBadge";
import { PAGE_SIZE, clampRedirect, parsePage, totalPagesOf } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import ReadOnlyBadge from "@/components/ReadOnlyBadge";
import { canWrite } from "@/lib/permissions";
import { requireAccess } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "./actions";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Produits · Admin" };

const BASE = "/admin/products";

function parseQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim();
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}) {
  const staff = await requireAccess("products");
  const writable = canWrite(staff.role, "products");
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = parseQuery(sp.q);

  const where: Prisma.ProductWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  const total = await prisma.product.count({ where });
  const totalPages = totalPagesOf(total);
  const baseWithQ = q ? `${BASE}?q=${encodeURIComponent(q)}` : BASE;
  if (page > totalPages) redirect(clampRedirect(baseWithQ, totalPages));

  const products = await prisma.product.findMany({
    where,
    include: { category: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Produits</h1>
          <p className="mt-1 text-sm text-slate">
            {q
              ? `${total} résultat${total > 1 ? "s" : ""} pour « ${q} »`
              : `${total} produit${total > 1 ? "s" : ""} au catalogue`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form action={BASE} method="get" className="relative">
            <label htmlFor="product-search" className="sr-only">
              Rechercher un produit
            </label>
            <input
              id="product-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Rechercher…"
              className="field w-48 sm:w-56 pl-9"
            />
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </form>
          {writable ? (
            <Link href="/admin/products/new" className="btn-primary">
              Ajouter un produit
            </Link>
          ) : (
            <ReadOnlyBadge />
          )}
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">{q ? "Aucun résultat" : "Aucun produit"}</p>
          <p className="mt-1 text-sm text-slate">
            {q
              ? "Essayez un autre mot-clé."
              : "Ajoutez votre premier produit pour remplir la boutique."}
          </p>
          {q && (
            <Link href={BASE} className="mt-4 inline-block text-sm font-semibold text-cobalt underline-offset-2 hover:underline">
              Voir tous les produits
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-line bg-mist text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Catégorie</th>
                  <th className="px-4 py-3 font-semibold">Prix</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">À la Une</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-mist">
                          <Image src={p.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                        </div>
                        <span className="font-semibold">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate">{p.category.name}</td>
                    <td className="px-4 py-3">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className="px-4 py-3">{p.isFeatured ? "Oui" : "Non"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <EditIconLink
                          href={`/admin/products/${p.id}/edit`}
                          label={`Modifier « ${p.title} »`}
                          disabled={!writable}
                        />
                        <DeleteIconButton id={p.id} name={p.title} onDelete={deleteProduct} disabled={!writable} />
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
            totalItems={total}
            pageSize={PAGE_SIZE}
            basePath={baseWithQ}
          />
        </>
      )}
    </>
  );
}
