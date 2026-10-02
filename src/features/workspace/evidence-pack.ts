/**
 * The evidence pack SwishX curates for a brand: the verified dossiers an asset
 * is grounded in, and what they let it claim.
 *
 * One pack per brand, used or not as a whole. The dossiers inside are shown
 * so they can be read, not picked between: what an HCP asset needs is the
 * label, the pivotal evidence and the safety wording together, and offering
 * them one by one invited a pack missing its ISI.
 */
export interface PackDossier {
  id: "regulatory" | "clinical" | "safety";
  name: string;
  /** Where it comes from, in the reader's words. */
  source: string;
  claims: number;
  sections: number;
}

export interface PackArea {
  label: string;
  /** Approved claims the pack holds for this message area. */
  claims: number;
  /**
   * How much of what an asset typically needs to say in this area the pack
   * can back with an approved claim, as a percentage.
   */
  coverage: number;
}

export interface EvidencePack {
  name: string;
  dossiers: PackDossier[];
  areas: PackArea[];
  totalClaims: number;
  /** Who stands behind it, and when they last checked it against the label. */
  reviewedBy: string;
  verifiedOn: string;
}

export function evidencePack(brandName: string): EvidencePack {
  const dossiers: PackDossier[] = [
    { id: "regulatory", name: "Regulatory dossier", source: "Prescribing information · rev. 06/2026", claims: 19, sections: 3 },
    { id: "clinical", name: "Clinical dossier", source: "Pivotal trial evidence", claims: 19, sections: 5 },
    { id: "safety", name: "Safety dossier", source: "ISI and fair balance", claims: 19, sections: 7 },
  ];
  /* Regulatory splits across indication, dosing and contraindications; the
     other two are one area each. The parts add up to the dossiers' totals. */
  const areas: PackArea[] = [
    { label: "Indication", claims: 8, coverage: 100 },
    { label: "Dosing", claims: 7, coverage: 98 },
    { label: "Contraindications", claims: 4, coverage: 94 },
    { label: "Efficacy", claims: 19, coverage: 97 },
    { label: "Safety & ISI", claims: 19, coverage: 100 },
  ];
  return {
    name: `${brandName} evidence pack`,
    dossiers,
    areas,
    totalClaims: dossiers.reduce((sum, d) => sum + d.claims, 0),
    reviewedBy: "SwishX Science medical review",
    verifiedOn: "Sep 7, 2026",
  };
}
