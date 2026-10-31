"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidateStockViews } from "@/lib/revalidate";
import { requireAccess } from "@/lib/session";

const movementSchema = z
  .object({
    productId: z.string().min(1, "Choisissez un produit."),
    type: z.enum(["IN", "ADJUST"], { errorMap: () => ({ message: "Type invalide." }) }),
    quantity: z.coerce
      .number({ invalid_type_error: "Quantité invalide." })
      .int("La quantité doit être un nombre entier.")
      .refine((n) => n !== 0, "Entrez une quantité différente de 0.")
      .refine((n) => Math.abs(n) <= 100_000, "Quantité trop grande."),
    note: z.string().trim().max(200, "200 caractères maximum."),
  })
  .superRefine((v, ctx) => {
    if (v.type === "IN" && v.quantity < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Une entrée doit être positive. Pour retirer du stock, choisissez « Ajustement ».",
      });
    }
    if (v.type === "ADJUST" && v.note.length === 0) {
      ctx.addIssue({ code: "custom", path: ["note"], message: "Précisez la raison de l’ajustement (casse, inventaire…)." });
    }
  });

export type StockFormState = {
  errors?: Partial<Record<"productId" | "type" | "quantity" | "note", string[]>> & { form?: string[] };
  values?: Record<string, string>;
};

/** Business refusal we can show as-is (not exported: a "use server" file only exports async functions). */
class StockError extends Error {}

export async function createMovement(_prev: StockFormState, formData: FormData): Promise<StockFormState> {
  const staff = await requireAccess("stock");

  const values = {
    productId: String(formData.get("productId") ?? ""),
    type: String(formData.get("type") ?? "IN"),
    quantity: String(formData.get("quantity") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
  const parsed = movementSchema.safeParse(values);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, values };

  const { productId, type, quantity: delta, note } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true } });
      if (!product) throw new StockError("Ce produit n’existe plus.");

      if (delta < 0) {
        // Conditional decrement: the stock can never go below zero, even with concurrent sales.
        const res = await tx.product.updateMany({
          where: { id: productId, stock: { gte: -delta } },
          data: { stock: { decrement: -delta } },
        });
        if (res.count === 0) throw new StockError("Le stock ne peut pas devenir négatif.");
      } else {
        await tx.product.update({ where: { id: productId }, data: { stock: { increment: delta } } });
      }

      const after = await tx.product.findUniqueOrThrow({ where: { id: productId }, select: { stock: true } });
      await tx.stockMovement.create({
        data: { type, quantity: delta, stockAfter: after.stock, note: note || null, productId, userId: staff.id },
      });
    });
  } catch (e) {
    if (e instanceof StockError) return { errors: { form: [e.message] }, values };
    console.error(e);
    return { errors: { form: ["Une erreur est survenue. Réessayez."] }, values };
  }

  revalidateStockViews();
  redirect("/admin/stock");
}
