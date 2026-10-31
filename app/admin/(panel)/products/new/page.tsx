import type { Metadata } from "next";
import ProductForm from "@/components/ProductForm";
import { getCategories } from "@/lib/data";
import { requireWrite } from "@/lib/session";
import { createProduct } from "../actions";

export const metadata: Metadata = { title: "Nouveau produit · Admin" };

export default async function NewProductPage() {
  await requireWrite("products");
  const categories = await getCategories();

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Nouveau produit</h1>
      <ProductForm action={createProduct} categories={categories} submitLabel="Créer le produit" />
    </>
  );
}
