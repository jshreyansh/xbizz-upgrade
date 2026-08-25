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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudienceIcon } from "@/components/ui/select-icons";
import { MultiSelectMenu, SelectMenu } from "@/components/ui/select-menu";
import { VideoWizardHeader } from "@/features/workspace/video-wizard-header";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
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
  const goal = useWorkspaceStore((s) => s.goal);
  const setGoal = useWorkspaceStore((s) => s.setGoal);
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

  const selectedDossierId = sourcePayload.dossierId || "velmora";
  const activeDossier = DOSSIERS.find((d) => d.id === selectedDossierId) || DOSSIERS[0];

  // Mandatory Validation Checks
  const isAudienceValid = Boolean(audience);
  const isGoalValid = Boolean(goal);
  const isTopicsValid = topics.length > 0;
  const isDossierValid = Boolean(selectedDossierId);
  const canContinue = isAudienceValid && isGoalValid && isTopicsValid && isDossierValid;

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
    <main className="mx-auto w-full max-w-[1280px] px-6 py-7 sm:px-8">
      {/* Standardized Page Heading (No Badge) */}
      <div className="mb-7">
        <h1 className="text-[28px] font-[800] tracking-tight text-[var(--ink)] sm:text-[34px]">
          Choose brand dossier &amp; goals
        </h1>
        <p className="mt-1 text-[15px] text-[var(--ink-3)]">
          Select a brand dossier or a SwishX sample to ground every claim, then configure your mandatory campaign parameters.
        </p>
      </div>

      {/* Standardized 2-Column Layout */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Brand Dossiers & Sample Dossiers */}
        <section className="squircle-card rise-in border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6 space-y-6">
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

            <div className="grid gap-3.5 sm:grid-cols-3">
              {brandDossiers.map((d) => {
                const isSelected = selectedDossierId === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDossier(d.id)}
                    className={`relative flex flex-col rounded-[18px] border p-3.5 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--tint)] ring-2 ring-[var(--brand)] ring-offset-2 shadow-md"
                        : "border-[var(--hair-2)] bg-[#fafbf9] hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="grid size-8 place-items-center rounded-xl text-white font-extrabold text-[11px] shadow-sm"
                          style={{ background: d.avatarBg }}
                        >
                          {d.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <h3 className="text-[15px] font-bold text-[var(--ink)] leading-tight">{d.name}</h3>
                          <span className="text-[11px] italic text-[var(--ink-3)]">{d.molecule}</span>
                        </div>
                      </div>
                      <span
                        className={`grid size-4 place-items-center rounded-full border transition ${
                          isSelected
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : "border-[var(--hair-3)] bg-white"
                        }`}
                      >
                        {isSelected && <Check className="size-2.5" strokeWidth={3.5} />}
                      </span>
                    </div>

                    <div className="mt-3 rounded-[10px] bg-black/[0.03] p-2 border border-black/[0.04]">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[var(--ink-3)] mb-1">
                        <span>Brand Dossier</span>
                        <span>{d.sections} sections</span>
                      </div>
                      <div className="space-y-1">
                        {d.skeletonWidths.map((w, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="h-1 rounded-full bg-black/10" style={{ width: `${w}%` }} />
                            <sup className="text-[8px] font-bold text-[var(--brand)]">[{i + 1}]</sup>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--hair)] pt-2 text-[11px]">
                      <span className="rounded-full bg-white px-1.5 py-0.5 font-semibold text-[var(--ink-2)] border border-[var(--hair-2)]">
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
          <div className="border-t border-[var(--hair)] pt-5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-4 text-[var(--brand)]" />
                <h2 className="text-[14.5px] font-bold text-[var(--ink)]">Sample Dossiers by SwishX</h2>
                <span className="text-[10.5px] font-bold text-[#b45309] bg-[#fef3c7] px-2 py-0.5 rounded-full border border-[#fde68a]">
                  Ready to test
                </span>
              </div>
              <span className="text-[11.5px] text-[var(--ink-muted)]">Pre-loaded clinical evidence</span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {sampleDossiers.map((d) => {
                const isSelected = selectedDossierId === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDossier(d.id)}
                    className={`relative flex flex-col rounded-[18px] border p-3.5 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--tint)] ring-2 ring-[var(--brand)] ring-offset-2 shadow-md"
                        : "border-[var(--hair-2)] bg-[#fafbf9] hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="grid size-8 place-items-center rounded-xl text-white font-extrabold text-[11px] shadow-sm"
                          style={{ background: d.avatarBg }}
                        >
                          {d.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-[15px] font-bold text-[var(--ink)] leading-tight">{d.name}</h3>
                            <span className="rounded-full bg-[#fef3c7] text-[#92400e] px-1.5 py-0.2 text-[9.5px] font-bold border border-[#fde68a]">
                              Sample
                            </span>
                          </div>
                          <span className="text-[11px] italic text-[var(--ink-3)]">{d.molecule}</span>
                        </div>
                      </div>
                      <span
                        className={`grid size-4 place-items-center rounded-full border transition ${
                          isSelected
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : "border-[var(--hair-3)] bg-white"
                        }`}
                      >
                        {isSelected && <Check className="size-2.5" strokeWidth={3.5} />}
                      </span>
                    </div>

                    <div className="mt-3 rounded-[10px] bg-black/[0.03] p-2 border border-black/[0.04]">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[var(--ink-3)] mb-1">
                        <span>Curated Clinical Sample</span>
                        <span>{d.sections} sections</span>
                      </div>
                      <div className="space-y-1">
                        {d.skeletonWidths.map((w, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="h-1 rounded-full bg-black/10" style={{ width: `${w}%` }} />
                            <sup className="text-[8px] font-bold text-[var(--brand)]">[{i + 1}]</sup>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--hair)] pt-2 text-[11px]">
                      <span className="rounded-full bg-white px-1.5 py-0.5 font-semibold text-[var(--ink-2)] border border-[var(--hair-2)]">
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

        {/* Right Column: Mandatory Dropdowns Form */}
        <aside className="rise-in [animation-delay:80ms]">
          <div className="squircle-card overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
            {/* Header */}
            <div className="border-b border-[var(--line)] bg-[#fafbf9] px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Configuration</span>
                <span className="rounded-full bg-[var(--ok-bg)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--ok)]">
                  Mandatory
                </span>
              </div>
              <h2 className="mt-1 text-[17px] font-bold tracking-tight text-[var(--ink)]">
                {activeDossier.name} Dossier
              </h2>
            </div>

            {/* Dropdowns Form */}
            <div className="p-5 space-y-4">
              {/* 1. Target Audience (Mandatory) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                    <Users className="size-4 text-[var(--brand)]" />
                    Target Audience
                  </label>
                  <span className="text-[11px] font-bold text-[var(--brand)]">* Required</span>
                </div>
                <SelectMenu
                  value={audience}
                  onChange={(next) => setAudience(next as Audience)}
                  options={AUDIENCE_OPTIONS}
                  ariaLabel="Target Audience"
                  renderIcon={(item) => <AudienceIcon value={item} />}
                />
              </div>

              {/* 2. Campaign Goal (Mandatory) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                    <Target className="size-4 text-[var(--brand)]" />
                    Campaign Goal
                  </label>
                  <span className="text-[11px] font-bold text-[var(--brand)]">* Required</span>
                </div>
                <SelectMenu
                  value={goal}
                  onChange={(next) => setGoal(next)}
                  options={GOAL_OPTIONS}
                  ariaLabel="Campaign Goal"
                  renderIcon={() => <Target className="size-4 text-[var(--brand)]" />}
                />
              </div>

              {/* 3. Focus Topics (Mandatory Multi-Select Dropdown) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                    <Layers className="size-4 text-[var(--brand)]" />
                    Focus Topics
                  </label>
                  {topics.length > 0 ? (
                    <span className="text-[11px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                      {topics.length} selected
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-[var(--warn)]">* Min 1 topic</span>
                  )}
                </div>
                <MultiSelectMenu
                  values={topics}
                  onChange={(next) => setTopics(next)}
                  options={TOPIC_OPTIONS}
                  ariaLabel="Focus Topics"
                  renderIcon={(item) => {
                    const Icon = topicIcons[item] || Pill;
                    return <Icon className="size-4 text-[var(--brand)]" />;
                  }}
                />
              </div>
            </div>

            {/* Grounding Footer Note */}
            <div className="mt-auto border-t border-[var(--line)] bg-[#f7f9f7] px-5 py-4 text-[12.5px] leading-5 text-[var(--ink-muted)]">
              All script statements and storyboard scenes will be tailored to this audience, goal, and topic combination.
            </div>
          </div>

          {/* Standardized Continue Forward Button (Positioned Below Right Panel) */}
          <Button
            onClick={handleContinueToBrief}
            size="lg"
            disabled={!canContinue}
            className="group mt-3.5 h-[52px] w-full px-8 rounded-[14px] text-[15px] font-bold shadow-md bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span>Continue to job brief</span>
            <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[12.5px] text-[var(--ink-muted)]">
            {!canContinue ? (
              <span className="text-[var(--warn)] font-medium">
                {!isDossierValid
                  ? "Please select a brand dossier"
                  : !isAudienceValid
                  ? "Please select an audience"
                  : !isGoalValid
                  ? "Please select a campaign goal"
                  : "Please select at least 1 focus topic"}
              </span>
            ) : (
              <>
                <ShieldCheck className="size-4 text-[var(--brand)]" />
                <span>All mandatory inputs configured</span>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );

  if (embedded) {
    return <div className="page-enter pb-10">{content}</div>;
  }

  return (
    <div className="page-enter min-h-screen bg-[#f7f8f6] pb-10">
      <VideoWizardHeader
        currentStep={1}
        onBack={handleBackToMode}
        onClose={handleClose}
      />
      {content}
    </div>
  );
}
