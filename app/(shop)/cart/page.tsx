import type { Metadata } from "next";
import CartView from "@/components/CartView";

export const metadata: Metadata = { title: "Panier" };

export default function CartPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Panier</h1>
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
