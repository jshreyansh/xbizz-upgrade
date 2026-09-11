"use client";

import { cn } from "@/lib/cn";
import { APPROVED_CLAIMS } from "@/features/workspace/script-claims";

/**
 * The approved claims, beside whatever is being written.
 *
 * Shared by the video script stage and the creative copy deck, because it is
 * the same list answering the same question: what am I allowed to say. A
 * citation badge in either stage jumps here and highlights its claim, which
 * only works if both stages are looking at one panel rather than two copies
 * of one.
 */
export function ClaimsPanel({ highlightedClaimId }: { highlightedClaimId?: string | null }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      <div className="flex items-center justify-between border-b border-hair pb-2.5">
        <div>
          <div className="text-micro font-extrabold uppercase tracking-[0.12em] text-ink-3">
            Compliance grounding
          </div>
          <h2 className="mt-0.5 text-body-lg font-[800] text-ink">
            {APPROVED_CLAIMS.length} approved claims
          </h2>
        </div>
        <span className="rounded-chip border border-ok-line bg-ok-bg px-2.5 py-0.5 text-micro font-bold text-ok">
          ✓ PromoMats verified
        </span>
      </div>

      <div className="space-y-2.5">
        {APPROVED_CLAIMS.map((claim) => (
          <div
            key={claim.id}
            data-claim-card={claim.id}
            className={cn(
              "rounded-control border p-3 text-left transition-all duration-300",
              highlightedClaimId === claim.id
                ? "border-brand bg-tint shadow-sm ring-2 ring-brand/25"
                : "border-hair bg-canvas hover:border-brand/20"
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="rounded-glyph bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep">
                {claim.tag}
              </span>
              <span className="text-caption font-bold text-ok">✓ {claim.status}</span>
            </div>
            <h4 className="text-body font-bold text-ink">{claim.title}</h4>
            <p className="mt-1 text-caption leading-relaxed text-ink-3">{claim.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
