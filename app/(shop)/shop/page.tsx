import type { Metadata } from "next";
import ShopCatalog from "@/components/ShopCatalog";
import { getAllProducts, getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Boutique" };

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Boutique</h1>
      <p className="mt-3 max-w-xl text-slate">Toute la collection, filtrable par catégorie ou par mot-clé.</p>
      <div className="mt-10">
        <ShopCatalog products={products} categories={categories} />
      </div>
    </div>
  );
}
