import { planningSources } from "@/features/workspace/mock-data";
import { parseIntendedUses, primaryIntendedUse } from "@/features/workspace/intended-use";
import type { AssetType, Audience, PresentationMode } from "@/types/content";

export interface PlanInputs {
  assetType: AssetType;
  brief: string;
  audience: Audience;
  market: string;
  intendedUse: string;
  selectedSourceIds: string[];
}

export interface DerivedContentPlan {
  goal: string;
  topics: string[];
  format: string;
  length: string;
  language: string;
  presentationMode: PresentationMode;
  treatmentId: string;
  voice: string;
  music: string;
  storyStructure: string;
  hasApprovedEvidence: boolean;
  hasBrandKit: boolean;
  followsSuppliedScript: boolean;
  sourceConflict: string | null;
}

export function isRequestSpecific(brief: string) {
  return brief.trim().split(/\s+/).filter(Boolean).length >= 6;
}

const deliveryDefaults: Record<string, Record<AssetType, { format: string; length: string }>> = {
  "HCP meeting": {
    video: { format: "16:9", length: "60 sec" },
    carousel: { format: "16:9 slides", length: "6 pages" },
    infographic: { format: "Presentation slide", length: "Standard" },
    visual: { format: "16:9", length: "Single composition" },
  },
  "Social channel": {
    video: { format: "9:16", length: "30 sec" },
    carousel: { format: "LinkedIn carousel", length: "6 pages" },
    infographic: { format: "Vertical", length: "Compact" },
    visual: { format: "4:5", length: "Single composition" },
  },
  LinkedIn: {
    video: { format: "1:1", length: "30 sec" },
    carousel: { format: "LinkedIn carousel", length: "6 pages" },
    infographic: { format: "Vertical", length: "Compact" },
    visual: { format: "1:1", length: "Single composition" },
  },
  Instagram: {
    video: { format: "9:16", length: "30 sec" },
    carousel: { format: "1:1 pages", length: "6 pages" },
    infographic: { format: "Vertical", length: "Compact" },
    visual: { format: "4:5", length: "Single composition" },
  },
  YouTube: {
    video: { format: "16:9", length: "60 sec" },
    carousel: { format: "16:9 slides", length: "6 pages" },
    infographic: { format: "Landscape", length: "Standard" },
    visual: { format: "16:9", length: "Single composition" },
  },
  "Congress / event": {
    video: { format: "16:9", length: "60 sec" },
    carousel: { format: "16:9 slides", length: "5 pages" },
    infographic: { format: "Landscape", length: "Detailed" },
    visual: { format: "16:9", length: "Single composition" },
  },
  "Website / email": {
    video: { format: "16:9", length: "45 sec" },
    carousel: { format: "1:1 pages", length: "5 pages" },
    infographic: { format: "Vertical", length: "Standard" },
    visual: { format: "1:1", length: "Single composition" },
  },
  Email: {
    video: { format: "16:9", length: "45 sec" },
    carousel: { format: "1:1 pages", length: "5 pages" },
    infographic: { format: "Vertical", length: "Standard" },
    visual: { format: "1:1", length: "Single composition" },
  },
  Website: {
    video: { format: "16:9", length: "45 sec" },
    carousel: { format: "1:1 pages", length: "5 pages" },
    infographic: { format: "Vertical", length: "Standard" },
    visual: { format: "1:1", length: "Single composition" },
  },
  "Internal presentation": {
    video: { format: "16:9", length: "60 sec" },
    carousel: { format: "16:9 slides", length: "6 pages" },
    infographic: { format: "Presentation slide", length: "Standard" },
    visual: { format: "16:9", length: "Single composition" },
  },
};

export function deriveContentPlan(inputs: PlanInputs): DerivedContentPlan {
  const brief = inputs.brief.toLowerCase();
  const selectedSources = planningSources.filter((source) => inputs.selectedSourceIds.includes(source.id));
  const intendedUses = parseIntendedUses(inputs.intendedUse);
  const primaryUse = primaryIntendedUse(inputs.intendedUse);
  const delivery = (deliveryDefaults[primaryUse] ?? deliveryDefaults["HCP meeting"])[inputs.assetType];
  const hasApprovedEvidence = selectedSources.some((source) => source.kind === "approved-source" || source.kind === "claims");
  const hasBrandKit = selectedSources.some((source) => source.kind === "brand");
  const followsSuppliedScript = /\b(my|supplied|attached|existing) script\b|use (this|the) script/.test(brief);

  const goal = brief.includes("launch") || brief.includes("introduce")
    ? "New launch"
    : brief.includes("retain") || brief.includes("adherence")
      ? "Retention"
      : brief.includes("educat") || inputs.audience === "Patient"
        ? "Education"
        : brief.includes("adopt")
          ? "Adoption"
          : "Awareness";

  const topics = unique([
    ...(brief.includes("introduc") || brief.includes("launch") ? ["Product introduction"] : []),
    ...(brief.includes("mechanism") || brief.includes("how it works") ? ["Mechanism"] : []),
    ...(brief.includes("evidence") || brief.includes("study") || brief.includes("endpoint") || brief.includes("clinical") ? ["Pivotal evidence"] : []),
    ...(brief.includes("dos") || brief.includes("safety") || brief.includes("fair balance") ? ["Dosing & safety"] : []),
    ...(brief.includes("patient") || brief.includes("burden") ? ["Patient impact"] : []),
  ]);
  if (topics.length === 0) topics.push(inputs.audience === "Patient" ? "Patient impact" : "Product introduction");

  const presentationMode: PresentationMode = /presenter|avatar|doctor speaking|spokesperson|digital twin/.test(brief)
    ? "presenter"
    : /visual.only|silent|without (a )?voice|no narration/.test(brief)
      ? "visual-only"
      : "narrated";

  const treatmentId = inputs.assetType === "video"
    ? presentationMode
    : inputs.assetType === "carousel"
      ? brief.includes("data") || brief.includes("chart") ? "data" : brief.includes("story") ? "story" : "evidence"
      : inputs.assetType === "infographic"
        ? brief.includes("compar") ? "comparison" : brief.includes("process") || brief.includes("mechanism") ? "process" : "guided"
        : brief.includes("packshot") || brief.includes("product-first") ? "product" : brief.includes("evidence") ? "evidence" : "message";

  const storyStructure = followsSuppliedScript
    ? "Follow supplied script"
    : inputs.assetType === "video"
      ? goal === "New launch" ? "Product → Proof" : topics.includes("Patient impact") ? "Problem → Solution" : "Mechanism → Evidence"
      : inputs.assetType === "carousel"
        ? treatmentId === "data" ? "Data → Meaning → Action" : treatmentId === "story" ? "Need → Product → Proof" : "Evidence → Interpretation"
        : inputs.assetType === "infographic"
          ? treatmentId === "comparison" ? "Comparison" : treatmentId === "process" ? "Step-by-step process" : "Context → Evidence → Implication"
          : treatmentId === "product" ? "Product-first composition" : treatmentId === "evidence" ? "Evidence-first composition" : "Message-first composition";

  const language = inputs.market === "India" ? "English" : inputs.market === "United States" || inputs.market === "United Kingdom" ? "English" : "English";
  const voice = inputs.audience === "Patient" ? "Riya · friendly and clear" : inputs.audience === "HCP" ? "Rohan · clear and measured" : "Dev · warm and conversational";
  const music = inputs.assetType === "video" && presentationMode === "visual-only" && intendedUses.some((use) => ["Social channel", "LinkedIn", "Instagram", "YouTube"].includes(use)) ? "Calm clinical" : "No music";

  const hasUSSource = selectedSources.some((source) => /\bUS\b/.test(source.detail));
  const hasIndiaSource = selectedSources.some((source) => /\bIndia\b|\bIN\b/.test(source.detail));
  const sourceConflict = hasUSSource && inputs.market === "India"
    ? "US source material is attached to an India-market request. Confirm the authoritative local dossier."
    : hasIndiaSource && inputs.market === "United States"
      ? "India source material is attached to a US-market request. The current US dossier should remain authoritative."
      : null;

  return {
    goal,
    topics,
    format: delivery.format,
    length: delivery.length,
    language,
    presentationMode,
    treatmentId,
    voice,
    music,
    storyStructure,
    hasApprovedEvidence,
    hasBrandKit,
    followsSuppliedScript,
    sourceConflict,
  };
}

function unique(values: string[]) {
  return [...new Set(values)];
}
