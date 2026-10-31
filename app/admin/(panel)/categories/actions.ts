"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/session";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(60, "60 caractères maximum."),
});

export type CategoryFormState = {
  errors?: { name?: string[]; form?: string[] };
  values?: { name: string };
};

function refresh() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}

async function nameTaken(name: string, exceptId?: string) {
  const existing = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { id: true },
  });
  return !!existing;
}

export async function createCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const staff = await requireWrite("categories");
  const values = { name: String(formData.get("name") ?? "") };
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, values };

  if (await nameTaken(parsed.data.name)) return { errors: { name: ["Cette catégorie existe déjà."] }, values };

  try {
    await prisma.category.create({ data: { ...parsed.data, createdById: staff.id, updatedById: staff.id } });
  } catch {
    return { errors: { form: ["Impossible de créer la catégorie."] }, values };
  }
  refresh();
  redirect("/admin/categories");
}

export async function updateCategory(id: string, _prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const staff = await requireWrite("categories");
  const values = { name: String(formData.get("name") ?? "") };
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, values };

  if (await nameTaken(parsed.data.name, id)) return { errors: { name: ["Cette catégorie existe déjà."] }, values };

  try {
    await prisma.category.update({ where: { id }, data: { ...parsed.data, updatedById: staff.id } });
  } catch {
    return { errors: { form: ["Cette catégorie n’existe plus."] }, values };
  }
  refresh();
  redirect("/admin/categories");
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  await requireWrite("categories");
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return {
      error: `Impossible de supprimer : ${count} produit${count > 1 ? "s" : ""} utilise${count > 1 ? "nt" : ""} cette catégorie. Déplacez-les ou supprimez-les d’abord.`,
    };
  }
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    // Already deleted: nothing to do.
  }
  refresh();
  return {};
}
