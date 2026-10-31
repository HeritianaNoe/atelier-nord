import "server-only";
import { prisma } from "@/lib/prisma";

/** A refusal we can show to the user as-is (out of stock, unknown product…). */
export class OrderError extends Error {}

export type NewOrder = {
  lines: { productId: string; quantity: number }[];
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  source: "WEB" | "COUNTER";
  createdById?: string | null;
};

/**
 * Creates an order AND decreases the stock, atomically.
 * - Prices always come from the database, never from the client.
 * - The decrement is conditional (`stock >= quantity`), so two simultaneous buyers can never
 *   push the stock below zero: the second one is refused and the whole transaction rolls back.
 * - Every decrement is logged in StockMovement.
 */
export async function createOrder(input: NewOrder) {
  const merged = new Map<string, number>();
  for (const l of input.lines) merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.quantity);

  // Sorted so concurrent transactions lock rows in the same order (no deadlocks).
  const lines = [...merged.entries()]
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((a, b) => a.productId.localeCompare(b.productId));

  if (lines.length === 0) throw new OrderError("La commande est vide.");
  if (lines.some((l) => !Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > 999)) {
    throw new OrderError("Quantité invalide.");
  }

  return prisma.$transaction(async (tx) => {
    const ids = lines.map((l) => l.productId);
    const products = await tx.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, price: true, stock: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    for (const line of lines) {
      const product = byId.get(line.productId);
      if (!product) throw new OrderError("Un article n’existe plus. Actualisez la page et réessayez.");

      const res = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (res.count === 0) {
        throw new OrderError(
          product.stock <= 0
            ? `« ${product.title} » est en rupture de stock.`
            : `Stock insuffisant pour « ${product.title} » : ${product.stock} disponible${product.stock > 1 ? "s" : ""}.`,
        );
      }
    }

    const total = Math.round(lines.reduce((sum, l) => sum + byId.get(l.productId)!.price * l.quantity, 0) * 100) / 100;

    const order = await tx.order.create({
      data: {
        customerName: input.customerName,
        customerEmail: input.customerEmail || null,
        customerPhone: input.customerPhone || null,
        source: input.source,
        total,
        createdById: input.createdById ?? null,
        items: {
          create: lines.map((l) => {
            const p = byId.get(l.productId)!;
            return { title: p.title, unitPrice: p.price, quantity: l.quantity, productId: p.id };
          }),
        },
      },
      select: { id: true, number: true, total: true },
    });

    const after = await tx.product.findMany({ where: { id: { in: ids } }, select: { id: true, stock: true } });
    const afterById = new Map(after.map((p) => [p.id, p.stock]));

    await tx.stockMovement.createMany({
      data: lines.map((l) => ({
        type: "OUT" as const,
        quantity: -l.quantity,
        stockAfter: afterById.get(l.productId) ?? 0,
        note: `Vente n°${order.number}`,
        productId: l.productId,
        orderId: order.id,
        userId: input.createdById ?? null,
      })),
    });

    return order;
  });
}
