export const PAGE_SIZE = 10;

/** Produits par page sur la boutique (grille de 4 colonnes → 3 rangées). */
export const SHOP_PAGE_SIZE = 12;

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function totalPagesOf(count: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

/** Where to send the user when `?page=` is past the last page (e.g. after deleting the last row of a page). */
export function clampRedirect(basePath: string, totalPages: number): string {
  if (totalPages <= 1) {
    const [path, qs] = basePath.split("?");
    if (!qs) return path;
    const params = new URLSearchParams(qs);
    params.delete("page");
    const next = params.toString();
    return next ? `${path}?${next}` : path;
  }
  const [path, qs] = basePath.split("?");
  if (!qs) return `${basePath}?page=${totalPages}`;
  const params = new URLSearchParams(qs);
  params.set("page", String(totalPages));
  return `${path}?${params.toString()}`;
}
