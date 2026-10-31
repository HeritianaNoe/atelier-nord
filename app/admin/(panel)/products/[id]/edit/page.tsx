import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getCategories } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/session";
import { updateProduct } from "../../actions";

export const metadata: Metadata = { title: "Modifier le produit · Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireWrite("products");
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Modifier « {product.title} »</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        submitLabel="Enregistrer les modifications"
        stockInfo={{ productId: product.id, current: product.stock }}
        defaults={{
          title: product.title,
          description: product.description,
          price: String(product.price),
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
        }}
      />
    </>
  );
}
