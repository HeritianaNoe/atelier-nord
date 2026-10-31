import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UserForm from "@/components/UserForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { updateUser } from "../../actions";

export const metadata: Metadata = { title: "Modifier l’utilisateur · Admin" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [admin, user] = await Promise.all([requireAdmin(), prisma.user.findUnique({ where: { id } })]);
  if (!user) notFound();

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Modifier « {user.name} »</h1>
      <UserForm
        action={updateUser.bind(null, user.id)}
        isSelf={admin.id === user.id}
        submitLabel="Enregistrer les modifications"
        defaults={{ name: user.name, email: user.email, role: user.role, gender: user.gender, photoUrl: user.photoUrl ?? "" }}
      />
    </>
  );
}
