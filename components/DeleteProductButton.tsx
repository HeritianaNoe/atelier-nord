"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/admin/(panel)/products/actions";

export default function DeleteProductButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="btn-danger !px-3 !py-1.5"
      onClick={() => {
        if (window.confirm(`Supprimer « ${title} » ? Cette action est définitive.`)) {
          startTransition(() => deleteProduct(id));
        }
      }}
    >
      {pending ? "Suppression…" : "Supprimer"}
    </button>
  );
}
