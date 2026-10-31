import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/CategoryForm";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/session";
import { updateCategory } from "../../actions";

export const metadata: Metadata = { title: "Modifier la catégorie · Admin" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireWrite("categories");
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Modifier « {category.name} »</h1>
      <CategoryForm action={updateCategory.bind(null, category.id)} defaultName={category.name} submitLabel="Enregistrer les modifications" />
    </>
  );
}
