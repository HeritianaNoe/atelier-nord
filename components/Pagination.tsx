import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  /** Mode "liens" (pages serveur) : navigation via ?page=N. */
  basePath?: string;
  /** Mode "boutons" (état client) : appelé avec le numéro de page choisi. */
  onPageChange?: (page: number) => void;
};

function pageHref(basePath: string, page: number) {
  if (page === 1) {
    // Strip any existing page= param but keep other query params.
    const [path, qs] = basePath.split("?");
    if (!qs) return path;
    const params = new URLSearchParams(qs);
    params.delete("page");
    const next = params.toString();
    return next ? `${path}?${next}` : path;
  }
  const sep = basePath.includes("?") ? "&" : "?";
  // Avoid duplicating page= if somehow present.
  const [path, qs] = basePath.split("?");
  if (!qs) return `${basePath}?page=${page}`;
  const params = new URLSearchParams(qs);
  params.set("page", String(page));
  return `${path}?${params.toString()}`;
}

function buildRange(page: number, total: number): (number | "gap-left" | "gap-right")[] {
  const set = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "gap-left" | "gap-right")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(i < sorted.length / 2 ? "gap-left" : "gap-right");
    out.push(p);
  });
  return out;
}

function PageControl({
  target,
  basePath,
  onPageChange,
  className,
  label,
  children,
}: {
  target: number;
  basePath?: string;
  onPageChange?: (page: number) => void;
  className: string;
  label?: string;
  children: ReactNode;
}) {
  if (onPageChange) {
    return (
      <button type="button" onClick={() => onPageChange(target)} className={className} aria-label={label}>
        {children}
      </button>
    );
  }
  return (
    <Link href={pageHref(basePath ?? "", target)} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

const item = "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors";

export default function Pagination({ page, totalPages, totalItems, pageSize, basePath, onPageChange }: Props) {
  if (totalItems === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate">
        {from}–{to} sur {totalItems}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          {page > 1 ? (
            <PageControl target={page - 1} basePath={basePath} onPageChange={onPageChange} className={`${item} hover:bg-mist`} label="Page précédente">
              ‹
            </PageControl>
          ) : (
            <span className={`${item} cursor-not-allowed opacity-40`} aria-hidden>‹</span>
          )}

          {buildRange(page, totalPages).map((p) =>
            typeof p === "string" ? (
              <span key={p} className="px-1 text-slate" aria-hidden>…</span>
            ) : p === page ? (
              <span key={p} aria-current="page" className={`${item} bg-ink text-paper`}>{p}</span>
            ) : (
              <PageControl key={p} target={p} basePath={basePath} onPageChange={onPageChange} className={`${item} hover:bg-mist`}>{p}</PageControl>
            ),
          )}

          {page < totalPages ? (
            <PageControl target={page + 1} basePath={basePath} onPageChange={onPageChange} className={`${item} hover:bg-mist`} label="Page suivante">
              ›
            </PageControl>
          ) : (
            <span className={`${item} cursor-not-allowed opacity-40`} aria-hidden>›</span>
          )}
        </nav>
      )}
    </div>
  );
}
