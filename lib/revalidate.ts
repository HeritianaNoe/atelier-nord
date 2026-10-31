import "server-only";
import { revalidatePath } from "next/cache";

/** Everything that displays stock levels or sales. Call after any stock change. */
export function revalidateStockViews() {
  for (const path of [
    "/",
    "/shop",
    "/admin/products",
    "/admin/stock",
    "/admin/stock/movements",
    "/admin/sales",
  ]) {
    revalidatePath(path);
  }
}
