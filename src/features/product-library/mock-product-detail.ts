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
  AssetOrigin,
  ProductImageAngle,
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

/**
 * A claim as a reviewer would actually see it written.
 *
 * These were one short sentence each, which is not what clears MLR: an
 * approved statement carries the population it applies to, the evidence
 * behind it, and the boundary past which it stops being true. Written short,
 * the whole library read as slogans — and the detail page, whose job is to
 * show the statement in full, had nothing to show.
 */
const CLAIM_TEMPLATES: Record<string, ((name: string, generic: string) => string)[]> = {
  Regulatory: [
    (n, g) =>
      `${n} (${g}) is approved for the indication and dosing described in the current Prescribing Information, and may be promoted only within that wording. The approved indication covers adults meeting the criteria set out in Section 1; use outside those criteria, including any paediatric population, is outside the label and may not be implied in any material. Where a statement paraphrases the indication rather than quoting it, the paraphrase must not widen the population, soften a contraindication or omit the qualifier the label attaches to it.`,
    (n) =>
      `${n}'s labelling has been reviewed and cleared for the promotional claims used in this cycle, against the revision current at the time of sign-off. Every claim in the approved set traces to a numbered section of the label, and the traceability is recorded rather than asserted. A label revision invalidates that clearance: claims must be re-checked against the new text before any asset carrying them goes back into market, and the sign-off record on this brand's attachments names the revision each claim was cleared against.`,
    (n, g) =>
      `No off-label claims appear in any ${n} (${g}) asset currently in market, as confirmed by the most recent audit of the live inventory. The audit covers every published asset across video, document and web, and checks each claim in each asset against the approved set rather than sampling. Two assets from the previous cycle were withdrawn rather than corrected, and are held in the archive. The audit is repeated at each label revision and whenever a new market is added.`,
  ],
  Clinical: [
    (n) =>
      `Pivotal trial data demonstrates statistically significant efficacy for ${n} versus the comparator arm on the pre-specified primary endpoint, with the treatment effect holding on both the relative and absolute scale. The result was obtained in a randomised, double-blind, multi-centre population, and the estimate is not materially sensitive to assumptions about missing data. A relative figure presented without the absolute one overstates the effect and will not clear review; either may be quoted, but not the first alone.`,
    (n) =>
      `Secondary endpoints for ${n} were consistent with the primary readout across all studied subgroups, with no component moving against the composite and no subgroup interaction reaching nominal significance. Those endpoints that were hierarchically tested and met significance may be quoted as evidence of effect; those that were exploratory may be described only as supportive. Subgroup figures are supportive in every case and may not be presented as evidence of benefit in a particular population.`,
    (n) =>
      `Long-term follow-up data for ${n} supports durability of response beyond the initial trial period, with the separation between arms maintained through the extension phase. Median duration of response had not been reached at the most recent data cut, and the proportion still in response is reported with its confidence interval wherever the figure is used. Follow-up beyond the extension is ongoing, and no statement may be made about the period it covers until that data reads out.`,
  ],
  Safety: [
    (n) =>
      `${n} has a well-characterised, consistent safety profile across the studied population, with adverse reactions reported at rates and severities set out in Section 6 of the label. Every suspected event in the programme was adjudicated by an independent committee blinded to allocation. The profile is described as consistent rather than favourable: a comparison to another product's tolerability requires a head-to-head study, and none has been conducted.`,
    (n) =>
      `The most common adverse events reported with ${n} were mild to moderate and self-limiting, resolving without intervention in the large majority of cases and leading to discontinuation in fewer than one patient in twenty. Each reaction quoted must carry both its rate and the comparator rate, since a figure on its own reads as attributable when the difference between arms is what the data supports. The label's warnings accompany any statement about tolerability.`,
    (n) =>
      `Post-marketing surveillance of ${n} has not identified any new safety signals to date, across the exposure accumulated since first approval. Surveillance covers spontaneous reports, the registry and the periodic safety update cycle, and the absence of a signal is a statement about what has been observed rather than a guarantee about what has not. This claim is re-checked at each periodic safety update and is withdrawn automatically if a signal is raised.`,
  ],
  Commercial: [
    (n) =>
      `${n} offers a differentiated value proposition versus existing standard-of-care options, on the basis of the outcomes demonstrated in its own programme rather than a cross-trial comparison. Differentiation is described in terms of what the evidence supports — the endpoints met, the population studied, the dosing regimen — and not as superiority, which would require a head-to-head study. Any comparative wording must name the comparator and the study it comes from.`,
    (n) =>
      `Payer feedback positions ${n} favourably on total cost of care versus the current formulary standard, drawing on the budget-impact model submitted with the dossier and on advisory board input across the major accounts. Model assumptions must accompany any figure quoted from it, and the figure may not be presented as a realised saving. Individual payer decisions vary by contract and no access statement may be generalised from one account to another.`,
    (n) =>
      `Field data shows ${n} converting new-to-brand prescriptions faster than the category average over the first two quarters since launch, measured against the syndicated panel. The figure is an observed trend in prescribing behaviour, not a clinical outcome, and it must be labelled as such wherever it appears. It may be used internally and in field material, and may not appear in any asset directed at patients.`,
  ],
  Patient: [
    (n) =>
      `Patients on ${n} reported meaningful improvement in quality-of-life measures on the validated instrument used in the programme, with the change exceeding the minimal clinically important difference at the pre-specified timepoint. Patient-reported outcomes were a secondary endpoint and are described as supportive of the primary result rather than as evidence in their own right. The instrument and the timepoint must be named wherever the result is quoted.`,
    (n) =>
      `Adherence data for ${n} improved after the simplified dosing schedule was introduced, measured by refill persistence across the observation period. The comparison is before-and-after within the same population rather than against another product, and must be presented that way. Adherence is a behaviour, not an outcome: no inference about efficacy may be drawn from it in any material, including material aimed at prescribers.`,
    (n) =>
      `Patient support materials for ${n} were rated clear and reassuring in post-launch surveys, against the readability and comprehension criteria set for patient-facing content. The rating covers the materials, not the medicine, and may not be restated as a statement about the treatment or about patient experience of it. Every patient-facing asset carries the approved safety wording in full, at the size and placement the label requires.`,
  ],
  HCP: [
    (n, g) =>
      `${g} provides a mechanism of action that supports once-daily dosing convenience for ${n}, with a pharmacokinetic profile that maintains exposure across the interval at the approved dose. Convenience is a description of the regimen the label sets out and not a claim of benefit; it may not be presented as improving outcomes, and the dosing statement must match Section 2 of the label exactly wherever it appears.`,
    (n) =>
      `HCPs cited ${n}'s onset of action as a key factor in first-line prescribing decisions, in the qualitative research conducted across the target specialties after launch. This is reported prescriber opinion and must be attributed as such, with the research named. It is not evidence of clinical benefit and may not be used to support a comparative statement about any other product in the class.`,
    (n) =>
      `Prescriber feedback on ${n} highlights ease of counselling patients on expected outcomes, particularly on what to expect in the first month and on what the label says about missed doses. The feedback supports the counselling materials in the brand's attachments and is used to shape them. Like all opinion research it is attributed to the study it came from and is never presented alongside efficacy data as though it were part of it.`,
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

const DOCUMENT_TEMPLATES: Array<{
  name: string;
  comment: string;
  fileType: DocumentFileType;
  size: string;
  addedBy: AssetOrigin;
  addedOn: string;
  previewUrl?: string;
  archived?: boolean;
}> = [
  {
    name: "Prescribing Information",
    comment: "The current approved label. Every regulatory claim in the dossier traces back to this.",
    fileType: "PDF",
    size: "1.8 MB",
    addedBy: { name: "Maya Kapoor", team: "Medical Affairs" },
    addedOn: "Jul 2, 2026",
    previewUrl: "/documents/sample-approved-label.pdf",
  },
  {
    name: "Field Training Deck",
    comment: "What the reps are trained on this cycle. Slides 12-18 are the fair-balance section.",
    fileType: "PPTX",
    size: "6.2 MB",
    addedBy: { name: "Rohan Desai", team: "Field Excellence" },
    addedOn: "Aug 14, 2026",
    previewUrl: "/documents/sample-clinical-study-report.pdf",
  },
  {
    name: "Batch Release Certificate",
    comment: "Release paperwork for the batches now in market. Quality reference, not for promotional use.",
    fileType: "PDF",
    size: "420 KB",
    addedBy: { name: "Neha Iyer", team: "Quality" },
    addedOn: "Sep 3, 2026",
    previewUrl: "/documents/sample-clinical-study-report.pdf",
  },
  {
    name: "MLR Sign-off Record",
    comment: "Signed MLR minutes for the launch pack. Attach this whenever a claim is queried.",
    fileType: "PDF",
    size: "290 KB",
    addedBy: { name: "Maya Kapoor", team: "Medical Affairs" },
    addedOn: "Sep 9, 2026",
    previewUrl: "/documents/sample-approved-label.pdf",
  },
  {
    name: "Packaging Artwork Spec",
    comment: "Print spec for the carton. The pack photography on the Images tab was shot against this.",
    fileType: "DOCX",
    size: "1.1 MB",
    addedBy: { name: "Arjun Pillai", team: "Marketing" },
    addedOn: "Sep 15, 2026",
    previewUrl: "/documents/sample-approved-label.pdf",
  },
  {
    name: "Launch Deck (2025 cycle)",
    comment: "Last cycle’s launch deck. Superseded by the current pack, kept for reference.",
    fileType: "PPTX",
    size: "8.4 MB",
    addedBy: { name: "Arjun Pillai", team: "Marketing" },
    addedOn: "Nov 4, 2025",
    previewUrl: "/documents/sample-clinical-study-report.pdf",
    archived: true,
  },
];

/**
 * What somebody said about a shot when they uploaded it.
 *
 * The studio asks which product and variant an image is for and what it
 * shows; that answer is what the tile carries under the file name, so the
 * library reads as things people put there rather than six slots a system
 * filled in.
 */
const IMAGE_SEEDS: Record<
  ProductImageAngle,
  { file: string; comment: string; by: AssetOrigin; added: string; updated: string; archived?: boolean }
> = {
  Front: {
    file: "pack_front_hero.png",
    comment: "Approved front-of-pack hero. Use this one for anything a prescriber sees.",
    by: { name: "Sana Qureshi", team: "Creative" },
    added: "Jul 2, 2026",
    updated: "Aug 21, 2026",
  },
  Back: {
    file: "pack_back_panel.png",
    comment: "Back panel with the full dosage text legible at 100%.",
    by: { name: "Arjun Pillai", team: "Marketing" },
    added: "Jul 9, 2026",
    updated: "Jul 9, 2026",
  },
  Side: {
    file: "pack_side_batch.png",
    comment: "Side profile. Batch panel is visible — crop it out before any external use.",
    by: { name: "Arjun Pillai", team: "Marketing" },
    added: "Jul 9, 2026",
    updated: "Sep 1, 2026",
  },
  Top: {
    file: "pack_top_down.png",
    comment: "Top-down for grid layouts. Shot on the studio white, no shadow pass yet.",
    by: { name: "Sana Qureshi", team: "Creative" },
    added: "Aug 4, 2026",
    updated: "Aug 4, 2026",
  },
  Packaging: {
    file: "carton_open_flat.png",
    comment: "Carton with the leaflet in frame — for anything about what is in the box.",
    by: { name: "Sana Qureshi", team: "Creative" },
    added: "Aug 18, 2026",
    updated: "Sep 5, 2026",
  },
  Lifestyle: {
    file: "lifestyle_counter_am.png",
    comment: "Lifestyle scene from the 2025 shoot. Superseded by the current campaign art.",
    by: { name: "Sana Qureshi", team: "Creative" },
    added: "Nov 12, 2025",
    updated: "Nov 12, 2025",
    archived: true,
  },
};

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

function buildImages(
  product: LibraryProduct,
  variationId: string,
  variationLabel: string,
  heroImageUrl?: string
): ProductImage[] {
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  /* The pack size is part of the file name, because it is the thing that
     tells two otherwise identical front shots apart. */
  const size = variationLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return IMAGE_ANGLES.map((angle, i) => {
    const seed = IMAGE_SEEDS[angle];
    return {
      id: `${product.id}-${variationId}-img-${i}`,
      name: `${slug}_${size}_${seed.file}`,
      comment: seed.comment,
      label: `${angle} shot`,
      angle,
      gradient: product.gradient,
      addedBy: seed.by,
      addedOn: seed.added,
      updatedOn: seed.updated,
      archived: seed.archived,
      imageUrl: angle === "Front" ? heroImageUrl : undefined,
    };
  });
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
          /* Everything in the library is approved. A claim that has not
             cleared review is not in the library yet — it is in the dossier
             being worked on, which is a different screen. */
          status: "approved" as const,
        };
      })
    );

  const variations: ProductVariation[] = VARIATION_LABELS[product.type].map((label, i) => {
    const id = `${product.id}-var-${i}`;
    // The uploaded reference photo, if any, stands in for the default
    // variation's Front angle only — every other angle/variation still
    // gets the generated packshot art.
    const heroImageUrl = i === 0 ? product.referenceImageUrl : undefined;
    return { id, label, images: buildImages(product, id, label, heroImageUrl) };
  });

  const documents: ProductDocument[] = DOCUMENT_TEMPLATES.map((tpl, i) => ({
    id: `${product.id}-doc-${i}`,
    name: `${product.name} — ${tpl.name}`,
    comment: tpl.comment,
    fileType: tpl.fileType,
    size: tpl.size,
    addedOn: tpl.addedOn,
    addedBy: tpl.addedBy,
    archived: tpl.archived,
    previewUrl: tpl.previewUrl,
  }));

  return { variations, dossiers, claims, documents };
}
