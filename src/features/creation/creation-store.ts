import { create } from "zustand";
import { creativeDirections } from "@/features/workspace/mock-data";
import type { Scene } from "@/types/content";

export type CreationStep =
  | "intent"
  | "brief"
  | "direction"
  | "script"
  | "generating"
  | "rendering"
  | "complete";

export type CreationIntent = "dossier" | "brief" | "scratch";

export interface CreationState {
  step: CreationStep;
  intent: CreationIntent;
  selectedDossierId: string;
  briefText: string;
  format: "16:9" | "9:16" | "1:1";
  duration: "30s" | "45s" | "60s" | "90s";
  voice: string;
  captionStyle: "karaoke" | "subtitles" | "clean";
  directionId: string;
  scenes: Scene[];
  renderProgress: number;
  // Actions
  setStep: (step: CreationStep) => void;
  setIntent: (intent: CreationIntent) => void;
  setSelectedDossierId: (id: string) => void;
  setBriefText: (text: string) => void;
  setFormat: (format: "16:9" | "9:16" | "1:1") => void;
  setDuration: (duration: "30s" | "45s" | "60s" | "90s") => void;
  setVoice: (voice: string) => void;
  setCaptionStyle: (style: "karaoke" | "subtitles" | "clean") => void;
  setDirectionId: (id: string) => void;
  setScenes: (scenes: Scene[]) => void;
  setRenderProgress: (progress: number) => void;
  reset: () => void;
}

const DEFAULT_SCENES: Scene[] = [
  {
    id: "sc-1",
    number: 1,
    title: "Clinical Need & Baseline Risk",
    duration: 10,
    narration: "For patients post-acute coronary syndrome, residual inflammatory and thrombotic risk remains high despite guideline-directed statin and antiplatelet therapy.",
    visual: "Cinematic close-up of cardiac arterial cross-section highlighting vulnerable plaque formation and microvascular inflammation.",
    claim: "Residual vascular risk post-ACS remains up to 24% at 12 months.",
    evidenceState: "approved",
  },
  {
    id: "sc-2",
    number: 2,
    title: "Dual Pathway Mechanism",
    duration: 14,
    narration: "Velmora selectively targets the catalytic pocket with sub-nanomolar affinity, inhibiting thrombin generation without compromising baseline haemostasis.",
    visual: "Photorealistic molecular animation showing targeted pocket binding and suppression of fibrin mesh propagation.",
    claim: "Sub-nanomolar binding affinity (Ki = 0.42 nM) preserves baseline platelet adhesion.",
    evidenceState: "approved",
  },
  {
    id: "sc-3",
    number: 3,
    title: "Pivotal Efficacy (CLARITY-CV)",
    duration: 12,
    narration: "In the 12,480-patient CLARITY-CV trial, Velmora demonstrated a statistically significant 24% reduction in primary composite MACE endpoints.",
    visual: "Clear Kaplan-Meier survival curves showing early divergence at day 30 with sustained separation through 28 months.",
    claim: "HR 0.76 (95% CI: 0.68-0.85; p < 0.001) for composite CV death, MI, or stroke.",
    evidenceState: "approved",
  },
  {
    id: "sc-4",
    number: 4,
    title: "Safety & Summary Call-to-Action",
    duration: 9,
    narration: "With a balanced bleeding profile and once-daily oral dosing, Velmora delivers targeted protection where patients need it most.",
    visual: "Velmora packshot with on-screen ISI reference link and Prescribing Information callout.",
    claim: "Major TIMI bleeding rate 1.9% vs 1.4% (p = 0.06); no increase in fatal hemorrhage.",
    evidenceState: "approved",
  },
];

export const useCreationStore = create<CreationState>((set) => ({
  step: "intent",
  intent: "dossier",
  selectedDossierId: "velmora",
  briefText: "Create a concise HCP launch video for cardiologists that explains the dual-pathway mechanism and pivotal Phase III CLARITY-CV evidence.",
  format: "16:9",
  duration: "45s",
  voice: "Rohan · Clear & measured",
  captionStyle: "karaoke",
  directionId: creativeDirections[0].id,
  scenes: DEFAULT_SCENES,
  renderProgress: 0,
  setStep: (step) => set({ step }),
  setIntent: (intent) => set({ intent }),
  setSelectedDossierId: (selectedDossierId) => set({ selectedDossierId }),
  setBriefText: (briefText) => set({ briefText }),
  setFormat: (format) => set({ format }),
  setDuration: (duration) => set({ duration }),
  setVoice: (voice) => set({ voice }),
  setCaptionStyle: (captionStyle) => set({ captionStyle }),
  setDirectionId: (directionId) => set({ directionId }),
  setScenes: (scenes) => set({ scenes }),
  setRenderProgress: (renderProgress) => set({ renderProgress }),
  reset: () =>
    set({
      step: "intent",
      intent: "dossier",
      selectedDossierId: "velmora",
      format: "16:9",
      duration: "45s",
      directionId: creativeDirections[0].id,
      scenes: DEFAULT_SCENES,
      renderProgress: 0,
    }),
}));
