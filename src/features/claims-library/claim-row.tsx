"use client";

import { FileSearch, ShieldCheck } from "lucide-react";
import { CLAIM_STATUS_STYLE } from "@/features/product-library/claim-card";
import { claimCode, claimUpdatedOn } from "@/features/claims-library/claim-detail";
import type { LibraryProduct, ProductClaim } from "@/features/product-library/product-library-types";

/**
 * One claim, as a row you open.
 *
 * Written twice — once on the brand's Claims tab and once on the Claims
 * Library — and neither said which claim it was. A row carrying only a
 * sentence cannot be referred to: two people looking at the same shelf had
 * no way to name the one they meant. So the reference leads, the statement
 * follows, and the brand and the date close it.
 *
 * The shield is the studio's own claims mark. A checklist glyph said "a list
 * of tasks", which is the one thing an approved claim is not.
 */
export function ClaimRow({
  claim,
  /** Omitted on a brand's own tab, where every row is that brand's. */
  product,
}: {
  claim: ProductClaim;
  product?: LibraryProduct;
}) {
  const tone = CLAIM_STATUS_STYLE[claim.status];

  return (
    <>
      <span className={`grid size-9 shrink-0 place-items-center rounded-control ${tone.bg} ${tone.tone}`}>
        <ShieldCheck size={17} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-micro font-extrabold uppercase tracking-[.1em] tabular-nums text-ink-4">
            {claimCode(claim.id)}
          </span>
          <span className={`rounded-chip px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-[.03em] ${tone.bg} ${tone.tone}`}>
            {tone.label}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-body-lg leading-snug text-ink-2">{claim.text}</p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-caption text-ink-4">
          {product && (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-chip bg-subtle px-2 py-0.5 font-bold text-ink-3">
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: product.gradient }} />
              <span className="truncate">{product.name}</span>
            </span>
          )}
          {/* Where anyone else can check it. The dossier section says where we
              filed the claim; this says where the evidence lives. */}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-chip bg-tint-2 px-2 py-0.5 font-bold text-brand-deep">
            <FileSearch size={11} />
            {claim.evidenceSource}
          </span>
          <span>Updated {claimUpdatedOn(claim.id)}</span>
        </div>
      </div>

      <span className="inline-flex shrink-0 items-center gap-1 text-body-lg font-bold text-brand transition-all group-hover:gap-1.5 group-hover:text-brand-deep">
        View details →
      </span>
    </>
  );
}
