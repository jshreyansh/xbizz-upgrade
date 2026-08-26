"use client";

import {
  ArrowRight,
  Check,
  Plus,
  Sparkles,
  Users,
  Target,
  Layers,
  Activity,
  Pill,
  ShieldAlert,
  HelpCircle,
  Zap,
  ShieldCheck,
  FlaskConical,
  MonitorPlay,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudienceIcon } from "@/components/ui/select-icons";
import { MultiSelectMenu, SelectMenu } from "@/components/ui/select-menu";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";
import type { Audience } from "@/types/content";

interface DossierItem {
  id: string;
  name: string;
  molecule: string;
  market: string;
  sections: number;
  claims: number;
  heldOut: number;
  avatarBg: string;
  skeletonWidths: number[];
  isSample?: boolean;
}

const DOSSIERS: DossierItem[] = [
  {
    id: "velmora",
    name: "Velmora",
    molecule: "tirzelamide",
    market: "🇺🇸 US · FDA",
    sections: 18,
    claims: 214,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
    skeletonWidths: [88, 72, 94, 60, 80],
  },
  {
    id: "onkavia",
    name: "Onkavia",
    molecule: "relunocitinib",
    market: "🇪🇺 EU · EMA",
    sections: 19,
    claims: 188,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#22c07a,#12784a)",
    skeletonWidths: [92, 65, 84, 55, 78],
  },
  {
    id: "nirvexa",
    name: "Nirvexa",
    molecule: "brentaxaban",
    market: "🇬🇧 UK · MHRA",
    sections: 16,
    claims: 142,
    heldOut: 2,
    avatarBg: "linear-gradient(140deg,#9b6bff,#5b21b6)",
    skeletonWidths: [80, 88, 60, 90, 70],
  },
  {
    id: "cardioxa",
    name: "Cardioxa",
    molecule: "levomilnacipran ER",
    market: "🇺🇸 US · FDA",
    sections: 17,
    claims: 165,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#f59e0b,#d97706)",
    skeletonWidths: [85, 70, 90, 65, 75],
    isSample: true,
  },
  {
    id: "pulmovax",
    name: "PulmoVax",
    molecule: "albuterol / budesonide",
    market: "🌐 Global · WHO",
    sections: 21,
    claims: 230,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#ec4899,#be185d)",
    skeletonWidths: [90, 80, 75, 88, 68],
    isSample: true,
  },
];

const AUDIENCE_OPTIONS: Audience[] = ["HCP", "Patient", "Payer", "Field team", "Consumer"];
const GOAL_OPTIONS = ["New Launch", "Awareness", "Retention"];
const TOPIC_OPTIONS = [
  "Product Introduction",
  "Mechanism of Action",
  "Indications",
  "Dosage & Safety",
  "Drug Interactions",
  "Side Effects",
];

const topicIcons: Record<string, typeof Pill> = {
  "Product Introduction": Pill,
  "Mechanism of Action": Activity,
  "Indications": Target,
  "Dosage & Safety": ShieldAlert,
  "Drug Interactions": Zap,
  "Side Effects": HelpCircle,
};

export function MagicVideoSourceScreen({ embedded = false }: { embedded?: boolean }) {
  const audience = useWorkspaceStore((s) => s.audience);
  const setAudience = useWorkspaceStore((s) => s.setAudience);
  const topics = useWorkspaceStore((s) => s.topics);
  const setTopics = useWorkspaceStore((s) => s.setTopics);
  const creationMode = useWorkspaceStore((s) => s.creationMode);
  const brief = useWorkspaceStore((s) => s.brief);
  const setBrief = useWorkspaceStore((s) => s.setBrief);
  const setSelectedSourceIds = useWorkspaceStore((s) => s.setSelectedSourceIds);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);
  const format = useWorkspaceStore((s) => s.format);
  const setFormat = useWorkspaceStore((s) => s.setFormat);
  const selectedDossierId = sourcePayload.dossierId || "velmora";
  const activeDossier = DOSSIERS.find((d) => d.id === selectedDossierId) || DOSSIERS[0];

  // Mandatory Validation Checks
  const isAudienceValid = Boolean(audience);
  const isTopicsValid = topics.length > 0;
  const isDossierValid = Boolean(selectedDossierId);
  const canContinue = isAudienceValid && isTopicsValid && isDossierValid;

  const handleSelectDossier = (dossierId: string) => {
    setSourcePayload({ dossierId });
  };

  const handleContinueToBrief = () => {
    if (!canContinue) return;
    const dossierId = sourcePayload.dossierId || "velmora";
    setSourcePayload({ dossierId });
    setSelectedSourceIds(["dermora-core", "dermora-claims", "dermora-brand"]);
    if (!brief || brief.length < 10) {
      if (creationMode === "magic-reel") {
        setBrief(`Create a concise ${activeDossier.name} HCP launch video explaining clinical need, mechanism, and pivotal risk reduction.`);
      } else if (creationMode === "magic-avatar") {
        setBrief(`Create a presenter-led clinical briefing video with Dr. Maya Kapoor highlighting the key trial readouts from the ${activeDossier.name} dossier.`);
      }
    }
    setVideoSubStage("intake");
    setView("create");
  };

  const handleBackToMode = () => {
    setVideoSubStage("mode-select");
  };

  const handleClose = () => {
    setView("home");
  };

  const brandDossiers = DOSSIERS.filter((d) => !d.isSample);
  const sampleDossiers = DOSSIERS.filter((d) => d.isSample);

  const content = (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-6 sm:px-8">
      {/* Standardized 2-Column Layout with Top-Pinned Sticky Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start w-full">
        {/* Left Column: Brand Dossiers & Sample Dossiers */}
        <section className="squircle-card min-w-0 w-full border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6 space-y-6">
            {/* Group 1: Workspace Brand Dossiers */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-[var(--brand)] text-white text-[11px] font-bold">1</span>
                  <h2 className="text-[15.5px] font-bold text-[var(--ink)]">Your Brand Dossiers</h2>
                  <span className="text-[11px] font-semibold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                    Mandatory Selection
                  </span>
                </div>
                <span className="text-[12px] font-bold text-[var(--ok)] hidden sm:inline-block">
                  ✓ 100% label verified
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {brandDossiers.map((d) => {
                  const isSelected = selectedDossierId === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDossier(d.id)}
                      className={`relative flex flex-col rounded-[20px] border p-4 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--tint)] ring-2 ring-[var(--brand)] ring-offset-2 shadow-md"
                          : "border-[var(--hair-2)] bg-[#fafbf9] hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[17px] font-[800] tracking-tight text-[var(--ink)] leading-tight">{d.name}</h3>
                          <span className="text-[12px] italic text-[var(--ink-3)] font-medium mt-0.5 block">{d.molecule}</span>
                        </div>
                        <span
                          className={`grid size-5 place-items-center rounded-full border transition ${
                            isSelected
                              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                              : "border-[var(--hair-3)] bg-white"
                          }`}
                        >
                          {isSelected && <Check className="size-3" strokeWidth={3.5} />}
                        </span>
                      </div>

                      <div className="mt-3.5 rounded-[12px] bg-black/[0.03] p-2.5 border border-black/[0.04]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--ink-3)] mb-1.5">
                          <span>Brand Dossier</span>
                          <span>{d.sections} sections</span>
                        </div>
                        <div className="space-y-1.5">
                          {d.skeletonWidths.map((w, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <div className="h-1.5 rounded-full bg-black/10" style={{ width: `${w}%` }} />
                              <sup className="text-[8.5px] font-bold text-[var(--brand)]">[{i + 1}]</sup>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between border-t border-[var(--hair)] pt-2.5 text-[11.5px]">
                        <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-[var(--ink-2)] border border-[var(--hair-2)]">
                          {d.market}
                        </span>
                        <span className="font-bold text-[var(--ok)]">{d.claims} claims</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Sample Dossiers by SwishX */}
            <div className="border-t border-[var(--hair)] pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-4 text-[var(--brand)]" />
                  <h2 className="text-[15px] font-bold text-[var(--ink)]">Sample Dossiers by SwishX</h2>
                  <span className="text-[10.5px] font-bold text-[#b45309] bg-[#fef3c7] px-2 py-0.5 rounded-full border border-[#fde68a]">
                    Ready to test
                  </span>
                </div>
                <span className="text-[12px] text-[var(--ink-muted)] font-medium">Pre-loaded clinical evidence</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {sampleDossiers.map((d) => {
                  const isSelected = selectedDossierId === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDossier(d.id)}
                      className={`relative flex flex-col rounded-[20px] border p-4 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--tint)] ring-2 ring-[var(--brand)] ring-offset-2 shadow-md"
                          : "border-[var(--hair-2)] bg-[#fafbf9] hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[17px] font-[800] tracking-tight text-[var(--ink)] leading-tight">{d.name}</h3>
                            <span className="rounded-full bg-[#fef3c7] text-[#92400e] px-2 py-0.5 text-[10px] font-bold border border-[#fde68a]">
                              Sample
                            </span>
                          </div>
                          <span className="text-[12px] italic text-[var(--ink-3)] font-medium mt-0.5 block">{d.molecule}</span>
                        </div>
                        <span
                          className={`grid size-5 place-items-center rounded-full border transition ${
                            isSelected
                              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                              : "border-[var(--hair-3)] bg-white"
                          }`}
                        >
                          {isSelected && <Check className="size-3" strokeWidth={3.5} />}
                        </span>
                      </div>

                      <div className="mt-3.5 rounded-[12px] bg-black/[0.03] p-2.5 border border-black/[0.04]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--ink-3)] mb-1.5">
                          <span>Curated Clinical Sample</span>
                          <span>{d.sections} sections</span>
                        </div>
                        <div className="space-y-1.5">
                          {d.skeletonWidths.map((w, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <div className="h-1.5 rounded-full bg-black/10" style={{ width: `${w}%` }} />
                              <sup className="text-[8.5px] font-bold text-[var(--brand)]">[{i + 1}]</sup>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between border-t border-[var(--hair)] pt-2.5 text-[11.5px]">
                        <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-[var(--ink-2)] border border-[var(--hair-2)]">
                          {d.market}
                        </span>
                        <span className="font-bold text-[var(--ok)]">{d.claims} claims cited</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Custom Dossier */}
            <div className="flex items-center justify-between rounded-[16px] border border-[var(--hair-2)] bg-[#fafbf9] p-3 text-[12.5px] text-[var(--ink-3)]">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--brand)] shrink-0" />
                <span>Need a dossier for another molecule? Synthesize a new one from FDA / EMA labels.</span>
              </div>
              <Button variant="ghost" size="sm" className="font-bold text-[var(--brand)] text-[12px] h-7 shrink-0">
                <Plus className="size-3 mr-1" /> New Dossier
              </Button>
            </div>
          </section>

        {/* Right Column: Sticky Mandatory Dropdowns Form (Fixed to Top) */}
        <aside className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-[76px] self-start">
          <div className="squircle-card overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
            {/* Header */}
            <div className="border-b border-[var(--line)] bg-[#fafbf9] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Configuration</span>
                <span className="rounded-full bg-[var(--ok-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--ok)]">
                  Mandatory
                </span>
              </div>
              <h2 className="mt-0.5 text-[16px] font-bold tracking-tight text-[var(--ink)]">
                {activeDossier.name} Dossier
              </h2>
            </div>

            {/* Dropdowns Form */}
            <div className="p-6 space-y-6">
              {/* 1. Output Frame / Aspect Ratio */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--ink-2)] tracking-tight">
                  <MonitorPlay className="size-3.5 text-[var(--brand)]" />
                  <span>Output Frame</span>
                  <span className="text-[11px] text-[var(--brand)] font-bold">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "16:9", label: "16:9", sub: "Landscape" },
                    { id: "9:16", label: "9:16", sub: "Portrait" },
                    { id: "1:1", label: "1:1", sub: "Square" },
                  ].map((f) => {
                    const isSelected = format === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className={cn(
                          "focus-ring flex flex-col items-center justify-center gap-1.5 rounded-[13px] border py-2.5 px-2 text-center transition-all duration-200 cursor-pointer",
                          isSelected
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-semibold shadow-xs ring-1 ring-[var(--brand)]"
                            : "border-[var(--line)] bg-[#fafbf9] text-[var(--ink-2)] hover:border-[#cbd5d0] hover:bg-white"
                        )}
                      >
                        <span
                          className={cn(
                            "rounded-[2px] border-2 border-current block transition-colors",
                            f.id === "9:16" ? "h-5 w-3" : f.id === "1:1" ? "size-4" : "h-3.5 w-5"
                          )}
                        />
                        <div className="leading-none">
                          <span className="text-[12px] font-bold block">{f.label}</span>
                          <span className="text-[9.5px] text-[var(--ink-muted)] block mt-0.5">{f.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Target Audience* */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--ink-2)] tracking-tight">
                  <Users className="size-3.5 text-[var(--brand)]" />
                  <span>Target Audience</span>
                  <span className="text-[11px] text-[var(--brand)] font-bold">*</span>
                </label>
                <SelectMenu
                  value={audience}
                  onChange={(next) => setAudience(next as Audience)}
                  options={AUDIENCE_OPTIONS}
                  ariaLabel="Target Audience"
                  placeholder="Choose target audience..."
                  renderIcon={(item) => <AudienceIcon value={item} />}
                />
              </div>

              {/* 4. Focus Topics* */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--ink-2)] tracking-tight">
                    <Layers className="size-3.5 text-[var(--brand)]" />
                    <span>Focus Topics</span>
                    <span className="text-[11px] text-[var(--brand)] font-bold">*</span>
                  </label>
                  {topics.length > 0 && (
                    <span className="text-[10px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                      {topics.length} selected
                    </span>
                  )}
                </div>
                <MultiSelectMenu
                  values={topics}
                  onChange={(next) => setTopics(next)}
                  options={TOPIC_OPTIONS}
                  ariaLabel="Focus Topics"
                  placeholder="Select one or more topics..."
                  renderIcon={(item) => {
                    const Icon = topicIcons[item] || Pill;
                    return <Icon className="size-3.5 text-[var(--brand)]" />;
                  }}
                />
              </div>
            </div>

            {/* Grounding Footer Note */}
            <div className="mt-auto border-t border-[var(--line)] bg-[#f7f9f7] px-4 py-2.5 text-[11.5px] leading-4 text-[var(--ink-muted)]">
              All statements and scenes will be tailored to this configuration.
            </div>
          </div>

          {/* Standardized Continue Forward Button (Positioned Below Right Panel) */}
          <Button
            onClick={handleContinueToBrief}
            size="lg"
            disabled={!canContinue}
            className="group mt-3 h-[48px] w-full px-6 rounded-[13px] text-[14.5px] font-bold shadow-md bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span>Start Project</span>
            <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-[var(--ink-muted)]">
            {!canContinue ? (
              <span className="text-[var(--warn)] font-medium">
                {!isDossierValid
                  ? "Please select a brand dossier"
                  : !isAudienceValid
                  ? "Please select an audience"
                  : "Please select at least 1 focus topic"}
              </span>
            ) : (
              <>
                <ShieldCheck className="size-3.5 text-[var(--brand)]" />
                <span>All mandatory inputs configured</span>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );

  if (embedded) {
    return <div className="pb-10">{content}</div>;
  }

  return (
    <div className="page-enter min-h-screen bg-[#f7f8f6] pb-10">
      {/* Minimal Back Button — no full header bar */}
      <div className="px-6 pt-5 pb-1">
        <button
          type="button"
          onClick={handleBackToMode}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
      </div>
      {content}
    </div>
  );
}
