import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import SidebarUserCard from "@/components/SidebarUserCard";
import { CartIcon, PackageIcon, TagsIcon, UsersIcon, WarehouseIcon } from "@/components/icons";
import { can, type Section } from "@/lib/permissions";
import { requireStaff } from "@/lib/session";
import type { ComponentType } from "react";

export const dynamic = "force-dynamic";

const NAV: {
  section: Section;
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  { section: "products", href: "/admin/products", label: "Produits", Icon: PackageIcon },
  { section: "categories", href: "/admin/categories", label: "Catégories", Icon: TagsIcon },
  { section: "stock", href: "/admin/stock", label: "Stock", Icon: WarehouseIcon },
  { section: "sales", href: "/admin/sales", label: "Ventes", Icon: CartIcon },
  { section: "users", href: "/admin/users", label: "Utilisateurs", Icon: UsersIcon },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff(); // each page ALSO checks its own section with requireAccess()

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. TOP BAR (Mbola eo ihany: Lohateny, Roly, ary Se déconnecter) */}
      <header className="border-b border-line bg-ink text-paper print:hidden">
        <div className="container-page flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
          <div className="flex items-center gap-x-6">
            <Link href="/" className="font-display text-lg font-extrabold">
              Atelier Nord
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <form action={logout}>
              <button type="submit" className="text-sm font-semibold underline underline-offset-4 hover:text-white">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 2. LAYOUT AMBANY: Sidebar ankavia + Votoatiny (Main) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr] print:block">
        {/* SIDEBAR ANKAVIA (NAV ihany no eto) */}
        <aside className="border-r border-line bg-ink text-paper p-6 flex flex-col gap-2 print:hidden">
          <span className="text-xs font-semibold text-paper/50 uppercase tracking-wider mb-2">Utilisateur</span>
          <SidebarUserCard user={staff} />
          <span className="text-xs font-semibold text-paper/50 uppercase tracking-wider mb-2">Navigation</span>
          <nav className="flex flex-col gap-1">
            {NAV.filter((n) => can(staff.role, n.section)).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-paper/80 hover:bg-paper/10 hover:text-paper font-medium transition-colors"
              >
                <n.Icon className="shrink-0 opacity-80" />
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* VOTOATINY LEHIBE */}
        <main className="container-page py-10 bg-background">{children}</main>
      </div>
    </div>
  );
}
