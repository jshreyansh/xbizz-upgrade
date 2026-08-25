export type AssetType = "video" | "visual" | "carousel" | "infographic";
export type Audience = "HCP" | "Patient" | "Payer" | "Field team" | "Consumer";
export type PresentationMode = "narrated" | "presenter" | "visual-only";
export type AppView = "home" | "create" | "directions" | "studio";
export type InspectorTab = "edit" | "assistant" | "evidence";
export type EvidenceState = "approved" | "supported" | "changed" | "unsupported";

export interface SourceReference {
  id: string;
  name: string;
  type: "pdf" | "pptx" | "docx" | "approved-asset";
  version: string;
  status: "current" | "impacted" | "expired";
}

export interface PlanningSource {
  id: string;
  name: string;
  kind: "approved-source" | "claims" | "brand" | "existing-asset" | "reference";
  detail: string;
  status: "current" | "review" | "reference-only";
}

export interface CreativeDirection {
  id: string;
  name: string;
  eyebrow: string;
  summary: string;
  rationale: string;
  palette: [string, string, string];
  structure: string[];
  risk: "Low" | "Moderate";
}

export interface Scene {
  id: string;
  number: number;
  title: string;
  duration: number;
  narration: string;
  visual: string;
  claim: string;
  evidenceState: EvidenceState;
}
