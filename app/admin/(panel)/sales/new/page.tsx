import type { Metadata } from "next";
import SaleForm from "@/components/SaleForm";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { createSale } from "../actions";

export const metadata: Metadata = { title: "Nouvelle vente · Admin" };

export default async function NewSalePage() {
  await requireAccess("sales");
  const products = await prisma.product.findMany({
    select: { id: true, title: true, price: true, stock: true },
    orderBy: [{ title: "asc" }, { id: "asc" }],
  });

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Nouvelle vente</h1>
      <SaleForm action={createSale} products={products} />
    </>
  );
}
