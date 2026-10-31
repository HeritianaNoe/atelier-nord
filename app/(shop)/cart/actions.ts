"use server";

import { z } from "zod";
import { OrderError, createOrder } from "@/lib/orders";
import { revalidateStockViews } from "@/lib/revalidate";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Entrez votre nom.").max(80),
  email: z.string().trim().toLowerCase().email("Adresse email invalide.").max(160),
  phone: z.string().trim().max(30).optional(),
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Votre panier est vide.")
    .max(50),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutResult =
  | { ok: true; number: number }
  | { ok: false; error?: string; fieldErrors?: Partial<Record<"name" | "email" | "phone", string[]>> };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      fieldErrors: flat.fieldErrors,
      error: flat.fieldErrors.items?.[0],
    };
  }

  try {
    const order = await createOrder({
      lines: parsed.data.items,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      customerPhone: parsed.data.phone,
      source: "WEB",
    });
    revalidateStockViews();
    return { ok: true, number: order.number };
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message };
    console.error(e);
    return { ok: false, error: "Une erreur est survenue. Réessayez dans un instant." };
  }
}
