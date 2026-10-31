import type { Metadata } from "next";
import UserForm from "@/components/UserForm";
import { createUser } from "../actions";

export const metadata: Metadata = { title: "Nouvel utilisateur · Admin" };

export default function NewUserPage() {
  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Nouvel utilisateur</h1>
      <UserForm action={createUser} submitLabel="Créer l’utilisateur" passwordRequired />
    </>
  );
}
