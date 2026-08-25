export type RegulatoryBody = "FDA" | "EMA" | "MHRA" | "PMDA";

export interface DossierSource {
  id: string;
  name: string;
  type: "label" | "pubmed" | "clinical-trials" | "heor" | "slides";
  date: string;
  status: "approved" | "reference-only" | "under-review";
  details: string;
  citationCount: number;
}

export interface CitedClaim {
  id: string;
  text: string;
  sourceId: string;
  sourceName: string;
  confidence: number;
  isHeldOut?: boolean;
  heldOutReason?: string;
}

export interface DossierSection {
  id: string;
  number: number;
  title: string;
  category: "clinical" | "commercial" | "regulatory" | "safety";
  content: string;
  claimsCount: number;
  heldOutCount: number;
  citations: string[];
}

export type ApprovalStatus = "pending" | "reviewing" | "approved" | "changes-requested";

export interface DossierApproval {
  role: string;
  name: string;
  initials: string;
  gradient: string;
  status: ApprovalStatus;
}

export type DocumentType = "commercial" | "patient-medication" | "hcp-scientific";

export interface BrandDossier {
  id: string;
  brandName: string;
  genericName: string;
  indication: string;
  therapyArea: string;
  regulatoryAnchor: RegulatoryBody;
  documentType: DocumentType;
  gradient: string;
  accentColor: string;
  initials: string;
  sectionsCount: number;
  claimsCited: number;
  claimsHeldOut: number;
  sourcesCount: number;
  lastUpdated: string;
  status: "complete" | "draft" | "updating" | "pending-approval";
  sources: DossierSource[];
  sections: DossierSection[];
  /** Who needs to sign off before this dossier can be used to create content. */
  approvals: DossierApproval[];
}

/** An entry in the brand picker — not every brand has a dossier yet. */
export interface BrandOption {
  id: string;
  name: string;
  genericName: string;
  therapyArea: string;
  regulatoryAnchor: RegulatoryBody;
  hasDossier: boolean;
}

export type DossierWizardStep =
  | "list"
  | "product"
  | "sources"
  | "plan"
  | "writing"
  | "approval"
  | "view";
