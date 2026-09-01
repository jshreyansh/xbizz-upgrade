import { create } from "zustand";
import { creativeDirections } from "@/features/workspace/mock-data";
import type { AppView, AssetType, Audience, AuthView, InspectorTab, OnboardingBeat, PresentationMode } from "@/types/content";

export type CreationMode = "magic-reel" | "magic-avatar" | "magic-chart" | "scratch";
export type SourceSelectionType = "dossier" | "url" | "text";
export type VideoSubStage = "mode-select" | "source-select" | "intake" | "directions" | "studio";

interface WorkspaceState {
  view: AppView;
  // Magic Video workflow states
  creationMode: CreationMode;
  sourceType: SourceSelectionType;
  sourcePayload: { dossierId?: string; url?: string; text?: string };
  videoSubStage: VideoSubStage;
  assetType: AssetType;
  brief: string;
  audience: Audience;
  goal: string;
  topics: string[];
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
  selectedQuality: "hd" | "cinematic";
  chatMessages: Array<{ role: "user" | "swishx"; text: string; chips?: string[] }>;
  // Auth & onboarding
  authView: AuthView;
  onboardingBeat: OnboardingBeat;
  isFirstRun: boolean;
  navCollapsed: boolean;
  teamDockOpen: boolean;
  copilotPanelOpen: boolean;
  // Infographic / Creative specific states
  pageShape: "3:4" | "16:9" | "A4";
  infographicPages: "1" | "2" | "3" | string;
  infographicTemplate: "stat-hero" | "trial-summary" | "bench-data" | "moa-scroll" | "burden-disease";
  infographicLogoPlacement: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "none";
  infographicActivePage: number;
  // Setters
  setView: (view: AppView) => void;
  setSelectedQuality: (quality: "hd" | "cinematic") => void;
  setChatMessages: (messages: Array<{ role: "user" | "swishx"; text: string; chips?: string[] }>) => void;
  addChatMessage: (message: { role: "user" | "swishx"; text: string; chips?: string[] }) => void;
  setCreationMode: (mode: CreationMode) => void;
  setSourceType: (type: SourceSelectionType) => void;
  setSourcePayload: (payload: { dossierId?: string; url?: string; text?: string }) => void;
  setVideoSubStage: (stage: VideoSubStage) => void;
  setAssetType: (assetType: AssetType) => void;
  setBrief: (brief: string) => void;
  setAudience: (audience: Audience) => void;
  setGoal: (goal: string) => void;
  setTopics: (topics: string[]) => void;
  toggleTopic: (topic: string) => void;
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
  setAuthView: (authView: AuthView) => void;
  setOnboardingBeat: (beat: OnboardingBeat) => void;
  setIsFirstRun: (isFirstRun: boolean) => void;
  setNavCollapsed: (collapsed: boolean) => void;
  setTeamDockOpen: (open: boolean) => void;
  toggleTeamDock: () => void;
  setCopilotPanelOpen: (open: boolean) => void;
  toggleCopilotPanel: () => void;
  setPageShape: (shape: "3:4" | "16:9" | "A4") => void;
  setInfographicPages: (pages: "1" | "2" | "3" | string) => void;
  setInfographicTemplate: (template: "stat-hero" | "trial-summary" | "bench-data" | "moa-scroll" | "burden-disease") => void;
  setInfographicLogoPlacement: (placement: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "none") => void;
  setInfographicActivePage: (page: number) => void;
  reset: () => void;
}

const initialState = {
  view: "home" as AppView,
  creationMode: "magic-reel" as CreationMode,
  sourceType: "dossier" as SourceSelectionType,
  sourcePayload: { dossierId: "velmora" },
  videoSubStage: "mode-select" as VideoSubStage,
  assetType: "video" as AssetType,
  brief: "Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for DERMORA.",
  audience: "" as Audience,
  goal: "",
  topics: [] as string[],
  market: "United States",
  intendedUse: "HCP meeting",
  format: "16:9",
  duration: "60 sec",
  language: "English",
  presentationMode: "narrated" as PresentationMode,
  voice: "Rohan · clear and measured",
  music: "No music",
  selectedSourceIds: [],
  demoScenarioId: "hcp-launch",
  directionId: creativeDirections[0].id,
  selectedSceneId: "scene-3",
  inspectorTab: "edit" as InspectorTab,
  selectedQuality: "hd" as "hd" | "cinematic",
  chatMessages: [] as Array<{ role: "user" | "swishx"; text: string }>,
  authView: "signin" as AuthView,
  onboardingBeat: 1 as OnboardingBeat,
  isFirstRun: true,
  navCollapsed: false,
  teamDockOpen: false,
  copilotPanelOpen: true,
  pageShape: "3:4" as "3:4" | "16:9" | "A4",
  infographicPages: "1" as "1" | "2",
  infographicTemplate: "stat-hero" as "stat-hero" | "trial-summary" | "bench-data" | "moa-scroll" | "burden-disease",
  infographicLogoPlacement: "bottom-right" as "bottom-right" | "bottom-left" | "top-right" | "top-left" | "none",
  infographicActivePage: 1 as 1 | 2,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...initialState,
  setSelectedQuality: (selectedQuality) => set({ selectedQuality }),
  setChatMessages: (chatMessages) => set({ chatMessages }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setView: (view) => {
    const documentWithTransitions = typeof document === "undefined" ? null : document as Document & { startViewTransition?: (update: () => void) => { ready?: Promise<unknown> } };
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (documentWithTransitions?.startViewTransition && !reduceMotion) {
      try {
        const transition = documentWithTransitions.startViewTransition(() => set({ view }));
        transition?.ready?.catch(() => {});
      } catch {
        set({ view });
      }
    } else {
      set({ view });
    }
  },
  setCreationMode: (creationMode) => set({ creationMode }),
  setSourceType: (sourceType) => set({ sourceType }),
  setSourcePayload: (sourcePayload) => set({ sourcePayload }),
  setVideoSubStage: (videoSubStage) => set({ videoSubStage }),
  setAssetType: (assetType) => set({ assetType }),
  setBrief: (brief) => set({ brief }),
  setAudience: (audience) => set({ audience }),
  setGoal: (goal) => set({ goal }),
  setTopics: (topics) => set({ topics }),
  toggleTopic: (topic) =>
    set((state) => ({
      topics: state.topics.includes(topic)
        ? state.topics.filter((t) => t !== topic)
        : [...state.topics, topic],
    })),
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
  setAuthView: (authView) => set({ authView }),
  setOnboardingBeat: (onboardingBeat) => set({ onboardingBeat }),
  setIsFirstRun: (isFirstRun) => set({ isFirstRun }),
  setNavCollapsed: (navCollapsed) => set({ navCollapsed }),
  setTeamDockOpen: (teamDockOpen) => set({ teamDockOpen }),
  toggleTeamDock: () => set((state) => ({ teamDockOpen: !state.teamDockOpen })),
  setCopilotPanelOpen: (copilotPanelOpen) => set({ copilotPanelOpen }),
  toggleCopilotPanel: () => set((state) => ({ copilotPanelOpen: !state.copilotPanelOpen })),
  setPageShape: (pageShape) => set({ pageShape }),
  setInfographicPages: (infographicPages) => set({ infographicPages }),
  setInfographicTemplate: (infographicTemplate) => set({ infographicTemplate }),
  setInfographicLogoPlacement: (infographicLogoPlacement) => set({ infographicLogoPlacement }),
  setInfographicActivePage: (infographicActivePage) => set({ infographicActivePage }),
  reset: () => set(initialState),
}));
