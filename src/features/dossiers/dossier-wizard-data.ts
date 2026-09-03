/**
 * Fixture data for the dossier wizard: document types, pending approvals,
 * pharma section templates, required sources and source-tier metadata.
 *
 * Moved out of dossier-wizard.tsx verbatim — a pure move, no value changed.
 * It kept ~95 lines of fixture data ahead of the component that uses it.
 *
 * .ts rather than .tsx: the block carries no JSX, only TypeScript generics.
 */

import type { BrandDossier, DocumentType, DossierApproval, RegulatoryBody } from "@/features/dossiers/dossier-types";

export const DOCUMENT_TYPES: { type: DocumentType; label: string; description: string }[] = [
  { type: "commercial", label: "Commercial dossier", description: "Sales-enablement dossier for HCPs — the default." },
  { type: "patient-medication", label: "Patient Medication Information", description: "Regulated patient leaflet — its own mandated sections." },
  { type: "hcp-scientific", label: "HCP Scientific", description: "Non-promotional prescriber reference." },
];

export const PENDING_APPROVALS: DossierApproval[] = [
  { role: "Medical Writer", name: "Medical Writer", initials: "MW", gradient: "linear-gradient(140deg,#ff7a3d,#c9310a)", status: "pending" },
  { role: "MLR Reviewer", name: "MLR Reviewer", initials: "MR", gradient: "linear-gradient(140deg,#22c07a,#12784a)", status: "pending" },
  { role: "Project Manager", name: "Project Manager", initials: "PM", gradient: "linear-gradient(140deg,#9b6bff,#5b21b6)", status: "pending" },
  { role: "Brand Lead", name: "You", initials: "N", gradient: "linear-gradient(140deg,#3a3f4b,#0d1017)", status: "pending" },
];


export const PHARMA_SECTIONS = [
  { id: "s1", name: "1. Executive Summary & Clinical Need", cat: "Clinical", defaultOn: true },
  { id: "s2", name: "2. Mechanism of Action & Target Selectivity", cat: "Clinical", defaultOn: true },
  { id: "s3", name: "3. Pivotal Phase III Efficacy Readouts", cat: "Clinical", defaultOn: true },
  { id: "s4", name: "4. Primary Composite & Key Secondary Endpoints", cat: "Clinical", defaultOn: true },
  { id: "s5", name: "5. Safety Profile & Adverse Event Adjudication", cat: "Safety", defaultOn: true },
  { id: "s6", name: "6. Warnings, Precautions & Boxed Warnings", cat: "Safety", defaultOn: true },
  { id: "s7", name: "7. Contraindications & Drug-Drug Interactions", cat: "Safety", defaultOn: true },
  { id: "s8", name: "8. Dosage, Administration & Titration", cat: "Regulatory", defaultOn: true },
  { id: "s9", name: "9. Special Populations (Renal / Hepatic / Pediatric)", cat: "Regulatory", defaultOn: true },
  { id: "s10", name: "10. Clinical Pharmacology & Pharmacokinetics", cat: "Clinical", defaultOn: true },
  { id: "s11", name: "11. HEOR Budget Impact & QALY Economic Model", cat: "Commercial", defaultOn: true },
  { id: "s12", name: "12. Hospital Readmission & ER Avoidance Model", cat: "Commercial", defaultOn: true },
  { id: "s13", name: "13. Patient Archetypes & Treatment Journey", cat: "Commercial", defaultOn: true },
  { id: "s14", name: "14. HCP Core Message Pillars & Objection Handling", cat: "Commercial", defaultOn: true },
  { id: "s15", name: "15. Congress Presentation & Symposium Abstract", cat: "Commercial", defaultOn: true },
  { id: "s16", name: "16. Field Medical FAQ & Scientific Responses", cat: "Commercial", defaultOn: true },
  { id: "s17", name: "17. Patient Counseling & Adherence Support", cat: "Commercial", defaultOn: true },
  { id: "s18", name: "18. Core Visual Identity & ISI Layout Rules", cat: "Commercial", defaultOn: true },
];

/** What promotional-review law requires before a dossier can be drafted.
 *  Independent of the 18-section content plan — this is source
 *  evidence, not written claims. */
export type SourceTier = "required" | "recommended" | "optional";

export interface RequiredSource {
  type: BrandDossier["sources"][number]["type"];
  badge: string;
  label(anchor: RegulatoryBody): string;
  detail: string;
  tier: SourceTier;
}

export const REQUIRED_SOURCES: RequiredSource[] = [
  {
    type: "label",
    badge: "PI",
    label: (anchor) => (anchor === "FDA" || anchor === "PMDA" ? "Approved Prescribing Information" : "Summary of Product Characteristics (SmPC)"),
    detail: "The label governs every claim — nothing ships without it.",
    tier: "required",
  },
  {
    type: "clinical-trials",
    badge: "NCT",
    label: () => "Registered Clinical Trial Record",
    detail: "Public registry entry for the pivotal study.",
    tier: "required",
  },
  {
    type: "pubmed",
    badge: "PUB",
    label: () => "Peer-Reviewed Pivotal Publication",
    detail: "The published efficacy and safety readout.",
    tier: "required",
  },
  {
    type: "heor",
    badge: "HEOR",
    label: () => "Health Economics & Outcomes Data",
    detail: "Needed only if the dossier will support value or budget-impact claims.",
    tier: "recommended",
  },
  {
    type: "slides",
    badge: "CONG",
    label: () => "Congress / Symposium Materials",
    detail: "Supplementary — strengthens context, not required to proceed.",
    tier: "optional",
  },
];

export const SOURCE_TIER_META: Record<SourceTier, { label: string; color: string; bg: string; line: string }> = {
  required: { label: "Required by law", color: "var(--brand-deep)", bg: "var(--tint)", line: "var(--tint-line)" },
  recommended: { label: "Recommended", color: "var(--warn)", bg: "var(--warn-bg)", line: "#f3dfb0" },
  optional: { label: "Optional", color: "var(--ink-4)", bg: "rgba(10,13,20,.04)", line: "var(--hair)" },
};
