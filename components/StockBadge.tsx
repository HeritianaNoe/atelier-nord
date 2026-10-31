import { stockLevel } from "@/lib/stock";

export default function StockBadge({ stock }: { stock: number }) {
  const level = stockLevel(stock);
  const styles =
    level === "out"
      ? "bg-danger/10 text-danger"
      : level === "low"
        ? "border border-danger/40 text-danger"
        : "bg-mist text-slate";
  const label = level === "out" ? "0 · rupture" : level === "low" ? `${stock} · faible` : String(stock);
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>{label}</span>;
}
