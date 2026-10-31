"use client";

import { useMemo, useRef, useState } from "react";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { SHOP_PAGE_SIZE, totalPagesOf } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { CategoryDTO, ProductDTO } from "@/lib/types";

export default function ShopCatalog({
  products,
  categories,
}: {
  products: ProductDTO[];
  categories: CategoryDTO[];
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLParagraphElement>(null);

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function changeCategory(id: string) {
    setCategoryId(id);
    setPage(1);
  }

  function goToPage(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = categoryId === "all" || p.categoryId === categoryId;
      const matchesQuery =
        q === "" || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, query, categoryId]);

  const totalPages = totalPagesOf(filtered.length, SHOP_PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * SHOP_PAGE_SIZE, currentPage * SHOP_PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <label htmlFor="search" className="sr-only">
            Rechercher un produit
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder="Rechercher un produit"
            className="field pl-10"
          />
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>

        <div role="group" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
          {[{ id: "all", name: "Tout" }, ...categories].map((c) => {
            const active = categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => changeCategory(c.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <p ref={topRef} className="mt-6 scroll-mt-24 text-sm text-slate" aria-live="polite">
        {filtered.length} produit{filtered.length > 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-line p-12 text-center">
          <p className="font-semibold">Aucun résultat</p>
          <p className="mt-1 text-sm text-slate">Essayez un autre mot-clé ou changez de catégorie.</p>
          <button
            type="button"
            className="btn-ghost mt-5"
            onClick={() => {
              changeQuery("");
              changeCategory("all");
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={SHOP_PAGE_SIZE}
              onPageChange={goToPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
