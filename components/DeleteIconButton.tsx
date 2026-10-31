"use client";

import { useTransition } from "react";
import { TrashIcon } from "@/components/icons";

type Props = {
  id: string;
  /** Shown in the confirmation dialog, e.g. the product title. */
  name: string;
  /** A Server Action. May return `{ error }` to report a refusal. */
  onDelete: (id: string) => Promise<{ error?: string } | void>;
  label?: string;
  disabled?: boolean;
};

export default function DeleteIconButton({ id, name, onDelete, label = "Supprimer", disabled }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="icon-btn-danger"
      aria-label={`${label} « ${name} »`}
      title={disabled ? "Lecture seule : suppression non autorisée" : label}
      disabled={pending || disabled}
      onClick={() => {
        if (!window.confirm(`Supprimer « ${name} » ? Cette action est définitive.`)) return;
        startTransition(async () => {
          const result = await onDelete(id);
          if (result?.error) window.alert(result.error);
        });
      }}
    >
      <TrashIcon className={pending ? "animate-pulse" : undefined} />
    </button>
  );
}
