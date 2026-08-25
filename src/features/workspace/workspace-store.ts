import { create } from "zustand";
import { creativeDirections } from "@/features/workspace/mock-data";
import type { AppView, AssetType, Audience, InspectorTab, PresentationMode } from "@/types/content";

interface WorkspaceState {
  view: AppView;
  assetType: AssetType;
  brief: string;
  audience: Audience;
  market: string;
  intendedUse: string;
  format: string;
  duration: string;
  language: string;
  presentationMode: PresentationMode;
  voice: string;
  music: string;
  selectedSourceIds: string[];
  demoScenarioId: string;
  directionId: string;
  selectedSceneId: string;
  inspectorTab: InspectorTab;
  setView: (view: AppView) => void;
  setAssetType: (assetType: AssetType) => void;
  setBrief: (brief: string) => void;
  setAudience: (audience: Audience) => void;
  setMarket: (market: string) => void;
  setIntendedUse: (intendedUse: string) => void;
  setFormat: (format: string) => void;
  setDuration: (duration: string) => void;
  setLanguage: (language: string) => void;
  setPresentationMode: (presentationMode: PresentationMode) => void;
  setVoice: (voice: string) => void;
  setMusic: (music: string) => void;
  toggleSource: (sourceId: string) => void;
  setSelectedSourceIds: (sourceIds: string[]) => void;
  setDemoScenarioId: (scenarioId: string) => void;
  setDirectionId: (directionId: string) => void;
  setSelectedSceneId: (selectedSceneId: string) => void;
  setInspectorTab: (inspectorTab: InspectorTab) => void;
  reset: () => void;
}

const initialState = {
  view: "home" as AppView,
  assetType: "video" as AssetType,
  brief: "Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for DERMORA.",
  audience: "HCP" as Audience,
  market: "United States",
  intendedUse: "HCP meeting",
  format: "16:9",
  duration: "60 sec",
  language: "English",
  presentationMode: "narrated" as PresentationMode,
  voice: "Rohan · clear and measured",
  music: "No music",
  selectedSourceIds: ["dermora-core", "dermora-claims", "dermora-brand"],
  demoScenarioId: "hcp-launch",
  directionId: creativeDirections[0].id,
  selectedSceneId: "scene-3",
  inspectorTab: "edit" as InspectorTab,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...initialState,
  setView: (view) => {
    const documentWithTransitions = typeof document === "undefined" ? null : document as Document & { startViewTransition?: (update: () => void) => void };
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (documentWithTransitions?.startViewTransition && !reduceMotion) documentWithTransitions.startViewTransition(() => set({ view }));
    else set({ view });
  },
  setAssetType: (assetType) => set({ assetType }),
  setBrief: (brief) => set({ brief }),
  setAudience: (audience) => set({ audience }),
  setMarket: (market) => set({ market }),
  setIntendedUse: (intendedUse) => set({ intendedUse }),
  setFormat: (format) => set({ format }),
  setDuration: (duration) => set({ duration }),
  setLanguage: (language) => set({ language }),
  setPresentationMode: (presentationMode) => set({ presentationMode }),
  setVoice: (voice) => set({ voice }),
  setMusic: (music) => set({ music }),
  toggleSource: (sourceId) => set((state) => ({ selectedSourceIds: state.selectedSourceIds.includes(sourceId) ? state.selectedSourceIds.filter((id) => id !== sourceId) : [...state.selectedSourceIds, sourceId] })),
  setSelectedSourceIds: (selectedSourceIds) => set({ selectedSourceIds }),
  setDemoScenarioId: (demoScenarioId) => set({ demoScenarioId }),
  setDirectionId: (directionId) => set({ directionId }),
  setSelectedSceneId: (selectedSceneId) => set({ selectedSceneId }),
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
  reset: () => set(initialState),
}));
