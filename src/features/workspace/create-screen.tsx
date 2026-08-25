"use client";

import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleCheck,
  Eye,
  FileText,
  Film,
  FlaskConical,
  GitBranch,
  Globe2,
  Info,
  LayoutGrid,
  Link2,
  MonitorPlay,
  Paperclip,
  RotateCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AudienceIcon, ChannelIcon } from "@/components/ui/select-icons";
import { MultiSelectMenu, SelectMenu } from "@/components/ui/select-menu";
import { VideoWizardHeader } from "@/features/workspace/video-wizard-header";
import { deriveContentPlan, isRequestSpecific } from "@/features/workspace/content-plan";
import { defaultDemoScenarioId, demoScenarios, type DemoScenario, type DemoScenarioCategory } from "@/features/workspace/demo-scenarios";
import { planningSources } from "@/features/workspace/mock-data";
import { parseIntendedUses, serializeIntendedUses } from "@/features/workspace/intended-use";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";
import type { Audience, PlanningSource } from "@/types/content";

const audienceOptions: Audience[] = ["HCP", "Patient", "Payer", "Field team", "Consumer"];
const useOptions = ["HCP meeting", "LinkedIn", "Instagram", "YouTube", "Email", "Website", "Congress / event", "Internal presentation"];

export function CreateScreen() {
  const router = useRouter();
  const {
    assetType,
    brief,
    audience,
    market,
    intendedUse,
    selectedSourceIds,
    demoScenarioId,
    setAssetType,
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

  const handleBackHome = () => {
    setView("home");
    router.push("/");
  };
  const [sourceLibraryOpen, setSourceLibraryOpen] = useState(false);
  const [scenarioLibraryOpen, setScenarioLibraryOpen] = useState(false);
  const [sourceQuery, setSourceQuery] = useState("");
  const [clarificationOpen, setClarificationOpen] = useState(false);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [localFiles, setLocalFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSources = planningSources.filter((source) => selectedSourceIds.includes(source.id));
  const requestIsSpecific = isRequestSpecific(brief);
  const filteredSources = useMemo(() => {
    const query = sourceQuery.trim().toLowerCase();
    return query ? planningSources.filter((source) => `${source.name} ${source.detail}`.toLowerCase().includes(query)) : planningSources;
  }, [sourceQuery]);

  const preparePlan = () => {
    if (!requestIsSpecific) {
      setClarificationOpen(true);
      return;
    }
    const plan = deriveContentPlan({ assetType, brief, audience, market, intendedUse, selectedSourceIds });
    setFormat(plan.format);
    setDuration(plan.length);
    setLanguage(plan.language);
    setPresentationMode(plan.presentationMode);
    setVoice(plan.voice);
    setMusic(plan.music);
    setView("directions");
  };

  const loadScenario = (scenario: DemoScenario) => {
    setAssetType(scenario.inputs.assetType);
    setBrief(scenario.inputs.brief);
    setAudience(scenario.inputs.audience);
    setMarket(scenario.inputs.market);
    setIntendedUse(scenario.inputs.intendedUse);
    setSelectedSourceIds(scenario.inputs.selectedSourceIds);
    setDemoScenarioId(scenario.id);
    setClarificationOpen(false);
    setReferenceUrl("");
    setLocalFiles([]);
    setScenarioLibraryOpen(false);
  };

  const creationMode = useWorkspaceStore((s) => s.creationMode);
  const sourceType = useWorkspaceStore((s) => s.sourceType);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);

  const handleBackToSource = () => {
    setVideoSubStage("source-select");
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

  return (
    <div className="page-enter min-h-screen bg-[#f7f8f6] pb-10">
      <VideoWizardHeader
        currentStep={2}
        onBack={handleBackToSource}
        onClose={handleBackHome}
        modeLabel={modeDisplayName}
      />

      <main className="mx-auto w-full max-w-[1280px] px-6 py-7 sm:px-8">
        {/* Standardized Page Heading */}
        <div className="mb-7">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint)] px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-[var(--brand-deep)] border border-[var(--tint-line)]">
              <FileText className="size-3.5 text-[var(--brand)]" /> Step 2 of 3 · Define the Job
            </span>
          </div>
          <h1 className="mt-2.5 text-[28px] font-[800] tracking-tight text-[var(--ink)] sm:text-[34px]">
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
            <button
              type="button"
              onClick={() => setVideoSubStage("mode-select")}
              className="focus-ring rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)]"
            >
              Change
            </button>
          </div>

          <div className="mt-5">
            <label htmlFor="request" className="text-[14px] font-bold">Request and source material</label>
            <div className={cn("squircle-panel mt-2 overflow-hidden border bg-[#fbfcfa] transition focus-within:border-[#9fb4aa] focus-within:ring-3 focus-within:ring-[rgb(37_79_63/8%)]", clarificationOpen ? "border-[#c8892c]" : "border-[#e0e6e2]")}>
              {(selectedSources.length > 0 || localFiles.length > 0 || referenceUrl) && (
                <div className="flex flex-wrap gap-2 border-b border-[var(--line)] bg-white/75 px-3 py-2.5">
                  {selectedSources.map((source) => <SourceChip key={source.id} source={source} onRemove={() => toggleSource(source.id)} />)}
                  {localFiles.map((file) => <AttachmentChip key={file} label={file} onRemove={() => setLocalFiles((files) => files.filter((item) => item !== file))} />)}
                  {referenceUrl && <AttachmentChip label="Reference link" onRemove={() => setReferenceUrl("")} />}
                </div>
              )}
              <textarea id="request" value={brief} onChange={(event) => { setBrief(event.target.value); setClarificationOpen(false); }} rows={4} className="w-full resize-none bg-transparent px-4 py-3.5 text-[16px] leading-6 outline-none placeholder:text-[#8d9892]" placeholder="Example: Create a short HCP launch video focused on the pivotal evidence…" />
              <div aria-hidden={!referenceOpen} inert={!referenceOpen} className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]", referenceOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 border-t border-[var(--line)] bg-white px-3 py-2">
                    <Link2 className="size-4 shrink-0 text-[var(--ink-muted)]" />
                    <input value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} placeholder="Paste a reference link" className="h-9 min-w-0 flex-1 text-[14px] outline-none" autoFocus={referenceOpen} tabIndex={referenceOpen ? 0 : -1} />
                    <button onClick={() => setReferenceOpen(false)} className="focus-ring min-h-9 rounded-lg px-3 text-[13px] font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)]">Done</button>
                  </div>
                </div>
              </div>
              <div className="flex min-h-12 flex-wrap items-center gap-1 border-t border-[var(--line)] bg-white/60 px-2.5 py-1.5">
                <button onClick={() => setSourceLibraryOpen(true)} className="focus-ring flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[13px] font-bold text-[var(--brand)] hover:bg-[var(--brand-soft)]"><Search className="size-4" /> Search library</button>
                <button onClick={() => fileInputRef.current?.click()} className="focus-ring flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[13px] font-semibold text-[var(--ink-muted)] hover:bg-black/5"><Paperclip className="size-4" /> Upload</button>
                <button onClick={() => setReferenceOpen((open) => !open)} className="focus-ring flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[13px] font-semibold text-[var(--ink-muted)] hover:bg-black/5"><Link2 className="size-4" /> Add link</button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => setLocalFiles(Array.from(event.target.files ?? []).map((file) => file.name))} />
                <span className="ml-auto px-2 text-[12px] text-[#747f79]">{brief.length} characters</span>
              </div>
            </div>
          </div>

          {clarificationOpen && (
            <div className="rise-in mt-3 rounded-[13px] border border-[#e5c07d] bg-[var(--warning-soft)] p-4" role="alert">
              <div className="flex items-start gap-3"><Info className="mt-0.5 size-5 shrink-0 text-[var(--warning)]" /><div><div className="text-[14px] font-bold text-[#704b13]">Tell us a little more about the job.</div><p className="mt-1 text-[14px] leading-5 text-[#765b31]">What should this {assetType} accomplish? A short sentence is enough.</p></div></div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Introduce the product", "Explain the mechanism", "Present clinical evidence", "Educate patients"].map((suggestion) => <button key={suggestion} onClick={() => { setBrief(`${suggestion} for ${audience === "HCP" ? "healthcare professionals" : audience.toLowerCase()} using the approved source material.`); setClarificationOpen(false); }} className="focus-ring min-h-10 rounded-[9px] border border-[#dfc493] bg-white px-3 text-[13px] font-bold text-[#704b13] hover:bg-[#fffaf0]">{suggestion}</button>)}
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Who is it for?" icon={Users}>
              <SelectMenu value={audience} onChange={(value) => setAudience(value as Audience)} options={audienceOptions} ariaLabel="Who is it for?" renderIcon={(value) => <AudienceIcon value={value} />} />
            </Field>
            <Field label="Where will it be used?" icon={MonitorPlay}>
              <MultiSelectMenu values={parseIntendedUses(intendedUse)} onChange={(values) => setIntendedUse(serializeIntendedUses(values))} options={useOptions} ariaLabel="Where will it be used?" renderIcon={(value) => <ChannelIcon value={value} />} />
            </Field>
          </div>
        </section>

        <aside className="rise-in opacity-[.82] transition-opacity duration-300 hover:opacity-100 [animation-delay:70ms]">
          <div className="lg:sticky lg:top-5">
          <div className="squircle-card flex min-h-[500px] flex-col overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
            <div className="border-b border-[var(--line)] p-5">
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Available context</div>
              <h2 className="mt-1 text-[20px] font-bold tracking-[-0.02em]">{sourceDisplayName} · {market}</h2>
              <p className="mt-2 text-[14px] leading-5 text-[var(--ink-muted)]">
                {sourceType === "dossier"
                  ? "Grounding statements and citations in the approved 18-section brand dossier."
                  : sourceType === "url"
                  ? `Clinical statements extracted and linked to ${sourcePayload.url || "source link"}.`
                  : "Using custom notes as the message boundary."}
              </p>
            </div>
            <div className="p-5">
              {creationMode === "magic-avatar" ? (
                <ContextItem icon={Users} title="Presenter Digital Twin" detail="Dr. Maya Kapoor (Dermatology Specialist) pre-configured." />
              ) : (
                <ContextItem icon={Film} title="Cinematic Scene Engine" detail="Scene storyboard with clinical graph animations & MoA visuals." />
              )}
              <ContextItem icon={BookOpenCheck} title={sourceType === "dossier" ? "214 approved claims" : "Evidence coverage"} detail={sourceType === "dossier" ? "All statements cited against FDA/EMA approved label." : "Grounding verified from attached source."} />
              <ContextItem icon={ShieldCheck} title="Brand kit applied" detail="Logo, packshot, typography and fair balance." />
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <label className="text-[13px] font-bold text-[var(--ink-muted)]" htmlFor="market">Market from source</label>
                <SelectMenu value={market} onChange={setMarket} options={["United States", "India", "European Union", "United Kingdom", "Global / multiple markets"]} ariaLabel="Market from source" className="mt-1.5" renderIcon={() => <Globe2 className="size-[17px]" />} />
              </div>
            </div>
            <div className="mt-auto border-t border-[var(--line)] bg-[#f7f9f7] px-5 py-4 text-[13px] leading-5 text-[var(--ink-muted)]">The next screen will show one recommended plan and only the decisions that materially change the first draft.</div>
          </div>
          <Button onClick={preparePlan} size="lg" className="group mt-3 h-[60px] w-full px-8 text-[16px] shadow-[0_10px_26px_rgb(21_61_46/22%)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgb(21_61_46/25%)]">Prepare content plan <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></Button>
          <div className="mt-3 flex items-center justify-center gap-2 text-[12.5px] text-[var(--ink-muted)]"><ShieldCheck className="size-4 text-[var(--brand)]" /><span>Nothing is created until you confirm the plan.</span></div>
          </div>
        </aside>
        </div>
      </main>

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
      <div className="scenario-drawer flex h-full w-full max-w-[500px] flex-col border-l border-white/50 bg-[#f7f9f7] shadow-[var(--shadow-lg)]">
        <div className="flex items-start justify-between border-b border-[var(--line)] bg-white p-5">
          <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[var(--brand-soft)] text-[var(--brand)]"><FlaskConical className="size-5" /></span><div><div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Prototype controls</div><h2 className="mt-1 text-[24px] font-bold tracking-[-0.03em]">Choose a demo case</h2><p className="mt-1 text-[14px] leading-5 text-[var(--ink-muted)]">Each case fills Screen 1, then the real decision engine derives Screen 2.</p></div></div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close demo cases"><X className="size-5" /></Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {categories.map((category) => {
            const Icon = scenarioCategoryIcons[category];
            return <section key={category} className="mb-5"><div className="mb-2 flex items-center gap-2 px-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#68756e]"><Icon className="size-4 text-[var(--brand)]" />{category}</div><div className="space-y-2">{demoScenarios.filter((scenario) => scenario.category === category).map((scenario) => {
              const selected = scenario.id === currentScenarioId;
              return <button key={scenario.id} onClick={() => onSelect(scenario)} className={cn("focus-ring group w-full rounded-[13px] border bg-white p-3.5 text-left transition hover:-translate-y-px hover:shadow-sm", selected ? "border-[var(--brand)] shadow-[0_0_0_1px_var(--brand)]" : "border-[var(--line)] hover:border-[var(--line-strong)]")}><div className="flex items-start gap-3"><span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition", selected ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--line-strong)] bg-[#f8faf8] text-transparent group-hover:border-[var(--brand)]")}>{selected && <Check className="size-4" />}</span><span className="min-w-0 flex-1"><span className="block text-[15px] font-bold">{scenario.label}</span><span className="mt-0.5 block text-[13px] leading-5 text-[var(--ink-muted)]">{scenario.description}</span><span className="mt-2 flex items-start gap-1.5 rounded-[8px] bg-[#f4f7f4] px-2.5 py-2 text-[12px] font-semibold leading-4 text-[#56635c]"><GitBranch className="mt-0.5 size-3.5 shrink-0 text-[var(--brand)]" />{scenario.expected}</span></span></div></button>;
            })}</div></section>;
          })}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--line)] bg-white p-4"><button onClick={onReset} className="focus-ring flex min-h-10 items-center gap-2 rounded-lg px-3 text-[13px] font-bold text-[var(--ink-muted)] hover:bg-black/5"><RotateCcw className="size-4" /> Reset default</button><span className="text-[12px] font-semibold text-[var(--ink-muted)]">{demoScenarios.length} cases</span></div>
      </div>
    </div>
  );
}

function SourceLibraryModal({ selectedIds, query, onQueryChange, sources, onToggle, onUpload, onClose }: { selectedIds: string[]; query: string; onQueryChange: (value: string) => void; sources: PlanningSource[]; onToggle: (id: string) => void; onUpload: () => void; onClose: () => void }) {
  const [previewSource, setPreviewSource] = useState<PlanningSource | null>(null);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search content library">
      <div className="squircle-card rise-in w-full max-w-[920px] overflow-hidden border border-white/50 bg-white shadow-[var(--shadow-lg)]">
        <div className="flex items-start justify-between border-b border-[var(--line)] p-5 sm:px-6"><div><div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--brand)]">SwishX library</div><h2 className="mt-1 text-[23px] font-semibold tracking-[-0.03em]">Add source material</h2><p className="mt-1 text-[14px] text-[var(--ink-muted)]">Choose dossiers, claims, brand material or an existing asset.</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close source library"><X className="size-5" /></Button></div>
        <div className="border-b border-[var(--line)] p-4 sm:px-6"><div className="flex h-12 items-center gap-3 rounded-[14px] border border-[#e0e6e2] bg-[#fcfdfc] px-3.5 transition focus-within:border-[#a9bdb3] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgb(37_79_63/7%)]"><Search className="size-[18px] text-[var(--ink-muted)]" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" placeholder="Search dossiers, claims and assets" autoFocus /></div></div>
        <div className={cn("grid min-h-0", previewSource && "md:grid-cols-[minmax(0,1fr)_310px]")}>
          <div className="max-h-[410px] space-y-2 overflow-y-auto p-4 sm:px-6">
            {sources.map((source) => {
              const selected = selectedIds.includes(source.id);
              return (
                <div key={source.id} className={cn("group flex min-h-[70px] items-center rounded-[14px] border transition", selected ? "border-[#bfd0c7] bg-[#f3f8f5]" : "border-[#e5e9e6] bg-white hover:border-[#d0dad5] hover:shadow-[0_3px_12px_rgb(19_31_26/4%)]")}>
                  <button type="button" onClick={() => onToggle(source.id)} className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-l-[14px] p-3 text-left">
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-[11px]", source.kind === "reference" ? "bg-[#f4f0ea] text-[#8a623e]" : "bg-[#f5ece8] text-[#9a5645]")}><FileText className="size-[18px]" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{source.name}</span><span className="mt-0.5 block truncate text-[12.5px] text-[var(--ink-muted)]">{source.detail}</span></span>
                  </button>
                  <button type="button" onClick={() => setPreviewSource(source)} className="focus-ring mr-1 flex min-h-10 items-center gap-1.5 rounded-[10px] px-2.5 text-[12.5px] font-medium text-[var(--brand)] opacity-80 transition hover:bg-white hover:opacity-100" aria-label={`View ${source.name}`}><Eye className="size-4" /><span className="hidden sm:inline">View</span></button>
                  <button type="button" onClick={() => onToggle(source.id)} className="focus-ring mr-3 grid size-9 shrink-0 place-items-center rounded-full" aria-label={`${selected ? "Remove" : "Attach"} ${source.name}`}><span className={cn("grid size-6 place-items-center rounded-full border transition", selected ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[#d6ddd9] bg-white group-hover:border-[#aebdb5]")}>{selected && <Check className="size-4" />}</span></button>
                </div>
              );
            })}
          </div>
          {previewSource && (
            <aside className="select-pop border-t border-[var(--line)] bg-[#fafcfb] p-5 md:border-l md:border-t-0">
              <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-[13px] bg-white text-[var(--brand)] shadow-sm"><BookOpenCheck className="size-5" /></span><button type="button" onClick={() => setPreviewSource(null)} className="focus-ring grid size-9 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-white" aria-label="Close source preview"><X className="size-4" /></button></div>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.11em] text-[var(--brand)]">Source preview</div>
              <h3 className="mt-1 text-[18px] font-semibold leading-6 tracking-[-0.02em]">{previewSource.name}</h3>
              <p className="mt-1 text-[13px] leading-5 text-[var(--ink-muted)]">{previewSource.detail}</p>
              <div className="mt-5 rounded-[14px] border border-[#e5eae7] bg-white p-4"><div className="text-[12px] font-semibold text-[#65716b]">How SwishX will use it</div><p className="mt-1.5 text-[13px] leading-5 text-[var(--ink)]">{sourceUsage(previewSource)}</p></div>
              <div className="mt-4 flex items-center gap-2 text-[12.5px] text-[var(--ink-muted)]"><ShieldCheck className="size-4 text-[var(--brand)]" /> Its approval status remains visible in the plan.</div>
            </aside>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--line)] bg-[#f7f9f7] p-4"><button onClick={onUpload} className="focus-ring flex min-h-10 items-center gap-2 rounded-lg px-3 text-[13px] font-bold text-[var(--brand)] hover:bg-[var(--brand-soft)]"><Upload className="size-4" /> Upload instead</button><Button onClick={onClose}>Done · {selectedIds.length} attached</Button></div>
      </div>
    </div>
  );
}

function sourceUsage(source: PlanningSource) {
  if (source.kind === "claims") return "Use approved claims and citations as the evidence boundary for messages in the draft.";
  if (source.kind === "brand") return "Apply the current logo, product imagery, typography and required fair-balance treatment.";
  if (source.kind === "approved-source") return "Ground product, mechanism, efficacy and safety statements in this approved source.";
  return "Treat this as supporting context. Any unapproved statement remains visibly flagged for review.";
}
