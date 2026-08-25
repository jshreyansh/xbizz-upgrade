import { create } from "zustand";

export type MVFormatType = "reel" | "avatar";
export type MVAudience = "hcp" | "rep" | "patient" | "payer";
export type MVVoice = "ava" | "marcus" | "sofia" | "hana";
export type MVLength = "30s" | "60s" | "90s" | "120s" | "180s";
export type MVScriptStructure = "problem" | "product" | "custom";
export type MVVideoMode = "hd" | "cinematic";

export interface MVScene {
  id: string;
  number: number;
  text: string;
  source: string;
  duration: string;
  visualPrompt: string;
  negativePrompt: string;
  overlayText: string;
  overlayType: string;
  soundEffect?: string;
}

export const DEFAULT_MV_SCENES: MVScene[] = [
  {
    id: "sc-1",
    number: 1,
    text: "For patients living with heart failure, each hospitalization marks a progressive decline in cardiac function.",
    source: "Drugs@FDA approved labeling · Section 1",
    duration: "6.2s",
    visualPrompt: "A calm cardiology consult room in a US academic medical centre, late-morning window light across a walnut desk. The camera opens on a close-up of an echocardiogram printout, then pulls back to a clinician mid-thought.",
    negativePrompt: "cartoon, 3D render, CGI, animated character, illustration, sparkling eyes, waxy skin, product packaging, pill, tablet, capsule, logo text on screen, minors, distressed patient",
    overlayText: "Velmora · tirzelamide",
    overlayType: "Key term — middle, dark box",
  },
  {
    id: "sc-2",
    number: 2,
    text: "Velmora is a once-daily selective oral inhibitor designed to improve myocardial energetics and reduce recurrent decompensation.",
    source: "ClinicalTrials.gov Protocol Identifier NCT04892110",
    duration: "8.4s",
    visualPrompt: "Photorealistic molecular representation of cardiac microvasculature with subtle kinetic flow of oxygenated erythrocytes.",
    negativePrompt: "cartoon, 3D render, CGI, animated character, illustration, neon colors",
    overlayText: "Selective Oral Inhibitor",
    overlayType: "Lower third — light",
  },
  {
    id: "sc-3",
    number: 3,
    text: "Across the pivotal Phase III CLARITY-CV study of over twelve thousand patients, Velmora achieved a twenty-four percent relative risk reduction in composite cardiovascular events.",
    source: "CLARITY-CV Phase III (NEJM 2025; 392:101-114)",
    duration: "11.2s",
    visualPrompt: "Clean, elegant clinical data visualization of Kaplan-Meier survival curves showing early divergence at day 30.",
    negativePrompt: "cartoon, 3D render, CGI, busy chart, tiny unreadable text",
    overlayText: "24% Relative Risk Reduction (p < 0.001)",
    overlayType: "Key term — middle, dark box",
  },
  {
    id: "sc-4",
    number: 4,
    text: "Adverse events were consistent with baseline comorbidities, with discontinuation rates comparable to placebo.",
    source: "FDA PI Section 6.1 Adverse Reactions",
    duration: "7.8s",
    visualPrompt: "Senior cardiologist consulting with an active adult patient in a bright, modern clinic environment.",
    negativePrompt: "distressed patient, cartoon, CGI",
    overlayText: "Tolerability & Safety Profile",
    overlayType: "Lower third — light",
  },
  {
    id: "sc-5",
    number: 5,
    text: "With a convenient once-daily oral dosing regimen, Velmora integrates seamlessly into guideline-directed medical therapy.",
    source: "FDA PI Section 2 Dosage and Administration",
    duration: "6.5s",
    visualPrompt: "Discreet packaging shot on minimalist frosted glass surface with clear prescribing guide iconography.",
    negativePrompt: "pill spilling, cartoon, dramatic lighting",
    overlayText: "Once Daily · No Titration Required",
    overlayType: "Lower third — light",
  },
];

export const KEPT_OUT_CLAIMS = [
  "“Velmora cures heart failure in 85% of patients”",
  "“Zero risk of renal complications in all age brackets”",
  "“Superior to all competitor SGLT2 inhibitors without exception”",
];

export interface CreationState {
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  formatType: MVFormatType;
  selectedDossier: string;
  audience: MVAudience;
  voice: MVVoice;
  length: MVLength;
  scriptStructure: MVScriptStructure;
  scenes: MVScene[];
  activeSceneIndex: number;
  videoMode: MVVideoMode;
  mlrCitations: boolean;
  mlrReferencesCard: boolean;
  mlrIsiCard: boolean;
  renderProgress: number;
  // Actions
  setStage: (stage: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  setFormatType: (type: MVFormatType) => void;
  setSelectedDossier: (dossier: string) => void;
  setAudience: (aud: MVAudience) => void;
  setVoice: (voice: MVVoice) => void;
  setLength: (len: MVLength) => void;
  setScriptStructure: (struct: MVScriptStructure) => void;
  setScenes: (scenes: MVScene[]) => void;
  updateScene: (index: number, partial: Partial<MVScene>) => void;
  setActiveSceneIndex: (index: number) => void;
  setVideoMode: (mode: MVVideoMode) => void;
  setMlrCitations: (val: boolean) => void;
  setMlrReferencesCard: (val: boolean) => void;
  setMlrIsiCard: (val: boolean) => void;
  setRenderProgress: (progress: number) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>((set) => ({
  stage: 1,
  formatType: "reel",
  selectedDossier: "velmora",
  audience: "hcp",
  voice: "ava",
  length: "60s",
  scriptStructure: "product",
  scenes: DEFAULT_MV_SCENES,
  activeSceneIndex: 0,
  videoMode: "hd",
  mlrCitations: true,
  mlrReferencesCard: true,
  mlrIsiCard: true,
  renderProgress: 0,
  setStage: (stage) => set({ stage }),
  setFormatType: (formatType) => set({ formatType }),
  setSelectedDossier: (selectedDossier) => set({ selectedDossier }),
  setAudience: (audience) => set({ audience }),
  setVoice: (voice) => set({ voice }),
  setLength: (length) => set({ length }),
  setScriptStructure: (scriptStructure) => set({ scriptStructure }),
  setScenes: (scenes) => set({ scenes }),
  updateScene: (index, partial) =>
    set((state) => {
      const updated = [...state.scenes];
      updated[index] = { ...updated[index], ...partial };
      return { scenes: updated };
    }),
  setActiveSceneIndex: (activeSceneIndex) => set({ activeSceneIndex }),
  setVideoMode: (videoMode) => set({ videoMode }),
  setMlrCitations: (mlrCitations) => set({ mlrCitations }),
  setMlrReferencesCard: (mlrReferencesCard) => set({ mlrReferencesCard }),
  setMlrIsiCard: (mlrIsiCard) => set({ mlrIsiCard }),
  setRenderProgress: (renderProgress) => set({ renderProgress }),
  reset: () =>
    set({
      stage: 1,
      formatType: "reel",
      selectedDossier: "velmora",
      audience: "hcp",
      voice: "ava",
      length: "60s",
      scriptStructure: "product",
      scenes: DEFAULT_MV_SCENES,
      activeSceneIndex: 0,
      videoMode: "hd",
      mlrCitations: true,
      mlrReferencesCard: true,
      mlrIsiCard: true,
      renderProgress: 0,
    }),
}));
