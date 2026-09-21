import { PRODUCTS } from "@/features/product-library/mock-products";
import { INITIAL_BRANDS } from "@/features/workspace/brand-modal-data";

/**
 * A dossier as a shelf tile: enough to name it and say how much it carries.
 * The full document lives in the dossier reader — this is the summary the
 * Research and Sources strip shows before you open it.
 */
export interface DossierPreviewData {
  name: string;
  molecule: string;
  market: string;
  sections: number;
  claims: number;
  documents: Array<{ name: string; citations: number; type?: string }>;
  keyClaims?: Array<{ category: string; claim: string; citation: string }>;
  indication?: string;
}

/**
 * The approved dossier this project is grounded in.
 *
 * One record, not three. A brand's market was settled when the brand was
 * picked, so offering USA, India and Global side by side on the plan was
 * presenting a choice that had already been made — and putting three
 * regulators' names on the screen to do it.
 *
 * Its own module because two screens show the same record: the plan's
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
];
}

/** The record a claim resolves to: the market whose label governs this asset. */
export function primaryDossier(brandName: string, molecule: string): DossierPreviewData {
  return groundingDossiers(brandName, molecule)[0];
}

/**
 * Molecule per brand, so every caller names the same one.
 *
 * Reads the catalogues rather than a hand-kept ladder of five: the ladder
 * fell through to tirzelamide for everything it did not know, which put
 * Velmora's molecule on Affolmy's dossier. A brand nobody has heard of still
 * needs an answer, and the last case is that answer rather than a default
 * pretending to be one.
 */
export function moleculeFor(brandName: string): string {
  const name = brandName.trim().toLowerCase();
  const fromLibrary = PRODUCTS.find((p) => p.name.toLowerCase() === name);
  if (fromLibrary) return fromLibrary.genericName;
  const fromStudio = INITIAL_BRANDS.find((b) => b.name.toLowerCase() === name);
  if (fromStudio) return fromStudio.genericName;
  return "tirzelamide";
}
