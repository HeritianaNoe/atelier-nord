import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteIconButton from "@/components/DeleteIconButton";
import EditIconLink from "@/components/EditIconLink";
import UserAvatar from "@/components/UserAvatar";
import Pagination from "@/components/Pagination";
import { PAGE_SIZE, clampRedirect, parsePage, totalPagesOf } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/lib/permissions";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { deleteUser } from "./actions";

export const metadata: Metadata = { title: "Utilisateurs · Admin" };

const BASE = "/admin/users";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const admin = await requireAdmin();
  const page = parsePage((await searchParams).page);
  const total = await prisma.user.count();
  const totalPages = totalPagesOf(total);
  if (page > totalPages) redirect(clampRedirect(BASE, totalPages));

  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate">{total} utilisateur{total > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/users/new" className="btn-primary">Ajouter un utilisateur</Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-md border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-mist text-slate">
            <tr>
              <th className="px-4 py-3 font-semibold">Photo</th>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Rôle</th>
              <th className="px-4 py-3 font-semibold">Créé le</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const isSelf = u.id === admin.id;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <UserAvatar user={u} size={36} />
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {u.name}
                    {isSelf && <span className="ml-2 text-xs font-medium text-slate">(vous)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "ADMIN" ? "bg-cobalt/10 text-cobalt" : u.role === "STOCK" ? "bg-ink/10 text-ink" : "bg-mist text-slate"
                      }`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <EditIconLink href={`/admin/users/${u.id}/edit`} label={`Modifier « ${u.name} »`} />
                      <DeleteIconButton id={u.id} name={u.name} onDelete={deleteUser} disabled={isSelf} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} basePath={BASE} />
    </>
  );
}
