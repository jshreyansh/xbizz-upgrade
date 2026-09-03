"use client";

import {
  AlertCircle,
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
  Globe2,
  History,
  Info,
  Layers,
  LayoutList,
  Mic2,
  MoreHorizontal,
  Music2,
  MonitorPlay,
  PackageCheck,
  PanelRight,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  Plus,
  Redo2,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Undo2,
  Users,
  Volume2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { AudienceIcon, ChannelIcon } from "@/components/ui/select-icons";
import { deriveContentPlan } from "@/features/workspace/content-plan";
import { displayIntendedUses, parseIntendedUses, serializeIntendedUses } from "@/features/workspace/intended-use";
import { planningSources } from "@/features/workspace/mock-data";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { InfographicDirectionsScreen } from "@/features/workspace/infographic-directions-screen";
import { DOSSIERS, INITIAL_BRANDS } from "@/features/workspace/brand-dossier-modal";
import { DossierPreviewModal, type DossierPreviewData } from "@/features/workspace/dossier-preview-modal";
import { ResearchSourcesContent } from "@/features/workspace/research-sources-section";
import { cn } from "@/lib/cn";
import type { AssetType, Audience, PresentationMode } from "@/types/content";

type PlanSectionId = "sources" | "treatment" | "message" | "delivery" | "voice" | "story" | "product-assets";

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

function FormattedMessageText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
}

export function DirectionsScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const assetType = useWorkspaceStore((state) => state.assetType);

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
    setCopilotPanelOpen,
    toggleCopilotPanel,
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

  const dossierNames: Record<string, string> = {
    velmora: "Velmora",
    onkavia: "Onkavia",
    nirvexa: "Nirvexa",
    cardioxa: "Cardioxa",
    pulmovax: "PulmoVax",
  };

  const brandName = dossierNames[sourcePayload.dossierId || "velmora"] || "Velmora";
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
    Array<{ id: string; name: string; type: "image" | "video"; preview: string; size: string }>
  >([]);

  const isProductFocus =
    selectedTopics.some((t) => t.toLowerCase().includes("product") || t.toLowerCase().includes("launch")) ||
    goal.toLowerCase().includes("launch") ||
    goal.toLowerCase().includes("product") ||
    brief.toLowerCase().includes("product") ||
    brief.toLowerCase().includes("pen") ||
    brief.toLowerCase().includes("autoinjector");

  const [openSection, setOpenSection] = useState<PlanSectionId | null>("sources");
  const [sourceGroundingMode, setSourceGroundingMode] = useState<"both" | "my-sources" | "swishx-only">("both");
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; size: string; date: string }>>([
    { name: `${brandName || "Brand"}_Clinical_Study_Report_Phase3.pdf`, size: "4.2 MB", date: "Today" },
    { name: `${brandName || "Brand"}_Core_Visual_Aid_Brief.docx`, size: "840 KB", date: "Today" },
  ]);
  const [previewDossier, setPreviewDossier] = useState<DossierPreviewData | null>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);
  const [editingDecision, setEditingDecision] = useState<string | null>(null);
  const [previewingAudio, setPreviewingAudio] = useState<string | null>(null);
  const [presenterLibraryOpen, setPresenterLibraryOpen] = useState(false);
  const [voiceLibraryOpen, setVoiceLibraryOpen] = useState(false);
  const [sourceManagerOpen, setSourceManagerOpen] = useState(false);

  const approvedEvidenceCount = selectedSourceIds.filter((id) => id !== "dermora-reference").length;
  const needsPresenter = presentationMode === "presenter" || treatmentId === "presenter" || creationMode === "magic-avatar";
  const needsProductAssets = isProductFocus && productMediaList.length === 0;

  const unresolvedCount =
    (confirmedTreatment ? 0 : 1) +
    (needsPresenter && !presenter ? 1 : 0) +
    (needsProductAssets ? 1 : 0) +
    (derivedPlan.sourceConflict && !sourceConflictResolved ? 1 : 0);

  const isPlanReady = unresolvedCount === 0;
  const selectedTreatment = profile.treatments.find((item) => item.id === treatmentId) ?? profile.treatments[0];

  // ── Generation Loading State on Left Panel ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // ── Chat Input in Right Panel ──
  const [chatInput, setChatInput] = useState("");
  const [chatContextOpen, setChatContextOpen] = useState(false);

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

  const selectTreatment = (id: string) => {
    setTreatmentId(id);
    if (assetType === "video") setPresentationMode(id as PresentationMode);
    if (id !== "presenter") setPresenter("");
    if (!derivedPlan.followsSuppliedScript) setStoryStructure(structureForTreatment(assetType, id));
    setConfirmedTreatment(true);
    setOpenSection(id === "presenter" ? "voice" : null);
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
    setIsGenerating(true);
    setGenerationStep(1);

    addChatMessage({
      role: "user",
      text: "Confirm plan & build script",
    });

    addChatMessage({
      role: "swishx",
      text: `Confirmed plan parameters for **${brandName}**. Structuring 5-scene clinical script and grounding against FDA approved claims...`,
    });

    setTimeout(() => {
      setGenerationStep(2);
    }, 600);

    setTimeout(() => {
      setGenerationStep(3);
    }, 1200);

    setTimeout(() => {
      addChatMessage({
        role: "swishx",
        text: `Script & storyboard scenes generated for **${brandName}**! You can review or edit script narration in-place on the left canvas, or chat with me to make adjustments.`,
      });
      setVideoSubStage("studio");
      setView("studio");
    }, 1800);
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInput.trim();
    if (!text) return;

    addChatMessage({ role: "user", text });
    if (!textToSend) setChatInput("");

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
    <div className="min-h-screen flex flex-col bg-[#edf0ed] h-screen overflow-hidden">
      {/* ─── Top Studio-Matched Header Bar (Same as Scenes & Editor) ─── */}
      <header className="z-30 flex h-[60px] shrink-0 items-center border-b border-hair bg-white px-3 sm:px-5">
        <button
          onClick={handleBackToBrief}
          className="focus-ring mr-2 grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-black/5 cursor-pointer"
          aria-label="Back to brief"
        >
          <ArrowLeft className="size-4" />
        </button>
        <SwishXMark compact />
        <div className="mx-3 h-5 w-px bg-hair" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-[800] text-ink">{projectName}</span>
            <span className="hidden rounded-full bg-[#edf1ee] px-2 py-0.5 text-micro font-bold text-[#69736e] sm:inline">
              Draft v1
            </span>
          </div>
          <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
            Saved just now · {presenter || "Maya Kapoor"}
          </div>
        </div>

        {/* State Switcher in Header */}
        <div className="ml-6 hidden items-center gap-1 sm:flex">
          <span className="rounded-full bg-tint px-2.5 py-0.5 text-caption font-extrabold tracking-wide text-brand-deep border border-tint-line">
            Plan View
          </span>
        </div>

        <div className="ml-4 hidden items-center gap-0.5 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Redo" disabled>
            <Redo2 className="size-4" />
          </Button>
          <div className="mx-1 h-5 w-px bg-hair" />
          <Button variant="ghost" size="sm">
            <History className="size-3.5" /> Versions
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Toggle Right Sidebar Panel Button (Icon Only) */}
          <button
            type="button"
            onClick={toggleCopilotPanel}
            className={cn(
              "grid size-8 place-items-center rounded-lg border transition-colors cursor-pointer",
              copilotPanelOpen
                ? "border-black/15 bg-black/5 text-ink hover:bg-black/10"
                : "border-black/10 bg-white text-ink-3 hover:text-ink hover:border-brand shadow-2xs"
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
      </header>

      {/* ── Main Split View: Left (Plan Canvas), Right (Chat Assistant) ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* ── LEFT PANEL (Plan Canvas OR Loader) ── */}
        <section
          style={{
            width: copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            minWidth: copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            maxWidth: copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="flex flex-col shrink-0 min-h-0 border-r border-hair bg-[#eef1ed] overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4"
        >
          {isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 my-auto">
              <div className="size-20 rounded-3xl bg-tint border border-tint-line flex items-center justify-center mb-6 shadow-sm">
                <Sparkles className="size-10 text-brand animate-pulse" />
              </div>
              <h3 className="text-display font-extrabold text-ink tracking-tight">
                Generating Clinical Script &amp; Storyboard...
              </h3>
              <p className="text-body-lg text-ink-3 mt-1.5 max-w-[440px]">
                Structuring clinical narrative, scene-by-scene script narration, and visual grounding against 214 approved claims.
              </p>

              <div className="mt-8 w-full max-w-[360px] space-y-2.5 text-left text-body">
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", generationStep >= 1 ? "bg-white border-black/10 text-ink shadow-2xs" : "opacity-40")}>
                  <Check className={cn("size-4.5 shrink-0", generationStep >= 1 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Parsed campaign brief &amp; focus topics</span>
                </div>
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", generationStep >= 2 ? "bg-white border-black/10 text-ink shadow-2xs" : "opacity-40")}>
                  <Check className={cn("size-4.5 shrink-0", generationStep >= 2 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Synthesized 5-scene clinical narrative &amp; script</span>
                </div>
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", generationStep >= 3 ? "bg-white border-black/10 text-ink shadow-2xs" : "opacity-40")}>
                  <Check className={cn("size-4.5 shrink-0", generationStep >= 3 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Linking citations to FDA label §5.1</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header in Left Canvas */}
              <div className="flex items-center justify-between pb-2 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-label font-bold uppercase tracking-[0.12em] text-brand">
                      Available Context
                    </span>
                    <span className="rounded-full bg-ok-bg px-2 py-0.5 text-caption font-bold text-ok border border-emerald-200">
                      Grounding active
                    </span>
                  </div>
                  <h2 className="text-display font-[850] text-ink tracking-tight mt-0.5">
                    {brandName} Dossier Plan &amp; Storyboard Parameters
                  </h2>
                  <p className="text-body text-ink-3 mt-0.5">
                    Refine the creative treatment, audience focus, and evidence cues before confirming scenes.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-label font-bold text-ok border border-hair shadow-2xs">
                    ✓ 214 approved claims cited
                  </span>
                </div>
              </div>

              {/* ─── Rich Accordion Sections with Dynamic Focus Enlargement & Dimming ─── */}
              <div className="space-y-3 min-w-0 w-full">
                {/* 1. Research & Sources (Unified Top Starting Tile) */}
                <PlanSection
                  icon={ShieldCheck}
                  title="Research and Sources"
                  summary={
                    sourceGroundingMode === "both"
                      ? `${brandName} SmPC Dossier + ${uploadedDocs.length} custom files active`
                      : sourceGroundingMode === "my-sources"
                      ? `${uploadedDocs.length} custom files active · Dossier ignored`
                      : `${brandName} SmPC Approved Dossier · 214 claims`
                  }
                  status="From source"
                  open={openSection === "sources"}
                  onToggle={() => toggleSection("sources")}
                  tone="done"
                >
                  <ResearchSourcesContent
                    brandName={brandName || "Velmora"}
                    sourceGroundingMode={sourceGroundingMode}
                    onSetSourceGroundingMode={setSourceGroundingMode}
                    uploadedDocs={uploadedDocs}
                    onSetUploadedDocs={setUploadedDocs}
                    onPreviewDossier={(d) => setPreviewDossier(d)}
                    onContinue={() => toggleSection(isMagicAvatar ? "voice" : "treatment")}
                  />
                </PlanSection>

                {/* 2. Creative Treatment (in regular mode) OR Presenter & Voice (in Magic Avatar mode) */}
                {isMagicAvatar ? (
                  <PlanSection
                    icon={Mic2}
                    title="Presenter, voice and sound"
                    summary={`${presenter || "Dr. Maya Kapoor"} · ${language} · ${music}`}
                    status={presenter ? "Confirmed" : "Needs you"}
                    open={openSection === "voice"}
                    onToggle={() => toggleSection("voice")}
                    tone={presenter ? "done" : "attention"}
                  >
                    <div className="mb-4">
                      <div className="text-body-lg font-semibold text-[#5f6b65] mb-2.5">
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
                                ? "border-brand bg-tint ring-2 ring-brand text-brand-deep shadow-xs"
                                : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
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
                          className="focus-ring flex min-h-[64px] items-center gap-2.5 rounded-control border border-[#e3e8e5] bg-white p-3 text-left text-body-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cbd6d0] hover:bg-[#fafbf9] cursor-pointer"
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
                          setOpenSection(isProductFocus ? "product-assets" : "message");
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
                    status={confirmedTreatment ? "Confirmed" : "Needs you"}
                    open={openSection === "treatment"}
                    onToggle={() => toggleSection("treatment")}
                    tone={confirmedTreatment ? "done" : "attention"}
                  >
                    <div className="squircle rounded-panel bg-[#f5f8f6] px-4 py-3.5">
                      <div className="text-body-lg font-semibold text-brand">Why this fits</div>
                      <p className="mt-1 text-body-lg leading-5 text-[#5f6b65]">{profile.rationale}</p>
                    </div>
                    <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
                      {profile.treatments.map((item, index) => {
                        const selected = treatmentId === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => selectTreatment(item.id)}
                            className={cn(
                              "focus-ring flex flex-col justify-between rounded-[16px] border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer",
                              selected
                                ? "border-brand bg-tint ring-2 ring-brand shadow-xs"
                                : "border-[#e4e9e6] bg-white opacity-85 hover:opacity-100 hover:border-[#ccd7d1]"
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
                                      : "border-[#d6ddd9] bg-white"
                                  )}
                                >
                                  {selected && <Check className="size-3" strokeWidth={3.5} />}
                                </span>
                              </div>
                              {index === 0 && (
                                <span className="inline-block mb-2 rounded-full bg-white px-2 py-0.5 text-caption font-bold text-brand-deep border border-tint-line shadow-2xs">
                                  Recommended
                                </span>
                              )}
                              <p className="text-body leading-relaxed text-ink-3">
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {!confirmedTreatment && (
                      <Button
                        onClick={() => {
                          setConfirmedTreatment(true);
                          setOpenSection(isProductFocus ? "product-assets" : null);
                        }}
                        className="mt-3 bg-brand text-white"
                      >
                        Use recommendation <ArrowRight className="size-4" />
                      </Button>
                    )}
                  </PlanSection>
                )}

                {/* 2. Elevated Product Packshot & Visual Assets */}
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
                  status={
                    isProductFocus
                      ? productMediaList.length > 0
                        ? "Attached"
                        : "Needs Assets"
                      : "Optional"
                  }
                  open={openSection === "product-assets"}
                  onToggle={() => toggleSection("product-assets")}
                  tone={productMediaList.length > 0 ? "done" : isProductFocus ? "attention" : "default"}
                >
                  <div className="space-y-3.5">
                    <div className="rounded-control bg-[#fafbf9] border border-hair p-3.5 text-body text-ink-2 leading-relaxed">
                      <p className="font-bold text-ink mb-1">
                        📸 Product Packshots &amp; Device Reference Media
                      </p>
                      <p className="text-ink-3 text-body">
                        Add multiple photos or videos of your drug packaging, delivery pen, or MoA visual clips. These will be visually grounded in 3D across product scenes.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {productMediaList.map((media) => (
                        <div
                          key={media.id}
                          className="group relative rounded-xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col"
                        >
                          <div className="relative aspect-video w-full bg-[#1a4435] overflow-hidden flex items-center justify-center">
                            <img
                              src={media.preview}
                              alt={media.name}
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-micro font-bold text-white uppercase backdrop-blur-xs">
                              {media.type}
                            </span>
                            <button
                              type="button"
                              onClick={() => setProductMediaList((prev) => prev.filter((m) => m.id !== media.id))}
                              className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-rose-600 transition cursor-pointer backdrop-blur-xs"
                              title="Remove media"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>

                          <div className="p-2.5">
                            <span className="block truncate text-body font-bold text-ink">
                              {media.name}
                            </span>
                            <span className="text-caption text-ink-3 block mt-0.5 font-medium">
                              {media.size} · Uploaded
                            </span>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const sampleItem = {
                            id: `media-${Date.now()}`,
                            name: "Velmora_Autoinjector_3D_Packshot.png",
                            type: "image" as const,
                            preview: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                            size: "4.2 MB",
                          };
                          setProductMediaList((prev) => [...prev, sampleItem]);
                        }}
                        className="flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/40 bg-white p-4 text-center hover:bg-tint hover:border-brand transition cursor-pointer"
                      >
                        <div className="grid size-8 place-items-center rounded-full bg-tint text-brand">
                          <Plus className="size-4" />
                        </div>
                        <div>
                          <span className="block text-body font-bold text-brand">
                            {productMediaList.length === 0 ? "Upload Product Photos / Videos" : "Add More Product Media"}
                          </span>
                          <span className="text-caption text-ink-3 mt-0.5 block">
                            PNG, JPG, MP4 · Click to attach asset
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (productMediaList.length === 0) {
                            setProductMediaList([
                              {
                                id: `media-${Date.now()}`,
                                name: "Velmora_Autoinjector_3D_Packshot.png",
                                type: "image",
                                preview: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                                size: "4.2 MB",
                              },
                            ]);
                          }
                          setOpenSection("message");
                        }}
                        className="bg-brand hover:bg-brand-deep text-white font-bold cursor-pointer"
                      >
                        Save Product Assets &amp; Next <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </PlanSection>

                {/* 3. Message and Audience */}
                <PlanSection
                  icon={Target}
                  title="Message and audience"
                  summary={`${audience} · ${goal} · ${selectedTopics.length} topics`}
                  status="From brief"
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
                      <div className="text-body-lg font-semibold text-[#5f6b65]">Include only what matters</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {topics.map((topic) => (
                          <button
                            key={topic}
                            onClick={() => toggleTopic(topic)}
                            aria-pressed={selectedTopics.includes(topic)}
                            className={cn(
                              "focus-ring min-h-10 rounded-[12px] border px-3 text-body-lg font-medium transition cursor-pointer",
                              selectedTopics.includes(topic)
                                ? "border-[#b8ccc2] bg-[#f2f7f4] text-brand"
                                : "border-[#e3e8e5] hover:border-[#cbd6d0]"
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
                </PlanSection>

                {/* 4. Delivery & Cost */}
                <PlanSection
                  icon={MonitorPlay}
                  title="Delivery & Cost"
                  summary={`${displayIntendedUses(intendedUse)} · ${effectiveFormat} · ${duration} · ${selectedQuality === "cinematic" ? "Cinematic" : "HD"} (⚡ ${estimatedCredits.toLocaleString()} credits)`}
                  status={`${estimatedCredits.toLocaleString()} credits`}
                  tone="done"
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
                    <div className="pt-2 border-t border-black/[0.06]">
                      <label className="text-body font-bold text-ink block mb-2">
                        Generation Output Quality
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option 1: HD */}
                        <button
                          type="button"
                          onClick={() => setSelectedQuality("hd")}
                          className={cn(
                            "group relative rounded-[16px] border p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between",
                            selectedQuality === "hd"
                              ? "border-brand bg-tint ring-2 ring-brand shadow-xs"
                              : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-extrabold text-subhead text-ink">HD Motion</span>
                              <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-caption font-extrabold text-amber-800">
                                ⚡ {Math.round((durationSeconds / 60) * 2500).toLocaleString()} credits
                              </span>
                            </div>
                            <p className="text-body leading-relaxed text-ink-3">
                              Lifelike motion that stops the scroll — ideal for launches &amp; HCP presentations.
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/[0.05] text-label text-ink-3">
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
                            "group relative rounded-[16px] border p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between",
                            selectedQuality === "cinematic"
                              ? "border-brand bg-tint ring-2 ring-brand shadow-xs"
                              : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-extrabold text-subhead text-ink">Cinematic 4K</span>
                              <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-caption font-extrabold text-orange-800">
                                ⚡ {Math.round((durationSeconds / 60) * 7500).toLocaleString()} credits
                              </span>
                            </div>
                            <p className="text-body leading-relaxed text-ink-3">
                              Ultra-realistic, fully generated 3D anatomical scenes — for flagship congresses.
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/[0.05] text-label text-ink-3">
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
                    <div className="rounded-[16px] bg-[#121614] border border-white/10 p-4 text-white shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-lg bg-brand/20 border border-brand/40 flex items-center justify-center">
                            <Sparkles className="size-3.5 text-brand" />
                          </div>
                          <div>
                            <div className="text-label font-extrabold uppercase tracking-wider text-white/60">Estimated Project Cost</div>
                            <div className="text-subhead font-[850] text-white">⚡ {estimatedCredits.toLocaleString()} Credits</div>
                          </div>
                        </div>
                        <div className="text-right sm:text-right text-label text-white/70">
                          <span>Team Balance: </span>
                          <strong className="text-emerald-400 font-bold">50,000 credits</strong>
                        </div>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-label text-white/75">
                        <span>Format: <strong className="text-white font-semibold">{effectiveFormat}</strong> ({duration})</span>
                        <span>Quality: <strong className="text-white font-semibold">{selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"}</strong></span>
                        <span>Estimated Render: <strong className="text-white font-semibold">~{estimatedRenderTime}</strong></span>
                      </div>
                    </div>
                  </div>
                </PlanSection>

                {/* 5. Presenter, Voice and Sound (for standard video mode) */}
                {!isMagicAvatar && assetType === "video" && treatmentId !== "visual-only" && (
                  <PlanSection
                    icon={Mic2}
                    title={needsPresenter ? "Presenter, voice and sound" : "Voice and sound"}
                    summary={
                      needsPresenter
                        ? `${presenter || "Choose presenter"} · ${language} · ${music}`
                        : `${voice} · ${language} · ${music}`
                    }
                    status={needsPresenter && !presenter ? "Needs you" : "Recommended"}
                    open={openSection === "voice"}
                    onToggle={() => toggleSection("voice")}
                    tone={needsPresenter && !presenter ? "attention" : "default"}
                  >
                    {needsPresenter && (
                      <div className="mb-4">
                        <div className="text-body-lg font-semibold text-[#5f6b65] mb-2.5">
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
                                  ? "border-brand bg-tint ring-2 ring-brand text-brand-deep shadow-xs"
                                  : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
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
                            className="focus-ring flex min-h-[64px] items-center gap-2.5 rounded-control border border-[#e3e8e5] bg-white p-3 text-left text-body-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cbd6d0] hover:bg-[#fafbf9] cursor-pointer"
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
                  </PlanSection>
                )}



                {/* 7. Story Structure */}
                <PlanSection
                  icon={LayoutList}
                  title="Story structure"
                  summary={`${storyStructure} · ${profile.units.length} ${assetType === "video" ? "scenes" : "sections"}`}
                  status={derivedPlan.followsSuppliedScript ? "From script" : "Recommended"}
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
                </PlanSection>
              </div>

              {/* Centered Floating Confirmation CTA at the bottom of the Left Stage */}
              <div className="sticky bottom-4 z-30 flex justify-center shrink-0 mt-auto pointer-events-none w-full pt-6 pb-2">
                <div className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-5 py-2.5 rounded-full bg-[#111613] border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.32)] backdrop-blur-md max-w-[580px] w-auto">
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    {isPlanReady ? (
                      <CheckCircle2 className="size-4.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="size-4.5 text-amber-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-body font-bold text-white tracking-tight truncate">
                        {isPlanReady ? "Ready to generate script" : `${unresolvedCount} parameter${unresolvedCount > 1 ? "s" : ""} pending`}
                      </div>
                      <p className="text-label text-white/70 truncate">
                        {isPlanReady
                          ? "Grounded against 214 approved claims"
                          : needsProductAssets
                          ? "Please attach product visual assets"
                          : needsPresenter && !presenter
                          ? "Please select an AI presenter"
                          : "Please confirm creative treatment"}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmPlan}
                    disabled={!isPlanReady || isGenerating}
                    size="sm"
                    className={cn(
                      "h-9.5 px-5 rounded-full text-body-lg font-bold shadow-sm transition-all duration-200 shrink-0",
                      isPlanReady && !isGenerating
                        ? "bg-brand hover:bg-brand-deep text-white hover:-translate-y-0.5 cursor-pointer"
                        : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                    )}
                  >
                    <span>Confirm Plan &amp; Build Script</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── RIGHT PANEL (1/3 width = 410px): Interactive AI Planning Director Chat Assistant ── */}
        <aside
          style={{
            width: copilotPanelOpen ? 410 : 0,
            minWidth: copilotPanelOpen ? 410 : 0,
            maxWidth: copilotPanelOpen ? 410 : 0,
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn(
            "flex flex-col shrink-0 min-h-0 bg-white border-l border-hair shadow-[-4px_0_20px_rgba(0,0,0,0.04)] z-10 overflow-hidden",
            !copilotPanelOpen && "border-none pointer-events-none"
          )}
        >
          {/* Chat Top Online Banner */}
          <div className="p-3.5 border-b border-hair bg-white shrink-0">
            <div className="rounded-xl border border-brand/15 bg-tint p-2.5">
              <div className="flex items-center gap-2 text-label font-bold text-brand-deep">
                <Sparkles className="size-3.5 text-brand" />
                <span>Direct with SwishX</span>
                <span className="ml-auto rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-micro font-bold">
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
                    "rounded-[15px] px-3.5 py-2.5 text-body-lg leading-relaxed shadow-2xs max-w-[85%]",
                    msg.role === "user"
                      ? "bg-brand text-white font-medium"
                      : "bg-white border border-hair text-ink"
                  )}
                >
                  <FormattedMessageText text={msg.text} />
                  {msg.role === "swishx" && index === 1 && !isGenerating && (
                    <div className="mt-2.5 pt-2 border-t border-black/[0.06] flex flex-wrap gap-1.5">
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
                          className="text-label font-semibold text-brand-deep bg-tint hover:bg-[#ffe5dd] border border-tint-line px-2 py-0.5 rounded-full transition cursor-pointer"
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
          <div className="p-3 border-t border-black/[0.06] bg-white shrink-0 space-y-2">
            {/* Attached Primary Action Bar above chat input */}
            <div className="rounded-xl border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2.5 shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("size-6 rounded-full grid place-items-center shrink-0", isPlanReady ? "bg-emerald-600 text-white" : "bg-black/10 text-ink-3")}>
                  {isPlanReady ? <Check className="size-3.5 stroke-[3]" /> : <Sparkles className="size-3 text-brand" />}
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
                  "h-7.5 px-3 rounded-lg text-label font-bold shadow-xs transition-all shrink-0 cursor-pointer",
                  isPlanReady && !isGenerating
                    ? "bg-brand hover:bg-brand-deep text-white hover:scale-[1.02]"
                    : "bg-black/10 text-black/40 cursor-not-allowed"
                )}
              >
                <span>Confirm Plan &amp; Build Script</span>
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </div>

            <div className="relative">
              <div className="flex items-center gap-1.5 rounded-[12px] border border-black/15 bg-[#f7f8f6] px-2.5 py-1.5 focus-within:border-brand focus-within:bg-white focus-within:shadow-xs transition">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setChatContextOpen(!chatContextOpen)}
                    className="grid size-6 place-items-center rounded-lg text-ink-3 hover:text-ink hover:bg-black/5 transition cursor-pointer"
                    title="Add context"
                  >
                    <Plus className="size-3.5" />
                  </button>

                  {chatContextOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border border-black/10 bg-white p-1 shadow-lg z-20 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setChatContextOpen(false);
                          handleSendChatMessage("Attach trial citations from CLARITY-CV study.");
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-label font-medium text-ink-2 hover:bg-[#f4f5f3] rounded-lg transition text-left cursor-pointer"
                      >
                        <FileCheck2 className="size-3 text-brand" />
                        Attach trial citations
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChatContextOpen(false);
                          handleSendChatMessage("Adjust narrative tone to be more clinical and objective.");
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-label font-medium text-ink-2 hover:bg-[#f4f5f3] rounded-lg transition text-left cursor-pointer"
                      >
                        <Target className="size-3 text-brand" />
                        Specify clinical tone
                      </button>
                    </div>
                  )}
                </div>

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
                  disabled={!chatInput.trim() || isGenerating}
                  className="grid size-6 place-items-center rounded-lg bg-brand text-white disabled:opacity-30 hover:bg-brand-deep transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modals & Drawers ── */}
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
        <DossierPreviewModal
          dossier={previewDossier}
          onClose={() => setPreviewDossier(null)}
        />
      )}
    </div>
  );
}

// ── High Fidelity PlanSection with Smooth Zoom & Focus Animations ──
function PlanSection({
  icon: Icon,
  title,
  summary,
  status,
  open,
  onToggle,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  status: string;
  open: boolean;
  onToggle: () => void;
  tone?: "default" | "done" | "attention";
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "squircle-card relative transition-all duration-300 ease-entrance",
        open
          ? "z-20 w-full scale-100 bg-white border border-brand shadow-[0_12px_36px_rgba(235,94,40,0.14),0_2px_10px_rgba(0,0,0,0.06)] rounded-[20px] my-3.5"
          : "z-0 w-[93%] sm:w-[94%] mx-auto scale-[0.985] bg-white/80 opacity-[.76] hover:opacity-100 hover:bg-white hover:shadow-xs border border-black/[0.08] hover:border-black/20 rounded-control my-1"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "focus-ring group flex w-full items-center gap-3 text-left transition-all duration-200 cursor-pointer",
          open ? "min-h-[70px] px-4 sm:px-5" : "min-h-[44px] py-1.5 px-3 sm:px-3.5"
        )}
        aria-expanded={open}
      >
        <span
          className={cn(
            "squircle-control grid shrink-0 place-items-center transition-transform group-hover:scale-105",
            open ? "size-10 rounded-[12px]" : "size-7 rounded-[8px]",
            tone === "attention"
              ? "bg-warn-bg text-warn"
              : tone === "done"
              ? "bg-brand text-white shadow-xs"
              : "bg-[#edf3ef] text-brand"
          )}
        >
          {tone === "done" ? (
            <Check className={cn(open ? "size-4" : "size-3")} strokeWidth={3} />
          ) : (
            <Icon className={cn(open ? "size-[19px]" : "size-3.5")} />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-bold tracking-tight transition-colors leading-snug",
              open ? "text-subhead text-ink" : "text-body-lg text-ink-2"
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "block truncate text-ink-3",
              open ? "mt-0.5 text-body" : "text-label max-w-[380px]"
            )}
          >
            {summary}
          </span>
        </span>

        <span
          className={cn(
            "hidden rounded-full font-bold sm:inline border",
            open ? "px-2.5 py-1 text-label" : "px-2 py-0.5 text-micro",
            tone === "attention"
              ? "bg-warn-bg text-warn border-[#fde68a]"
              : tone === "done"
              ? "bg-tint text-brand-deep border-tint-line"
              : "bg-[#eef2ef] text-[#66736c] border-[#e2e8e4]"
          )}
        >
          {status}
        </span>

        <div
          className={cn(
            "grid place-items-center rounded-full transition-all duration-300",
            open
              ? "size-7 rotate-180 bg-tint text-brand"
              : "size-5.5 text-ink-3 group-hover:bg-black/5"
          )}
        >
          <ChevronDown className={cn(open ? "size-4" : "size-3")} />
        </div>
      </button>

      <div
        aria-hidden={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-entrance",
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-hair px-4 pb-5 pt-3.5 sm:px-5 sm:pb-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

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
          ? "border-[#b7c9c0] bg-[#fbfdfc] opacity-100 shadow-[0_3px_14px_rgb(19_31_26/4%)]"
          : "border-[#e5e9e6] bg-white opacity-75 hover:opacity-100"
      )}
    >
      <div className="flex min-h-[58px] items-center gap-3 px-3.5">
        <span className="squircle-control grid size-8 shrink-0 place-items-center rounded-[9px] bg-[#edf3ef] text-brand">
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
      {editing && <div className="border-t border-hair bg-white p-3.5">{children}</div>}
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
      <div className="text-body-lg font-semibold text-[#5f6b65]">{label}</div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "focus-ring flex min-h-[50px] items-center gap-2.5 rounded-[12px] border p-2.5 text-left text-body-lg font-medium transition cursor-pointer",
                active ? "border-[#b8ccc2] bg-[#f2f7f4] text-brand font-semibold shadow-2xs" : "border-[#e3e8e5] hover:border-[#cbd6d0]"
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
      <div className="text-body-lg font-semibold text-[#5f6b65]">{label}</div>
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
                "focus-ring flex min-h-[50px] items-center gap-2.5 rounded-[12px] border p-2.5 text-left text-body-lg font-medium transition cursor-pointer",
                active ? "border-[#b8ccc2] bg-[#f2f7f4] text-brand font-semibold shadow-2xs" : "border-[#e3e8e5] hover:border-[#cbd6d0]"
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
      <div className="text-body-lg font-semibold text-[#5f6b65]">{label}</div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "focus-ring flex flex-col items-center justify-center gap-1.5 rounded-[12px] border py-3 px-2 text-center text-body-lg font-medium transition cursor-pointer",
                active ? "border-[#b8ccc2] bg-[#f2f7f4] text-brand font-bold shadow-2xs" : "border-[#e3e8e5] hover:border-[#cbd6d0]"
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
      <div className="text-body-lg font-semibold text-[#5f6b65]">{label}</div>
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
                active ? "border-[#b8ccc2] bg-[#f2f7f4] text-brand font-bold" : "border-[#e3e8e5] hover:border-[#cbd6d0]"
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
        <span className="text-body-lg font-semibold text-[#5f6b65]">{label}</span>
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
                "flex items-center justify-between rounded-[12px] border p-2.5 transition",
                active ? "border-[#b8ccc2] bg-[#f2f7f4]" : "border-[#e3e8e5]"
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
              active ? "border-[#b8ccc2] bg-[#f2f7f4] text-brand font-semibold shadow-2xs" : "border-[#e3e8e5] hover:border-[#cbd6d0]"
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
    <div className="rounded-control border border-[#e3e8e5] bg-white p-3.5">
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[680px] overflow-hidden rounded-card border border-white/60 bg-white shadow-2xl">
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
                  "flex items-center gap-3 rounded-[16px] border p-3 text-left transition hover:-translate-y-px hover:shadow-sm cursor-pointer",
                  active ? "border-brand bg-tint ring-1 ring-brand" : "border-[#e3e8e5] hover:border-[#c8d4ce]"
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[620px] overflow-hidden rounded-card border border-white/60 bg-white shadow-2xl">
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
                  active ? "border-brand bg-tint" : "border-[#e3e8e5]"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-body-lg text-ink">{v.name}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-caption font-bold text-brand-deep border border-tint-line">
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[700px] overflow-hidden rounded-card border border-white/60 bg-white shadow-2xl">
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
                  active ? "border-brand bg-tint" : "border-[#e3e8e5]"
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
                    "px-3 py-1.5 rounded-[9px] text-body font-bold transition cursor-pointer",
                    active ? "bg-white text-ink border border-black/10" : "bg-brand text-white"
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
