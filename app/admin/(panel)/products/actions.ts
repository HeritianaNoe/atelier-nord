"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEFAULT_STOCK } from "@/lib/stock";
import { requireWrite } from "@/lib/session";

const shape = {
  title: z.string().trim().min(2, "Le titre doit contenir au moins 2 caractères.").max(120),
  description: z.string().trim().min(10, "La description doit contenir au moins 10 caractères.").max(2000),
  price: z.coerce.number({ invalid_type_error: "Prix invalide." }).positive("Le prix doit être supérieur à 0.").max(1_000_000),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Entrez l’URL ou le chemin de l’image.")
    .refine(
      (u) => /^https?:\/\/\S+$/.test(u) || /^\/[\w\-./]+$/.test(u),
      "Utilisez une URL https://… ou un chemin comme /products/vase.svg",
    ),
  categoryId: z.string().min(1, "Choisissez une catégorie."),
  isFeatured: z.boolean(),
};

// Stock is only set when the product is created. Afterwards it changes through stock movements
// (entry, adjustment, sale) so that every change is logged.
const updateSchema = z.object(shape);
const createSchema = z.object({
  ...shape,
  stock: z.coerce
    .number({ invalid_type_error: "Stock invalide." })
    .int("Le stock doit être un nombre entier.")
    .min(0, "Le stock ne peut pas être négatif.")
    .max(100_000),
});

export type ProductFormState = {
  errors?: Partial<Record<keyof z.infer<typeof createSchema>, string[]>> & { form?: string[] };
  values?: Record<string, string>;
};

function rawValues(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    isFeatured: formData.get("isFeatured") === "on",
  };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/admin/stock");
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const staff = await requireWrite("products");
  const raw = { ...rawValues(formData), stock: String(formData.get("stock") ?? String(DEFAULT_STOCK)) };
  const values = { ...raw, isFeatured: raw.isFeatured ? "on" : "" };
  const result = createSchema.safeParse(raw);
  if (!result.success) return { errors: result.error.flatten().fieldErrors, values };

  const category = await prisma.category.findUnique({ where: { id: result.data.categoryId } });
  if (!category) return { errors: { categoryId: ["Catégorie introuvable."] }, values };

  const { stock, ...data } = result.data;
  await prisma.product.create({
    data: {
      ...data,
      stock,
      movements:
        stock > 0
          ? { create: { type: "IN", quantity: stock, stockAfter: stock, note: "Stock initial", userId: staff.id } }
          : undefined,
    },
  });
  refresh();
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireWrite("products");
  const raw = rawValues(formData);
  const values = { ...raw, isFeatured: raw.isFeatured ? "on" : "" };
  const result = updateSchema.safeParse(raw);
  if (!result.success) return { errors: result.error.flatten().fieldErrors, values };

  try {
    await prisma.product.update({ where: { id }, data: result.data });
  } catch {
    return { errors: { form: ["Ce produit n’existe plus ou la catégorie est invalide."] }, values };
  }
  refresh();
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireWrite("products");
  try {
    // Its stock history is deleted with it; past sales keep their title and price.
    await prisma.product.delete({ where: { id } });
  } catch {
    // Already deleted: nothing to do.
  }
  refresh();
}
