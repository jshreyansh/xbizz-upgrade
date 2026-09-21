import type { BrandDossier, DocumentType } from "@/features/dossiers/dossier-types";
import { MOCK_DOSSIERS } from "@/features/dossiers/mock-dossiers";
import type { DossierTypeName } from "@/features/product-library/product-library-types";

/**
 * The dossier behind whatever you just clicked.
 *
 * There is one written dossier body in this build and it is the demo's whole
 * point: what a real master document looks like — sections, sources, cited
 * and held-out claims, approvals. Every brand and every dossier type shows
 * that body with its own name on it, rather than five brands showing nothing
 * because nobody has written five more.
 *
 * So this is a costume, not a lookup: the seed supplies the substance, the
 * caller supplies the identity. When a brand does have its own seeded
 * dossier, that one is used as the base, which is how Velmora reads like
 * Velmora.
 */

/** Which of the six product dossier types maps to which document type. */
const DOCUMENT_TYPE_FOR: Record<DossierTypeName, DocumentType> = {
  Regulatory: "commercial",
  Clinical: "hcp-scientific",
  Safety: "hcp-scientific",
  Commercial: "commercial",
  Patient: "patient-medication",
  HCP: "hcp-scientific",
};

const FALLBACK = MOCK_DOSSIERS[0];

function baseFor(brandName: string): BrandDossier {
  const seeded = MOCK_DOSSIERS.find(
    (d) => d.brandName.toLowerCase() === brandName.trim().toLowerCase()
  );
  return seeded ?? FALLBACK;
}

/**
 * A dossier presented as this brand's, and optionally as one of its six
 * types. The type is a dossier in its own right — its own sections, its own
 * claim count — not a slice of a bigger one.
 */
export function dossierFor(
  brandName: string,
  genericName?: string,
  type?: DossierTypeName
): BrandDossier {
  const base = baseFor(brandName);
  const named = brandName.trim() || base.brandName;

  /* Reusing a seeded body under another brand's name means every mention of
     the original has to move with it, or the reader quietly says Velmora on
     a page titled Affolmy. */
  const rename = (text: string) =>
    text
      .split(base.brandName)
      .join(named)
      .split(base.genericName)
      .join(genericName?.trim() || base.genericName);

  return {
    ...base,
    id: type ? `${named.toLowerCase()}-${type.toLowerCase()}` : named.toLowerCase(),
    brandName: named,
    genericName: genericName?.trim() || base.genericName,
    initials: named.slice(0, 2).toUpperCase(),
    indication: rename(base.indication),
    documentType: type ? DOCUMENT_TYPE_FOR[type] : base.documentType,
    sections: base.sections.map((section) => ({
      ...section,
      title: rename(section.title),
      content: rename(section.content),
      subsections: section.subsections?.map((sub) => ({
        ...sub,
        title: rename(sub.title),
        content: rename(sub.content),
      })),
      unverifiedClaims: section.unverifiedClaims?.map((claim) => ({
        ...claim,
        claim: rename(claim.claim),
        issue: rename(claim.issue),
      })),
    })),
    sources: base.sources.map((source) => ({
      ...source,
      name: rename(source.name),
      details: rename(source.details),
    })),
  };
}
