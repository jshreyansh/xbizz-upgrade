import { DOSSIER_TYPES } from "@/features/product-library/product-library-types";
import type {
  LibraryProduct,
  ProductDetail,
  ProductDossierEntry,
  ProductClaim,
  ProductImage,
  DossierEntryStatus,
} from "@/features/product-library/product-library-types";

const CLAIM_TEMPLATES: Record<string, ((name: string, generic: string) => string)[]> = {
  Regulatory: [
    (n, g) => `${n} (${g}) is approved for the indication and dosing described in the current label.`,
    (n) => `${n}'s labeling has been reviewed and cleared for the promotional claims used in this cycle.`,
    (n, g) => `No off-label claims appear in any ${n} (${g}) asset currently in market.`,
  ],
  Clinical: [
    (n) => `Pivotal trial data demonstrates statistically significant efficacy for ${n} versus the comparator arm.`,
    (n) => `Secondary endpoints for ${n} were consistent with the primary readout across all studied subgroups.`,
    (n) => `Long-term follow-up data for ${n} supports durability of response beyond the initial trial period.`,
  ],
  Safety: [
    (n) => `${n} has a well-characterized, consistent safety profile across the studied population.`,
    (n) => `The most common adverse events reported with ${n} were mild to moderate and self-limiting.`,
    (n) => `Post-marketing surveillance of ${n} has not identified any new safety signals to date.`,
  ],
  Commercial: [
    (n) => `${n} offers a differentiated value proposition versus existing standard-of-care options.`,
    (n) => `Payer feedback positions ${n} favorably on total cost of care versus the current formulary standard.`,
    (n) => `Field data shows ${n} converting new-to-brand prescriptions faster than the category average.`,
  ],
  Patient: [
    (n) => `Patients on ${n} reported meaningful improvement in quality-of-life measures.`,
    (n) => `Adherence data for ${n} improved after introducing the simplified dosing schedule.`,
    (n) => `Patient support materials for ${n} were rated clear and reassuring in post-launch surveys.`,
  ],
  HCP: [
    (n, g) => `${g} provides a mechanism of action that supports once-daily dosing convenience for ${n}.`,
    (n) => `HCPs cited ${n}'s onset of action as a key factor in first-line prescribing decisions.`,
    (n) => `Prescriber feedback on ${n} highlights ease of counseling patients on expected outcomes.`,
  ],
};

const IMAGE_KINDS: ProductImage["kind"][] = ["Pack shot", "Device", "Reference", "Lifestyle"];

function statusFor(index: number, verified: number, total: number): DossierEntryStatus {
  if (index < verified) return "verified";
  if (index < total) return "in review";
  return "not started";
}

/** Derives a full ProductDetail (images, 6 dossier types, claims list) from a
 *  product's summary card stats — deterministic per product id, so the same
 *  product always renders the same detail content. */
export function buildProductDetail(product: LibraryProduct): ProductDetail {
  const dossiers: ProductDossierEntry[] = DOSSIER_TYPES.map((type, i) => {
    const status = statusFor(i, product.dossiersVerified, product.dossiersTotal);
    const sections = status === "not started" ? 0 : 3 + ((i * 2) % 5);
    const claimsCited = status === "not started" ? 0 : Math.max(1, Math.round((product.claimsApproved / 6) * (status === "verified" ? 1 : 0.5)));
    return {
      type,
      status,
      sections,
      claimsCited,
      updated: status === "not started" ? "—" : product.updated,
    };
  });

  const claims: ProductClaim[] = dossiers
    .filter((d) => d.status !== "not started")
    .flatMap((d, di) =>
      Array.from({ length: Math.min(3, Math.max(1, Math.round(d.claimsCited / 3))) }, (_, i) => {
        const templates = CLAIM_TEMPLATES[d.type];
        const template = templates?.[i % templates.length];
        return {
          id: `${product.id}-claim-${di}-${i}`,
          text: template ? template(product.name, product.genericName) : `Grounded claim for ${product.name}.`,
          source: `${d.type} dossier, section ${i + 1}`,
          dossierType: d.type,
          status: d.status === "verified" ? ("approved" as const) : i === 0 ? ("pending" as const) : ("held out" as const),
        };
      })
    );

  const images: ProductImage[] = IMAGE_KINDS.map((kind, i) => ({
    id: `${product.id}-img-${i}`,
    label: `${product.name} — ${kind.toLowerCase()}`,
    kind,
    gradient: product.gradient,
  }));

  return { images, dossiers, claims };
}
