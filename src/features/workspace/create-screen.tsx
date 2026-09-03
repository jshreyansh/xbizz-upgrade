"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Film,
  FlaskConical,
  Globe2,
  History,
  Image as ImageIcon,
  Info,
  Layers,
  Monitor,
  MoreHorizontal,
  Palette,
  Paperclip,
  Plus,
  Redo2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Undo2,
  Upload,
  UserCircle2,
  Users,
  X,
  CircleCheck,
  GitBranch,
  LayoutGrid,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { deriveContentPlan, isRequestSpecific } from "@/features/workspace/content-plan";
import { defaultDemoScenarioId, demoScenarios, type DemoScenario, type DemoScenarioCategory } from "@/features/workspace/demo-scenarios";
import { planningSources } from "@/features/workspace/mock-data";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";
import { cn } from "@/lib/cn";
import type { PlanningSource, Audience } from "@/types/content";

const VIDEO_HEADLINES = [
  "What video would you like to create today?",
  "Describe your brief in detail to generate directly from text",
  "Use the example prompts below to start creating an asset",
];

const INFOGRAPHIC_HEADLINES = [
  "What infographic would you like to design today?",
  "Describe your clinical brief to generate directly from approved claims",
  "Use the example prompts below to create a high-impact leave-behind",
];

const PRESENTERS = [
  {
    id: "none",
    name: "No Avatar",
    role: "Voiceover narration & cinematic 3D motion only",
    image: "",
  },
  {
    id: "maya",
    name: "Dr. Maya Kapoor",
    role: "Dermatologist · warm, reassuring",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "rohan",
    name: "Dr. Rohan Mehta",
    role: "Physician · clear, authoritative",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "aisha",
    name: "Dr. Aisha Shah",
    role: "Medical presenter · calm, precise",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "daniel",
    name: "Dr. Daniel Lee",
    role: "Physician · conversational",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "elena",
    name: "Dr. Elena Rostova",
    role: "Oncology specialist · measured",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
  },
];

export function CreateScreen({ embedded = false }: { embedded?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    assetType,
    setAssetType,
    brief,
    audience,
    market,
    intendedUse,
    goal,
    topics,
    format,
    pageShape,
    infographicPages,
    infographicTemplate,
    selectedSourceIds,
    demoScenarioId,
    setBrief,
    setAudience,
    setMarket,
    setIntendedUse,
    setFormat,
    setPageShape,
    setInfographicPages,
    setInfographicTemplate,
    setTopics,
    setDuration,
    setLanguage,
    setPresentationMode,
    setVoice,
    setMusic,
    toggleSource,
    setSelectedSourceIds,
    setDemoScenarioId,
    setView,
    setChatMessages,
  } = useWorkspaceStore();

  const isInfographic = assetType === "infographic";
  const activeHeadlines = isInfographic ? INFOGRAPHIC_HEADLINES : VIDEO_HEADLINES;

  const [sourceLibraryOpen, setSourceLibraryOpen] = useState(false);
  const [scenarioLibraryOpen, setScenarioLibraryOpen] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<"engine" | "aspect" | "pageshape" | "audience" | "topics" | "character" | "pages" | "template" | null>(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [activeTier2, setActiveTier2] = useState<"engine" | "aspect" | "audience" | "topics" | "character" | "template" | null>(null);
  const [selectedPresenterId, setSelectedPresenterId] = useState<string>("maya");
  const selectedPresenter = PRESENTERS.find((p) => p.id === selectedPresenterId) || PRESENTERS[0];
  const [sourceQuery, setSourceQuery] = useState("");
  const [clarificationOpen, setClarificationOpen] = useState(false);
  const [localFiles, setLocalFiles] = useState<string[]>([]);

  // ── Typewriter Animated Switching Headline Hook ──
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [displayedHeadline, setDisplayedHeadline] = useState(activeHeadlines[0]);
  const [isDeletingHeadline, setIsDeletingHeadline] = useState(false);

  useEffect(() => {
    const currentPhrase = activeHeadlines[headlineIndex % activeHeadlines.length];
    let timer: NodeJS.Timeout;

    if (!isDeletingHeadline) {
      if (displayedHeadline.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayedHeadline(currentPhrase.slice(0, displayedHeadline.length + 1));
        }, 36);
      } else {
        // Hold full phrase for 4 seconds
        timer = setTimeout(() => {
          setIsDeletingHeadline(true);
        }, 4000);
      }
    } else {
      if (displayedHeadline.length > 0) {
        timer = setTimeout(() => {
          setDisplayedHeadline(currentPhrase.slice(0, displayedHeadline.length - 1));
        }, 18);
      } else {
        // Pause briefly at empty before typing next phrase
        timer = setTimeout(() => {
          setIsDeletingHeadline(false);
          setHeadlineIndex((prev) => (prev + 1) % activeHeadlines.length);
        }, 350);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedHeadline, isDeletingHeadline, headlineIndex, activeHeadlines]);

  const creationMode = useWorkspaceStore((s) => s.creationMode);
  const setCreationMode = useWorkspaceStore((s) => s.setCreationMode);
  const sourceType = useWorkspaceStore((s) => s.sourceType);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);

  const toggleTopic = (topic: string) => {
    if (topics.includes(topic)) {
      setTopics(topics.filter((t) => t !== topic));
    } else {
      setTopics([...topics, topic]);
    }
  };

  const selectedSources = planningSources.filter((source) => selectedSourceIds.includes(source.id));
  const requestIsSpecific = isRequestSpecific(brief);
  const filteredSources = useMemo(() => {
    const query = sourceQuery.trim().toLowerCase();
    return query ? planningSources.filter((source) => `${source.name} ${source.detail}`.toLowerCase().includes(query)) : planningSources;
  }, [sourceQuery]);

  const removeAttachment = (target: string) => {
    setLocalFiles((current) => current.filter((file) => file !== target));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const names = files.map((file) => file.name);
    setLocalFiles((current) => [...current, ...names.filter((name) => !current.includes(name))]);
    event.target.value = "";
  };

  const getBrandDisplayName = (id?: string) => {
    if (!id) return "Velmora";
    if (id.startsWith("velmora")) return "Velmora";
    if (id.startsWith("onkavia")) return "Onkavia";
    if (id.startsWith("nirvexa")) return "Nirvexa";
    if (id.startsWith("cardioxa")) return "Cardioxa";
    if (id.startsWith("pulmovax")) return "PulmoVax";
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  const currentBrandName = getBrandDisplayName(sourcePayload.dossierId);

  const preparePlan = () => {
    if (!requestIsSpecific) {
      setClarificationOpen(true);
      return;
    }
    const plan = deriveContentPlan({ assetType, brief, audience, market, intendedUse, selectedSourceIds, creationMode, sourceType, sourcePayload });
    setFormat(plan.format);
    setDuration(plan.length);
    setLanguage(plan.language);
    setPresentationMode(plan.presentationMode);
    setVoice(plan.voice);
    setMusic(plan.music);
    const bName = currentBrandName;
    setChatMessages([
      {
        role: "user",
        text: brief || `Create a concise ${bName} HCP launch video explaining clinical need, mechanism, and pivotal risk reduction.`,
      },
      {
        role: "swishx",
        text: `I've structured a 5-scene video plan grounded in the **${bName}** dossier and approved claims. You can review the parameters on the left canvas, or chat with me to make any adjustments.`,
      },
    ]);
    setView("directions");
    setVideoSubStage("directions");
  };

  const handleBackToSource = () => {
    setVideoSubStage("mode-select");
  };

  const loadScenario = (scenario: DemoScenario) => {
    setBrief(scenario.inputs.brief);
    setAudience(scenario.inputs.audience);
    setMarket(scenario.inputs.market);
    setIntendedUse(scenario.inputs.intendedUse);
    setSelectedSourceIds(scenario.inputs.selectedSourceIds);
    setDemoScenarioId(scenario.id);
    setClarificationOpen(false);
    setLocalFiles([]);
    setScenarioLibraryOpen(false);
  };

  const modeDisplayName = isInfographic
    ? "Image (Infographic)"
    : creationMode === "magic-avatar"
    ? "Video (Avatar)"
    : "Video";

  const samplePrompts = useMemo(
    () => [
      {
        id: "hcp-launch",
        tag: isInfographic ? "HCP Clinical Leave-Behind" : "HCP Launch Video",
        prompt: isInfographic
          ? `Create a high-impact clinical leave-behind infographic for ${currentBrandName} summarizing pivotal Phase III PASI 90 clearance, dual mechanism of action, and licensed indication cut-offs.`
          : `Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for ${currentBrandName}.`,
      },
      {
        id: "moa-efficacy",
        tag: isInfographic ? "3D MoA Cellular Cascade" : "Mechanism & Efficacy",
        prompt: isInfographic
          ? `Design a 3D cellular mechanism of action visual flow showing receptor binding, downstream kinase blockade, and plaque reduction for ${currentBrandName}.`
          : `Produce a 45-second clinical education video highlighting the Phase III efficacy endpoints and dosing safety for ${currentBrandName}.`,
      },
      {
        id: "presenter-briefing",
        tag: isInfographic ? "Clinical Readout & Cut-Offs" : "Clinical Briefing",
        prompt: isInfographic
          ? `Summarize the EMBRACE-3 pivotal trial endpoints (52% PASI 90 vs 18% placebo) with eGFR ≥25 prescribing cut-offs and mandatory ISI fair balance for ${currentBrandName}.`
          : `Generate a presenter-led clinical briefing explaining the dual mechanism of action and fair balance safety profile for ${currentBrandName}.`,
      },
    ],
    [currentBrandName, isInfographic]
  );

  const sourceDisplayName =
    sourceType === "dossier"
      ? `${currentBrandName} Dossier`
      : sourceType === "url"
      ? "Web / Study Link"
      : "Custom Plain Text";

  const projectName =
    sourceType === "dossier"
      ? `${currentBrandName} HCP launch`
      : "New Video Project";

  return (
    <div className="min-h-screen flex flex-col bg-subtle" onClick={() => setActivePopover(null)}>
      {/* ─── Top Studio-Matched Header Bar ─── */}
      <header className="z-30 flex h-[60px] shrink-0 items-center border-b border-hair bg-card px-3 sm:px-5">
        <button
          onClick={handleBackToSource}
          className="focus-ring mr-2 grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-black/5 cursor-pointer"
          aria-label="Back to modes"
        >
          <ArrowLeft className="size-4" />
        </button>
        <SwishXMark compact />
        <div className="mx-3 h-5 w-px bg-hair" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-[800] text-ink">{projectName}</span>
            <span className="hidden rounded-full bg-ok-bg px-2 py-0.5 text-micro font-bold text-ink-3 sm:inline">
              Draft v1
            </span>
          </div>
          <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
            Saved just now · Maya Kapoor
          </div>
        </div>

        {/* Brand Switcher Action in Header */}
        <div className="ml-6 hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => setDossierModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-tint px-2.5 py-0.5 text-caption font-extrabold tracking-wide text-brand-deep border border-tint-line hover:bg-tint/80 transition-colors cursor-pointer"
          >
            <ShieldCheck className="size-3 text-brand" />
            <span>{currentBrandName}</span>
            <ChevronDown className="size-2.5" />
          </button>
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
          {/* Sample Briefs Button moved to Top Header */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScenarioLibraryOpen(true)}
            className="gap-1.5 text-body font-bold text-ink-2 hover:text-brand hover:bg-tint transition cursor-pointer"
          >
            <FlaskConical className="size-3.5 text-brand" />
            <span>Sample Briefs</span>
          </Button>

          <Button variant="ghost" size="icon" aria-label="More">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </header>

      {/* Center stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full flex flex-col items-center space-y-5">
          {/* ── Hero Heading ── */}
          <div className="text-center max-w-[840px] min-h-[44px] sm:min-h-[50px] flex items-center justify-center">
            <h1 className="text-display-lg sm:text-hero md:text-hero-lg font-[850] text-ink tracking-tight inline-flex items-center justify-center flex-wrap">
              <span>{displayedHeadline || "\u00A0"}</span>
              <span
                className="inline-block w-[3px] h-[0.85em] bg-brand ml-2 rounded-full animate-cursor-blink align-middle shrink-0"
                aria-hidden="true"
              />
            </h1>
          </div>

          {/* ── Prominently Wide AI Chat Input Box ── */}
          <div className="w-full max-w-[940px] rounded-[26px] border border-black/[0.09] bg-card shadow-[0_12px_40px_rgba(0,0,0,0.07)] focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 transition-all duration-200">
            <div className="p-6 pb-3">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) preparePlan();
                }}
                rows={4}
                placeholder={`Ask SwishX or describe what you want to create (e.g. "Create a concise ${currentBrandName} HCP launch video for dermatologists explaining clinical need, mechanism, and pivotal PASI 90 evidence")...`}
                className="w-full resize-none bg-transparent text-subhead leading-relaxed outline-none placeholder:text-ink-4 text-ink font-normal"
              />
            </div>

            {/* Attached local files preview if any */}
            {localFiles.length > 0 && (
              <div className="px-6 pb-2.5 flex flex-wrap gap-1.5">
                {localFiles.map((file) => (
                  <span key={file} className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf1f4] px-2.5 py-1 text-label font-medium text-ink-3 border border-black/[0.06]">
                    <Paperclip className="size-3" />
                    <span className="max-w-[160px] truncate">{file}</span>
                    <button onClick={() => removeAttachment(file)} className="hover:text-black cursor-pointer"><X className="size-3" /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Toolbar */}
            <div
              className="relative flex items-center justify-between gap-2 border-t border-black/[0.06] bg-canvas/95 px-3.5 py-2.5 rounded-b-[26px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                {/* + Plus Button — Files, Audience, Aspect Ratio, Clinical Topics only */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setPlusMenuOpen(!plusMenuOpen);
                      setActiveTier2(activeTier2 || "audience");
                    }}
                    title="Configure audience, topics & aspect ratio"
                    aria-label="Add options"
                    className={cn(
                      "grid size-8 place-items-center rounded-xl border transition-all cursor-pointer shadow-2xs shrink-0",
                      plusMenuOpen
                        ? "border-brand bg-brand text-white ring-2 ring-brand/20 shadow-xs"
                        : "border-black/10 bg-card text-ink-3 hover:text-brand hover:border-brand hover:bg-card"
                    )}
                  >
                    <Plus className={cn("size-4 transition-transform duration-200", plusMenuOpen && "rotate-45")} />
                  </button>

                  {plusMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2.5 z-50 w-56 rounded-2xl border border-black/10 bg-card p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.18)] space-y-0.5">
                      {/* 1. Attach Files */}
                      <button
                        type="button"
                        onClick={() => {
                          setPlusMenuOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-body font-medium text-ink hover:bg-black/5 text-left cursor-pointer transition-colors"
                      >
                        <Paperclip className="size-4 text-brand shrink-0" />
                        <span className="flex-1">Add files or briefs</span>
                      </button>

                      <div className="h-px w-full bg-black/6 my-1" />

                      {/* 2. Target Audience */}
                      <button
                        type="button"
                        onMouseEnter={() => setActiveTier2("audience")}
                        onClick={() => setActiveTier2(activeTier2 === "audience" ? null : "audience")}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-body font-medium transition-colors text-left cursor-pointer",
                          activeTier2 === "audience"
                            ? "bg-tint text-brand-deep font-bold shadow-2xs"
                            : "text-ink hover:bg-black/5"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="size-4 text-brand shrink-0" />
                          <span>Target Audience</span>
                        </div>
                        <ChevronRight className="size-3.5 opacity-60" />
                      </button>

                      {/* 3. Output Size & Aspect */}
                      <button
                        type="button"
                        onMouseEnter={() => setActiveTier2("aspect")}
                        onClick={() => setActiveTier2(activeTier2 === "aspect" ? null : "aspect")}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-body font-medium transition-colors text-left cursor-pointer",
                          activeTier2 === "aspect"
                            ? "bg-tint text-brand-deep font-bold shadow-2xs"
                            : "text-ink hover:bg-black/5"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Monitor className="size-4 text-brand shrink-0" />
                          <span>Size &amp; Aspect Ratio</span>
                        </div>
                        <ChevronRight className="size-3.5 opacity-60" />
                      </button>

                      {/* 4. Clinical Focus Topics */}
                      <button
                        type="button"
                        onMouseEnter={() => setActiveTier2("topics")}
                        onClick={() => setActiveTier2(activeTier2 === "topics" ? null : "topics")}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-body font-medium transition-colors text-left cursor-pointer",
                          activeTier2 === "topics"
                            ? "bg-tint text-brand-deep font-bold shadow-2xs"
                            : "text-ink hover:bg-black/5"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="size-4 text-brand shrink-0" />
                          <span>Clinical Topics</span>
                        </div>
                        <ChevronRight className="size-3.5 opacity-60" />
                      </button>

                      {/* Infographic Layout / Templates */}
                      {isInfographic && (
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTier2("template")}
                          onClick={() => setActiveTier2(activeTier2 === "template" ? null : "template")}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-body font-medium transition-colors text-left cursor-pointer",
                            activeTier2 === "template"
                              ? "bg-tint text-brand-deep font-bold shadow-2xs"
                              : "text-ink hover:bg-black/5"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Palette className="size-4 text-brand shrink-0" />
                            <span>Design &amp; Layout</span>
                          </div>
                          <ChevronRight className="size-3.5 opacity-60" />
                        </button>
                      )}

                      {/* Tier 2 submenu */}
                      {activeTier2 && (
                        <div className="absolute left-full bottom-0 ml-2 w-[310px] rounded-2xl border border-black/10 bg-card p-2.5 shadow-[0_16px_48px_rgba(0,0,0,0.18)] flex flex-col justify-start before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-3">
                          {activeTier2 === "audience" && (
                            <div className="space-y-1">
                              <div className="px-2 py-1 text-caption font-extrabold uppercase tracking-wider text-ink-3 flex items-center justify-between">
                                <span>Target Audience</span>
                                <span className="text-ok font-bold uppercase">{audience}</span>
                              </div>
                              {[
                                { id: "HCP", label: "HCP", desc: "Doctors, Specialists, Key Opinion Leaders" },
                                { id: "Patient", label: "Patients", desc: "Treatment understanding, adherence" },
                                { id: "Field team", label: "Field Force", desc: "Detailing aids & objection handling" },
                                { id: "Hospital", label: "Hospital Procurement", desc: "Formulary decisions, HEOR, budget impact" },
                                { id: "Distributor", label: "Distributors", desc: "Trade, supply chain, market access" },
                                { id: "Consumer", label: "Consumers", desc: "General public & symptom awareness" },
                              ].map((item) => {
                                const isSelected = audience === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      setAudience(item.id as Audience);
                                    }}
                                    className={cn(
                                      "flex w-full items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer",
                                      isSelected
                                        ? "bg-tint font-bold text-brand-deep border border-tint-line shadow-2xs"
                                        : "hover:bg-black/5 text-ink border border-transparent"
                                    )}
                                  >
                                    <div>
                                      <div className="text-body font-bold">{item.label}</div>
                                      <div className="text-caption text-ink-3 font-normal">{item.desc}</div>
                                    </div>
                                    {isSelected && <Check className="size-3.5 text-brand stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {activeTier2 === "aspect" && (
                            <div className="space-y-1">
                              <div className="px-2 py-1 text-caption font-extrabold uppercase tracking-wider text-ink-3 flex items-center justify-between">
                                <span>{isInfographic ? "Infographic Shape" : "Video Aspect Ratio"}</span>
                                <span className="text-ok font-bold uppercase">
                                  {isInfographic ? pageShape : format || "16:9"}
                                </span>
                              </div>
                              {(isInfographic
                                ? [
                                    { id: "3:4", label: "3:4 Tablet Detailer", desc: "Held upright & iPad friendly" },
                                    { id: "16:9", label: "16:9 Landscape Slide", desc: "Screens & presentations" },
                                    { id: "A4", label: "A4 Print Document", desc: "Print leave-behind standard" },
                                  ]
                                : [
                                    { id: "16:9", label: "16:9 Landscape", desc: "Widescreen HCP meetings & CLM" },
                                    { id: "9:16", label: "9:16 Vertical", desc: "Instagram Reels & mobile feed" },
                                    { id: "1:1", label: "1:1 Square", desc: "LinkedIn & social engagement" },
                                  ]
                              ).map((item) => {
                                const isSelected = isInfographic ? pageShape === item.id : format === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      if (isInfographic) setPageShape(item.id as any);
                                      else setFormat(item.id);
                                    }}
                                    className={cn(
                                      "flex w-full items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer",
                                      isSelected
                                        ? "bg-tint font-bold text-brand-deep border border-tint-line shadow-2xs"
                                        : "hover:bg-black/5 text-ink border border-transparent"
                                    )}
                                  >
                                    <div>
                                      <div className="text-body font-bold">{item.label}</div>
                                      <div className="text-caption text-ink-3 font-normal">{item.desc}</div>
                                    </div>
                                    {isSelected && <Check className="size-3.5 text-brand stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {activeTier2 === "topics" && (
                            <div className="space-y-1">
                              <div className="px-2 py-1 text-caption font-extrabold uppercase tracking-wider text-ink-3 flex items-center justify-between">
                                <span>Clinical Topics</span>
                                <span className="text-ok font-bold">{topics.length} selected</span>
                              </div>
                              {[
                                "Mechanism of Action",
                                "Pivotal Trial Data",
                                "Dosing & Safety",
                                "Fair Balance & ISI",
                                "Patient Profile",
                                "Competitive Context",
                              ].map((topic) => {
                                const isSelected = topics.includes(topic);
                                return (
                                  <button
                                    key={topic}
                                    type="button"
                                    onClick={() => toggleTopic(topic)}
                                    className={cn(
                                      "flex w-full items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer",
                                      isSelected
                                        ? "bg-tint font-bold text-brand-deep border border-tint-line shadow-2xs"
                                        : "hover:bg-black/5 text-ink border border-transparent"
                                    )}
                                  >
                                    <span className="text-body">{topic}</span>
                                    {isSelected && <Check className="size-3.5 text-brand stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {activeTier2 === "template" && isInfographic && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <div className="px-2 py-0.5 text-caption font-extrabold uppercase tracking-wider text-ink-3">
                                  Pages Count
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {[
                                    { id: "1", label: "1 Page" },
                                    { id: "2", label: "2 Pages" },
                                  ].map((item) => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => setInfographicPages(item.id as "1" | "2")}
                                      className={cn(
                                        "p-2 rounded-xl text-center text-label font-bold border transition-colors cursor-pointer",
                                        infographicPages === item.id
                                          ? "border-brand bg-tint text-brand-deep"
                                          : "border-black/10 bg-card hover:bg-black/5 text-ink"
                                      )}
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1 pt-1 border-t border-black/5">
                                <div className="px-2 py-0.5 text-caption font-extrabold uppercase tracking-wider text-ink-3">
                                  Design Template
                                </div>
                                {[
                                  { id: "stat-hero", label: "Stat Hero" },
                                  { id: "trial-summary", label: "Trial Summary" },
                                  { id: "bench-data", label: "Bench Data" },
                                  { id: "moa-scroll", label: "Anatomy & MoA" },
                                ].map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setInfographicTemplate(item.id as any)}
                                    className={cn(
                                      "flex w-full items-center justify-between p-1.5 px-2.5 rounded-lg text-left text-label transition-colors cursor-pointer",
                                      infographicTemplate === item.id
                                        ? "bg-tint font-bold text-brand-deep"
                                        : "hover:bg-black/5 text-ink"
                                    )}
                                  >
                                    <span>{item.label}</span>
                                    {infographicTemplate === item.id && <Check className="size-3 text-brand stroke-[3]" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Attach file button shortcut */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-label font-medium text-ink-3 hover:text-brand hover:bg-tint transition-colors cursor-pointer"
                >
                  <Paperclip className="size-3.5" />
                  <span>Attach</span>
                </button>
              </div>

              {/* Far Right Bottom Action: Send Arrow CTA */}
              <div className="flex items-center gap-2.5 ml-auto shrink-0 pl-2">
                <span className="hidden sm:inline text-caption font-mono text-ink-3">
                  {brief.length > 0 ? `${brief.length} chars · ⌘↵` : "⌘↵ to send"}
                </span>

                <button
                  type="button"
                  onClick={preparePlan}
                  disabled={!brief.trim()}
                  title="Generate Plan (⌘↵)"
                  aria-label="Generate Plan"
                  className="grid size-8 place-items-center rounded-xl bg-brand hover:bg-brand-deep text-white shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:shadow-md hover:scale-105"
                >
                  <ArrowUp className="size-4 stroke-[2.8]" />
                </button>
              </div>
            </div>
          </div>

          {/* Clarification warning */}
          {clarificationOpen && (
            <div className="w-full max-w-[940px] rounded-panel border border-[#f0cfa0] bg-[#fffbf2] p-4 text-body-lg text-[#78531d] shadow-2xs">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-[#b57314]" />
                <div>
                  <b className="font-bold">Add a little more detail before continuing.</b>
                  <p className="mt-0.5 leading-relaxed text-[#8c672e]">
                    Mention the topic, disease state, evidence point, or launch objective so SwishX can recommend an appropriate storyboard structure.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Compact Grounding Strip ── */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-[840px]">
            <button
              type="button"
              onClick={() => setDossierModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-tint px-3 py-1 text-label font-bold text-brand-deep border border-tint-line shadow-2xs hover:bg-tint/80 transition-colors cursor-pointer"
            >
              <ShieldCheck className="size-3.5 text-brand" />
              <span>{sourceDisplayName}</span>
              <ChevronDown className="size-2.5 opacity-60" />
            </button>
            {audience && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-label font-semibold text-ink-2 border border-black/[0.08] shadow-2xs">
                <Users className="size-3.5 text-brand" />
                {audience}
              </span>
            )}
            {topics.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-label font-semibold text-ink-2 border border-black/[0.08] shadow-2xs">
                <Layers className="size-3.5 text-brand" />
                {topics.length} {topics.length === 1 ? "topic" : "topics"}
              </span>
            )}
            {/* Engine context chip */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-label font-semibold text-ink-2 border border-black/[0.08] shadow-2xs">
              <Film className="size-3.5 text-brand" />
              {modeDisplayName}
            </span>
            {selectedSources.map((source) => {
              const dynamicSource = {
                ...source,
                name: source.name.replace(/DERMORA/g, currentBrandName),
              };
              return (
                <SourceChip key={source.id} source={dynamicSource} onRemove={() => toggleSource(source.id)} />
              );
            })}
            {localFiles.map((file) => (
              <AttachmentChip
                key={file}
                label={file}
                onRemove={() => setLocalFiles((prev) => prev.filter((f) => f !== file))}
              />
            ))}
            <span className="inline-flex items-center gap-1 text-label font-bold text-ok bg-ok-bg border border-ok-line px-2.5 py-1 rounded-full ml-1">
              <span className="size-1.5 rounded-full bg-ok animate-pulse" />
              Grounding Locked
            </span>
          </div>

          {/* ── Example Prompts — BELOW the input ── */}
          <div className="w-full max-w-[940px] flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-caption font-extrabold uppercase tracking-wider text-ink-3">
                Example Prompts
              </span>
              <span className="text-caption text-ink-3">Click any prompt to load into brief</span>
            </div>

            {samplePrompts.map((sample) => {
              const isSelected = brief.trim() === sample.prompt.trim();
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setBrief(sample.prompt);
                    setSelectedSourceIds(["dermora-core", "dermora-claims", "dermora-brand"]);
                  }}
                  className={cn(
                    "group flex items-center justify-between gap-3.5 rounded-2xl border p-2.5 px-3.5 text-left transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs",
                    isSelected
                      ? "border-brand bg-tint/70 ring-2 ring-brand/20 shadow-xs"
                      : "border-black/[0.08] bg-card hover:border-brand/80 hover:bg-[#fffcfb]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="inline-flex items-center rounded-lg bg-tint px-2 py-0.5 text-label font-extrabold text-brand-deep border border-tint-line shrink-0">
                      {sample.tag}
                    </span>
                    <span className="text-body text-ink font-medium leading-normal line-clamp-1 flex-1">
                      "{sample.prompt}"
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-label font-bold text-brand opacity-80 group-hover:opacity-100 shrink-0 ml-2">
                    <span className="hidden sm:inline">Use prompt</span>
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />

      {/* Brand & Dossier Selection Pop-up Modal */}
      <BrandDossierModal
        open={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
      />

      {sourceLibraryOpen && (
        <SourceLibraryModal
          selectedIds={selectedSourceIds}
          query={sourceQuery}
          onQueryChange={setSourceQuery}
          sources={filteredSources}
          onToggle={toggleSource}
          onUpload={() => { setSourceLibraryOpen(false); fileInputRef.current?.click(); }}
          onClose={() => setSourceLibraryOpen(false)}
          brandName={currentBrandName}
        />
      )}
      {scenarioLibraryOpen && (
        <DemoScenarioDrawer
          currentScenarioId={demoScenarioId}
          onSelect={loadScenario}
          onReset={() => loadScenario(demoScenarios.find((s) => s.id === defaultDemoScenarioId) ?? demoScenarios[0])}
          onClose={() => setScenarioLibraryOpen(false)}
        />
      )}
    </div>
  );
}

function SourceChip({ source, onRemove }: { source: PlanningSource; onRemove: () => void }) {
  const approved = source.status === "current" && source.kind !== "reference";
  const color =
    source.kind === "brand" ? "bg-ok-bg text-[#355f4e]"
    : source.kind === "claims" ? "bg-[#eef1f7] text-[#4f5f78]"
    : source.kind === "reference" ? "bg-[#f3eee8] text-[#705f4d]"
    : "bg-[#f5ece8] text-[#775548]";
  return (
    <span className={cn("flex min-h-9 max-w-full items-center gap-2 rounded-chip px-2.5 text-body font-medium border border-black/[0.06]", color)}>
      <FileText className="size-3.5 shrink-0 opacity-75" />
      <span className="max-w-[210px] truncate">{source.name}</span>
      {approved && <span className="rounded-full bg-white/65 px-1.5 py-0.5 text-caption font-semibold opacity-80">Current</span>}
      <button onClick={onRemove} className="grid size-5 shrink-0 place-items-center rounded-full opacity-60 hover:bg-white/70 hover:opacity-100 transition" aria-label={`Remove ${source.name}`}>
        <X className="size-3" />
      </button>
    </span>
  );
}

function AttachmentChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex min-h-9 items-center gap-2 rounded-chip bg-[#edf1f4] px-2.5 text-body font-medium text-ink-3 border border-black/[0.06]">
      <Paperclip className="size-3.5 opacity-75" />
      <span className="max-w-[180px] truncate">{label}</span>
      <button onClick={onRemove} className="grid size-5 place-items-center rounded-full opacity-60 hover:bg-white/70 hover:opacity-100 transition" aria-label={`Remove ${label}`}>
        <X className="size-3" />
      </button>
    </span>
  );
}

const scenarioCategoryIcons: Record<DemoScenarioCategory, typeof CircleCheck> = {
  "Happy paths": CircleCheck,
  "Dynamic branches": GitBranch,
  "Missing information": TriangleAlert,
  "Source and market": Globe2,
  "Other formats": LayoutGrid,
};

function DemoScenarioDrawer({ currentScenarioId, onSelect, onReset, onClose }: { currentScenarioId: string; onSelect: (scenario: DemoScenario) => void; onReset: () => void; onClose: () => void }) {
  const categories = [...new Set(demoScenarios.map((s) => s.category))];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/38 backdrop-blur-[2px]" role="dialog" aria-modal="true">
      <div className="slide-left flex h-full w-full max-w-[440px] flex-col border-l border-white/50 bg-canvas shadow-2xl">
        <div className="flex items-center justify-between border-b border-hair px-5 py-4">
          <div>
            <div className="text-label font-bold uppercase tracking-[0.12em] text-brand">Demo Library</div>
            <h3 className="text-title font-semibold">Sample briefs</h3>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-ok-bg" aria-label="Close"><X className="size-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {categories.map((category) => {
            const CategoryIcon = scenarioCategoryIcons[category];
            const list = demoScenarios.filter((item) => item.category === category);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-1.5 text-body font-bold uppercase tracking-wider text-ink-3">
                  <CategoryIcon className="size-3.5 text-brand" />
                  <span>{category}</span>
                </div>
                {list.map((scenario) => {
                  const active = scenario.id === currentScenarioId;
                  return (
                    <button key={scenario.id} onClick={() => onSelect(scenario)} className={cn("block w-full rounded-control border p-3 text-left transition hover:-translate-y-px hover:shadow-sm", active ? "border-[#adc4b8] bg-ok-bg" : "border-hair bg-card hover:border-[#ccd7d1]")}>
                      <div className="flex items-center justify-between">
                        <b className="text-body-lg font-semibold">{scenario.label}</b>
                        {active && <span className="rounded-full bg-brand px-2 py-0.5 text-caption font-bold text-white">Active</span>}
                      </div>
                      <p className="mt-1 text-body leading-5 text-ink-3">{scenario.description}</p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="border-t border-hair p-4">
          <Button variant="secondary" size="sm" onClick={onReset} className="w-full">Reset to default demo case</Button>
        </div>
      </div>
    </div>
  );
}

function SourceLibraryModal({
  selectedIds,
  query,
  onQueryChange,
  sources,
  onToggle,
  onUpload,
  onClose,
  brandName = "Brand",
}: {
  selectedIds: string[];
  query: string;
  onQueryChange: (q: string) => void;
  sources: PlanningSource[];
  onToggle: (id: string) => void;
  onUpload: () => void;
  onClose: () => void;
  brandName?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/38 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true">
      <div className="flex max-h-[85vh] w-full max-w-[620px] flex-col rounded-[22px] border border-white/60 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-hair p-5">
          <div>
            <div className="text-label font-bold uppercase tracking-[0.12em] text-brand">Regulatory Sources</div>
            <h3 className="text-title font-semibold">Attach verified evidence</h3>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-ok-bg" aria-label="Close"><X className="size-4" /></button>
        </div>
        <div className="p-4 border-b border-hair">
          <div className="flex items-center gap-2 rounded-[12px] border border-hair bg-canvas px-3 py-2">
            <Search className="size-4 text-ink-3" />
            <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search FDA labels, trial protocols, brand assets..." className="w-full bg-transparent text-body-lg outline-none" />
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {sources.map((source) => {
            const active = selectedIds.includes(source.id);
            return (
              <div key={source.id} className={cn("flex items-center justify-between rounded-control border p-3 transition", active ? "border-[#adc4b8] bg-ok-bg" : "border-hair bg-card")}>
                <div className="min-w-0 flex-1 pr-3">
                  <b className="block truncate text-body-lg font-semibold">{source.name.replace(/DERMORA/g, brandName)}</b>
                  <span className="block truncate text-body text-ink-3">{source.detail.replace(/DERMORA/g, brandName)}</span>
                </div>
                <Button size="sm" variant={active ? "secondary" : "primary"} onClick={() => onToggle(source.id)} className="shrink-0 text-body">
                  {active ? "Remove" : "Attach"}
                </Button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-hair p-4">
          <Button variant="secondary" size="sm" onClick={onUpload} className="gap-1.5"><Upload className="size-3.5" /> Upload document</Button>
          <Button size="sm" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
