// Pure module: safe to import from server and client code.
export type Role = "ADMIN" | "VENTE" | "STOCK";
export type Section = "products" | "categories" | "stock" | "sales" | "users";

const ACCESS: Record<Role, readonly Section[]> = {
  ADMIN: ["products", "categories", "stock", "sales", "users"],
  STOCK: ["products", "categories", "stock"],
  VENTE: ["sales", "products", "categories"], // products & categories: read-only (see WRITE)
};

/** Sections a role may modify. Anything in ACCESS but not here is read-only. */
const WRITE: Record<Role, readonly Section[]> = {
  ADMIN: ["products", "categories", "stock", "sales", "users"],
  STOCK: ["products", "categories", "stock"],
  VENTE: ["sales"],
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrateur",
  VENTE: "Commercial",
  STOCK: "Magasinier",
};

export const ROLE_HELP: Record<Role, string> = {
  ADMIN: "Accès complet, y compris la gestion des utilisateurs.",
  STOCK: "Produits, catégories et gestion du stock.",
  VENTE: "Enregistre et consulte les ventes. Consulte les produits et catégories (lecture seule).",
};

export function can(role: Role, section: Section): boolean {
  return ACCESS[role].includes(section);
}

export function canWrite(role: Role, section: Section): boolean {
  return WRITE[role].includes(section);
}

/** First page shown after login, and where a user is sent when they open a page they may not access. */
export function homeFor(role: Role): string {
  if (role === "ADMIN") return "/admin/products";
  if (role === "STOCK") return "/admin/stock";
  return "/admin/sales";
}
