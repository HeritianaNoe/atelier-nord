import { LockIcon } from "@/components/icons";

export default function ReadOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-slate">
      <LockIcon className="h-3.5 w-3.5" />
      Lecture seule
    </span>
  );
}
