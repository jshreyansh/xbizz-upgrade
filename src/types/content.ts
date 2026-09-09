export type AssetType = "video" | "visual" | "carousel" | "infographic";
export type Audience = "HCP" | "Patient" | "Field team" | "Hospital" | "Distributor" | "Consumer";
export type PresentationMode = "narrated" | "presenter" | "visual-only";
export type AppView = "home" | "create" | "directions" | "studio";
export type InspectorTab = "edit" | "assistant" | "evidence";
export type EvidenceState = "approved" | "supported" | "changed" | "unsupported";

/** Auth sub-stages within /auth route */
export type AuthView = "signin" | "otp" | "workspace" | "team" | "signedout";

/** Onboarding beat index within /onboarding route (1-indexed) */
export type OnboardingBeat = 1 | 2;

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

/**
 * One source behind a line of narration. A rewritten line usually resolves to
 * more than one, which is why the UI shows a count and lets you page through
 * them rather than picking one to display.
 */
export interface SceneCitation {
  id: string;
  source: string;
  title: string;
  date: string;
  /**
   * Index of the sentence this source backs, so the badge sits at the claim it
   * supports rather than in a footnote pile under the paragraph. Several
   * sources sharing an anchor collapse into one badge carrying their count.
   */
  anchor?: number;
  /** The approved claim this resolves to, so the badge can jump to its card. */
  claimId?: string;
}

/**
 * When one element of a scene is on screen, and how it gets there.
 *
 * Real data rather than a label: the media placeholder shown during generation
 * reads these numbers, and the whole point of that placeholder is that the
 * frame is settled before the asset exists. A guessed in/out would move the
 * frame when the asset landed, which is the failure the two-phase generation
 * is built to avoid.
 */
export interface ElementTiming {
  /** Matches the canvas element ids: headline, narration, image, video-clip... */
  elementId: string;
  /** Seconds into the scene. */
  inAt: number;
  outAt: number;
  transitionIn: string;
  transitionOut?: string;
}

export interface Scene {
  id: string;
  number: number;
  title: string;
  duration: number;
  narration: string;
  visual: string;
  negativeVisual?: string;
  claim: string;
  evidenceState: EvidenceState;
  narrativeTag?: string;
  mediaType?: "none" | "image" | "video" | "both";
  mediaImageSrc?: string;
  mediaVideoSrc?: string;
  mediaLabel?: string;
  /** Attached when a line is written or rewritten from approved sources. */
  citations?: SceneCitation[];
  /** Per-element in/out and transitions. Drives the generation placeholders. */
  timings?: ElementTiming[];
}
