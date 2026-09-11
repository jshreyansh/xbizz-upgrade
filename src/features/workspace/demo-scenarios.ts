import type { AssetType, Audience } from "@/types/content";

/**
 * Categories name what a case DOES to the flow, not the business situation.
 * "Blocked" replaced "Missing information" because two of those cases now
 * refuse to continue rather than merely warning, and "Other formats" went
 * because asset type is what each screen filters on, not a category.
 */
export type DemoScenarioCategory = "Happy paths" | "Dynamic branches" | "Blocked" | "Source and market";

export interface DemoScenario {
  id: string;
  label: string;
  category: DemoScenarioCategory;
  description: string;
  expected: string;
  assertions: {
    shouldClarify?: boolean;
    presentationMode?: "narrated" | "presenter" | "visual-only";
    treatmentId?: string;
    format?: string;
    length?: string;
    voiceIncludes?: string;
    hasApprovedEvidence?: boolean;
    hasBrandKit?: boolean;
    followsSuppliedScript?: boolean;
    sourceConflict?: boolean;
    /** Pages the deck should come out at — the image flow's own axis. */
    pages?: number;
    /** The layout family the plan should land on. */
    archetypeId?: string;
    /**
     * The plan screen must refuse to continue, for this reason.
     * "copy-overflow" is the image flow's own: the approved copy does not fit
     * the boxes the chosen archetype has, and a clipped safety block is a
     * regulatory failure rather than a cosmetic one.
     */
    blocked?: "no-context" | "unusable-sources" | "copy-overflow";
  };
  inputs: {
    assetType: AssetType;
    brief: string;
    audience: Audience;
    market: string;
    intendedUse: string;
    selectedSourceIds: string[];
    /** Files the user attached themselves. */
    uploadedDocs?: string[];
    /** Whether those files hold anything a script can be grounded in. */
    sourcesVerify?: boolean;
  };
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "hcp-launch",
    label: "HCP launch video",
    category: "Happy paths",
    description: "A complete, source-grounded launch request.",
    expected: "Narrated visual story · 16:9 · 60 sec · Product → Proof",
    assertions: { presentationMode: "narrated", format: "16:9", length: "60 sec", hasApprovedEvidence: true, hasBrandKit: true },
    inputs: { assetType: "video", brief: "Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for DERMORA.", audience: "HCP", market: "United States", intendedUse: "HCP meeting", selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand"] },
  },
  {
    id: "patient-education",
    label: "Patient education video",
    category: "Happy paths",
    description: "Patient-friendly education \u2014 the audience that may ground on a therapy area instead of a brand.",
    expected: "Friendly voice · 16:9 · 45 sec · patient-impact emphasis",
    assertions: { presentationMode: "narrated", format: "16:9", length: "45 sec", voiceIncludes: "friendly", hasApprovedEvidence: true },
    inputs: { assetType: "video", brief: "Create a patient education video that explains what to expect from DERMORA in clear, reassuring language.", audience: "Patient", market: "United States", intendedUse: "Website", selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand"] },
  },
  {
    id: "presenter-social",
    label: "Doctor presenter",
    category: "Dynamic branches",
    description: "Explicitly requests a doctor on screen.",
    expected: "Presenter, voice and setting become required · LinkedIn 1:1 · 30 sec",
    assertions: { presentationMode: "presenter", format: "1:1", length: "30 sec" },
    inputs: { assetType: "video", brief: "Create a doctor-presenter launch video for social that introduces DERMORA and its pivotal evidence.", audience: "HCP", market: "United States", intendedUse: "LinkedIn", selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand"] },
  },
  {
    id: "visual-only",
    label: "Visual-only social video",
    category: "Dynamic branches",
    description: "No narration or character should appear.",
    expected: "Voice and character hidden · on-screen copy prioritized · 9:16",
    assertions: { presentationMode: "visual-only", format: "9:16", length: "30 sec" },
    inputs: { assetType: "video", brief: "Create a silent visual-only social video introducing DERMORA. Use on-screen copy and no narration.", audience: "HCP", market: "United States", intendedUse: "Instagram", selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand"] },
  },
  {
    id: "own-script",
    label: "Supplied script",
    category: "Dynamic branches",
    description: "The user wants SwishX to preserve an existing script.",
    expected: "Structure follows supplied script · no rewrite by default",
    assertions: { followsSuppliedScript: true, hasApprovedEvidence: true },
    inputs: { assetType: "video", brief: "Use my attached script for a DERMORA HCP video. Preserve the wording and turn it into scenes.", audience: "HCP", market: "United States", intendedUse: "HCP meeting", selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand", "hcp-detail-aid"] },
  },
  {
    id: "weak-request",
    label: "Vague request",
    category: "Blocked",
    description: "Tests inline clarification before the plan.",
    expected: "Remain on Screen 1 and request the communication job",
    assertions: { shouldClarify: true },
    inputs: { assetType: "video", brief: "Hello", audience: "HCP", market: "United States", intendedUse: "HCP meeting", selectedSourceIds: ["dermora-core", "dermora-claims"] },
  },
  {
    id: "no-context",
    label: "Nothing to work from",
    category: "Blocked",
    description: "A real request, but no dossier on our side and nothing attached.",
    expected: "Refused on the plan screen \u00b7 asks for context before any script",
    assertions: { hasApprovedEvidence: false, hasBrandKit: false, blocked: "no-context" },
    inputs: { assetType: "video", brief: "Create a patient awareness video about the burden of plaque psoriasis for a website.", audience: "Patient", market: "United States", intendedUse: "Website", selectedSourceIds: [], uploadedDocs: [] },
  },
  {
    id: "unusable-sources",
    label: "Attachments with nothing usable",
    category: "Blocked",
    description: "Files were attached, but none of them hold anything a script can be grounded in.",
    expected: "Confirm refused \u00b7 offending files flagged inline \u00b7 chat asks for context or better files",
    assertions: { hasApprovedEvidence: false, hasBrandKit: false, blocked: "unusable-sources" },
    inputs: { assetType: "video", brief: "Create an HCP video explaining the DERMORA mechanism of action and the pivotal trial evidence.", audience: "HCP", market: "United States", intendedUse: "HCP meeting", selectedSourceIds: [], uploadedDocs: ["Q3_Marketing_Calendar.xlsx", "Team_Offsite_Photos.zip"], sourcesVerify: false },
  },
  {
    id: "market-conflict",
    label: "US and India conflict",
    category: "Source and market",
    description: "Two market dossiers are attached to an India request.",
    expected: "Source authority becomes an explicit decision",
    assertions: { sourceConflict: true, hasApprovedEvidence: true },
    inputs: { assetType: "video", brief: "Create a launch video for Indian rheumatologists explaining the DERMORA mechanism.", audience: "HCP", market: "India", intendedUse: "Congress / event", selectedSourceIds: ["dermora-core", "dermora-india", "dermora-brand"] },
  },
  {
    id: "mechanism-infographic",
    label: "Mechanism infographic",
    category: "Happy paths",
    description: "The image flow\u2019s happy path \u2014 a congress infographic explaining a pathway.",
    expected: "Process hierarchy · landscape · detailed · no voice or music",
    assertions: { treatmentId: "process", format: "Landscape", length: "Detailed", pages: 1, archetypeId: "moa-scroll" },
    inputs: { assetType: "infographic", brief: "Create an infographic explaining the DERMORA mechanism as a clear step-by-step process.", audience: "HCP", market: "United States", intendedUse: "Congress / event", selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand"] },
  },
  {
    id: "stat-leavebehind",
    label: "Efficacy leave-behind",
    category: "Happy paths",
    description: "One number carries the page — the commonest thing a field team asks for.",
    expected: "Stat hero · A4 print · 1 page · headline endpoint leads",
    assertions: { treatmentId: "comparison", pages: 1, archetypeId: "stat-hero", hasApprovedEvidence: true, hasBrandKit: true },
    inputs: { assetType: "infographic", brief: "A one-page HCP leave-behind led by the PASI 90 primary endpoint, with the comparator and the p-value beside it.", audience: "HCP", market: "United States", intendedUse: "HCP meeting", selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand"] },
  },
  {
    id: "patient-explainer-sheet",
    label: "Patient explainer sheet",
    category: "Dynamic branches",
    description: "A patient audience — the one that may ground on a therapy area rather than a brand, and needs plainer language and larger type.",
    expected: "Burden of disease · 3:4 tablet · plain language · no comparator claims",
    assertions: { treatmentId: "guided", pages: 1, archetypeId: "burden-disease" },
    inputs: { assetType: "infographic", brief: "A plain-language sheet for patients starting treatment: what the condition is, what to expect week by week, and when to call the clinic.", audience: "Patient", market: "United States", intendedUse: "Patient support", selectedSourceIds: ["dermora-core"] },
  },
  {
    id: "field-detail-aid",
    label: "Three-page detail aid",
    category: "Dynamic branches",
    description: "Page count becomes the question — the axis the video flow does not have.",
    expected: "Trial summary · 16:9 · 3 pages · one job per page",
    assertions: { treatmentId: "guided", pages: 3, archetypeId: "trial-summary" },
    inputs: { assetType: "infographic", brief: "A three-page iPad detail aid for the field team: clinical need, pivotal evidence, then dosing and safety.", audience: "Field team", market: "United States", intendedUse: "Field detailing", selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand"] },
  },
  {
    id: "copy-overflow",
    label: "Copy will not fit",
    category: "Blocked",
    description: "The approved safety copy is longer than the chosen archetype has room for.",
    expected: "Refuses to continue — a clipped safety block is a regulatory failure, not a layout preference",
    assertions: { blocked: "copy-overflow", archetypeId: "stat-hero", pages: 1 },
    inputs: { assetType: "infographic", brief: "Put the full Important Safety Information and the prescribing cut-offs on the same single stat-hero page as the efficacy headline.", audience: "HCP", market: "United States", intendedUse: "HCP meeting", selectedSourceIds: ["dermora-core", "dermora-claims"] },
  },
  {
    id: "image-market-conflict",
    label: "Two markets, one poster",
    category: "Source and market",
    description: "Sources from two markets whose labels do not agree, on an asset that will be printed.",
    expected: "Asks which market governs before the layout is fixed",
    assertions: { sourceConflict: true, pages: 1 },
    inputs: { assetType: "infographic", brief: "A congress poster using both the US and India label data for DERMORA.", audience: "HCP", market: "United States", intendedUse: "Congress / event", selectedSourceIds: ["dermora-core", "dermora-india"] },
  },
];

export const defaultDemoScenarioId = "hcp-launch";
