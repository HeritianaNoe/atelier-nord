// Pure module: safe to import from server and client code.
export const DEFAULT_STOCK = 10;
export const LOW_STOCK_THRESHOLD = 3;

export type StockLevel = "out" | "low" | "ok";

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}
