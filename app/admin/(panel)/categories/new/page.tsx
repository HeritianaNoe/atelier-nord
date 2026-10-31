import type { Metadata } from "next";
import CategoryForm from "@/components/CategoryForm";
import { requireWrite } from "@/lib/session";
import { createCategory } from "../actions";

export const metadata: Metadata = { title: "Nouvelle catégorie · Admin" };

export default async function NewCategoryPage() {
  await requireWrite("categories");
  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Nouvelle catégorie</h1>
      <CategoryForm action={createCategory} submitLabel="Créer la catégorie" />
    </>
  );
}
