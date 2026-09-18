"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { APPROVED_CLAIMS, claimUseLabel, type ClaimUse } from "@/features/workspace/script-claims";
import {
  DossierPreviewModal,
  type DossierPreviewData,
} from "@/features/workspace/dossier-preview-modal";
import { moleculeFor, primaryDossier } from "@/features/workspace/grounding-dossiers";

/**
 * The approved claims, beside whatever is being written.
 *
 * Shared by the video script stage and the creative content plan, because it is
 * the same list answering the same question: what am I allowed to say. A
 * citation badge in either stage jumps here and highlights its claim, which
 * only works if both stages are looking at one panel rather than two copies
 * of one.
 *
 * "See in dossier" answers the next question, which is where the claim came
 * from. It opens the same record the plan's Research and Sources step shows
 * when it describes what this project is grounded in — the same component and
 * the same data, because a claim that opened a different dossier from the one
 * the plan named would be worse than no link at all.
 */
export function ClaimsPanel({
  highlightedClaimId,
  brandName = "Velmora",
  usage,
}: {
  highlightedClaimId?: string | null;
  brandName?: string;
  /**
   * Where each claim is cited, keyed by claim id.
   *
   * The list answered "what am I allowed to say" and stopped there, so a card
   * gave no way to tell a claim carrying three lines of the film from one
   * nothing has used yet. Omitted where the surface has no placements to
   * report, and then no card claims one.
   */
  usage?: Record<string, ClaimUse[]>;
}) {
  const [dossier, setDossier] = useState<DossierPreviewData | null>(null);

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
              "group rounded-control border p-3 text-left transition-all duration-300",
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

            {usage && (
              /* Where it is used. Two placements shown, the rest counted —
                 the point is to tell a claim that is carrying the film from
                 one nothing has picked up yet, not to list every hit. */
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {(usage[claim.id] ?? []).slice(0, 2).map((use) => (
                  <span
                    key={`${use.sceneNumber}-${use.shotIndex ?? "x"}`}
                    className="rounded-glyph border border-hair-2 bg-card px-1.5 py-0.5 text-micro font-bold text-ink-2"
                  >
                    {claimUseLabel(use)}
                  </span>
                ))}
                {(usage[claim.id]?.length ?? 0) > 2 && (
                  <span className="text-micro font-bold text-ink-4">
                    +{(usage[claim.id]?.length ?? 0) - 2} more
                  </span>
                )}
                {(usage[claim.id]?.length ?? 0) === 0 && (
                  <span className="rounded-glyph border border-dashed border-hair-2 px-1.5 py-0.5 text-micro font-semibold text-ink-4">
                    Not used yet
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setDossier(primaryDossier(brandName, moleculeFor(brandName)))}
              className={cn(
                "focus-ring mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-glyph px-1.5 py-1 text-caption font-bold transition",
                // Quiet until the card is under the pointer or is the one a
                // citation just jumped to: the claim is what you came to read.
                highlightedClaimId === claim.id
                  ? "text-brand-deep hover:bg-white/60"
                  : "text-ink-4 hover:bg-tint hover:text-brand-deep group-hover:text-ink-3"
              )}
            >
              <BookOpen className="size-3" />
              See in dossier
            </button>
          </div>
        ))}
      </div>

      <DossierPreviewModal dossier={dossier} onClose={() => setDossier(null)} />
    </div>
  );
}
