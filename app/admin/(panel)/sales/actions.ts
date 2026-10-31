"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { OrderError, createOrder } from "@/lib/orders";
import { revalidateStockViews } from "@/lib/revalidate";
import { requireAccess } from "@/lib/session";

const saleSchema = z.object({
  customerName: z.string().trim().max(80, "80 caractères maximum."),
  customerPhone: z.string().trim().max(30, "30 caractères maximum."),
  lines: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int("Quantité entière requise.").min(1, "Quantité minimale : 1.").max(999) }))
    .min(1, "Ajoutez au moins un article.")
    .max(50),
});

export type SaleFormState = {
  errors?: Partial<Record<"customerName" | "customerPhone" | "lines", string[]>> & { form?: string[] };
  values?: Record<string, string>;
};

export async function createSale(_prev: SaleFormState, formData: FormData): Promise<SaleFormState> {
  const staff = await requireAccess("sales");

  const values = {
    customerName: String(formData.get("customerName") ?? ""),
    customerPhone: String(formData.get("customerPhone") ?? ""),
  };

  const productIds = formData.getAll("productId").map(String);
  const quantities = formData.getAll("quantity").map((q) => Number(q));
  const lines = productIds
    .map((productId, i) => ({ productId, quantity: quantities[i] ?? 0 }))
    .filter((l) => l.productId !== ""); // ignore empty rows

  const parsed = saleSchema.safeParse({ ...values, lines });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, values };

  let orderId: string;
  try {
    const order = await createOrder({
      lines: parsed.data.lines,
      customerName: parsed.data.customerName || "Client comptoir",
      customerPhone: parsed.data.customerPhone,
      source: "COUNTER",
      createdById: staff.id,
    });
    orderId = order.id;
  } catch (e) {
    if (e instanceof OrderError) return { errors: { form: [e.message] }, values };
    console.error(e);
    return { errors: { form: ["Une erreur est survenue. Réessayez."] }, values };
  }

  revalidateStockViews();
  redirect(`/admin/sales/${orderId}`);
}
