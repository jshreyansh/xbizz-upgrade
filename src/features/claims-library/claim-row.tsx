"use client";

import { ArrowRight, FileSearch } from "lucide-react";
import { CLAIM_STATUS_STYLE } from "@/features/product-library/claim-card";
import { claimCode, claimUpdatedOn } from "@/features/claims-library/claim-detail";
import type { LibraryProduct, ProductClaim } from "@/features/product-library/product-library-types";

/**
 * One claim, as a row you open.
 *
 * Read top to bottom the way a reviewer names a claim: whose it is and which
 * one (Affolmy · AFF-C01), whether it can be used (the status, at the far
 * edge where a column of them scans), what it says, and where it can be
 * checked. The statement is the row's body text at full contrast — it is the
 * thing being approved, not a caption under it.
 *
 * The drug name replaces the shield that used to lead every row: the same
 * shield on every row told you nothing, and the drug is the first thing a
 * mixed shelf is scanned for. Twelve characters at most, the full name on
 * hover. "View details" sits on the footer line rather than as a large link
 * beside every row, where it was the loudest thing on the page.
 */
const NAME_MAX = 12;

export function ClaimRow({
  claim,
  product,
}: {
  claim: ProductClaim;
  product: LibraryProduct;
}) {
  const tone = CLAIM_STATUS_STYLE[claim.status];
  const name = product.name.length > NAME_MAX ? `${product.name.slice(0, NAME_MAX).trimEnd()}…` : product.name;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-1 py-0.5">
      <div className="flex min-w-0 items-center gap-2">
        <span title={product.name} className="shrink-0 text-subhead font-extrabold tracking-tight text-ink">
          {name}
        </span>
        <span aria-hidden className="h-4 w-px shrink-0 bg-hair-2" />
        <span className="shrink-0 text-body-lg font-bold tracking-[.05em] tabular-nums text-ink-3">
          {claimCode(claim.id)}
        </span>
        <span
          className={`ml-auto shrink-0 rounded-chip px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.04em] ${tone.bg} ${tone.tone}`}
        >
          {tone.label}
        </span>
      </div>

      <p className="line-clamp-2 text-body-lg leading-relaxed text-ink">{claim.text}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-caption text-ink-3">
        {/* Where anyone else can check it. The dossier section says where we
            filed the claim; this says where the evidence lives. */}
        <span className="inline-flex shrink-0 items-center gap-1 rounded-chip bg-tint-2 px-2 py-0.5 font-bold text-brand-deep">
          <FileSearch size={11} />
          {claim.evidenceSource}
        </span>
        <span>Updated {claimUpdatedOn(claim.id)}</span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-label font-bold text-ink-3 transition-colors group-hover:text-brand">
          View details
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}
