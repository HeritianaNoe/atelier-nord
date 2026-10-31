import type { Metadata } from "next";
import StockEntryForm from "@/components/StockEntryForm";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/session";
import { createMovement } from "../actions";

export const metadata: Metadata = { title: "Entrée de stock · Admin" };

export default async function NewStockMovementPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string | string[] }>;
}) {
  await requireAccess("stock");
  const raw = (await searchParams).product;
  const preselected = Array.isArray(raw) ? raw[0] : raw;

  const products = await prisma.product.findMany({
    select: { id: true, title: true, stock: true },
    orderBy: [{ title: "asc" }, { id: "asc" }],
  });

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Nouvelle entrée de stock</h1>
      <StockEntryForm
        action={createMovement}
        products={products}
        initialProductId={products.some((p) => p.id === preselected) ? preselected : undefined}
      />
    </>
  );
}
