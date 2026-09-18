import { DOSSIER_TYPES, IMAGE_ANGLES } from "@/features/product-library/product-library-types";
import type {
  LibraryProduct,
  ProductDetail,
  ProductDossierEntry,
  ProductClaim,
  ProductImage,
  ProductVariation,
  ProductDocument,
  DocumentFileType,
  DossierEntryStatus,
  DossierSection,
  DossierTypeName,
} from "@/features/product-library/product-library-types";

/** Named sections per dossier type — seven each so every type's fixed
 *  section count (3 to 7, see the `sections` formula below) can slice off
 *  its own front slice and still read as a deliberate, ordered checklist
 *  rather than "Section 1, Section 2, …". */
const SECTION_TEMPLATES: Record<DossierTypeName, string[]> = {
  Regulatory: [
    "Indication & Approved Use",
    "Dosing & Administration",
    "Contraindications & Warnings",
    "Labeling Compliance",
    "Regulatory Approvals by Market",
    "Post-Marketing Commitments",
    "Variation & Renewal Filings",
  ],
  Clinical: [
    "Pivotal Trial Design",
    "Primary Endpoint Results",
    "Secondary Endpoint Results",
    "Subgroup Analyses",
    "Long-Term Follow-Up Data",
    "Comparator Studies",
    "Real-World Evidence",
  ],
  Safety: [
    "Adverse Event Profile",
    "Serious Adverse Events",
    "Drug Interactions",
    "Special Population Warnings",
    "Post-Marketing Surveillance",
    "Risk Mitigation Measures",
    "Signal Detection Log",
  ],
  Commercial: [
    "Value Proposition",
    "Payer & Formulary Positioning",
    "Competitive Landscape",
    "Pricing & Access Strategy",
    "Field Performance Data",
    "Market Share Trends",
    "Launch Readiness",
  ],
  Patient: [
    "Quality-of-Life Outcomes",
    "Adherence & Persistence Data",
    "Patient Support Program",
    "Patient-Reported Experience",
    "Caregiver Materials",
    "Access & Affordability Support",
    "Patient Education Assets",
  ],
  HCP: [
    "Mechanism of Action",
    "Prescribing Rationale",
    "Dosing Convenience",
    "Counseling Guidance",
    "Peer-to-Peer Insights",
    "Formulary & Access Notes",
  ],
};

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

/** Pack-size / strength labels per product type, so "variations" reads as a
 *  real presentation choice rather than an arbitrary list. */
const VARIATION_LABELS: Record<LibraryProduct["type"], string[]> = {
  Tablet: ["10 mg · 10s strip", "20 mg · 10s strip", "40 mg · 30s bottle"],
  Capsule: ["250 mg · 10s strip", "500 mg · 10s strip"],
  Syrup: ["60 mL bottle", "100 mL bottle"],
  Injection: ["1 mL vial", "5 mL vial", "Pre-filled syringe"],
  Device: ["Single-use pen", "Refill cartridge"],
};

/** The presentations a product of this type ships in. The studio's Start
 *  Project step asks which of them a project covers, and it should be asking
 *  about the same list the Product Library shows. */
export function variationLabelsFor(type: LibraryProduct["type"]): string[] {
  return VARIATION_LABELS[type];
}

const DOCUMENT_TEMPLATES: Array<{ name: string; category: string; fileType: DocumentFileType; size: string }> = [
  { name: "Prescribing Information (SmPC)", category: "Regulatory", fileType: "PDF", size: "1.8 MB" },
  { name: "Field Training Deck", category: "Training", fileType: "PPTX", size: "6.2 MB" },
  { name: "Batch Release Certificate", category: "Quality", fileType: "PDF", size: "420 KB" },
  { name: "MLR Sign-off Record", category: "Compliance", fileType: "PDF", size: "290 KB" },
  { name: "Packaging Artwork Spec", category: "Regulatory", fileType: "DOCX", size: "1.1 MB" },
];

function statusFor(index: number, verified: number, total: number): DossierEntryStatus {
  if (index < verified) return "verified";
  if (index < total) return "in review";
  return "not started";
}

/** Expands one dossier's summary (a status and a section count) into the
 *  named sections the Dossier detail page lists — deterministic per
 *  product, so reloading shows the same checklist rather than a fresh
 *  random split each time. */
export function buildDossierSections(entry: ProductDossierEntry): DossierSection[] {
  if (entry.sections === 0) return [];

  const titles = SECTION_TEMPLATES[entry.type].slice(0, entry.sections);
  // A dossier "in review" reads as partway there: its first half already
  // verified, the rest still in review — rather than every section sharing
  // one status, which would make the sections list redundant with the
  // dossier-level chip above it.
  const verifiedThrough = entry.status === "verified" ? entry.sections : entry.status === "in review" ? Math.ceil(entry.sections / 2) : 0;

  const base = Math.floor(entry.claimsCited / entry.sections);
  const remainder = entry.claimsCited % entry.sections;

  return titles.map((title, i) => ({
    id: `${entry.type}-section-${i}`,
    title,
    status: i < verifiedThrough ? "verified" : entry.status === "not started" ? "not started" : "in review",
    claimsCited: base + (i < remainder ? 1 : 0),
  }));
}

function buildImages(productId: string, variationId: string, gradient: string, heroImageUrl?: string): ProductImage[] {
  return IMAGE_ANGLES.map((angle, i) => ({
    id: `${productId}-${variationId}-img-${i}`,
    label: `${angle} shot`,
    angle,
    gradient,
    imageUrl: angle === "Front" ? heroImageUrl : undefined,
  }));
}

/** Derives a full ProductDetail (variations, 6 dossier types, claims,
 *  documents) from a product's summary card stats — deterministic per
 *  product id, so the same product always renders the same detail content. */
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

  const variations: ProductVariation[] = VARIATION_LABELS[product.type].map((label, i) => {
    const id = `${product.id}-var-${i}`;
    // The uploaded reference photo, if any, stands in for the default
    // variation's Front angle only — every other angle/variation still
    // gets the generated packshot art.
    const heroImageUrl = i === 0 ? product.referenceImageUrl : undefined;
    return { id, label, images: buildImages(product.id, id, product.gradient, heroImageUrl) };
  });

  const documents: ProductDocument[] = DOCUMENT_TEMPLATES.map((tpl, i) => ({
    id: `${product.id}-doc-${i}`,
    name: `${product.name} — ${tpl.name}`,
    category: tpl.category,
    fileType: tpl.fileType,
    size: tpl.size,
    updated: i % 2 === 0 ? product.updated : "3 weeks ago",
  }));

  return { variations, dossiers, claims, documents };
}
