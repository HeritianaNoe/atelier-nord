import Link from "next/link";
import { ROLE_LABEL, type Role } from "@/lib/permissions";
import type { Gender } from "@/lib/avatars";
import UserAvatar from "@/components/UserAvatar";

type Props = {
  user: { id: string; name: string; role: Role; gender: Gender; photoUrl?: string | null };
};

/** Carte en haut de la sidebar : photo, puis nom et rôle. Photo et nom mènent à la page profil. */
export default function SidebarUserCard({ user }: Props) {
  return (
    <div className="mb-4 flex flex-col items-center gap-2 border-b border-paper/10 pb-5 text-center">
      <Link
        href="/admin/profile"
        aria-label="Voir mon profil"
        className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-paper/60"
      >
        <UserAvatar user={user} size={72} className="ring-2 ring-paper/25 transition hover:ring-paper/60" />
      </Link>
      <div className="min-w-0 w-full">
        <Link
          href="/admin/profile"
          className="block truncate text-sm font-semibold text-paper hover:underline underline-offset-4"
        >
          {user.name}
        </Link>
        <p className="truncate text-xs text-paper/60">{ROLE_LABEL[user.role]}</p>
      </div>
    </div>
  );
}
