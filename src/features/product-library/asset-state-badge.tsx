import { CircleAlert, CircleDashed, ShieldCheck } from "lucide-react";
import type { AssetOrigin, AssetVerification } from "@/features/product-library/product-library-types";

const STATE = {
  verified: { label: "Verified", icon: ShieldCheck, className: "bg-ok-bg text-ok" },
  "in progress": { label: "In progress", icon: CircleDashed, className: "bg-warn-bg text-warn" },
  "has issues": { label: "Has issues", icon: CircleAlert, className: "bg-danger-bg text-danger" },
} as const satisfies Record<AssetVerification, { label: string; icon: typeof ShieldCheck; className: string }>;

/**
 * Where a file has got to.
 *
 * Attachments and images both arrive from a person and are then checked
 * against the approved source, so both carry the same three states and both
 * say so the same way — a shelf where the badge means one thing on one tab
 * and something else on the next is worse than no badge.
 */
export function AssetStateBadge({ state, onDark }: { state: AssetVerification; onDark?: boolean }) {
  const { label, icon: Icon, className } = STATE[state];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.04em] ${className} ${
        onDark ? "shadow-hair backdrop-blur-sm" : ""
      }`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

/** "SwishX", or "Arjun Pillai — Marketing". */
export function originLabel(origin: AssetOrigin): string {
  return origin.team ? `${origin.name} — ${origin.team}` : origin.name;
}
