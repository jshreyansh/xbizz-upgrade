import type { ReactNode } from "react";
import { Scale, FlaskConical, ShieldCheck, TrendingUp, HeartPulse, Stethoscope, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ClaimStatus, DossierTypeName, ProductClaim } from "@/features/product-library/product-library-types";

/** One glyph per dossier type, shared by every screen that shows a claim
 *  card — the Claims tab and the cross-brand Claims Library both need the
 *  same at-a-glance "what kind of evidence is this" cue. */
export const DOSSIER_TYPE_ICON: Record<DossierTypeName, LucideIcon> = {
  Regulatory: Scale,
  Clinical: FlaskConical,
  Safety: ShieldCheck,
  Commercial: TrendingUp,
  Patient: HeartPulse,
  HCP: Stethoscope,
};

export const CLAIM_STATUS_STYLE: Record<ClaimStatus, { tone: string; bg: string; line: string; label: string }> = {
  approved: { tone: "text-ok", bg: "bg-ok-bg", line: "border-ok-line", label: "Approved" },
  pending: { tone: "text-warn", bg: "bg-warn-bg", line: "border-warn-line", label: "Pending" },
  "held out": { tone: "text-danger", bg: "bg-danger-bg", line: "border-danger", label: "Held out" },
};

/**
 * A single approved (or pending, or held-out) statement, as a self-contained
 * card rather than a row in a table — each claim reads as its own citable
 * unit: what kind of evidence it is, its review status, the statement
 * itself, and the dossier section it traces back to. `footer` is the slot
 * for context a table row wouldn't need (which brand this belongs to, in
 * the cross-brand Claims Library).
 */
export function ClaimCard({
  claim,
  footer,
  onClick,
  className,
}: {
  claim: ProductClaim;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const s = CLAIM_STATUS_STYLE[claim.status];
  const Icon = DOSSIER_TYPE_ICON[claim.dossierType];

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter") onClick();
            }
          : undefined
      }
      className={cn(
        "group flex flex-col gap-3 rounded-panel border bg-card p-4 shadow-hair transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-soft",
        s.line,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-[.03em] text-ink-3">
          <span className={cn("grid size-6 shrink-0 place-items-center rounded-chip", s.bg, s.tone)}>
            <Icon size={13} />
          </span>
          {claim.dossierType}
        </span>
        <span className={cn("shrink-0 rounded-chip px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.03em]", s.bg, s.tone)}>
          {s.label}
        </span>
      </div>

      <p className="flex-1 text-body-lg leading-relaxed text-ink-2">{claim.text}</p>

      <div className="flex items-center justify-between gap-3 border-t border-hair pt-2.5 text-caption text-ink-4">
        <span className="min-w-0 truncate">{claim.source}</span>
        {footer}
      </div>
    </div>
  );
}
