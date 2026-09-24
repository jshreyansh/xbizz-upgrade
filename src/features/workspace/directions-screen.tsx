"use client";

import {
  AlertCircle,
  Pencil,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Film,
  Image as ImageIcon,
  Palette,
  Globe2,
  Info,
  Layers,
  LayoutList,
  Mic2,
  MoreHorizontal,
  Music2,
  MonitorPlay,
  PackageCheck,
  Stamp,
  PanelRight,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Target,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { AudienceIcon, ChannelIcon } from "@/components/ui/select-icons";
import { deriveContentPlan, isRequestSpecific } from "@/features/workspace/content-plan";
import { displayIntendedUses, parseIntendedUses, serializeIntendedUses } from "@/features/workspace/intended-use";
import { planningSources } from "@/features/workspace/mock-data";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { InfographicDirectionsScreen } from "@/features/workspace/infographic-directions-screen";
import { ScenarioDrawer } from "@/features/workspace/scenario-drawer";
import { IntakePlaceholder } from "@/features/workspace/intake-checklist";
import { defaultDemoScenarioId, demoScenarios, type DemoScenario } from "@/features/workspace/demo-scenarios";
import { DOSSIERS, INITIAL_BRANDS } from "@/features/workspace/brand-dossier-modal";
import { DossierReaderModal } from "@/features/dossiers/dossier-reader-modal";
import { dossierFor } from "@/features/dossiers/dossier-for";
import { moleculeFor } from "@/features/workspace/grounding-dossiers";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { ResearchSourcesContent, type UploadedDoc } from "@/features/workspace/research-sources-section";
import { FileNoteDialog } from "@/features/workspace/file-note-dialog";
import {
  AssetStrip,
  MediaAssetTile,
  MediaAttachmentGrid,
  brandVariations,
  workspaceAssets,
} from "@/features/workspace/workspace-assets";
import {
  ChatAttachmentRow,
  useChatAttachments,
  type LocalAttachment,
} from "@/features/workspace/chat-attachments";
import { useBrandName } from "@/features/workspace/brand-catalogue";
import {
  buildIntakeQuestions,
  intakeSteps,
  intakeBundlePrompt,
  readIntakeBundle,
  type IntakeAnswer,
} from "@/features/workspace/plan-intake";
import { FormattedMessageText } from "@/features/workspace/chat-message";
import { cn } from "@/lib/cn";
import type { AssetType, Audience, PresentationMode } from "@/types/content";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { VersionChip, type AssetVersion } from "@/features/workspace/version-trail";
import { FlowBreadcrumb, previousStep } from "@/features/workspace/flow-breadcrumb";
import { useVideoSteps } from "@/features/workspace/flow-steps";
import { LogoMark } from "@/components/ui/logo-mark";
import { GenerationProgress, type GenerationStep } from "@/features/workspace/generation-progress";
import { ActionBar } from "@/components/patterns/action-bar";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { LOGO_CORNERS } from "@/features/workspace/logo-watermark";
import { usePlanResearch } from "@/features/workspace/use-plan-research";
import { SplitLayout } from "@/components/patterns/workbench-layout";
import { PlanSectionShell, planState } from "@/features/workspace/plan-status";

import { Portal } from "@/components/ui/portal";

type PlanSectionId = "sources" | "treatment" | "message" | "delivery" | "voice" | "story" | "product-assets" | "references" | "logo";

/** One name per section, so the progress bar and the tiles agree. */
const SECTION_TITLES: Record<PlanSectionId, string> = {
  sources: "Research and Sources",
  treatment: "Creative treatment",
  logo: "Brand mark",
  "product-assets": "Product & Device Visual Assets",
  references: "Visual & creative references",
  message: "Message and audience",
  delivery: "Delivery & Cost",
  voice: "Voice and sound",
  story: "Story structure",
};

const audienceOptions: Audience[] = ["HCP", "Patient", "Field team", "Hospital", "Distributor", "Consumer"];
const useOptions = ["HCP meeting", "LinkedIn", "Instagram", "YouTube", "Email", "Website", "Congress / event", "Internal presentation"];
const topics = ["Product introduction", "Mechanism", "Pivotal evidence", "Dosing & safety", "Patient impact"];
const presenters = [
  { name: "Dr. Maya Kapoor", role: "Dermatologist · warm, reassuring", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Rohan Mehta", role: "Physician · clear, authoritative", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Aisha Shah", role: "Medical presenter · calm, precise", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Daniel Lee", role: "Physician · conversational", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Elena Rostova", role: "Oncology specialist · measured", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Marcus Thorne", role: "Cardiology lead · authoritative", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=160&q=80" },
];

const voiceList = [
  { name: "Rohan", role: "clear and measured", accent: "Indian / US English", tag: "Authoritative" },
  { name: "Riya", role: "friendly and clear", accent: "Neutral English", tag: "Warm & Caring" },
  { name: "Dev", role: "warm and conversational", accent: "US English", tag: "Conversational" },
  { name: "Sarah", role: "clinical and precise", accent: "British English", tag: "Clinical Lead" },
  { name: "Marcus", role: "deep and trustworthy", accent: "North American", tag: "Physician" },
  { name: "Elena", role: "calm and scientific", accent: "International", tag: "Research" },
  { name: "Liam", role: "energetic and direct", accent: "Australian", tag: "Patient Briefing" },
  { name: "Priya", role: "empathetic and reassuring", accent: "Neutral English", tag: "Patient Care" },
];

const profiles: Record<AssetType, {
  noun: string;
  recommendation: string;
  rationale: string;
  treatments: Array<{ id: string; label: string; description: string }>;
  units: Array<{ title: string; detail: string; time?: string }>;
  formatOptions: string[];
  lengthOptions: string[];
}> = {
  video: {
    noun: "video",
    recommendation: "Narrated visual story",
    rationale: "The clearest way to explain the mechanism and evidence without introducing an unnecessary presenter.",
    treatments: [
      { id: "narrated", label: "Narrated visual story", description: "Voiceover with branded scenes, evidence and restrained motion." },
      { id: "presenter", label: "Presenter-led", description: "A doctor or approved presenter delivers the story on screen." },
      { id: "visual-only", label: "Visual-only", description: "On-screen copy and visuals carry the story without narration." },
    ],
    units: [
      { title: "The unresolved need", detail: "Establish the clinical context", time: "8s" },
      { title: "Product introduction", detail: "State the molecule's intended role", time: "8s" },
      { title: "How it works", detail: "Explain the mechanism of action", time: "12s" },
      { title: "Pivotal evidence", detail: "Present the approved endpoint", time: "20s" },
      { title: "Close and fair balance", detail: "CTA and required safety", time: "12s" },
    ],
    formatOptions: ["16:9", "9:16", "1:1"],
    lengthOptions: ["30 sec", "45 sec", "60 sec", "90 sec"],
  },
  carousel: {
    noun: "carousel",
    recommendation: "Evidence-led page story",
    rationale: "A concise sequence lets readers scan the clinical argument while keeping every claim connected to its source.",
    treatments: [
      { id: "evidence", label: "Evidence-led", description: "Lead with the strongest approved result and build context around it." },
      { id: "story", label: "Story-led", description: "Move from the unmet need to the product and proof." },
      { id: "data", label: "Data-led", description: "Use charts and concise interpretation as the main structure." },
    ],
    units: [
      { title: "Cover", detail: "One clear launch message" },
      { title: "Clinical need", detail: "Why this matters" },
      { title: "Product introduction", detail: "The role of the molecule" },
      { title: "Mechanism", detail: "Simple scientific explanation" },
      { title: "Pivotal evidence", detail: "Approved result and citation" },
      { title: "Close", detail: "CTA and fair balance" },
    ],
    formatOptions: ["LinkedIn carousel", "1:1 pages", "16:9 slides"],
    lengthOptions: ["5 pages", "6 pages", "8 pages"],
  },
  infographic: {
    noun: "infographic",
    recommendation: "Guided evidence hierarchy",
    rationale: "A clear top-to-bottom information path makes the science understandable without becoming a dense scientific poster.",
    treatments: [
      { id: "guided", label: "Guided evidence hierarchy", description: "Move from context to mechanism, evidence and implication." },
      { id: "process", label: "Process explanation", description: "Use a sequential scientific pathway as the organizing device." },
      { id: "comparison", label: "Comparison", description: "Organize the content around two or more evidence states." },
    ],
    units: [
      { title: "Headline", detail: "Primary communication message" },
      { title: "Clinical context", detail: "Concise unmet need" },
      { title: "Mechanism", detail: "Scientific pathway" },
      { title: "Evidence", detail: "Approved endpoint and citation" },
      { title: "Implication", detail: "CTA and required safety" },
    ],
    formatOptions: ["Vertical", "Landscape", "Presentation slide"],
    lengthOptions: ["Compact", "Standard", "Detailed"],
  },
  visual: {
    noun: "visual",
    recommendation: "Message-first composition",
    rationale: "One approved message should dominate; brand and evidence remain visible without overcrowding the asset.",
    treatments: [
      { id: "message", label: "Message-first", description: "Lead with the approved communication message." },
      { id: "product", label: "Product-first", description: "Make the product and packshot the visual anchor." },
      { id: "evidence", label: "Evidence-first", description: "Use one approved result as the main focus." },
    ],
    units: [
      { title: "Primary message", detail: "The one thing viewers should retain" },
      { title: "Supporting proof", detail: "One approved evidence point" },
      { title: "Brand and action", detail: "Logo, CTA and required safety" },
    ],
    formatOptions: ["1:1", "4:5", "16:9", "9:16"],
    lengthOptions: ["Single composition"],
  },
};

/** The files a plan starts with when its use case does not say otherwise. */
function defaultUploadedDocs(brand: string): UploadedDoc[] {
  return [
    {
      name: `${brand || "Brand"}_Clinical_Study_Report_Phase3.pdf`,
      size: "4.2 MB",
      date: "Today",
      note: "Primary endpoint tables, for the efficacy claims",
      origin: "new" as const,
    },
    {
      name: `${brand || "Brand"}_Core_Visual_Aid_Brief.docx`,
      size: "840 KB",
      date: "Today",
      note: "Approved wording and tone for HCP copy",
      origin: "new" as const,
    },
  ];
}

/** Plausible file size by extension, so scenarios need not carry byte counts. */
function sizeForFile(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext === "pdf" ? "4.2 MB"
    : ext === "docx" ? "840 KB"
    : ext === "xlsx" ? "260 KB"
    : ext === "zip" ? "18.4 MB"
    : ext === "pptx" ? "6.1 MB"
    : "1.2 MB";
}

/* Nothing has been published yet on the way in, so the trail is one entry. */
const DRAFT_ONLY: AssetVersion[] = [
  { label: "Draft v1", state: "current", at: "Saved just now" },
];

/* Plan → Production Plan. Reported at the granularity the work actually
   happens at — per scene, per section — rather than as a tidy five. */
function scriptBuildSteps(sceneCount: number): GenerationStep[] {
  const scenes: GenerationStep[] = [];
  for (let i = 1; i <= sceneCount; i += 1) {
    scenes.push({ label: `Wrote scene ${i} narration`, seconds: 0.34 });
    scenes.push({ label: `Set scene ${i} visual direction & avoid list`, seconds: 0.28 });
  }
  return [
    { label: "Parsed campaign brief & focus topics", seconds: 0.5 },
    { label: "Resolved audience, market and intended use", seconds: 0.4 },
    { label: "Opened the approved dossier", seconds: 0.5 },
    { label: "Indexed 214 approved claims", seconds: 0.6 },
    { label: "Read attached files for supporting evidence", seconds: 0.5 },
    { label: "Chose the narrative arc for this audience", seconds: 0.6 },
    { label: `Allocated ${sceneCount} scenes against the topic list`, seconds: 0.5 },
    ...scenes,
    { label: "Balanced scene timing to the target duration", seconds: 0.45 },
    { label: "Matched every statement to an approved claim", seconds: 0.6 },
    { label: "Linked citations to FDA label §5.1", seconds: 0.5 },
    { label: "Checked fair balance coverage", seconds: 0.45 },
    { label: "Assembled the production plan", seconds: 0.5 },
  ];
}

export function DirectionsScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const assetType = useWorkspaceStore((state) => state.assetType);
  // Above the early return on purpose: below it these are conditional hooks.
  const research = usePlanResearch();
  const [useCaseDrawerOpen, setUseCaseDrawerOpen] = useState(false);
  /**
   * Two different things, deliberately not one.
   *
   * `sourcesWillFail` is a property of the attachments that nobody has looked
   * at yet. `sourcesUnusable` is what we found when we did. Verification
   * happens on Confirm — so until it runs, the plan must look exactly like any
   * other plan, and the error state cannot be on screen.
   */
  const [sourcesWillFail, setSourcesWillFail] = useState(false);
  const [sourcesUnusable, setSourcesUnusable] = useState(false);
  const [verifyingSources, setVerifyingSources] = useState(false);
  const [promptEditorOpen, setPromptEditorOpen] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");
  /**
   * Sections the user has worked through and confirmed.
   *
   * Nothing recorded this before, so after a bounce back from Confirm every
   * section still read "Recommended" or "From brief" — as if none of it had
   * been decided. The user then has to re-read the whole plan to find the one
   * thing that actually needs them. Confirmed sections say so, and only the
   * blocker asks.
   */
  const [confirmedSections, setConfirmedSections] = useState<PlanSectionId[]>([]);
  /* Above the early return, unlike most of this file's hooks — a new one
     added below it would be a new instance of the bug, not a continuation of
     the old one. */
  const logoUploadRef = useRef<HTMLInputElement>(null);
  const scriptBuildStepList = useMemo(() => scriptBuildSteps(5), []);
  /* The intake conversation. Above the early return with the rest of the
     hoisted hooks — a hook added below it would be a new instance of that
     bug rather than a continuation of the old one. */
  const planPhase = useWorkspaceStore((st) => st.planPhase);
  const setPlanPhase = useWorkspaceStore((st) => st.setPlanPhase);
  const briefAttachments = useWorkspaceStore((st) => st.briefAttachments);
  /* The brand comes from the catalogue, not from a five-entry map that
     answered "Velmora" for every brand it had not heard of. Hoisted with the
     other hooks, above the early return. */
  const resolvedBrandName = useBrandName(useWorkspaceStore((st) => st.sourcePayload?.dossierId));
  /* A packshot picked but not yet attached — waiting on what it is for.
     Hoisted with the other hooks, above the early return at the top. */
  const [pendingMedia, setPendingMedia] = useState<
    Array<{ id: string; name: string; type: "image" | "video"; preview: string; size: string }>
  >([]);
  const [editingMedia, setEditingMedia] = useState<
    { id: string; name: string; note: string; variation?: string; previewUrl?: string; mediaKind?: "image" | "video" } | null
  >(null);
  /**
   * Reference material: how it should feel, not what it may say.
   * Hoisted with the other hooks, above the early return at the top.
   */
  const [referenceList, setReferenceList] = useState<
    Array<{ id: string; name: string; kind: "image" | "video"; note: string; previewUrl?: string }>
  >([]);
  const [pendingReference, setPendingReference] = useState<
    Array<{ id: string; name: string; kind: "image" | "video"; previewUrl?: string }>
  >([]);
  const [editingReference, setEditingReference] = useState<
    { id: string; name: string; note: string; previewUrl?: string; mediaKind?: "image" | "video" } | null
  >(null);
  /* Files attached to the next chat message. Hoisted with the other hooks,
     above the early return at the top of this component. */
  const chatFiles = useChatAttachments();
  /* Sent, and waiting to be told where they belong. */
  const [pendingChatFiles, setPendingChatFiles] = useState<LocalAttachment[]>([]);
  const [intakeIndex, setIntakeIndex] = useState(0);
  /* Kept as the record of what was answered; nothing renders it, because the
     plan below IS what the answers produced. */
  const [, setIntakeAnswers] = useState<IntakeAnswer[]>([]);
  const flowSteps = useVideoSteps({});
  const backStep = previousStep(flowSteps, "plan");

  if (assetType === "infographic") {
    return <InfographicDirectionsScreen />;
  }

  const {
    brief,
    audience,
    market,
    intendedUse,
    format,
    duration,
    language,
    presentationMode,
    voice,
    music,
    selectedSourceIds,
    creationMode,
    sourceType,
    sourcePayload,
    chatMessages,
    setChatMessages,
    addChatMessage,
    setAudience,
    setIntendedUse,
    setBrief,
    setMarket,
    setCreationMode,
    setSourceType,
    setSelectedSourceIds,
    demoScenarioId,
    setDemoScenarioId,
    setFormat,
    setDuration,
    setLanguage,
    setPresentationMode,
    setVoice,
    setMusic,
    toggleSource,
    setView,
    setVideoSubStage,
    goal: storeGoal,
    topics: storeTopics,
    setGoal: setStoreGoal,
    setTopics: setStoreTopics,
    selectedQuality,
    setSelectedQuality,
    copilotPanelOpen,
    copilotPanelWidth,
    setCopilotPanelWidth,
    setCopilotPanelOpen,
    toggleCopilotPanel,
    logoMark,
    setLogoMark,
  } = useWorkspaceStore();

  // Keyboard shortcut: ⌘\ or Ctrl+\ to toggle right panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleCopilotPanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCopilotPanel]);

  const brandName = resolvedBrandName;
  const projectName = `${brandName} HCP launch`;

  const profile = profiles[assetType];
  const derivedPlan = useMemo(
    () =>
      deriveContentPlan({
        assetType,
        brief,
        audience,
        market,
        intendedUse,
        selectedSourceIds,
        creationMode,
        sourceType,
        sourcePayload,
      }),
    [assetType, audience, brief, intendedUse, market, selectedSourceIds, creationMode, sourceType, sourcePayload]
  );

  // Dynamic Real-time Duration, Quality & Credit Calculations
  const durationSeconds = duration.includes("30") ? 30 : duration.includes("45") ? 45 : duration.includes("90") ? 90 : 60;
  const estimatedCredits = Math.round((durationSeconds / 60) * (selectedQuality === "cinematic" ? 7500 : 2500));
  const estimatedRenderTime = selectedQuality === "cinematic" ? "12–14 min" : "7–9 min";

  const isMagicAvatar = creationMode === "magic-avatar";
  const defaultTreatment = isMagicAvatar ? "presenter" : creationMode === "magic-reel" ? "narrated" : (assetType === "video" ? presentationMode : derivedPlan.treatmentId);
  const [treatmentId, setTreatmentId] = useState<string>(defaultTreatment);
  const [goal, setGoal] = useState<string>(storeGoal || derivedPlan.goal || "New launch");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(storeTopics && storeTopics.length > 0 ? storeTopics : derivedPlan.topics.length > 0 ? derivedPlan.topics : ["Product introduction", "Mechanism"]);
  const [confirmedTreatment, setConfirmedTreatment] = useState(true);
  const [sourceConflictResolved, setSourceConflictResolved] = useState(false);
  const [storyStructure, setStoryStructure] = useState(derivedPlan.storyStructure);
  const [presenter, setPresenter] = useState(
    isMagicAvatar ? "Dr. Maya Kapoor" : (presentationMode === "presenter" ? "Dr. Maya Kapoor" : "")
  );

  // Dynamic Product Media Assets: Starts EMPTY by default
  const [productMediaList, setProductMediaList] = useState<
    Array<{
      id: string;
      name: string;
      type: "image" | "video";
      preview: string;
      size: string;
      note?: string;
      variation?: string;
    }>
  >([]);

  const isProductFocus =
    selectedTopics.some((t) => t.toLowerCase().includes("product") || t.toLowerCase().includes("launch")) ||
    goal.toLowerCase().includes("launch") ||
    goal.toLowerCase().includes("product") ||
    brief.toLowerCase().includes("product") ||
    brief.toLowerCase().includes("pen") ||
    brief.toLowerCase().includes("autoinjector");

  /* Undefined means "nobody has chosen yet", which is different from null
     meaning "everything is closed" — and it is what lets the opening section
     be derived from the plan rather than synced to it by an effect. */
  const [openOverride, setOpenOverride] = useState<PlanSectionId | null | undefined>(undefined);
  const setOpenSection = setOpenOverride;
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>(
    () => defaultUploadedDocs(brandName)
  );
  const [previewDossier, setPreviewDossier] = useState<BrandDossier | null>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);
  const [editingDecision, setEditingDecision] = useState<string | null>(null);
  const [previewingAudio, setPreviewingAudio] = useState<string | null>(null);
  const [presenterLibraryOpen, setPresenterLibraryOpen] = useState(false);
  const [voiceLibraryOpen, setVoiceLibraryOpen] = useState(false);
  const [sourceManagerOpen, setSourceManagerOpen] = useState(false);
  const activeScenario = demoScenarios.find((s) => s.id === demoScenarioId);

  /**
   * Switching the use case here swaps the whole context, not just a label —
   * brief, audience, market, intended use and sources — because the plan is
   * derived from those. The accordion set below then follows, since it is
   * computed from the same inputs.
   *
   * Only cases for this asset type are offered (see ScenarioDrawer): changing
   * asset type from inside this screen would hit the early return above and
   * unmount the hooks beneath it.
   */
  const loadUseCase = (scenario: DemoScenario) => {
    setBrief(scenario.inputs.brief);
    setAudience(scenario.inputs.audience);
    setMarket(scenario.inputs.market);
    setIntendedUse(scenario.inputs.intendedUse);
    setSelectedSourceIds(scenario.inputs.selectedSourceIds);
    // sourceType is what makes derivedPlan.hasApprovedEvidence true on its
    // own, so a case with no sources must not keep claiming "dossier".
    setSourceType(scenario.inputs.selectedSourceIds.length > 0 ? "dossier" : "text");
    setDemoScenarioId(scenario.id);
    setUseCaseDrawerOpen(false);

    /**
     * goal, topics and treatment are useState seeded once from the plan, so
     * without this they survive the switch — and because isProductFocus reads
     * topics and goal, a patient-education case kept showing Product & Device
     * Visual Assets on the strength of the previous case's "Product
     * introduction" topic. Re-derive them for the new inputs.
     */
    /**
     * creationMode is deliberately NOT passed, and is cleared below.
     *
     * content-plan short-circuits on it — "magic-reel" forces narrated before
     * the brief is even read — so the tile someone happened to click on the
     * way in was overriding every case, and the visual-only case arrived
     * narrated with a Voice section it has no use for. Once a use case is
     * chosen it is the statement of intent, so the brief governs, exactly as
     * the scenario's own assertions are written and verified.
     */
    setCreationMode("scratch");
    const next = deriveContentPlan({
      assetType,
      brief: scenario.inputs.brief,
      audience: scenario.inputs.audience,
      market: scenario.inputs.market,
      intendedUse: scenario.inputs.intendedUse,
      selectedSourceIds: scenario.inputs.selectedSourceIds,
      sourceType,
      sourcePayload,
    });
    setGoal(next.goal);
    setStoreGoal(next.goal);
    setSelectedTopics(next.topics);
    setStoreTopics(next.topics);
    setTreatmentId(assetType === "video" ? next.presentationMode : next.treatmentId);
    setPresentationMode(next.presentationMode);
    setStoryStructure(next.storyStructure);

    // The plan is being rebuilt around a different job, so the worked-through
    // state goes back to the top rather than pretending the old answers hold.
    /**
     * What the user has attached is part of the case, not a constant. These
     * were seeded with two plausible files for every plan, so "Nothing to work
     * from" showed a clinical study report it is supposed to be missing, and
     * "Attachments with nothing usable" showed useful-looking ones. A case
     * that states its attachments gets exactly those — including none.
     */
    const docs = scenario.inputs.uploadedDocs;
    setUploadedDocs(
      docs
        ? docs.map((name) => ({
            name,
            size: sizeForFile(name),
            date: "Today",
            note: "Attached with the brief",
            origin: "new" as const,
          }))
        // A case that says nothing about attachments means the user has their
        // normal working files — not whichever files the last case left behind.
        : defaultUploadedDocs(brandName)
    );
    // Whether those files hold anything is part of the case — but it is not
    // KNOWN until Confirm runs the check, so only the latent flag is set here.
    setSourcesWillFail(scenario.inputs.sourcesVerify === false);
    setSourcesUnusable(false);
    setVerifyingSources(false);

    setOpenSection("sources");
    setConfirmedTreatment(false);
    setConfirmedSections([]);
    setChatMessages([]);
  };

  /**
   * Whether SwishX has anything approved for this request. The dossier tray,
   * the grounding modes and the block all hang off this, so it is derived from
   * the sources the case actually selected rather than assumed.
   */
  /**
   * Read from the sources this case actually selected, NOT from
   * derivedPlan.hasApprovedEvidence: content-plan short-circuits that on
   * sourceType === "dossier", which every project started from the New
   * Project modal carries — so "Nothing to work from" still claimed an
   * approved dossier and offered to ground a script in it.
   */
  /**
   * Markets whose approved labels are all selected at once. Derived the same
   * way content-plan derives the conflict, from the market each source carries
   * as the first segment of its detail line.
   */
  const conflictingMarkets = derivedPlan.sourceConflict
    ? [
        ...new Set(
          selectedSourceIds
            .map((id) => planningSources.find((source) => source.id === id))
            .filter((source) => source?.kind === "approved-source" || source?.kind === "claims")
            .map((source) => source!.detail.split("\u00b7")[0].trim())
            .filter(Boolean)
        ),
      ]
    : [];

  /**
   * Resolving means removing the competing label, not ticking a box. The old
   * sourceConflictResolved flag had no caller anywhere — it was unreachable
   * while sourceConflict was hardcoded null, so making the conflict real left
   * this case blocked with no way forward.
   */
  const resolveSourceConflict = (keepMarket: string) => {
    for (const id of [...selectedSourceIds]) {
      const source = planningSources.find((item) => item.id === id);
      if (!source) continue;
      const isAuthority = source.kind === "approved-source" || source.kind === "claims";
      if (!isAuthority) continue;
      if (source.detail.split("\u00b7")[0].trim() !== keepMarket) toggleSource(id);
    }
    setSourceConflictResolved(true);
    addChatMessage({
      role: "swishx",
      text: `Using the **${keepMarket}** label as the governing source. The other market's dossier has been removed from this plan.`,
    });
  };

  /**
   * A brief too thin to plan from. Observable without checking anything, so it
   * is said here rather than saved up for Confirm — the plan below it would be
   * guesswork presented as decisions.
   */
  const requestTooVague = !isRequestSpecific(brief);

  /**
   * The approved dossier is a given at this stage. Whether one exists was
   * never a question the person planning could answer, and treating it as one
   * meant the plan could block itself on a condition with no way out of it
   * from here.
   */
  const nothingToGroundIn = false;

  const openPromptEditor = () => {
    setPromptDraft(brief);
    setPromptEditorOpen(true);
  };

  const savePromptEdit = () => {
    const next = promptDraft.trim();
    setPromptEditorOpen(false);
    if (!next || next === brief) return;
    setBrief(next);
    // Context supplied in words counts as context: the plan re-derives, and
    // with it the section set — which is the point of editing here rather
    // than walking back to the brief screen.
    setSourcesUnusable(false);
    setSourcesWillFail(false);
    setOpenSection("sources");
    addChatMessage({ role: "user", text: next });
    addChatMessage({
      role: "swishx",
      text: "Thanks, re-reading the plan against that. The parameters on the left have been updated.",
    });
  };

  const approvedEvidenceCount = selectedSourceIds.filter((id) => id !== "dermora-reference").length;
  const needsPresenter = presentationMode === "presenter" || treatmentId === "presenter" || creationMode === "magic-avatar";
  const needsProductAssets = isProductFocus && productMediaList.length === 0;

  /**
   * Two states that no amount of confirming resolves: nothing to ground in at
   * all, and attachments that were read and hold nothing usable. They are
   * counted as unresolved so Start is refused, and named first below so the
   * bar says the real reason rather than "confirm creative treatment".
   */
  const groundingBlocked = nothingToGroundIn || sourcesUnusable || requestTooVague;

  const unresolvedCount =
    (groundingBlocked ? 1 : 0) +
    (confirmedTreatment ? 0 : 1) +
    (needsPresenter && !presenter ? 1 : 0) +
    (needsProductAssets ? 1 : 0) +
    (derivedPlan.sourceConflict && !sourceConflictResolved ? 1 : 0);

  const isPlanReady = unresolvedCount === 0;
  const selectedTreatment = profile.treatments.find((item) => item.id === treatmentId) ?? profile.treatments[0];

  // ── Generation Loading State on Left Panel ──
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Chat Input in Right Panel ──
  const [chatInput, setChatInput] = useState("");

  // Initialize store chat messages if empty
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          role: "user",
          text: brief || `Create a concise ${brandName} HCP launch video explaining clinical need, mechanism, and pivotal risk reduction.`,
        },
        {
          role: "swishx",
          text: `I've structured a 5-scene video plan grounded in the **${brandName}** dossier and approved claims. You can review the parameters on the left canvas, or chat with me to make any adjustments.`,
        },
      ]);
    }
  }, [chatMessages.length, brief, brandName, setChatMessages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isGenerating]);

  const toggleSection = (section: PlanSectionId) => {
    setEditingDecision(null);
    setOpenSection((current) => (current === section ? null : section));
  };

  /**
   * The order the plan is meant to be worked through. Every section advances
   * via this, so the flow is one click after another rather than each section
   * deciding for itself where to go — which is how `selectTreatment` used to
   * collapse everything to null and leave Product Assets to be found by hand.
   */
  /* In the order they are drawn. An order that disagrees with the markup
     sends Save & Continue jumping back up the page — which is what putting
     the mark after the product assets here, while drawing it before them,
     had already started doing. */
  const sectionOrder: PlanSectionId[] = [
    "sources",
    isMagicAvatar ? "voice" : "treatment",
    // Every video carries a mark, so this is not folded into product assets —
    // that section only appears when the brief is product-focused.
    "logo",
    ...(isProductFocus ? (["product-assets"] as PlanSectionId[]) : []),
    /* Reference material sits beside the product media and nowhere near the
       sources: it shapes the treatment, and it grounds nothing. */
    "references",
    "message",
    "delivery",
    // Visual-only has nothing to voice, and avatar mode already voiced it in
    // slot 2 — either way there is no Voice section to advance into.
    ...(isMagicAvatar || treatmentId === "visual-only" ? [] : (["voice"] as PlanSectionId[])),
    "story",
  ];

  /**
   * sectionOrder already decided which sections this plan HAS — it just only
   * governed the advance chain, so Product & Device Visual Assets rendered for
   * every plan and merely changed its summary text. A section not in the order
   * is not part of this job and is not drawn.
   */
  const shows = (section: PlanSectionId) => sectionOrder.includes(section);

  /**
   * Whether a section is still asking something of you.
   *
   * One definition, used by the chip, the progress bar, what opens on arrival
   * and where Continue goes — so those four can never disagree about which
   * sections are outstanding, which is exactly the kind of drift a plan
   * screen cannot afford.
   */
  const sectionNeedsYou = (section: PlanSectionId) => {
    switch (section) {
      case "sources":
        return groundingBlocked;
      case "treatment":
        return !confirmedTreatment;
      case "voice":
        return needsPresenter && !presenter;
      case "product-assets":
        return needsProductAssets;
      default:
        /* Everything else arrives with an answer inferred from the brief.
           Not having looked at it yet is not the same as it asking you
           something — treating the two alike marked five settled sections as
           outstanding and made the count meaningless. "Needs you" is reserved
           for what is actually missing or blocked. */
        return false;
    }
  };

  /**
   * Product assets are genuinely skippable unless the brief is product-led,
   * and references always are — a plan blocked for want of a mood board is a
   * plan refusing to start over a nice-to-have.
   */
  const sectionOptional = (section: PlanSectionId) =>
    section === "references" || (section === "product-assets" && !isProductFocus);

  const planSections = sectionOrder.map((id) => ({
    id,
    title: SECTION_TITLES[id] ?? id,
    state: planState(sectionNeedsYou(id), sectionOptional(id)),
  }));

  /* Arrive on the first thing that actually needs an answer. Opening
     "Research and Sources" every time means the one blocking section sits
     several clicks away on a plan that is otherwise fine. Derived, so it
     cannot fight what the user then opens. */
  const openSection =
    openOverride === undefined
      ? ((planSections.find((entry) => entry.state === "needs-you")?.id as PlanSectionId | undefined) ??
        "sources")
      : openOverride;

  const advanceFrom = (section: PlanSectionId) => {
    setEditingDecision(null);
    // Pressing Continue on a section is the confirmation of it.
    const settled = confirmedSections.includes(section)
      ? confirmedSections
      : [...confirmedSections, section];
    setConfirmedSections(settled);

    /* Continue goes to the next thing that still needs an answer, not to the
       literal next tile. Walking someone through four settled sections to
       reach the one blocking them is the accordion wasting their time on its
       own ordering. */
    const from = sectionOrder.indexOf(section);
    const rest = sectionOrder.slice(from + 1);
    const next =
      rest.find((id) => sectionNeedsYou(id)) ??
      rest.find((id) => !settled.includes(id)) ??
      null;
    setOpenSection(next);
  };

  const selectTreatment = (id: string) => {
    setTreatmentId(id);
    if (assetType === "video") setPresentationMode(id as PresentationMode);
    if (id !== "presenter") setPresenter("");
    if (!derivedPlan.followsSuppliedScript) setStoryStructure(structureForTreatment(assetType, id));
    setConfirmedTreatment(true);
    // Was `: null`, which closed everything and stranded Product Assets.
    if (id === "presenter") setOpenSection("voice");
    else advanceFrom("treatment");
  };

  const toggleTopic = (topic: string) =>
    setSelectedTopics((current) => {
      const next = current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic];
      setStoreTopics(next);
      return next;
    });

  const previewAudio = (kind: "voice" | "music", label: string) => {
    stopAudioPreview();
    if (previewingAudio === label) {
      setPreviewingAudio(null);
      return;
    }
    setPreviewingAudio(label);
    if (kind === "voice" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${brandName} brings approved evidence into a clear clinical story.`);
      utterance.rate = label.includes("Riya") || label.includes("Maya") ? 0.95 : 0.9;
      utterance.pitch = label.includes("Riya") || label.includes("Maya") ? 1.05 : 0.95;
      utterance.onend = () => setPreviewingAudio(null);
      window.speechSynthesis.speak(utterance);
    } else {
      playMusicTone(label);
      window.setTimeout(() => setPreviewingAudio(null), 2200);
    }
  };

  const effectiveFormat = format.includes("·") ? format.split("·")[0].trim() : format;

  const handleBackToBrief = () => {
    setVideoSubStage("intake");
    setView("create");
  };

  const handleConfirmPlan = () => {
    /**
     * Verification happens BEFORE anything starts generating, and failure
     * keeps the user on this screen. The old handler set isGenerating and
     * navigated to the studio on a timer with no gate at all, so a plan with
     * nothing behind it produced a script anyway.
     */
    if (groundingBlocked) {
      setOpenSection("sources");
      addChatMessage({ role: "user", text: "Confirm plan & build script" });
      addChatMessage({
        role: "swishx",
        text: requestTooVague
          ? `Before I write anything: this request doesn't say what the asset has to do. Tell me the communication job, who it is for and what it has to land, with **Edit the prompt**, in Research and Sources.`
          : `I can't build a script yet, there's no approved **${brandName}** dossier for this request and nothing attached. Attach a source file, or use **Edit the prompt** in Research and Sources to give me the context in words.`,
      });
      return;
    }

    /**
     * The attachments are read HERE, because this is the moment the user asked
     * for a script from them. Failing sends them back to this screen with the
     * finding shown — it never reaches the studio, and the state that explains
     * why only appears now, not when the plan was first laid out.
     */
    if (sourcesWillFail) {
      addChatMessage({ role: "user", text: "Confirm plan & build script" });
      setVerifyingSources(true);
      addChatMessage({
        role: "swishx",
        text: `Verifying the ${uploadedDocs.length} attached source${uploadedDocs.length === 1 ? "" : "s"} before writing anything...`,
      });

      setTimeout(() => {
        setVerifyingSources(false);
        setSourcesUnusable(true);
        setSourcesWillFail(false);
        setOpenSection("sources");
        addChatMessage({
          role: "swishx",
          text: `I read every attached file and found nothing a claim can be grounded in, so I've stopped before the script, they're flagged in **Research and Sources**. Replace them with clinical or label material, or use **Edit the prompt** in Research and Sources to supply the context directly.`,
        });
      }, 1400);
      return;
    }

    setIsGenerating(true);

    addChatMessage({
      role: "user",
      text: "Confirm plan & build script",
    });

    addChatMessage({
      role: "swishx",
      text: `Confirmed plan parameters for **${brandName}**. Structuring 5-scene clinical script and grounding against FDA approved claims...`,
    });
  };

  /* The wait owns its own clock now, and calls this when it runs out. */
  const handleScriptBuilt = () => {
    addChatMessage({
      role: "swishx",
      text: `Script & storyboard scenes generated for **${brandName}**! You can review or edit script narration in-place on the left canvas, or chat with me to make adjustments.`,
    });
    setVideoSubStage("studio");
    setView("studio");
  };

  /**
   * What the plan still has to ask before it can be drawn — the attachments
   * nobody explained, and the length nobody stated.
   */
  /* Plain values, not memos: every hook in this file has to sit above the
     early return at the top, and these two are cheap array builders. */
  const intakeQuestions = buildIntakeQuestions(briefAttachments, "video");
  const currentIntake = planPhase === "intake" ? intakeQuestions[intakeIndex] : undefined;

  /** The wait between the brief and the first question. */
  const intakeStepList = intakeSteps(briefAttachments, brandName);


  /** The wait is over: say what was read, then ask the first thing. */
  const handleIntakeResearched = () => {
    setPlanPhase("intake");
    const count = briefAttachments.length;
    addChatMessage({
      role: "swishx",
      text: count
        ? `I've read the brief and opened ${count === 1 ? "the attachment" : `all ${count} attachments`}. ${intakeQuestions.length} quick ${intakeQuestions.length === 1 ? "thing" : "things"} and I can lay the plan out.`
        : `I've read the brief against the **${brandName}** dossier. One thing and I can lay the plan out.`,
    });
    setTimeout(() => {
      const prompt = intakeBundlePrompt(intakeQuestions);
      if (prompt) addChatMessage({ role: "swishx", text: prompt });
    }, 600);
  };

  /**
   * The reply, read against every question at once. Everything was asked in
   * one message, so everything is answered in one, and the plan follows —
   * drawn from those answers, which is the whole reason for asking rather
   * than guessing.
   */
  const answerIntake = (text: string) => {
    if (intakeQuestions.length === 0) return;
    const answers = readIntakeBundle(intakeQuestions, text, (question) => {
      const file = briefAttachments.find((f) => `file-${f.id}` === question.id);
      return file?.kind ?? "doc";
    });
    setIntakeAnswers(answers);
    setIntakeIndex(intakeQuestions.length);
    for (const answer of answers) {
      if (answer.kind === "duration") setDuration(answer.value);
    }

    setTimeout(() => {
      addChatMessage({
        role: "swishx",
        text: `${answers.map((a) => a.reply).join(" ")}\n\nThat's everything I needed. I've laid the plan out on the left, grounded in the **${brandName}** dossier and approved claims. Check it over and confirm, or tell me what to change.`,
      });
      setPlanPhase("plan");
    }, 650);
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const attached = textToSend ? [] : chatFiles.take();
    const text = textToSend || chatInput.trim();
    if (!text && attached.length === 0) return;

    addChatMessage({
      role: "user",
      text: attached.length
        ? [text, ...attached.map((f) => `\u{1F4CE} ${f.name}`)].filter(Boolean).join("\n")
        : text,
    });
    if (!textToSend) setChatInput("");

    /**
     * A file arrives without a job, and the three it could be doing here are
     * different enough that guessing is worse than asking: a source grounds
     * claims and has to be verified, a packshot gets placed into scenes, and
     * anything else is context for this one question. So it asks, and the
     * answer is what files it.
     */
    if (attached.length > 0) {
      setPendingChatFiles(attached);
      setTimeout(() => {
        addChatMessage({
          role: "swishx",
          text:
            attached.length === 1
              ? `Got **${attached[0].name}**. Where should it go. A grounded source, product media for the scenes, a creative reference for the look, or just context for this question?`
              : `Got ${attached.length} files. Where should they go, grounded sources, product media for the scenes, creative references for the look, or just context for this question?`,
        });
      }, 600);
      return;
    }

    /* An answer to "where should this go" beats every other reading of the
       sentence, because it is answering the question just asked. */
    if (pendingChatFiles.length > 0) {
      const lower = text.toLowerCase();
      const files = pendingChatFiles;
      const say = (message: string) =>
        setTimeout(() => addChatMessage({ role: "swishx", text: message }), 500);

      if (/\b(source|ground|grounding|evidence|research|dossier|claims?|study|data)\b/.test(lower)) {
        setPendingChatFiles([]);
        setUploadedDocs((prev) => [
          ...prev,
          ...files.map((f) => ({
            name: f.name,
            size: "—",
            date: "Just now",
            note: text.trim(),
            origin: "new" as const,
          })),
        ]);
        setOpenSection("sources");
        say(
          `Added ${files.length === 1 ? `**${files[0].name}**` : `${files.length} files`} to **Research and Sources**, with what you just said as the note. Claims can ground in ${files.length === 1 ? "it" : "them"} now.`
        );
        return;
      }
      if (/\b(packshot|pack shot|product|media|photo|image|footage|asset|device|pen)\b/.test(lower)) {
        setPendingChatFiles([]);
        setProductMediaList((prev) => [
          ...prev,
          ...files.map((f, i) => ({
            id: `media-chat-${Date.now()}-${i}`,
            name: f.name,
            type: (f.kind === "video" ? "video" : "image") as "image" | "video",
            preview:
              f.previewUrl ??
              "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
            size: "—",
            note: text.trim(),
          })),
        ]);
        setOpenSection("product-assets");
        say(
          `Placed ${files.length === 1 ? `**${files[0].name}**` : `${files.length} files`} in **Product & Device Visual Assets**, with your note against ${files.length === 1 ? "it" : "them"}.`
        );
        return;
      }
      if (/\b(reference|look|style|feel|mood|pacing|grade|inspiration)\b/.test(lower)) {
        setPendingChatFiles([]);
        setReferenceList((prev) => [
          ...prev,
          ...files.map((f, i) => ({
            id: `ref-chat-${Date.now()}-${i}`,
            name: f.name,
            kind: (f.kind === "video" ? "video" : "image") as "image" | "video",
            note: text.trim(),
            previewUrl: f.previewUrl,
          })),
        ]);
        setOpenSection("references");
        say(
          `Filed ${files.length === 1 ? `**${files[0].name}**` : `${files.length} files`} under **Visual & creative references**, with your note against ${files.length === 1 ? "it" : "them"}. It steers the treatment. No claim will ground in it.`
        );
        return;
      }
      if (/\b(context|just|only|nothing|ignore|question|message)\b/.test(lower)) {
        setPendingChatFiles([]);
        say(`Understood, reading ${files.length === 1 ? "it" : "them"} for this question only. Nothing added to the plan.`);
        return;
      }
    }

    /* While a question is outstanding, what you type is its answer — not a
       change request against a plan that does not exist yet. */
    if (currentIntake) {
      answerIntake(text);
      return;
    }

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Understood. I have verified this against the ${brandName} dossier and adjusted the plan canvas accordingly.`;

      if (lower.includes("portrait") || lower.includes("9:16")) {
        setFormat("9:16");
        reply = `Updated the output frame to **9:16 Portrait**. Ideal for mobile HCP engagement and congress stories.`;
      } else if (lower.includes("landscape") || lower.includes("16:9")) {
        setFormat("16:9");
        reply = `Updated the output frame to **16:9 Landscape**. Standard for desktop presentations and Veeva detailing.`;
      } else if (lower.includes("presenter") || lower.includes("doctor") || lower.includes("avatar")) {
        setPresenter("Dr. Maya Kapoor");
        setPresentationMode("presenter");
        setTreatmentId("presenter");
        reply = `Assigned **Dr. Maya Kapoor** (Dermatology Specialist) as the clinical presenter on the plan canvas.`;
      } else if (lower.includes("45") || lower.includes("shorten")) {
        setDuration("45 sec");
        reply = `Adjusted target length to **45 seconds** (compact 4-scene narrative).`;
      } else if (lower.includes("moa") || lower.includes("mechanism")) {
        if (!selectedTopics.includes("Mechanism")) {
          toggleTopic("Mechanism");
        }
        reply = `Elevated **Mechanism of Action** with dual-inhibition 3D visual cues in Scene 2.`;
      }

      addChatMessage({ role: "swishx", text: reply });
    }, 500);
  };

  return (
    <SplitLayout
      className="bg-[#edf0ed]"
      panelOpen={copilotPanelOpen}
      onPanelOpenChange={setCopilotPanelOpen}
      panelWidth={copilotPanelWidth}
      onPanelWidthChange={setCopilotPanelWidth}
      panelStorageKey="swishx.copilotPanelWidth"
      /* Below 1024 there is not enough width for canvas + inspector:
         the panel closes once on the way down, and a deliberate
         re-open sticks. Tablet portrait is review-only by design. */
      autoCollapsePanelBelow="laptop"
      header={
        <ScreenHeader>
          <button
            onClick={() => backStep?.onGo?.()}
            disabled={!backStep?.onGo}
            className="focus-ring mr-2 grid size-8 place-items-center rounded-chip text-ink-3 transition hover:bg-black/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            aria-label={backStep ? `Back to ${backStep.label}` : "Back"}
            title={backStep ? `Back to ${backStep.label}` : undefined}
          >
            <ArrowLeft className="size-4" />
          </button>
          <SwishXMark compact />
          <div className="mx-3 h-5 w-px bg-hair" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-body font-[800] text-ink">{projectName}</span>
              <VersionChip versions={DRAFT_ONLY} />
            </div>
            <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
              Saved just now · {presenter || "Maya Kapoor"}
            </div>
          </div>

          {/* Use case. Was a static "Plan View" chip, which named the screen
              you were already looking at; this names the job the plan is for
              and lets you change it without walking back to the brief. */}
          <div className="ml-6 hidden items-center gap-1.5 sm:flex">
            <FlowBreadcrumb steps={flowSteps} currentId="plan" />
            <button
              type="button"
              onClick={() => setUseCaseDrawerOpen(true)}
              aria-haspopup="dialog"
              className="flex max-w-[240px] items-center gap-1.5 rounded-chip border border-hair-2 bg-card px-2.5 py-1 text-caption font-bold text-ink-2 transition-colors hover:border-brand hover:text-brand cursor-pointer"
            >
              <Layers className="size-3 shrink-0 text-brand" />
              <span className="truncate">{activeScenario?.label ?? "Choose use case"}</span>
              <ChevronDown className="size-3 shrink-0 opacity-60" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Toggle Right Sidebar Panel Button (Icon Only) */}
            <button
              type="button"
              onClick={toggleCopilotPanel}
              className={cn(
                "grid size-8 place-items-center rounded-chip border transition-colors cursor-pointer",
                copilotPanelOpen
                  ? "border-hair-2 bg-black/5 text-ink hover:bg-black/10"
                  : "border-hair-2 bg-card text-ink-3 hover:text-ink hover:border-brand shadow-2xs"
              )}
              title={copilotPanelOpen ? "Collapse sidebar (⌘\\)" : "Expand sidebar (⌘\\)"}
              aria-label="Toggle sidebar"
            >
              <PanelRight className="size-4" />
            </button>

            <Button variant="ghost" size="icon" aria-label="More">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </ScreenHeader>
      }
      main={
          <section
            className="flex flex-1 min-w-0 flex-col min-h-0 border-r border-hair bg-[#eef1ed] overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4"
          >
            {isGenerating ? (
              <GenerationProgress
                title="Building the production plan..."
                subtitle="Structuring clinical narrative, scene-by-scene script narration, and visual grounding against 214 approved claims."
                steps={scriptBuildStepList}
                onDone={handleScriptBuilt}
              />
            ) : planPhase === "research" ? (
              /* Reading the request and whatever came with it — which is what
                 the questions are about, so the wait explains why it asks. */
              <GenerationProgress
                title="Reading your request..."
                subtitle={
                  briefAttachments.length
                    ? `Understanding the brief and checking what each of the ${briefAttachments.length} attached ${briefAttachments.length === 1 ? "file" : "files"} can ground.`
                    : "Understanding the brief and checking it against the approved dossier."
                }
                steps={intakeStepList}
                onDone={handleIntakeResearched}
              />
            ) : planPhase === "intake" ? (
              /* No plan to review yet — one drawn before the questions were
                 answered would be a guess presented as a decision. What there
                 is instead is the questions themselves, and what has been
                 answered so far. */
              <IntakePlaceholder />
            ) : (
              <>
                {/* Header in Left Canvas */}
                <div className="flex items-center justify-between pb-2 shrink-0">
                  <div>
                    {/* The screen is named after what it wants, not after
                        what it holds. "Available Context · Dossier Plan &
                        Storyboard Parameters" described the machinery; the
                        person here is being asked some questions. */}
                    <h2 className="text-display font-[850] text-ink tracking-tight">
                      Need your input
                    </h2>
                    <p className="text-body text-ink-3 mt-0.5">
                      Answer below to help us refine the production plan for you.
                    </p>
                  </div>
                </div>

                {/* No progress bar. The rows say it themselves now: a red
                    rail is a row that wants something and a green one does
                    not, so a segmented bar above them was the same count
                    twice. */}

                {requestTooVague && (
                  /* Above the accordions, because it is not a parameter — the
                     parameters below it are inferred from a request that does
                     not say enough to infer them from. */
                  <div className="rounded-panel border border-danger-line bg-danger-bg p-4">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="mt-0.5 size-4.5 shrink-0 text-danger" />
                      <div className="min-w-0 flex-1">
                        <p className="text-body-lg font-extrabold text-danger">
                          This request is too vague to plan from
                        </p>
                        <p className="mt-0.5 text-body leading-snug text-ink-2">
                          Everything below is a guess. Say what the asset has to do, who it speaks
                          to and what it has to land, and the plan will be built from that instead.
                        </p>
                        <div className="mt-3">
                          <Button size="sm" variant="primary" onClick={openPromptEditor} className="text-label font-bold cursor-pointer">
                            <Pencil className="size-3.5" /> Edit the prompt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Rich Accordion Sections with Dynamic Focus Enlargement & Dimming ─── */}
                <div className="space-y-3 min-w-0 w-full">
                  {/* 1. Research & Sources (Unified Top Starting Tile) */}
                  <PlanSection
                    icon={ShieldCheck}
                    title="Research and Sources"
                    summary={`${brandName} Approved Dossier + ${uploadedDocs.length} custom files active`}
                    state={planState(sectionNeedsYou("sources"))}
                    source={
                      research.researching
                        ? `researching ${research.current}/${research.total}`
                        : "from source"
                    }
                    /* Open while the research runs — the progress plays inside
                       the dossier tray, so there is something to watch. */
                    open={research.researching || openSection === "sources"}
                    onToggle={() => { if (!research.researching) toggleSection("sources"); }}
                    /* Sources is the one section that can BE the blocker, so
                       it is the one whose tone can turn. */
                  >
                    <ResearchSourcesContent
                      brandName={brandName || "Velmora"}
                      uploadedDocs={uploadedDocs}
                      onSetUploadedDocs={(next) => {
                        setUploadedDocs(next);
                        // Files the user just chose have not been read yet, so
                        // neither the finding nor the latent flag still holds.
                        setSourcesUnusable(false);
                        setSourcesWillFail(false);
                      }}
                      onPreviewDossier={() => setPreviewDossier(dossierFor(brandName, moleculeFor(brandName)))}
                      onContinue={() => advanceFrom("sources")}
                      research={research}
                      sourcesUnusable={sourcesUnusable}
                      conflictingMarkets={sourceConflictResolved ? [] : conflictingMarkets}
                      onResolveConflict={resolveSourceConflict}
                    />
                  </PlanSection>

                  {/* 2. Creative Treatment (in regular mode) OR Presenter & Voice (in Magic Avatar mode) */}
                  {isMagicAvatar ? (
                    <PlanSection
                      icon={Mic2}
                      title="Presenter, voice and sound"
                      summary={`${presenter || "Dr. Maya Kapoor"} · ${language} · ${music}`}
                      state={planState(!presenter)}
                      open={openSection === "voice"}
                      onToggle={() => toggleSection("voice")}
                    >
                      <div className="mb-4">
                        <div className="text-body-lg font-semibold text-ink-3 mb-2.5">
                          Select AI Presenter Avatar
                        </div>
                        <div className="grid gap-2.5 sm:grid-cols-3">
                          {presenters.slice(0, 2).map((person) => (
                            <button
                              key={person.name}
                              onClick={() => setPresenter(person.name)}
                              className={cn(
                                "focus-ring flex min-h-[64px] items-center gap-3 rounded-control border p-3 text-left text-body-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer",
                                presenter === person.name
                                  ? "border-brand bg-tint ring-2 ring-brand/15 text-brand-deep shadow-xs"
                                  : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                              )}
                            >
                              <FacePhoto person={person} className="size-10 rounded-full ring-2 ring-white shadow-xs shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="block truncate font-bold text-body-lg">{person.name}</span>
                                <span className="block text-label text-ink-3 font-normal">{person.role}</span>
                              </div>
                              {presenter === person.name && <Check className="size-4 shrink-0 text-brand" strokeWidth={3} />}
                            </button>
                          ))}
                          <button
                            onClick={() => setPresenterLibraryOpen(true)}
                            className="focus-ring flex min-h-[64px] items-center gap-2.5 rounded-control border border-hair-2 bg-card p-3 text-left text-body-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-hair-3 hover:bg-canvas cursor-pointer"
                          >
                            <span className="flex -space-x-2.5">
                              {presenters.slice(2).map((person) => (
                                <FacePhoto key={person.name} person={person} className="size-8 rounded-full border-2 border-white shadow-2xs" />
                              ))}
                            </span>
                            <span className="ml-1 text-body-lg text-ink-2">Avatar Library</span>
                            <ArrowRight className="ml-auto size-4 text-ink-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <DecisionRow
                          label="Language"
                          value={language}
                          icon={<Globe2 className="size-4" />}
                          editing={editingDecision === "language"}
                          onEdit={() => setEditingDecision(editingDecision === "language" ? null : "language")}
                        >
                          <ChoiceGroup
                            label="Choose a language"
                            value={language}
                            onChange={(next) => {
                              setLanguage(next);
                              setEditingDecision(null);
                            }}
                            options={["English", "Hindi", "Spanish", "French", "German"]}
                            icon={() => <Globe2 className="size-4" />}
                          />
                        </DecisionRow>
                        <DecisionRow
                          label="Voice"
                          value={voice}
                          icon={<Mic2 className="size-4" />}
                          editing={editingDecision === "voice"}
                          onEdit={() => setEditingDecision(editingDecision === "voice" ? null : "voice")}
                          onPreview={() => previewAudio("voice", voice)}
                          playing={previewingAudio === voice}
                        >
                          <AudioChoices
                            label="Choose and preview a voice"
                            value={voice}
                            options={["Rohan · clear and measured", "Riya · friendly and clear", "Dev · warm and conversational"]}
                            onChange={(next) => {
                              setVoice(next);
                              setEditingDecision(null);
                            }}
                            previewing={previewingAudio}
                            onPreview={(option) => previewAudio("voice", option)}
                            onOpenLibrary={() => setVoiceLibraryOpen(true)}
                          />
                        </DecisionRow>
                        <DecisionRow
                          label="Background music"
                          value={music}
                          icon={<Music2 className="size-4" />}
                          editing={editingDecision === "music"}
                          onEdit={() => setEditingDecision(editingDecision === "music" ? null : "music")}
                          onPreview={music === "No music" ? undefined : () => previewAudio("music", music)}
                          playing={previewingAudio === music}
                        >
                          <AudioChoices
                            label="Choose and preview music"
                            value={music}
                            options={["No music", "Calm clinical", "Warm", "Uplifting"]}
                            onChange={(next) => {
                              setMusic(next);
                              setEditingDecision(null);
                            }}
                            previewing={previewingAudio}
                            onPreview={(option) => previewAudio("music", option)}
                            music
                          />
                        </DecisionRow>
                      </div>

                      <div className="mt-4 pt-3 border-t border-hair flex justify-end">
                        <Button
                          onClick={() => {
                            setConfirmedTreatment(true);
                            advanceFrom("voice");
                          }}
                          className="bg-brand hover:bg-brand-deep text-white font-bold cursor-pointer"
                        >
                          {isProductFocus ? "Confirm Avatar & Proceed to Product Assets" : "Confirm Avatar & Continue"} <ArrowRight className="size-4 ml-1" />
                        </Button>
                      </div>
                    </PlanSection>
                  ) : (
                    <PlanSection
                      icon={Film}
                      title="Creative treatment"
                      summary={confirmedTreatment ? selectedTreatment.label : `${profile.recommendation} · needs confirmation`}
                      state={planState(!confirmedTreatment)}
                      open={openSection === "treatment"}
                      onToggle={() => toggleSection("treatment")}
                    >
                      <div className="squircle rounded-panel bg-subtle px-4 py-3.5">
                        <div className="text-body-lg font-semibold text-brand">Why this fits</div>
                        <p className="mt-1 text-body-lg leading-5 text-ink-3">{profile.rationale}</p>
                      </div>
                      <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
                        {profile.treatments.map((item, index) => {
                          const selected = treatmentId === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => selectTreatment(item.id)}
                              className={cn(
                                "focus-ring flex flex-col justify-between rounded-panel border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer",
                                selected
                                  ? "border-brand bg-tint ring-2 ring-brand/15 shadow-xs"
                                  : "border-hair bg-card opacity-85 hover:opacity-100 hover:border-hair-3"
                              )}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <span className="font-bold text-subhead text-ink flex items-center gap-1.5 leading-tight">
                                    {item.label}
                                  </span>
                                  <span
                                    className={cn(
                                      "grid size-5 shrink-0 place-items-center rounded-full border transition",
                                      selected
                                        ? "border-brand bg-brand text-white"
                                        : "border-hair-2 bg-card"
                                    )}
                                  >
                                    {selected && <Check className="size-3" strokeWidth={3.5} />}
                                  </span>
                                </div>
                                {index === 0 && (
                                  <span className="inline-block mb-2 rounded-chip bg-card px-2 py-0.5 text-caption font-bold text-brand-deep border border-tint-line shadow-2xs">
                                    Recommended
                                  </span>
                                )}
                                <p className="text-label leading-snug text-ink-3">
                                  {item.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <PlanSectionContinue
                        onClick={() => {
                          setConfirmedTreatment(true);
                          advanceFrom("treatment");
                        }}
                      />
                    </PlanSection>
                  )}

                  {/* Brand mark — one corner, every scene */}
                  {shows("logo") && (
                  <PlanSection
                    icon={Stamp}
                    title="Brand mark"
                    summary={
                      logoMark.position === "none"
                        ? "No logo. The asset ships unbranded"
                        : `${LOGO_CORNERS.find((c) => c.id === logoMark.position)?.label} · ${logoMark.name}`
                    }
                    state={planState(sectionNeedsYou("logo"))}
                    source={logoMark.source === "brand-kit" ? "from brand kit" : "replaced"}
                    open={openSection === "logo"}
                    onToggle={() => setOpenSection(openSection === "logo" ? null : "logo")}
                  >
                    <div className="space-y-4">
                      {/* The artwork, and the one thing you can do to it */}
                      <div className="flex flex-wrap items-center gap-3 rounded-control border border-hair bg-subtle p-3">
                        <span className="grid h-11 w-[112px] shrink-0 place-items-center rounded-control border border-hair-2 bg-card">
                          <span className="inline-flex items-center gap-1.5">
                            <span aria-hidden className="size-4 rounded-[3px] bg-[linear-gradient(135deg,#fd4816_0%,#b82f0c_100%)]" />
                            <span className="text-body font-[850] tracking-tight text-ink">Meridian</span>
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-body font-bold text-ink">{logoMark.name}</div>
                          <p className="mt-0.5 text-label text-ink-3">
                            {logoMark.source === "brand-kit"
                              ? "Pulled from your brand kit. Size and clear space follow the kit's rule, shown, not set."
                              : "Uploaded for this project. Check it against the brand kit before publishing."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => logoUploadRef.current?.click()}
                          className="focus-ring shrink-0 cursor-pointer rounded-chip border border-hair-2 bg-card px-3 py-1.5 text-label font-bold text-ink-2 transition hover:border-brand hover:text-brand"
                        >
                          Replace
                        </button>
                        {logoMark.source === "custom" && (
                          <button
                            type="button"
                            onClick={() =>
                              setLogoMark({ source: "brand-kit", name: "Meridian Therapeutics · primary mark" })
                            }
                            className="shrink-0 cursor-pointer text-label font-bold text-brand hover:underline"
                          >
                            Use brand kit
                          </button>
                        )}
                        <input
                          ref={logoUploadRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setLogoMark({ source: "custom", name: file.name });
                            e.target.value = "";
                          }}
                        />
                      </div>

                      <div>
                        <div className="mb-1 text-label font-extrabold uppercase tracking-wider text-brand-deep">
                          Placement
                        </div>
                        <p className="mb-2 text-body text-ink-2">
                          Every scene keeps this corner clear, and the mark is placed into it. Nothing else is
                          laid out there, so the logo can never end up over a claim or its citation.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {LOGO_CORNERS.map((corner) => {
                            const active = logoMark.position === corner.id;
                            return (
                              <button
                                key={corner.id}
                                type="button"
                                onClick={() => setLogoMark({ position: corner.id })}
                                className={cn(
                                  "flex cursor-pointer items-start gap-2 rounded-control border p-2.5 text-left transition",
                                  active
                                    ? "border-brand bg-tint shadow-2xs ring-2 ring-brand/15"
                                    : "border-hair-2 bg-card hover:border-hair-3"
                                )}
                              >
                                {/* A frame with the mark in the corner it means */}
                                <span className="relative mt-0.5 h-8 w-[52px] shrink-0 overflow-hidden rounded-[4px] border border-hair-2 bg-[#101826]">
                                  {corner.id !== "none" && (
                                    <span
                                      aria-hidden
                                      className={cn(
                                        "absolute h-1.5 w-4 rounded-[2px] bg-white/85",
                                        corner.id === "top-left" && "left-1 top-1",
                                        corner.id === "top-right" && "right-1 top-1",
                                        corner.id === "bottom-left" && "bottom-1 left-1",
                                        corner.id === "bottom-right" && "bottom-1 right-1"
                                      )}
                                    />
                                  )}
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-body font-bold text-ink">{corner.label}</span>
                                  <span className="mt-0.5 block text-label leading-snug text-ink-3">
                                    {corner.hint}
                                  </span>
                                </span>
                                {active && <Check className="ml-auto size-4 shrink-0 text-brand" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <PlanSectionContinue onClick={() => advanceFrom("logo")} />
                    </div>
                  </PlanSection>
                  )}

                  {/* 2. Elevated Product Packshot & Visual Assets */}
                  {shows("product-assets") && (
                  <PlanSection
                    icon={PackageCheck}
                    title="Product & Device Visual Assets"
                    summary={
                      productMediaList.length > 0
                        ? `${productMediaList.length} media attached · 3D packshots grounded`
                        : isProductFocus
                        ? "Required for Product Introduction · Please attach product photos/videos"
                        : "Optional product packshots & 3D device renders"
                    }
                    state={planState(sectionNeedsYou("product-assets"), sectionOptional("product-assets"))}
                    source={productMediaList.length > 0 ? `${productMediaList.length} attached` : undefined}
                    open={openSection === "product-assets"}
                    onToggle={() => toggleSection("product-assets")}
                  >
                    <div className="space-y-3.5">
                      <div className="rounded-control bg-canvas border border-hair p-3.5 text-body text-ink-2 leading-relaxed">
                        <p className="font-bold text-ink mb-1">
                          Product Packshots &amp; Device Reference Media
                        </p>
                        <p className="text-ink-3 text-body">
                          Packaging, delivery pen or MoA clips. Placed into the product scenes.
                        </p>
                      </div>

                      <MediaAttachmentGrid
                        items={productMediaList.map((m) => ({
                          id: m.id,
                          name: m.name,
                          note: m.note,
                          previewUrl: m.preview,
                          kind: m.type,
                          size: m.size ? `${m.size} · Uploaded` : undefined,
                          variation: m.variation,
                        }))}
                        uploadLabel={
                          productMediaList.length === 0 ? "Upload product photos / videos" : "Add more media"
                        }
                        onUpload={() =>
                          /* Held, not attached: what the packshot is for is
                             asked before it joins the plan, the same as a
                             source file. */
                          setPendingMedia([
                            {
                              id: `media-${Date.now()}`,
                              name: `${brandName}_${brandVariations(brandName)[0].replace(/[^a-zA-Z0-9]+/g, "_")}_Pack_Front.png`,
                              type: "image" as const,
                              preview:
                                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                              size: "4.2 MB",
                            },
                          ])
                        }
                        onRemove={(id) => setProductMediaList((prev) => prev.filter((m) => m.id !== id))}
                        onEditNote={(item) =>
                          setEditingMedia({
                            id: item.id,
                            name: item.name,
                            note: item.note ?? "",
                            variation: item.variation,
                            previewUrl: item.previewUrl,
                            mediaKind: item.kind,
                          })
                        }
                      />

                      {/* Cleared artwork this brand already has, shown as
                          artwork. A filename and a plus said nothing about
                          which pack it was. */}
                      {(() => {
                        const reusable = workspaceAssets(brandName, "product").filter(
                          (asset) => !productMediaList.some((m) => m.name === asset.name)
                        );
                        if (reusable.length === 0) return null;
                        return (
                          <div>
                            <span className="mb-1.5 block text-label font-bold uppercase tracking-wider text-ink-3">
                              Suggested from platform
                            </span>
                            <AssetStrip>
                              {reusable.map((asset) => (
                                <MediaAssetTile
                                  key={asset.id}
                                  source="workspace"
                                  name={asset.name}
                                  note={asset.note}
                                  origin={asset.origin}
                                  previewUrl={asset.previewUrl}
                                  kind={asset.kind}
                                  variation={asset.variation}
                                  onAdd={() =>
                                    setProductMediaList((prev) => [
                                      ...prev,
                                      {
                                        id: `media-lib-${asset.id}-${Date.now()}`,
                                        name: asset.name,
                                        type: asset.kind === "video" ? "video" : "image",
                                        preview: asset.previewUrl ?? "",
                                        size: asset.size,
                                        note: asset.note,
                                        variation: asset.variation,
                                      },
                                    ])
                                  }
                                />
                              ))}
                            </AssetStrip>
                          </div>
                        );
                      })()}
                    </div>
                    {/* ONE continue, like every other section. This used to be a
                        bespoke orange "Save Product Assets & Next" that always
                        rendered, so the footer added for consistency stacked a
                        second button under it. The attach-if-empty behaviour it
                        carried is preserved here. */}
                    <PlanSectionContinue
                      label={productMediaList.length === 0 ? "Attach & Continue" : "Save & Continue"}
                      onClick={() => {
                        if (productMediaList.length === 0) {
                          setProductMediaList([
                            {
                              id: `media-${Date.now()}`,
                              name: `${brandName}_Autoinjector_3D_Packshot.png`,
                              type: "image",
                              preview: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                              size: "4.2 MB",
                              note: "Hero packshot. The pack as it should appear in product scenes",
                            },
                          ]);
                        }
                        advanceFrom("product-assets");
                      }}
                    />
                  </PlanSection>
                  )}

                  {/* Visual & creative references — how it should feel, not
                      what it may say. Its own section because an asset from
                      you is doing one of three jobs, and this is the third:
                      evidence grounds a claim, a packshot appears on screen,
                      and a reference shapes the treatment. Folding it into
                      either of the others would put material that grounds
                      nothing next to material that grounds everything. */}
                  {shows("references") && (
                  <PlanSection
                    icon={Palette}
                    title="Visual & creative references"
                    summary={
                      referenceList.length > 0
                        ? `${referenceList.length} reference${referenceList.length === 1 ? "" : "s"}`
                        : "The look you are after"
                    }
                    state={planState(false, referenceList.length === 0)}
                    source={referenceList.length > 0 ? `${referenceList.length} attached` : undefined}
                    open={openSection === "references"}
                    onToggle={() => toggleSection("references")}
                  >
                    <div className="space-y-3">
                      <p className="text-body leading-snug text-ink-3">
                        A film or an image that shows the look you want. Steers pacing, grade and
                        composition. <strong className="font-bold text-ink-2">Grounds no claims.</strong>
                      </p>

                      <MediaAttachmentGrid
                        items={referenceList.map((r) => ({
                          id: r.id,
                          name: r.name,
                          note: r.note,
                          previewUrl: r.previewUrl,
                          kind: r.kind,
                        }))}
                        uploadLabel={referenceList.length === 0 ? "Upload a reference" : "Add another"}
                        onUpload={() =>
                          setPendingReference([
                            {
                              id: `ref-${Date.now()}`,
                              name: `${brandName}_Reference_Film.mp4`,
                              kind: "video" as const,
                              previewUrl: "/reel-moa.mp4",
                            },
                          ])
                        }
                        onRemove={(id) => setReferenceList((prev) => prev.filter((r) => r.id !== id))}
                        onEditNote={(item) =>
                          setEditingReference({
                            id: item.id,
                            name: item.name,
                            note: item.note ?? "",
                            previewUrl: item.previewUrl,
                            mediaKind: item.kind,
                          })
                        }
                      />

                      {/* What earlier projects referenced, shown as what it is. */}
                      {(() => {
                        const reusable = workspaceAssets(brandName, "reference").filter(
                          (asset) => !referenceList.some((r) => r.name === asset.name)
                        );
                        if (reusable.length === 0) return null;
                        return (
                          <div>
                            <span className="mb-1.5 block text-label font-bold uppercase tracking-wider text-ink-3">
                              Suggested from platform
                            </span>
                            <AssetStrip>
                              {reusable.map((asset) => (
                                <MediaAssetTile
                                  key={asset.id}
                                  source="workspace"
                                  name={asset.name}
                                  note={asset.note}
                                  origin={asset.origin}
                                  previewUrl={asset.previewUrl}
                                  kind={asset.kind}
                                  onAdd={() =>
                                    setReferenceList((prev) => [
                                      ...prev,
                                      {
                                        id: `ref-lib-${asset.id}-${Date.now()}`,
                                        name: asset.name,
                                        kind: asset.kind === "video" ? "video" : "image",
                                        note: asset.note,
                                        previewUrl: asset.previewUrl,
                                      },
                                    ])
                                  }
                                />
                              ))}
                            </AssetStrip>
                          </div>
                        );
                      })()}
                    </div>
                    <PlanSectionContinue
                      label={referenceList.length === 0 ? "Skip & Continue" : "Save & Continue"}
                      onClick={() => advanceFrom("references")}
                    />
                  </PlanSection>
                  )}

                  {/* 3. Message and Audience */}
                  <PlanSection
                    icon={Target}
                    title="Message and audience"
                    summary={`${audience} · ${goal} · ${selectedTopics.length} topics`}
                    state={planState(sectionNeedsYou("message"))}
                    source="from brief"
                    open={openSection === "message"}
                    onToggle={() => toggleSection("message")}
                  >
                    <div className="space-y-2">
                      <DecisionRow
                        label="Audience"
                        value={audience}
                        icon={<AudienceIcon value={audience} />}
                        editing={editingDecision === "audience"}
                        onEdit={() => setEditingDecision(editingDecision === "audience" ? null : "audience")}
                      >
                        <ChoiceGroup
                          label="Choose the primary audience"
                          value={audience}
                          onChange={(next) => {
                            setAudience(next as Audience);
                            setEditingDecision(null);
                          }}
                          options={audienceOptions}
                          icon={(next) => <AudienceIcon value={next} />}
                        />
                      </DecisionRow>
                      <DecisionRow
                        label="Objective"
                        value={goal}
                        icon={<Target className="size-4" />}
                        editing={editingDecision === "objective"}
                        onEdit={() => setEditingDecision(editingDecision === "objective" ? null : "objective")}
                      >
                        <ChoiceGroup
                          label="What should this accomplish?"
                          value={goal}
                          onChange={(next) => {
                            setGoal(next);
                            setStoreGoal(next);
                            setEditingDecision(null);
                          }}
                          options={["New launch", "Awareness", "Adoption", "Retention", "Education"]}
                          icon={() => <Target className="size-4" />}
                        />
                      </DecisionRow>
                      <DecisionRow
                        label="Topics"
                        value={selectedTopics.join(" · ")}
                        icon={<LayoutList className="size-4" />}
                        editing={editingDecision === "topics"}
                        onEdit={() => setEditingDecision(editingDecision === "topics" ? null : "topics")}
                      >
                        <div className="text-body-lg font-semibold text-ink-3">Include only what matters</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {topics.map((topic) => (
                            <button
                              key={topic}
                              onClick={() => toggleTopic(topic)}
                              aria-pressed={selectedTopics.includes(topic)}
                              className={cn(
                                "focus-ring min-h-10 rounded-control border px-3 text-body-lg font-medium transition cursor-pointer",
                                selectedTopics.includes(topic)
                                  ? "border-hair-3 bg-subtle text-brand"
                                  : "border-hair-2 hover:border-hair-3"
                              )}
                            >
                              {selectedTopics.includes(topic) && <Check className="mr-1.5 inline size-3.5" />}
                              {topic}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" onClick={() => setEditingDecision(null)}>
                            Done
                          </Button>
                        </div>
                      </DecisionRow>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("message")} />
                  </PlanSection>

                  {/* 4. Delivery & Cost */}
                  <PlanSection
                    icon={MonitorPlay}
                    title="Delivery & Cost"
                    summary={`${displayIntendedUses(intendedUse)} · ${effectiveFormat} · ${duration} · ${selectedQuality === "cinematic" ? "Cinematic" : "HD"} (⚡ ${estimatedCredits.toLocaleString()} credits)`}
                    state={planState(sectionNeedsYou("delivery"))}
                    source={`${estimatedCredits.toLocaleString()} credits`}
                    open={openSection === "delivery"}
                    onToggle={() => toggleSection("delivery")}
                  >
                    <div className="space-y-3">
                      <DecisionRow
                        label="Destinations"
                        value={displayIntendedUses(intendedUse)}
                        icon={<ChannelIcon value={parseIntendedUses(intendedUse)[0]} />}
                        editing={editingDecision === "channel"}
                        onEdit={() => setEditingDecision(editingDecision === "channel" ? null : "channel")}
                      >
                        <MultiChoiceGroup
                          label="Choose one or more destinations"
                          values={parseIntendedUses(intendedUse)}
                          onChange={(next) => setIntendedUse(serializeIntendedUses(next))}
                          onDone={() => setEditingDecision(null)}
                          options={useOptions}
                          icon={(next) => <ChannelIcon value={next} />}
                        />
                      </DecisionRow>
                      <DecisionRow
                        label={assetType === "video" ? "Frame" : "Format"}
                        value={effectiveFormat}
                        icon={<FrameGlyph value={effectiveFormat} />}
                        editing={editingDecision === "format"}
                        onEdit={() => setEditingDecision(editingDecision === "format" ? null : "format")}
                      >
                        <FormatChoices
                          label="Choose the output shape"
                          value={effectiveFormat}
                          options={profile.formatOptions}
                          onChange={(next) => {
                            setFormat(next);
                            setEditingDecision(null);
                          }}
                        />
                      </DecisionRow>
                      <DecisionRow
                        label={assetType === "video" ? "Length" : "Amount"}
                        value={duration}
                        icon={<Clock3 className="size-4" />}
                        editing={editingDecision === "length"}
                        onEdit={() => setEditingDecision(editingDecision === "length" ? null : "length")}
                      >
                        <SteppedControl
                          label={assetType === "video" ? "Video length" : "Content amount"}
                          value={duration}
                          options={profile.lengthOptions}
                          onChange={setDuration}
                        />
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" onClick={() => setEditingDecision(null)}>
                            Done
                          </Button>
                        </div>
                      </DecisionRow>

                      {/* Output Quality & Generation Engine Selector */}
                      <div className="pt-2 border-t border-hair">
                        <label className="text-body font-bold text-ink block mb-1.5">
                          Generation Output Quality
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Option 1: HD */}
                          <button
                            type="button"
                            onClick={() => setSelectedQuality("hd")}
                            className={cn(
                              "group relative rounded-control border p-3 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between",
                              selectedQuality === "hd"
                                ? "border-brand bg-tint ring-2 ring-brand/15 shadow-xs"
                                : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-extrabold text-body-lg text-ink">HD Motion</span>
                                <span className="rounded-chip bg-warn-bg border border-warn-line/80 px-2 py-0.5 text-caption font-extrabold text-warn">
                                  ⚡ {Math.round((durationSeconds / 60) * 2500).toLocaleString()} credits
                                </span>
                              </div>
                              <p className="text-label leading-snug text-ink-3">
                                Lifelike motion that stops the scroll, ideal for launches &amp; HCP presentations.
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-hair text-caption text-ink-3">
                              <span className="flex items-center gap-1 font-medium">⏱ 7–9 min render</span>
                              {selectedQuality === "hd" && (
                                <span className="font-bold text-brand flex items-center gap-1">
                                  <Check className="size-3.5" strokeWidth={3} /> Selected
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Option 2: Cinematic */}
                          <button
                            type="button"
                            onClick={() => setSelectedQuality("cinematic")}
                            className={cn(
                              "group relative rounded-control border p-3 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between",
                              selectedQuality === "cinematic"
                                ? "border-brand bg-tint ring-2 ring-brand/15 shadow-xs"
                                : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-extrabold text-body-lg text-ink">Cinematic 4K</span>
                                <span className="rounded-chip bg-tint border border-tint-line px-2 py-0.5 text-caption font-extrabold text-brand-deep">
                                  ⚡ {Math.round((durationSeconds / 60) * 7500).toLocaleString()} credits
                                </span>
                              </div>
                              <p className="text-label leading-snug text-ink-3">
                                Ultra-realistic, fully generated 3D anatomical scenes, for flagship congresses.
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-hair text-caption text-ink-3">
                              <span className="flex items-center gap-1 font-medium">⏱ 12–14 min render</span>
                              {selectedQuality === "cinematic" && (
                                <span className="font-bold text-brand flex items-center gap-1">
                                  <Check className="size-3.5" strokeWidth={3} /> Selected
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Live Real-Time Cost & Balance Breakdown Card */}
                      <div className="rounded-panel bg-[#121614] border border-white/10 p-4 text-white shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-chip bg-brand/20 border border-brand/20 flex items-center justify-center">

                            </div>
                            <div>
                              <div className="text-label font-extrabold uppercase tracking-wider text-white/60">Project Budget</div>
                              <div className="text-subhead font-[850] text-white">⚡ {estimatedCredits.toLocaleString()} Credits</div>
                            </div>
                          </div>
                          <div className="text-right sm:text-right text-label text-white/70">
                            <span>Team Balance: </span>
                            <strong className="text-ok-on-dark font-bold">50,000 credits</strong>
                          </div>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-label text-white/75">
                          <span>Format: <strong className="text-white font-semibold">{effectiveFormat}</strong> ({duration})</span>
                          <span>Quality: <strong className="text-white font-semibold">{selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"}</strong></span>
                          <span>Estimated Render: <strong className="text-white font-semibold">~{estimatedRenderTime}</strong></span>
                        </div>
                      </div>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("delivery")} />
                  </PlanSection>

                  {/* 5. Presenter, Voice and Sound (for standard video mode) */}
                  {shows("voice") && assetType === "video" && (
                    <PlanSection
                      icon={Mic2}
                      title={needsPresenter ? "Presenter, voice and sound" : "Voice and sound"}
                      summary={
                        needsPresenter
                          ? `${presenter || "Choose presenter"} · ${language} · ${music}`
                          : `${voice} · ${language} · ${music}`
                      }
                      state={planState(sectionNeedsYou("voice"))}
                      source={presenter ?? undefined}
                      open={openSection === "voice"}
                      onToggle={() => toggleSection("voice")}
                    >
                      {needsPresenter && (
                        <div className="mb-4">
                          <div className="text-body-lg font-semibold text-ink-3 mb-2.5">
                            Who appears on screen?
                          </div>
                          <div className="grid gap-2.5 sm:grid-cols-3">
                            {presenters.slice(0, 2).map((person) => (
                              <button
                                key={person.name}
                                onClick={() => setPresenter(person.name)}
                                className={cn(
                                  "focus-ring flex min-h-[64px] items-center gap-3 rounded-control border p-3 text-left text-body-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer",
                                  presenter === person.name
                                    ? "border-brand bg-tint ring-2 ring-brand/15 text-brand-deep shadow-xs"
                                    : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                                )}
                              >
                                <FacePhoto person={person} className="size-10 rounded-full ring-2 ring-white shadow-xs shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <span className="block truncate font-bold text-body-lg">{person.name}</span>
                                  <span className="block text-label text-ink-3 font-normal">{person.role}</span>
                                </div>
                                {presenter === person.name && <Check className="size-4 shrink-0 text-brand" strokeWidth={3} />}
                              </button>
                            ))}
                            <button
                              onClick={() => setPresenterLibraryOpen(true)}
                              className="focus-ring flex min-h-[64px] items-center gap-2.5 rounded-control border border-hair-2 bg-card p-3 text-left text-body-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-hair-3 hover:bg-canvas cursor-pointer"
                            >
                              <span className="flex -space-x-2.5">
                                {presenters.slice(2).map((person) => (
                                  <FacePhoto key={person.name} person={person} className="size-8 rounded-full border-2 border-white shadow-2xs" />
                                ))}
                              </span>
                              <span className="ml-1 text-body-lg text-ink-2">Avatar Library</span>
                              <ArrowRight className="ml-auto size-4 text-ink-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <DecisionRow
                          label="Language"
                          value={language}
                          icon={<Globe2 className="size-4" />}
                          editing={editingDecision === "language"}
                          onEdit={() => setEditingDecision(editingDecision === "language" ? null : "language")}
                        >
                          <ChoiceGroup
                            label="Choose a language"
                            value={language}
                            onChange={(next) => {
                              setLanguage(next);
                              setEditingDecision(null);
                            }}
                            options={["English", "Hindi", "Spanish", "French", "German"]}
                            icon={() => <Globe2 className="size-4" />}
                          />
                        </DecisionRow>
                        <DecisionRow
                          label="Voice"
                          value={voice}
                          icon={<Mic2 className="size-4" />}
                          editing={editingDecision === "voice"}
                          onEdit={() => setEditingDecision(editingDecision === "voice" ? null : "voice")}
                          onPreview={() => previewAudio("voice", voice)}
                          playing={previewingAudio === voice}
                        >
                          <AudioChoices
                            label="Choose and preview a voice"
                            value={voice}
                            options={["Rohan · clear and measured", "Riya · friendly and clear", "Dev · warm and conversational"]}
                            onChange={(next) => {
                              setVoice(next);
                              setEditingDecision(null);
                            }}
                            previewing={previewingAudio}
                            onPreview={(option) => previewAudio("voice", option)}
                            onOpenLibrary={() => setVoiceLibraryOpen(true)}
                          />
                        </DecisionRow>
                        <DecisionRow
                          label="Background music"
                          value={music}
                          icon={<Music2 className="size-4" />}
                          editing={editingDecision === "music"}
                          onEdit={() => setEditingDecision(editingDecision === "music" ? null : "music")}
                          onPreview={music === "No music" ? undefined : () => previewAudio("music", music)}
                          playing={previewingAudio === music}
                        >
                          <AudioChoices
                            label="Choose and preview music"
                            value={music}
                            options={["No music", "Calm clinical", "Warm", "Uplifting"]}
                            onChange={(next) => {
                              setMusic(next);
                              setEditingDecision(null);
                            }}
                            previewing={previewingAudio}
                            onPreview={(option) => previewAudio("music", option)}
                            music
                          />
                        </DecisionRow>
                      </div>
                      <PlanSectionContinue onClick={() => advanceFrom("voice")} />
                    </PlanSection>
                  )}



                  {/* 7. Story Structure */}
                  <PlanSection
                    icon={LayoutList}
                    title="Story structure"
                    summary={`${storyStructure} · ${profile.units.length} ${assetType === "video" ? "scenes" : "sections"}`}
                    state={planState(sectionNeedsYou("story"))}
                    source={derivedPlan.followsSuppliedScript ? "from your script" : "recommended"}
                    open={openSection === "story"}
                    onToggle={() => toggleSection("story")}
                  >
                    <StructureChoices
                      value={storyStructure}
                      onChange={setStoryStructure}
                      options={
                        assetType === "video"
                          ? ["Product → Proof", "Problem → Solution", "Mechanism → Evidence"]
                          : profile.treatments.map((item) => item.label)
                      }
                    />
                    <PlanSectionContinue onClick={() => advanceFrom("story")} />
                  </PlanSection>
                </div>

                {/* Centered Floating Confirmation CTA at the bottom of the Left Stage */}
                <ActionBar
                  icon={isPlanReady
                    ? <CheckCircle2 className="size-4.5 text-ok-on-dark shrink-0" />
                    : <AlertCircle className="size-4.5 text-warn-on-dark shrink-0" />}
                  title={verifyingSources
                    ? "Verifying attached sources"
                    : isPlanReady ? "Ready to generate script" : `${unresolvedCount} parameter${unresolvedCount > 1 ? "s" : ""} pending`}
                  description={isPlanReady
                    ? "Grounded against 214 approved claims"
                    : requestTooVague
                    ? "The request is too vague to plan from, say what the asset has to do"
                    : nothingToGroundIn
                    ? "No approved dossier and no attachments. Add context to continue"
                    : sourcesUnusable
                    ? "Attached sources hold nothing usable, replace them or edit the prompt"
                    : needsProductAssets
                    ? "Please attach product visual assets"
                    : needsPresenter && !presenter
                    ? "Please select an AI presenter"
                    : "Please confirm creative treatment"}
                  action={
                    <Button
                      onClick={handleConfirmPlan}
                      disabled={!isPlanReady || isGenerating || verifyingSources}
                      size="sm"
                      className={cn(
                        "h-9.5 px-5 rounded-control text-body-lg font-bold shadow-sm transition-all duration-200 shrink-0",
                        isPlanReady && !isGenerating
                          ? "bg-brand hover:bg-brand-deep text-white hover:-translate-y-0.5 cursor-pointer"
                          : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                      )}
                    >
                      <span>Confirm Plan &amp; Build Script</span>
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  }
                />
              </>
            )}
          </section>
      }
      panel={
        <>
          {/* Chat Top Online Banner */}
          <div className="p-3.5 border-b border-hair bg-card shrink-0">
            <div className="rounded-control border border-brand/20 bg-tint p-2.5">
              <div className="flex items-center gap-2 text-label font-bold text-brand-deep">
                <LogoMark size={14} className="text-brand" />
                <span>Direct with SwishX</span>
                <span className="ml-auto rounded-chip bg-ok/15 text-ok px-2 py-0.5 text-micro font-bold">
                  {isGenerating ? "Synthesizing..." : "Online"}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-2.5 max-w-full",
                  msg.role === "user" ? "ml-auto justify-end" : "mr-auto"
                )}
              >
                {msg.role === "swishx" && (
                  <div className="size-7 rounded-full bg-brand text-white grid place-items-center font-bold text-caption shrink-0 mt-0.5 shadow-2xs">
                    SX
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-panel px-3.5 py-2.5 text-body-lg leading-relaxed shadow-2xs max-w-[85%]",
                    msg.role === "user"
                      ? "bg-brand text-white font-medium"
                      : "bg-card border border-hair text-ink"
                  )}
                >
                  <FormattedMessageText text={msg.text} />
                  {/* Under the plan, and only once there is one. Pinned to
                      message 1 they sat under an intake question and offered
                      changes to a plan that had not been drawn yet; pinned to
                      the last message they are always under the thing that
                      announced it. */}
                  {msg.role === "swishx" &&
                    index === chatMessages.length - 1 &&
                    !isGenerating &&
                    planPhase === "plan" && (
                    <div className="mt-2.5 pt-2 border-t border-hair flex flex-wrap gap-1.5">
                      {[
                        "Switch to 9:16 Portrait",
                        "Elevate MoA in Scene 2",
                        "Add Dr. Maya Presenter",
                        "Shorten to 45 seconds",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSendChatMessage(chip)}
                          className="text-label font-semibold text-brand-deep bg-tint hover:bg-[#ffe5dd] border border-tint-line px-2 py-0.5 rounded-chip transition cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar with Attached Primary Confirmation Bar */}
          <div className="p-3 border-t border-hair bg-card shrink-0 space-y-2">
            {/* Attached Primary Action Bar above chat input. Not while the
                intake is still running: confirming a plan is not on offer
                until there is one. */}
            {planPhase === "plan" && (
            <div className="rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2 shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("size-6 rounded-full grid place-items-center shrink-0", isPlanReady ? "bg-ok text-white" : "bg-black/10 text-ink-3")}>
                  {isPlanReady ? <Check className="size-3.5 stroke-[3]" /> : <LogoMark size={12} className="text-brand" />}
                </div>
                <div className="min-w-0">
                  <div className="text-label font-bold text-ink truncate">
                    {isPlanReady ? "Ready to generate script" : "Review plan parameters"}
                  </div>
                  <div className="text-micro text-ink-3 truncate">
                    {isPlanReady ? "Grounded against 214 approved claims" : "Confirm creative & assets"}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleConfirmPlan}
                disabled={!isPlanReady || isGenerating}
                size="sm"
                className={cn(
                  "h-7.5 px-3 rounded-chip text-label font-bold shadow-xs transition-all shrink-0 cursor-pointer",
                  isPlanReady && !isGenerating
                    ? "bg-brand hover:bg-brand-deep text-white hover:scale-[1.02]"
                    : "bg-black/10 text-black/40 cursor-not-allowed"
                )}
              >
                <span>Confirm Plan &amp; Build Script</span>
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </div>
            )}

            <div className="relative">
              {/* The files on this message, above the field they were added
                  from — the same chips the brief screen uses, because it is
                  the same gesture. */}
              <ChatAttachmentRow attachments={chatFiles} />
              <div className="flex items-center gap-1.5 rounded-control border border-hair-2 bg-subtle px-2.5 py-1.5 focus-within:border-brand focus-within:bg-card focus-within:shadow-xs transition">
                {/* One thing: attach a file. This was a menu of two canned
                    prompts wearing an attach icon. */}
                <button
                  type="button"
                  onClick={chatFiles.open}
                  className="grid size-6 place-items-center rounded-chip text-ink-3 hover:text-ink hover:bg-black/5 transition cursor-pointer"
                  title="Attach a file"
                  aria-label="Attach a file"
                >
                  <Plus className="size-3.5" />
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChatMessage();
                  }}
                  disabled={isGenerating}
                  placeholder={isGenerating ? "Generating scenes..." : "Ask or request changes..."}
                  className="flex-1 bg-transparent text-body outline-none text-ink placeholder:text-ink-4 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => handleSendChatMessage()}
                  disabled={(!chatInput.trim() && chatFiles.files.length === 0) || isGenerating}
                  className="grid size-6 place-items-center rounded-chip bg-brand text-white disabled:opacity-30 hover:bg-brand-deep transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </>
      }
      overlay={
        <>
          {/* ── Modals & Drawers ── */}
          {pendingMedia.length > 0 && (
            <FileNoteDialog
              files={pendingMedia.map((m) => ({
                id: m.id,
                name: m.name,
                kind: "media" as const,
                previewUrl: m.preview,
                mediaKind: m.type,
              }))}
              title="What is this asset for?"
              prompt="A note and a variant travel with each asset, so it lands in the catalogue as one pack rather than as a file."
              placeholder="e.g. the hero packshot, front of pack, for the opening scene"
              variations={brandVariations(brandName)}
              onCancel={() => setPendingMedia([])}
              onConfirm={(notes, variations) => {
                setProductMediaList((prev) => [
                  ...prev,
                  ...pendingMedia.map((m) => ({
                    ...m,
                    note: notes[m.id].trim(),
                    variation: variations[m.id],
                  })),
                ]);
                setPendingMedia([]);
              }}
            />
          )}

          {pendingReference.length > 0 && (
            <FileNoteDialog
              files={pendingReference.map((r) => ({
                id: r.id,
                name: r.name,
                kind: "media" as const,
                previewUrl: r.previewUrl,
                mediaKind: r.kind,
              }))}
              title="What should we take from this reference?"
              prompt="A reference steers the treatment, pacing, grade, composition. Saying which part matters is what makes it usable."
              placeholder="e.g. the pacing and the grade, match this, not the script"
              onCancel={() => setPendingReference([])}
              onConfirm={(notes) => {
                setReferenceList((prev) => [
                  ...prev,
                  ...pendingReference.map((r) => ({ ...r, note: notes[r.id].trim() })),
                ]);
                setPendingReference([]);
              }}
            />
          )}

          {editingReference && (
            <FileNoteDialog
              files={[{
                id: editingReference.id,
                name: editingReference.name,
                kind: "media",
                note: editingReference.note,
                previewUrl: editingReference.previewUrl,
                mediaKind: editingReference.mediaKind,
              }]}
              title="What should we take from this reference?"
              prompt="The note travels with the reference wherever the treatment uses it."
              placeholder="e.g. the pacing and the grade, match this, not the script"
              onCancel={() => setEditingReference(null)}
              onConfirm={(notes) => {
                const next = notes[editingReference.id].trim();
                setReferenceList((prev) =>
                  prev.map((r) => (r.id === editingReference.id ? { ...r, note: next } : r))
                );
                setEditingReference(null);
              }}
            />
          )}

          {editingMedia && (
            <FileNoteDialog
              files={[{
                id: editingMedia.id,
                name: editingMedia.name,
                kind: "media",
                note: editingMedia.note,
                variation: editingMedia.variation,
                previewUrl: editingMedia.previewUrl,
                mediaKind: editingMedia.mediaKind,
              }]}
              title="What is this asset for?"
              prompt="The note and the variant travel with the asset wherever the plan places it."
              placeholder="e.g. the hero packshot, front of pack, for the opening scene"
              variations={brandVariations(brandName)}
              onCancel={() => setEditingMedia(null)}
              onConfirm={(notes, variations) => {
                const next = notes[editingMedia.id].trim();
                setProductMediaList((prev) =>
                  prev.map((m) =>
                    m.id === editingMedia.id
                      ? { ...m, note: next, variation: variations[editingMedia.id] }
                      : m
                  )
                );
                setEditingMedia(null);
              }}
            />
          )}

          {promptEditorOpen && (
            /* The prompt from the previous screen, editable here. Supplying
               the missing context in words is the alternative to attaching a
               file, and walking back to the brief screen to do it would throw
               away everything already decided on this one. */
            <Portal>
            <div className="fixed inset-0 z-[9999] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Edit prompt">
              <div className="rise-in w-full max-w-[620px] overflow-hidden rounded-card border border-hair-2 bg-card shadow-float">
                <div className="flex items-start justify-between gap-3 border-b border-hair-2 bg-canvas px-6 py-4">
                  <div>
                    <div className="text-caption font-extrabold uppercase tracking-[0.14em] text-brand">Your request</div>
                    <h2 className="mt-0.5 text-display font-[850] tracking-tight text-ink">Edit the prompt</h2>
                    <p className="mt-0.5 text-body text-ink-3">
                      Add what is missing. The plan re-reads against it.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromptEditorOpen(false)}
                    aria-label="Close"
                    className="grid size-8 place-items-center rounded-full text-ink-3 transition-colors hover:bg-black/5 hover:text-ink cursor-pointer"
                  >
                    <X className="size-4.5" />
                  </button>
                </div>

                <div className="p-6">
                  <textarea
                    value={promptDraft}
                    onChange={(e) => setPromptDraft(e.target.value)}
                    rows={7}
                    autoFocus
                    placeholder="Describe the asset, the audience, and the evidence it should rest on..."
                    className="w-full resize-none rounded-control border border-hair-2 bg-canvas p-3.5 text-body-lg leading-relaxed text-ink transition-all focus:border-brand focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand/15"
                  />
                  <p className="mt-2 text-label text-ink-3">
                    {promptDraft.trim().split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-hair bg-canvas px-6 py-4">
                  <Button variant="secondary" size="sm" onClick={() => setPromptEditorOpen(false)} className="px-4 font-bold text-body cursor-pointer">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={savePromptEdit}
                    disabled={!promptDraft.trim()}
                    className="gap-2 px-5 font-bold text-body cursor-pointer disabled:opacity-40"
                  >
                    <span>Save &amp; re-read plan</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            </Portal>
          )}
          {useCaseDrawerOpen && (
            <ScenarioDrawer
              currentScenarioId={demoScenarioId}
              assetType={assetType}
              title="Use cases"
              onSelect={loadUseCase}
              onReset={() => {
                const fallback = demoScenarios.find((s) => s.id === defaultDemoScenarioId) ?? demoScenarios[0];
                loadUseCase(fallback);
              }}
              onClose={() => setUseCaseDrawerOpen(false)}
            />
          )}
          {presenterLibraryOpen && (
            <PresenterLibrary
              selected={presenter}
              onSelect={(name) => {
                setPresenter(name);
                setPresenterLibraryOpen(false);
              }}
              onClose={() => setPresenterLibraryOpen(false)}
            />
          )}
          {voiceLibraryOpen && (
            <VoiceLibrary
              selected={voice}
              onSelect={(name) => {
                setVoice(name);
                setVoiceLibraryOpen(false);
              }}
              onClose={() => setVoiceLibraryOpen(false)}
              previewing={previewingAudio}
              onPreview={(name) => previewAudio("voice", name)}
            />
          )}
          {sourceManagerOpen && (
            <SourceManager
              selectedIds={selectedSourceIds}
              onToggle={toggleSource}
              onClose={() => setSourceManagerOpen(false)}
            />
          )}
          {previewDossier && (
            <DossierReaderModal
              dossier={previewDossier}
              onClose={() => setPreviewDossier(null)}
            />
          )}
        </>
      }
    />
  );
}

/** The shared shell, under the name this file has always called it. */
const PlanSection = PlanSectionShell;

function DecisionRow({
  label,
  value,
  icon,
  editing,
  onEdit,
  onPreview,
  playing = false,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  editing: boolean;
  onEdit: () => void;
  onPreview?: () => void;
  playing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "squircle-panel overflow-hidden border transition-[opacity,border-color,box-shadow,background-color] duration-300 ease-entrance rounded-control",
        editing
          ? "border-hair-3 bg-[#fbfdfc] opacity-100 shadow-soft"
          : "border-hair bg-card opacity-75 hover:opacity-100"
      )}
    >
      <div className="flex min-h-[58px] items-center gap-3 px-3.5">
        <span className="squircle-control grid size-8 shrink-0 place-items-center rounded-chip bg-[#edf3ef] text-brand">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-label font-medium text-ink-3">{label}</span>
          <span className="mt-0.5 block truncate text-body-lg font-medium">{value}</span>
        </span>
        <div className="flex items-center gap-1.5">
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreview}
              className={cn("size-8 p-0 rounded-full", playing && "text-brand")}
              aria-label="Preview sound"
            >
              {playing ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-body font-semibold text-brand"
          >
            {editing ? "Close" : "Change"}
          </Button>
        </div>
      </div>
      {editing && <div className="border-t border-hair bg-card p-3.5">{children}</div>}
    </div>
  );
}

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
  icon,
  className,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  icon: (value: string) => React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-body-lg font-semibold text-ink-3">{label}</div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "focus-ring flex min-h-[50px] items-center gap-2.5 rounded-control border p-2.5 text-left text-body-lg font-medium transition cursor-pointer",
                active ? "border-hair-3 bg-subtle text-brand font-semibold shadow-2xs" : "border-hair-2 hover:border-hair-3"
              )}
            >
              <span className="grid size-6 place-items-center text-current">{icon(option)}</span>
              <span className="flex-1">{option}</span>
              {active && <Check className="size-3.5 text-brand shrink-0" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiChoiceGroup({
  label,
  values,
  options,
  onChange,
  onDone,
  icon,
}: {
  label: string;
  values: string[];
  options: readonly string[];
  onChange: (values: string[]) => void;
  onDone: () => void;
  icon: (value: string) => React.ReactNode;
}) {
  return (
    <div>
      <div className="text-body-lg font-semibold text-ink-3">{label}</div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                const next = active ? values.filter((v) => v !== option) : [...values, option];
                onChange(next);
              }}
              className={cn(
                "focus-ring flex min-h-[50px] items-center gap-2.5 rounded-control border p-2.5 text-left text-body-lg font-medium transition cursor-pointer",
                active ? "border-hair-3 bg-subtle text-brand font-semibold shadow-2xs" : "border-hair-2 hover:border-hair-3"
              )}
            >
              <span className="grid size-6 place-items-center text-current">{icon(option)}</span>
              <span className="flex-1">{option}</span>
              {active && <Check className="size-3.5 text-brand shrink-0" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

function FormatChoices({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-body-lg font-semibold text-ink-3">{label}</div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "focus-ring flex flex-col items-center justify-center gap-1.5 rounded-control border py-3 px-2 text-center text-body-lg font-medium transition cursor-pointer",
                active ? "border-hair-3 bg-subtle text-brand font-bold shadow-2xs" : "border-hair-2 hover:border-hair-3"
              )}
            >
              <FrameGlyph value={option} />
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FrameGlyph({ value }: { value: string }) {
  if (value.includes("9:16") || value.includes("Vertical")) return <span className="inline-block h-5 w-3 rounded-[2px] border-2 border-current" />;
  if (value.includes("1:1") || value.includes("Square")) return <span className="inline-block size-4 rounded-[2px] border-2 border-current" />;
  return <span className="inline-block h-3.5 w-5 rounded-[2px] border-2 border-current" />;
}

function SteppedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-body-lg font-semibold text-ink-3">{label}</div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "focus-ring min-h-10 rounded-chip border px-2 text-body font-medium transition cursor-pointer",
                active ? "border-hair-3 bg-subtle text-brand font-bold" : "border-hair-2 hover:border-hair-3"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AudioChoices({
  label,
  value,
  options,
  onChange,
  previewing,
  onPreview,
  onOpenLibrary,
  music = false,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  previewing?: string | null;
  onPreview?: (option: string) => void;
  onOpenLibrary?: () => void;
  music?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-body-lg font-semibold text-ink-3">{label}</span>
        {onOpenLibrary && (
          <button
            type="button"
            onClick={onOpenLibrary}
            className="text-body font-bold text-brand hover:underline cursor-pointer"
          >
            Voice Library →
          </button>
        )}
      </div>
      <div className="mt-2.5 space-y-2">
        {options.map((option) => {
          const base = option.split("·")[0].trim();
          const active = value === option || value === base;
          const isPlaying = previewing === option || previewing === base;
          return (
            <div
              key={option}
              className={cn(
                "flex items-center justify-between rounded-control border p-2.5 transition",
                active ? "border-hair-3 bg-subtle" : "border-hair-2"
              )}
            >
              <button
                type="button"
                onClick={() => onChange(base)}
                className="flex-1 text-left text-body-lg font-medium text-ink cursor-pointer"
              >
                {option}
              </button>
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(base)}
                  className={cn("size-8 p-0 rounded-full", isPlaying && "text-brand")}
                  aria-label="Preview"
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StructureChoices({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "focus-ring flex flex-col justify-between rounded-control border p-3.5 text-left transition cursor-pointer",
              active ? "border-hair-3 bg-subtle text-brand font-semibold shadow-2xs" : "border-hair-2 hover:border-hair-3"
            )}
          >
            <div>
              <span className="block text-body-lg font-bold text-ink">{option}</span>
              <span className="mt-1 block text-body text-ink-3">{structureDescription(option)}</span>
            </div>
            {active && <Check className="mt-3 size-4 text-brand self-end" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof Film; title: string; body: string }) {
  return (
    <div className="rounded-control border border-hair-2 bg-card p-3.5">
      <div className="flex items-center gap-2 font-bold text-body-lg text-ink">
        <Icon className="size-4 text-brand" />
        {title}
      </div>
      <p className="mt-1 text-body leading-5 text-ink-3">{body}</p>
    </div>
  );
}

function structureDescription(option: string) {
  if (option.includes("Proof")) return "Lead with the clinical need, then prove the efficacy.";
  if (option.includes("Solution")) return "Establish problem states, then introduce product value.";
  if (option.includes("Evidence")) return "Focus on dual inhibition pathway and clinical study outcomes.";
  return "Organized around clear narrative chapters.";
}

function FacePhoto({ person, className }: { person: (typeof presenters)[number]; className: string }) {
  return <img src={person.image} alt={person.name} className={cn("object-cover", className)} />;
}

function PresenterLibrary({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}) {
  return (
    <Portal>
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[680px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-hair p-5 sm:px-6">
          <div>
            <div className="text-label font-bold uppercase tracking-[0.12em] text-brand">Presenter Library</div>
            <h2 className="mt-1 text-display font-bold tracking-tight">Choose clinical avatar presenter</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="max-h-[460px] overflow-y-auto grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
          {presenters.map((person) => {
            const active = selected === person.name;
            return (
              <button
                key={person.name}
                type="button"
                onClick={() => onSelect(person.name)}
                className={cn(
                  "flex items-center gap-3 rounded-panel border p-3 text-left transition hover:-translate-y-px hover:shadow-sm cursor-pointer",
                  active ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 hover:border-hair-3"
                )}
              >
                <FacePhoto person={person} className="size-14 rounded-control" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-lg font-bold text-ink">{person.name}</span>
                  <span className="mt-0.5 block text-body leading-4 text-ink-3">{person.role}</span>
                </span>
                {active && <Check className="size-4 text-brand shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </Portal>
  );
}

function VoiceLibrary({
  selected,
  onSelect,
  onClose,
  previewing,
  onPreview,
}: {
  selected: string;
  onSelect: (name: string) => void;
  onClose: () => void;
  previewing?: string | null;
  onPreview: (name: string) => void;
}) {
  return (
    <Portal>
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[620px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-hair p-5 sm:px-6">
          <div>
            <div className="text-label font-bold uppercase tracking-[0.12em] text-brand">Voice Library</div>
            <h2 className="mt-1 text-display font-bold tracking-tight">Select narrator voice</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="max-h-[460px] overflow-y-auto space-y-2 p-4 sm:p-6">
          {voiceList.map((v) => {
            const active = selected.includes(v.name);
            const isPlaying = previewing === v.name;
            return (
              <div
                key={v.name}
                className={cn(
                  "flex items-center justify-between rounded-control border p-3 transition",
                  active ? "border-brand bg-tint" : "border-hair-2"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-body-lg text-ink">{v.name}</span>
                    <span className="rounded-chip bg-card px-2 py-0.5 text-caption font-bold text-brand-deep border border-tint-line">
                      {v.tag}
                    </span>
                  </div>
                  <span className="text-body text-ink-3 block mt-0.5">{v.accent} · {v.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onPreview(v.name)}>
                    {isPlaying ? <Pause className="size-4 text-brand" /> : <Play className="size-4" />}
                  </Button>
                  <Button size="sm" variant={active ? "primary" : "secondary"} onClick={() => onSelect(v.name)}>
                    {active ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </Portal>
  );
}

function SourceManager({
  selectedIds,
  onToggle,
  onClose,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Portal>
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[700px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-hair p-5 sm:px-6">
          <div>
            <div className="text-label font-bold uppercase tracking-[0.12em] text-brand">Regulatory Sources</div>
            <h2 className="mt-1 text-display font-bold tracking-tight">Verified evidence citations</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="max-h-[430px] space-y-2 overflow-y-auto p-4 sm:p-6">
          {planningSources.map((source) => {
            const active = selectedIds.includes(source.id);
            return (
              <div
                key={source.id}
                className={cn(
                  "flex items-center gap-3 rounded-control border p-3 transition",
                  active ? "border-brand bg-tint" : "border-hair-2"
                )}
              >
                <FileCheck2 className="size-5 text-brand shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-body-lg font-bold text-ink">{source.name}</span>
                  <span className="block truncate text-body text-ink-3">{source.detail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(source.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-chip text-body font-bold transition cursor-pointer",
                    active ? "bg-card text-ink border border-hair-2" : "bg-brand text-white"
                  )}
                >
                  {active ? "Attached" : "Attach"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </Portal>
  );
}

function structureForTreatment(assetType: AssetType, treatmentId: string) {
  if (assetType === "video") {
    if (treatmentId === "presenter") return "Presenter introduction · Mechanism · Study outcomes · Practice summary";
    if (treatmentId === "visual-only") return "Message statement · Mechanism graphic · Result callout · Required safety";
    return "The unresolved need · Product introduction · How it works · Pivotal evidence · Close and fair balance";
  }
  return "Cover · Clinical need · Product introduction · Mechanism · Pivotal evidence · Close";
}

function stopAudioPreview() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function playMusicTone(label: string) {
  if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = label.includes("Warm") ? "triangle" : "sine";
    osc.frequency.setValueAtTime(label.includes("Warm") ? 330 : 260, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.9);
  } catch {
    // Ignore audio autoplay restrictions
  }
}
