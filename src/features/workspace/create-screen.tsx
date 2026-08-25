"use client";

import {
  ArrowRight,
  BookOpenCheck,
  CircleCheck,
  FileText,
  Film,
  FlaskConical,
  GitBranch,
  Globe2,
  Info,
  Layers,
  LayoutGrid,
  MonitorPlay,
  Paperclip,
  Search,
  ShieldCheck,
  Target,
  TriangleAlert,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChannelIcon } from "@/components/ui/select-icons";
import { MultiSelectMenu, SelectMenu } from "@/components/ui/select-menu";
import { VideoWizardHeader } from "@/features/workspace/video-wizard-header";
import { deriveContentPlan, isRequestSpecific } from "@/features/workspace/content-plan";
import { defaultDemoScenarioId, demoScenarios, type DemoScenario, type DemoScenarioCategory } from "@/features/workspace/demo-scenarios";
import { planningSources } from "@/features/workspace/mock-data";
import { parseIntendedUses, serializeIntendedUses } from "@/features/workspace/intended-use";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";
import type { PlanningSource } from "@/types/content";

const useOptions = ["HCP meeting", "LinkedIn", "Instagram", "YouTube", "Email", "Website", "Congress / event", "Internal presentation"];

export function CreateScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
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

  const uses = useMemo(() => parseIntendedUses(intendedUse), [intendedUse]);

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
    setView("directions");
    setVideoSubStage("directions");
  };

  const handleBackHome = () => {
    setView("home");
    router.push("/");
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
      ? "MagicReel™ · Short Video"
      : creationMode === "magic-avatar"
      ? "MagicAvatar™ · Digital Twin"
      : "Custom Video · Scratch";

  const sourceDisplayName =
    sourceType === "dossier"
      ? `${sourcePayload.dossierId === "onkavia" ? "Onkavia" : sourcePayload.dossierId === "nirvexa" ? "Nirvexa" : "Velmora"} Dossier`
      : sourceType === "url"
      ? "Web / Study Link"
      : "Custom Plain Text";

  const content = (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-7 sm:px-8">
      {/* Standardized Page Heading (No Badge) */}
      <div className="mb-7">
        <h1 className="text-[28px] font-[800] tracking-tight text-[var(--ink)] sm:text-[34px]">
          Define the video brief
        </h1>
        <p className="mt-1 text-[15px] text-[var(--ink-3)]">
          Describe what you want to communicate. SwishX will synthesize the script, visual scenes, and regulatory citations.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="squircle-card rise-in border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
          {/* Active Engine Indicator Pill */}
          <div className="flex items-center justify-between rounded-[14px] border border-[var(--line)] bg-[#fafbf9] p-3.5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-[11px] bg-[var(--brand)] text-white shadow-sm">
                <Film className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <b className="text-[14.5px] font-bold text-[var(--ink)]">{modeDisplayName}</b>
                  <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--brand)]">
                    Selected Engine
                  </span>
                </div>
                <span className="text-[12px] text-[var(--ink-muted)]">
                  {creationMode === "magic-reel"
                    ? "30–180s cinematic video with medical scenes, graphics & citations"
                    : creationMode === "magic-avatar"
                    ? "30–90s lip-synced presenter video with clinical slide overlays"
                    : "Open custom prompt & duration"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label htmlFor="content-brief" className="text-[14px] font-bold">What are you creating?</label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setScenarioLibraryOpen(true)} className="text-[12.5px] font-medium text-[var(--brand)]">
                  <FlaskConical className="size-3.5" /> Sample briefs
                </Button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="focus-ring flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-medium text-[var(--ink-muted)] hover:bg-[#f2f4f2] hover:text-[var(--ink)]">
                  <Paperclip className="size-3.5" /> Attach material
                </button>
              </div>
            </div>

            <textarea
              id="content-brief"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              rows={4}
              placeholder="e.g. Create a 60-second HCP explainer explaining why Velmora was developed, showing the dual-inhibition mechanism, and proving 24% relative risk reduction from CLARITY-CV."
              className="mt-2.5 w-full rounded-[14px] border border-[var(--line)] bg-[#fafbf9] p-3.5 text-[14.5px] leading-6 outline-none transition-[border-color,background-color] duration-200 focus:border-[var(--brand)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-soft)]"
            />

            {clarificationOpen && (
              <div className="mt-3 rounded-[13px] border border-[#f0cfa0] bg-[#fffbf2] p-3.5 text-[13px] text-[#78531d]">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 size-4 shrink-0 text-[#b57314]" />
                  <div>
                    <b>Add a little more detail before continuing.</b>
                    <p className="mt-0.5 leading-5 text-[#8c672e]">Mention the topic, disease state, evidence point, or launch objective so SwishX can recommend an appropriate storyboard structure.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attached Files & Sources */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold text-[var(--ink-muted)]">Active Context:</span>
            <span className="squircle-control flex min-h-9 items-center gap-2 bg-[var(--tint)] px-2.5 text-[12.5px] font-bold text-[var(--brand-deep)] border border-[var(--tint-line)]">
              <ShieldCheck className="size-4 text-[var(--brand)]" />
              {sourceDisplayName}
            </span>
            <span className="squircle-control flex min-h-9 items-center gap-1.5 bg-[#f4f5f3] px-2.5 text-[12px] font-semibold text-[var(--ink)] border border-[var(--hair-2)]">
              <Users className="size-3.5 text-[var(--brand)]" />
              {audience}
            </span>
            <span className="squircle-control flex min-h-9 items-center gap-1.5 bg-[#f4f5f3] px-2.5 text-[12px] font-semibold text-[var(--ink)] border border-[var(--hair-2)]">
              <Target className="size-3.5 text-[var(--brand)]" />
              {goal}
            </span>
            <span className="squircle-control flex min-h-9 items-center gap-1.5 bg-[#f4f5f3] px-2.5 text-[12px] font-semibold text-[var(--ink)] border border-[var(--hair-2)]">
              <Layers className="size-3.5 text-[var(--brand)]" />
              {topics.length} topics
            </span>
            {selectedSources.map((source) => (
              <SourceChip key={source.id} source={source} onRemove={() => toggleSource(source.id)} />
            ))}
            {localFiles.map((file) => (
              <AttachmentChip key={file} label={file} onRemove={() => removeAttachment(file)} />
            ))}
          </div>

          <div className="mt-7 border-t border-[var(--line)] pt-6">
            <Field label="Intended channel / format" icon={MonitorPlay}>
              <MultiSelectMenu values={uses} onChange={(next) => setIntendedUse(serializeIntendedUses(next))} options={useOptions} ariaLabel="Intended channel / format" renderIcon={(item) => <ChannelIcon value={item} />} />
            </Field>
          </div>

          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
        </section>

        {/* Right Sidebar: Grounding Context */}
        <aside className="rise-in [animation-delay:80ms]">
          <div className="squircle-card overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
            <div className="border-b border-[var(--line)] bg-[#fafbf9] px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Available Context</span>
                <span className="rounded-full bg-[var(--ok-bg)] px-2 py-0.5 text-[11px] font-bold text-[var(--ok)]">
                  Grounding active
                </span>
              </div>
              <h2 className="mt-1 text-[18px] font-bold tracking-tight text-[var(--ink)]">{sourceDisplayName}</h2>
            </div>
            <div className="p-5 space-y-4">
              <ContextItem icon={Users} title={`Audience & Goal: ${audience}`} detail={`Campaign objective: ${goal}`} />
              <ContextItem icon={Layers} title={`Focus Topics (${topics.length})`} detail={topics.join(" · ")} />
              <ContextItem icon={BookOpenCheck} title={sourceType === "dossier" ? "214 approved claims" : "Evidence coverage"} detail={sourceType === "dossier" ? "All statements cited against FDA/EMA approved label." : "Grounding verified from attached source."} />
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <label className="text-[13px] font-bold text-[var(--ink-muted)]" htmlFor="market">Market from source</label>
                <SelectMenu value={market} onChange={setMarket} options={["United States", "India", "European Union", "United Kingdom", "Global / multiple markets"]} ariaLabel="Market from source" className="mt-1.5" renderIcon={() => <Globe2 className="size-[17px]" />} />
              </div>
            </div>
            <div className="mt-auto border-t border-[var(--line)] bg-[#f7f9f7] px-5 py-4 text-[12.5px] leading-5 text-[var(--ink-muted)]">
              Parameters from Step 1 are locked into this brief. The next screen will show the recommended content plan.
            </div>
          </div>

          <Button
            onClick={preparePlan}
            size="lg"
            className="group mt-3.5 h-[52px] w-full px-8 rounded-[14px] text-[15px] font-bold shadow-md bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>Prepare content plan</span>
            <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[12.5px] text-[var(--ink-muted)]">
            <ShieldCheck className="size-4 text-[var(--brand)]" />
            <span>Nothing is created until you confirm the plan.</span>
          </div>
        </aside>
      </div>
    </main>
  );

  if (embedded) {
    return (
      <div className="page-enter pb-10">
        {content}
        {sourceLibraryOpen && <SourceLibraryModal selectedIds={selectedSourceIds} query={sourceQuery} onQueryChange={setSourceQuery} sources={filteredSources} onToggle={toggleSource} onUpload={() => { setSourceLibraryOpen(false); fileInputRef.current?.click(); }} onClose={() => setSourceLibraryOpen(false)} />}
        {scenarioLibraryOpen && <DemoScenarioDrawer currentScenarioId={demoScenarioId} onSelect={loadScenario} onReset={() => loadScenario(demoScenarios.find((scenario) => scenario.id === defaultDemoScenarioId) ?? demoScenarios[0])} onClose={() => setScenarioLibraryOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen bg-[#f7f8f6] pb-10">
      <VideoWizardHeader
        currentStep={2}
        onBack={handleBackToSource}
        onClose={handleBackHome}
      />
      {content}
      {sourceLibraryOpen && <SourceLibraryModal selectedIds={selectedSourceIds} query={sourceQuery} onQueryChange={setSourceQuery} sources={filteredSources} onToggle={toggleSource} onUpload={() => { setSourceLibraryOpen(false); fileInputRef.current?.click(); }} onClose={() => setSourceLibraryOpen(false)} />}
      {scenarioLibraryOpen && <DemoScenarioDrawer currentScenarioId={demoScenarioId} onSelect={loadScenario} onReset={() => loadScenario(demoScenarios.find((scenario) => scenario.id === defaultDemoScenarioId) ?? demoScenarios[0])} onClose={() => setScenarioLibraryOpen(false)} />}
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof Users; children: React.ReactNode }) {
  return <div><span className="mb-1.5 flex items-center gap-2 text-[14px] font-semibold text-[var(--ink-muted)]"><Icon className="size-4 text-[var(--brand)]" />{label}</span>{children}</div>;
}

function SourceChip({ source, onRemove }: { source: PlanningSource; onRemove: () => void }) {
  const approved = source.status === "current" && source.kind !== "reference";
  const color = source.kind === "brand" ? "bg-[#eaf2ed] text-[#355f4e]" : source.kind === "claims" ? "bg-[#eef1f7] text-[#4f5f78]" : source.kind === "reference" ? "bg-[#f3eee8] text-[#705f4d]" : "bg-[#f5ece8] text-[#775548]";
  return <span className={cn("squircle-control flex min-h-9 max-w-full items-center gap-2 px-2.5 text-[13px] font-medium", color)}><FileText className="size-4 shrink-0 opacity-75" /><span className="max-w-[210px] truncate">{source.name}</span>{approved && <span className="rounded-full bg-white/65 px-1.5 py-0.5 text-[10.5px] font-semibold opacity-80">Current</span>}<button onClick={onRemove} className="focus-ring grid size-6 shrink-0 place-items-center rounded-full opacity-60 transition hover:bg-white/70 hover:opacity-100" aria-label={`Remove ${source.name}`}><X className="size-3.5" /></button></span>;
}

function AttachmentChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <span className="squircle-control flex min-h-9 items-center gap-2 bg-[#edf1f4] px-2.5 text-[13px] font-medium text-[#52616a]"><Paperclip className="size-4 opacity-75" /><span className="max-w-[180px] truncate">{label}</span><button onClick={onRemove} className="focus-ring grid size-6 place-items-center rounded-full opacity-60 transition hover:bg-white/70 hover:opacity-100" aria-label={`Remove ${label}`}><X className="size-3.5" /></button></span>;
}

function ContextItem({ icon: Icon, title, detail }: { icon: typeof ShieldCheck; title: string; detail: string }) {
  return <div className="mb-4 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[var(--brand-soft)] text-[var(--brand)]"><Icon className="size-4" /></span><span><span className="block text-[14px] font-semibold">{title}</span><span className="mt-0.5 block text-[13px] leading-5 text-[var(--ink-muted)]">{detail}</span></span></div>;
}

const scenarioCategoryIcons: Record<DemoScenarioCategory, typeof CircleCheck> = {
  "Happy paths": CircleCheck,
  "Dynamic branches": GitBranch,
  "Missing information": TriangleAlert,
  "Source and market": Globe2,
  "Other formats": LayoutGrid,
};

function DemoScenarioDrawer({ currentScenarioId, onSelect, onReset, onClose }: { currentScenarioId: string; onSelect: (scenario: DemoScenario) => void; onReset: () => void; onClose: () => void }) {
  const categories = [...new Set(demoScenarios.map((scenario) => scenario.category))];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#10231c]/38 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Demo cases">
      <div className="slide-left flex h-full w-full max-w-[440px] flex-col border-l border-white/50 bg-[#fafbfa] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Demo Library</div>
            <h3 className="text-[17px] font-semibold">Test cases</h3>
          </div>
          <button onClick={onClose} className="focus-ring grid size-8 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-[#eef2ef] hover:text-[var(--ink)]" aria-label="Close demo cases"><X className="size-4" /></button>
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
                <div className="space-y-2">
                  {list.map((scenario) => {
                    const active = scenario.id === currentScenarioId;
                    return (
                      <button key={scenario.id} onClick={() => onSelect(scenario)} className={cn("focus-ring block w-full rounded-[14px] border p-3 text-left transition hover:-translate-y-px hover:shadow-sm", active ? "border-[#adc4b8] bg-[#eef5f1]" : "border-[var(--line)] bg-white hover:border-[#ccd7d1]")}>
                        <div className="flex items-center justify-between">
                          <b className="text-[13.5px] font-semibold text-[var(--ink)]">{scenario.label}</b>
                          {active && <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-white">Active</span>}
                        </div>
                        <p className="mt-1 text-[12.5px] leading-5 text-[var(--ink-muted)]">{scenario.description}</p>
                      </button>
                    );
                  })}
                </div>
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/38 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Evidence library">
      <div className="select-pop flex max-h-[85vh] w-full max-w-[620px] flex-col rounded-[22px] border border-white/60 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Regulatory Sources</div>
            <h3 className="text-[18px] font-semibold">Attach verified evidence</h3>
          </div>
          <button onClick={onClose} className="focus-ring grid size-8 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-[#eef2ef] hover:text-[var(--ink)]" aria-label="Close evidence library"><X className="size-4" /></button>
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
