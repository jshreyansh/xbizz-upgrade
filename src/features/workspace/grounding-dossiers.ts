import type { DossierPreviewData } from "@/features/workspace/dossier-preview-modal";

/**
 * The approved dossiers this project is grounded in.
 *
 * Its own module because two screens show the same three records: the plan's
 * Research and Sources step, where you choose what to ground in, and the
 * Claims tab's "See in dossier", where you check where a claim came from.
 * They must be the same dossier — a claim that opens a different record from
 * the one the plan says it was grounded in is worse than no link at all.
 */
export function groundingDossiers(brandName: string, molecule: string): DossierPreviewData[] {
return [
  {
    name: `${brandName} USA HCP Launch Dossier`,
    molecule,
    market: "USA · FDA",
    sections: 18,
    claims: 214,
    documents: [
      { name: "FDA Approved Prescribing Information (Rev. 04/2026)", citations: 112 },
      { name: "CLARITY-CV Phase III Pivotal Trial Readout", citations: 64 },
      { name: "ClinicalTrials.gov Protocol NCT04892110", citations: 18 },
    ],
    keyClaims: [
      {
        category: "Efficacy & Primary Endpoints",
        claim: "Achieved primary endpoint response in 68.4% of patients at Week 16 vs 14.2% placebo (p < 0.001).",
        citation: "FDA Approved Label §14.1 · CLARITY-CV Pivotal Readout",
      },
      {
        category: "Mechanism of Action",
        claim: "Selectively inhibits target cellular phosphorylation cascade with >100-fold specificity.",
        citation: "FDA Prescribing Information §12.1 Clinical Pharmacology",
      },
      {
        category: "Dosing & Administration",
        claim: "Once-daily oral administration (50mg tablet) with or without food.",
        citation: "FDA Approved Label §2.1 Dosage & Administration",
      },
    ],
  },
  {
    name: `${brandName} India HCP Clinical Dossier`,
    molecule,
    market: "India · Regulatory",
    sections: 16,
    claims: 186,
    documents: [
      { name: "Approved Package Insert & Product Monograph", citations: 96 },
      { name: "India Multi-Center Clinical Evaluation Sub-study", citations: 58 },
      { name: "National Formulary Clinical Summary", citations: 32 },
    ],
    keyClaims: [
      {
        category: "Clinical Evaluation",
        claim: "Clinically validated in adult populations across 14 tertiary care multi-speciality centers.",
        citation: "Approved Monograph §7.2 Clinical Safety",
      },
      {
        category: "Long-term Tolerability",
        claim: "Demonstrated durable tolerability and consistent safety profile over 52 weeks.",
        citation: "India Multi-Center Evaluation Trial Report 2025",
      },
      {
        category: "Administration & Packaging",
        claim: "Standardized once-daily regimen with blister strip packaging for tropical stability.",
        citation: "Package Insert §4 Dosage Guidelines",
      },
    ],
  },
  {
    name: `${brandName} Global Distributor Dossier`,
    molecule,
    market: "Global · Distributors",
    sections: 14,
    claims: 128,
    documents: [
      { name: "Global Commercial Product Specification & Logistics Protocol", citations: 76 },
      { name: "Global Trade Access, SKU Packaging & Storage Dossier", citations: 52 },
    ],
    keyClaims: [
      {
        category: "Storage & Stability",
        claim: "Room-temperature stable (15°C to 25°C) with 24-month certified shelf life.",
        citation: "Global Quality & Stability Summary §3.4",
      },
      {
        category: "Packaging & Serialization",
        claim: "Standardized tamper-evident blister packaging with GS1 DataMatrix 2D serialization.",
        citation: "Commercial Distribution Specification Rev. 2026",
      },
      {
        category: "Market Authorization",
        claim: "Full regulatory clearance across 28 export territories with active master files.",
        citation: "Global Regulatory Affairs Summary 2026",
      },
    ],
  },
];
}

/** The record a claim resolves to: the market whose label governs this asset. */
export function primaryDossier(brandName: string, molecule: string): DossierPreviewData {
  return groundingDossiers(brandName, molecule)[0];
}

/** Molecule per brand, so both callers name the same one. */
export function moleculeFor(brandName: string): string {
  return brandName === "Onkavia"
    ? "relunocitinib"
    : brandName === "PulmoVax"
    ? "albuterol / budesonide"
    : brandName === "Nirvexa"
    ? "brentaxaban"
    : brandName === "Cardioxa"
    ? "levomilnacipran ER"
    : "tirzelamide";
}
