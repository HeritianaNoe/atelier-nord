import Link from "next/link";
import { PencilIcon } from "@/components/icons";

type Props = { href: string; label: string; disabled?: boolean };

export default function EditIconLink({ href, label, disabled }: Props) {
  if (disabled) {
    return (
      <button type="button" className="icon-btn" disabled aria-label={label} title="Lecture seule : modification non autorisée">
        <PencilIcon />
      </button>
    );
  }
  return (
    <Link href={href} className="icon-btn" aria-label={label} title={label}>
      <PencilIcon />
    </Link>
  );
}
