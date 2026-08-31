"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Film,
  FlaskConical,
  Globe2,
  History,
  Info,
  Layers,
  MoreHorizontal,
  Paperclip,
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
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { deriveContentPlan, isRequestSpecific } from "@/features/workspace/content-plan";
import { defaultDemoScenarioId, demoScenarios, type DemoScenario, type DemoScenarioCategory } from "@/features/workspace/demo-scenarios";
import { planningSources } from "@/features/workspace/mock-data";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";
import type { PlanningSource } from "@/types/content";

export function CreateScreen({ embedded = false }: { embedded?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    assetType,
    brief,
    audience,
    market,
    intendedUse,
    goal,
    topics,
    selectedSourceIds,
    demoScenarioId,
    setBrief,
    setAudience,
    setMarket,
    setIntendedUse,
    setFormat,
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

  const [sourceLibraryOpen, setSourceLibraryOpen] = useState(false);
  const [scenarioLibraryOpen, setScenarioLibraryOpen] = useState(false);
  const [sourceQuery, setSourceQuery] = useState("");
  const [clarificationOpen, setClarificationOpen] = useState(false);
  const [localFiles, setLocalFiles] = useState<string[]>([]);

  const creationMode = useWorkspaceStore((s) => s.creationMode);
  const sourceType = useWorkspaceStore((s) => s.sourceType);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);

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
    setVideoSubStage("source-select");
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

  const modeDisplayName =
    creationMode === "magic-reel"
      ? "MagicReel\u2122 \u00b7 Short Video"
      : creationMode === "magic-avatar"
      ? "MagicAvatar\u2122 \u00b7 Digital Twin"
      : "Custom Video \u00b7 Scratch";

  const modeSubtitle =
    creationMode === "magic-reel"
      ? "30\u2013180s cinematic video with medical scenes, graphics & citations"
      : creationMode === "magic-avatar"
      ? "30\u201390s lip-synced presenter video with clinical slide overlays"
      : "Open custom prompt & duration";

  const samplePrompts = useMemo(
    () => [
      {
        id: "hcp-launch",
        tag: "HCP Launch Video",
        oneLiner: "Highlight clinical need, mechanism & pivotal endpoints",
        prompt: `Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for ${currentBrandName}.`,
      },
      {
        id: "moa-efficacy",
        tag: "Mechanism & Efficacy",
        oneLiner: "45s animation on receptor binding & safety profile",
        prompt: `Produce a 45-second clinical education video highlighting the Phase III efficacy endpoints and dosing safety for ${currentBrandName}.`,
      },
      {
        id: "presenter-briefing",
        tag: "Clinical Briefing",
        oneLiner: "Presenter-led walkthrough with fair balance data",
        prompt: `Generate a presenter-led clinical briefing explaining the dual mechanism of action and fair balance safety profile for ${currentBrandName}.`,
      },
    ],
    [currentBrandName]
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
    <div className="min-h-screen flex flex-col bg-[#f7f8f6]">
      {/* ─── Top Studio-Matched Header Bar ─── */}
      <header className="z-30 flex h-[60px] shrink-0 items-center border-b border-[var(--line)] bg-white px-3 sm:px-5">
        <button
          onClick={handleBackToSource}
          className="focus-ring mr-2 grid size-8 place-items-center rounded-lg text-[var(--ink-muted)] hover:bg-black/5 cursor-pointer"
          aria-label="Back to setup"
        >
          <ArrowLeft className="size-4" />
        </button>
        <SwishXMark compact />
        <div className="mx-3 h-5 w-px bg-[var(--line)]" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[12.5px] font-[800] text-[var(--ink)]">{projectName}</span>
            <span className="hidden rounded-full bg-[#edf1ee] px-2 py-0.5 text-[9px] font-bold text-[#69736e] sm:inline">
              Draft v1
            </span>
          </div>
          <div className="mt-0.5 hidden text-[9.5px] text-[var(--ink-muted)] sm:block">
            Saved just now · Maya Kapoor
          </div>
        </div>

        {/* State Switcher in Header */}
        <div className="ml-6 hidden items-center gap-1 sm:flex">
          <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wide text-[var(--brand-deep)] border border-[var(--tint-line)]">
            Brief View
          </span>
        </div>

        <div className="ml-4 hidden items-center gap-0.5 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Redo" disabled>
            <Redo2 className="size-4" />
          </Button>
          <div className="mx-1 h-5 w-px bg-[var(--line)]" />
          <Button variant="ghost" size="sm">
            <History className="size-3.5" /> Versions
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="More">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </header>

      {/* Center stage (Expansive, Wide Chat Input with Minimal Text & Clean Whitespace) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full flex flex-col items-center space-y-6">
          {/* ── Static Hero Heading ── */}
          <div className="text-center space-y-1.5 max-w-[720px]">
            <h1 className="text-[28px] sm:text-[34px] font-[850] text-[var(--ink)] tracking-tight">
              What video would you like to create today?
            </h1>
          </div>

          {/* ── 3 Intelligible One-Liner Prompt Suggestion Cards (3-column grid) ── */}
          <div className="w-full max-w-[940px] grid grid-cols-1 md:grid-cols-3 gap-3">
            {samplePrompts.map((sample) => {
              const isSelected = brief.trim() === sample.prompt.trim();
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => setBrief(sample.prompt)}
                  title={sample.prompt}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all duration-150 cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-xs",
                    isSelected
                      ? "border-[var(--brand)] bg-[var(--tint)]/70 ring-2 ring-[var(--brand)]/20 shadow-xs"
                      : "border-black/[0.08] bg-white hover:border-[var(--brand)] hover:bg-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid size-7 place-items-center rounded-lg bg-[var(--tint)] text-[var(--brand-deep)] shrink-0 border border-[var(--tint-line)]">
                      <Sparkles className="size-3.5 text-[var(--brand)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-[var(--ink)] truncate">
                        {sample.tag}
                      </div>
                      <div className="text-[11px] text-[var(--ink-muted)] truncate group-hover:text-[var(--ink-2)] transition-colors">
                        {sample.oneLiner}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-[var(--brand)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>

          {/* ── Prominently Wide AI Chat Input Box (Commands the Screen) ── */}
          <div className="w-full max-w-[940px] rounded-[26px] border border-black/[0.09] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.07)] focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand)]/10 transition-all duration-200 overflow-hidden">
            <div className="p-6 pb-3">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) preparePlan();
                }}
                rows={4}
                placeholder={`Ask SwishX or describe what you want to create (e.g. "Create a concise ${currentBrandName} HCP launch video for dermatologists explaining clinical need, mechanism, and pivotal PASI 90 evidence")...`}
                className="w-full resize-none bg-transparent text-[15.5px] leading-relaxed outline-none placeholder:text-[var(--ink-4)] text-[var(--ink)] font-normal"
              />
            </div>

            {/* Attached local files preview if any */}
            {localFiles.length > 0 && (
              <div className="px-6 pb-2.5 flex flex-wrap gap-1.5">
                {localFiles.map((file) => (
                  <span key={file} className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf1f4] px-2.5 py-1 text-[11.5px] font-medium text-[#52616a] border border-black/[0.06]">
                    <Paperclip className="size-3" />
                    <span className="max-w-[160px] truncate">{file}</span>
                    <button onClick={() => removeAttachment(file)} className="hover:text-black cursor-pointer"><X className="size-3" /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Toolbar & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] bg-[#fafbf9]/90 px-5 py-3.5">
              <div className="flex items-center gap-2">
                {/* Engine Selector Pill */}
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-[12px] font-bold text-[var(--ink-2)] shadow-2xs">
                  {creationMode === "magic-avatar" ? (
                    <UserCircle2 className="size-3.5 text-[var(--brand)]" />
                  ) : (
                    <Film className="size-3.5 text-[var(--brand)]" />
                  )}
                  <span>{modeDisplayName.split(" · ")[0]}</span>
                </div>

                {/* Attach Material */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-2)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition cursor-pointer shadow-2xs"
                >
                  <Paperclip className="size-3.5 text-[var(--brand)]" />
                  <span>Attach</span>
                </button>

                {/* Sample Briefs */}
                <button
                  type="button"
                  onClick={() => setScenarioLibraryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-2)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition cursor-pointer shadow-2xs"
                >
                  <FlaskConical className="size-3.5 text-[var(--ink-muted)]" />
                  <span>Browse library</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[11px] font-mono text-[var(--ink-muted)]">
                  {brief.length > 0 ? `${brief.length} chars · ⌘↵ to send` : "⌘↵ to send"}
                </span>

                <button
                  type="button"
                  onClick={preparePlan}
                  disabled={!brief.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white px-4 py-2 text-[13px] font-extrabold shadow-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Generate Plan</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Clarification warning */}
          {clarificationOpen && (
            <div className="w-full max-w-[940px] rounded-[18px] border border-[#f0cfa0] bg-[#fffbf2] p-4 text-[13px] text-[#78531d] shadow-2xs">
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

          {/* ── Compact Grounding Strip (Clean horizontal centered pills) ── */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-[840px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint)] px-3 py-1 text-[11.5px] font-bold text-[var(--brand-deep)] border border-[var(--tint-line)] shadow-2xs">
              <ShieldCheck className="size-3.5 text-[var(--brand)]" />
              {sourceDisplayName}
            </span>
            {audience && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11.5px] font-semibold text-[var(--ink-2)] border border-black/[0.08] shadow-2xs">
                <Users className="size-3.5 text-[var(--brand)]" />
                {audience}
              </span>
            )}
            {topics.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11.5px] font-semibold text-[var(--ink-2)] border border-black/[0.08] shadow-2xs">
                <Layers className="size-3.5 text-[var(--brand)]" />
                {topics.length} {topics.length === 1 ? "topic" : "topics"}
              </span>
            )}
            {selectedSources.map((source) => (
              <SourceChip key={source.id} source={source} onRemove={() => toggleSource(source.id)} />
            ))}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full ml-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Grounding Locked
            </span>
          </div>
        </div>
      </main>

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />

      {sourceLibraryOpen && (
        <SourceLibraryModal
          selectedIds={selectedSourceIds}
          query={sourceQuery}
          onQueryChange={setSourceQuery}
          sources={filteredSources}
          onToggle={toggleSource}
          onUpload={() => { setSourceLibraryOpen(false); fileInputRef.current?.click(); }}
          onClose={() => setSourceLibraryOpen(false)}
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
    source.kind === "brand" ? "bg-[#eaf2ed] text-[#355f4e]"
    : source.kind === "claims" ? "bg-[#eef1f7] text-[#4f5f78]"
    : source.kind === "reference" ? "bg-[#f3eee8] text-[#705f4d]"
    : "bg-[#f5ece8] text-[#775548]";
  return (
    <span className={cn("flex min-h-9 max-w-full items-center gap-2 rounded-[10px] px-2.5 text-[12.5px] font-medium border border-black/[0.06]", color)}>
      <FileText className="size-3.5 shrink-0 opacity-75" />
      <span className="max-w-[210px] truncate">{source.name}</span>
      {approved && <span className="rounded-full bg-white/65 px-1.5 py-0.5 text-[10.5px] font-semibold opacity-80">Current</span>}
      <button onClick={onRemove} className="grid size-5 shrink-0 place-items-center rounded-full opacity-60 hover:bg-white/70 hover:opacity-100 transition" aria-label={`Remove ${source.name}`}>
        <X className="size-3" />
      </button>
    </span>
  );
}

function AttachmentChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex min-h-9 items-center gap-2 rounded-[10px] bg-[#edf1f4] px-2.5 text-[12.5px] font-medium text-[#52616a] border border-black/[0.06]">
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
    <div className="fixed inset-0 z-50 flex justify-end bg-[#10231c]/38 backdrop-blur-[2px]" role="dialog" aria-modal="true">
      <div className="slide-left flex h-full w-full max-w-[440px] flex-col border-l border-white/50 bg-[#fafbfa] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Demo Library</div>
            <h3 className="text-[17px] font-semibold">Sample briefs</h3>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-[#eef2ef]" aria-label="Close"><X className="size-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {categories.map((category) => {
            const CategoryIcon = scenarioCategoryIcons[category];
            const list = demoScenarios.filter((item) => item.category === category);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  <CategoryIcon className="size-3.5 text-[var(--brand)]" />
                  <span>{category}</span>
                </div>
                {list.map((scenario) => {
                  const active = scenario.id === currentScenarioId;
                  return (
                    <button key={scenario.id} onClick={() => onSelect(scenario)} className={cn("block w-full rounded-[14px] border p-3 text-left transition hover:-translate-y-px hover:shadow-sm", active ? "border-[#adc4b8] bg-[#eef5f1]" : "border-[var(--line)] bg-white hover:border-[#ccd7d1]")}>
                      <div className="flex items-center justify-between">
                        <b className="text-[13.5px] font-semibold">{scenario.label}</b>
                        {active && <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-white">Active</span>}
                      </div>
                      <p className="mt-1 text-[12.5px] leading-5 text-[var(--ink-muted)]">{scenario.description}</p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="border-t border-[var(--line)] p-4">
          <Button variant="secondary" size="sm" onClick={onReset} className="w-full">Reset to default demo case</Button>
        </div>
      </div>
    </div>
  );
}

function SourceLibraryModal({ selectedIds, query, onQueryChange, sources, onToggle, onUpload, onClose }: { selectedIds: string[]; query: string; onQueryChange: (q: string) => void; sources: PlanningSource[]; onToggle: (id: string) => void; onUpload: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/38 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true">
      <div className="flex max-h-[85vh] w-full max-w-[620px] flex-col rounded-[22px] border border-white/60 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Regulatory Sources</div>
            <h3 className="text-[18px] font-semibold">Attach verified evidence</h3>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-[#eef2ef]" aria-label="Close"><X className="size-4" /></button>
        </div>
        <div className="p-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2 rounded-[12px] border border-[var(--line)] bg-[#fafbf9] px-3 py-2">
            <Search className="size-4 text-[var(--ink-muted)]" />
            <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search FDA labels, trial protocols, brand assets..." className="w-full bg-transparent text-[13.5px] outline-none" />
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {sources.map((source) => {
            const active = selectedIds.includes(source.id);
            return (
              <div key={source.id} className={cn("flex items-center justify-between rounded-[14px] border p-3 transition", active ? "border-[#adc4b8] bg-[#edf5f0]" : "border-[var(--line)] bg-white")}>
                <div className="min-w-0 flex-1 pr-3">
                  <b className="block truncate text-[13.5px] font-semibold">{source.name}</b>
                  <span className="block truncate text-[12px] text-[var(--ink-muted)]">{source.detail}</span>
                </div>
                <Button size="sm" variant={active ? "secondary" : "primary"} onClick={() => onToggle(source.id)} className="shrink-0 text-[12px]">
                  {active ? "Remove" : "Attach"}
                </Button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--line)] p-4">
          <Button variant="secondary" size="sm" onClick={onUpload} className="gap-1.5"><Upload className="size-3.5" /> Upload document</Button>
          <Button size="sm" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
