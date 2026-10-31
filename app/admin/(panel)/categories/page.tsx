import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteIconButton from "@/components/DeleteIconButton";
import EditIconLink from "@/components/EditIconLink";
import Pagination from "@/components/Pagination";
import { PAGE_SIZE, clampRedirect, parsePage, totalPagesOf } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import ReadOnlyBadge from "@/components/ReadOnlyBadge";
import { canWrite } from "@/lib/permissions";
import { requireAccess } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";
import { deleteCategory } from "./actions";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Catégories · Admin" };

const BASE = "/admin/categories";

function parseQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim();
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}) {
  const staff = await requireAccess("categories");
  const writable = canWrite(staff.role, "categories");
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = parseQuery(sp.q);

  const where: Prisma.CategoryWhereInput = q
    ? { name: { contains: q, mode: "insensitive" } }
    : {};

  const total = await prisma.category.count({ where });
  const totalPages = totalPagesOf(total);
  const baseWithQ = q ? `${BASE}?q=${encodeURIComponent(q)}` : BASE;
  if (page > totalPages) redirect(clampRedirect(baseWithQ, totalPages));

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: { select: { products: true } },
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Catégories</h1>
          <p className="mt-1 text-sm text-slate">
            {q
              ? `${total} résultat${total > 1 ? "s" : ""} pour « ${q} »`
              : `${total} catégorie${total > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form action={BASE} method="get" className="relative">
            <label htmlFor="category-search" className="sr-only">
              Rechercher une catégorie
            </label>
            <input
              id="category-search"
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
            <Link href="/admin/categories/new" className="btn-primary">
              Ajouter une catégorie
            </Link>
          ) : (
            <ReadOnlyBadge />
          )}
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">{q ? "Aucun résultat" : "Aucune catégorie"}</p>
          <p className="mt-1 text-sm text-slate">
            {q ? "Essayez un autre mot-clé." : "Créez une catégorie avant d’ajouter des produits."}
          </p>
          {q && (
            <Link href={BASE} className="mt-4 inline-block text-sm font-semibold text-cobalt underline-offset-2 hover:underline">
              Voir toutes les catégories
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-mist text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nom</th>
                  <th className="px-4 py-3 font-semibold">Produits</th>
                  <th className="px-4 py-3 font-semibold">Créé par</th>
                  <th className="px-4 py-3 font-semibold">Modifié par</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3 text-slate">{c._count.products}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.createdBy?.name ?? "—"}</p>
                      <p className="text-xs text-slate">{formatDateTime(c.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.updatedBy?.name ?? "—"}</p>
                      <p className="text-xs text-slate">{c.updatedBy ? formatDateTime(c.updatedAt) : ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <EditIconLink
                          href={`/admin/categories/${c.id}/edit`}
                          label={`Modifier « ${c.name} »`}
                          disabled={!writable}
                        />
                        <DeleteIconButton id={c.id} name={c.name} onDelete={deleteCategory} disabled={!writable} />
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
