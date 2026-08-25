"use client";

import {
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
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);

  const selectedDossierId = sourcePayload.dossierId || "velmora";
  const activeDossier = DOSSIERS.find((d) => d.id === selectedDossierId) || DOSSIERS[0];

  const handleSelectDossier = (dossierId: string) => {
    setSourcePayload({ dossierId });
  };

  const handleBackToMode = () => {
    setVideoSubStage("mode-select");
  };

  const handleClose = () => {
    setView("home");
  };

  const content = (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-7 sm:px-8">
      {/* Standardized Page Heading (No Badge) */}
      <div className="mb-7">
        <h1 className="text-[28px] font-[800] tracking-tight text-[var(--ink)] sm:text-[34px]">
          Choose brand dossier &amp; goals
        </h1>
        <p className="mt-1 text-[15px] text-[var(--ink-3)]">
          Select an approved dossier to ground every claim, then set your audience, campaign goal, and focus topics.
        </p>
      </div>

      {/* Standardized 2-Column Layout */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Brand Dossier Selection */}
        <section className="squircle-card rise-in border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[var(--brand)] text-white text-[11px] font-bold">1</span>
              <h2 className="text-[16px] font-bold text-[var(--ink)]">Select Brand Dossier</h2>
              <span className="text-[11.5px] font-semibold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                Mandatory
              </span>
            </div>
            <span className="text-[12px] font-bold text-[var(--ok)] hidden sm:inline-block">
              ✓ 100% cited against regulatory label
            </span>
          </div>

          {/* Dossiers Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {DOSSIERS.map((d) => {
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
                  {/* Top: Avatar & Check */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid size-9 place-items-center rounded-xl text-white font-extrabold text-[12px] shadow-sm"
                        style={{ background: d.avatarBg }}
                      >
                        {d.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="text-[15.5px] font-bold text-[var(--ink)] leading-tight">{d.name}</h3>
                        <span className="text-[11.5px] italic text-[var(--ink-3)]">{d.molecule}</span>
                      </div>
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

                  {/* Skeleton lines */}
                  <div className="mt-3.5 rounded-[12px] bg-black/[0.03] p-2.5 border border-black/[0.04]">
                    <div className="flex items-center justify-between text-[10.5px] font-bold text-[var(--ink-3)] mb-1.5">
                      <span>Brand Dossier</span>
                      <span>{d.sections} sections</span>
                    </div>
                    <div className="space-y-1.5">
                      {d.skeletonWidths.map((w, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div
                            className="h-1.5 rounded-full bg-black/10"
                            style={{ width: `${w}%` }}
                          />
                          <sup className="text-[8.5px] font-bold text-[var(--brand)]">[{i + 1}]</sup>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom stats */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-[var(--hair)] pt-2 text-[11.5px]">
                    <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-[var(--ink-2)] border border-[var(--hair-2)]">
                      {d.market}
                    </span>
                    <span className="font-bold text-[var(--ok)]">
                      {d.claims} claims
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Dossier */}
          <div className="mt-4 flex items-center justify-between rounded-[16px] border border-[var(--hair-2)] bg-[#fafbf9] p-3.5 text-[13px] text-[var(--ink-3)]">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--brand)] shrink-0" />
              <span>Need a dossier for another molecule? Synthesize a new one from FDA / EMA labels.</span>
            </div>
            <Button variant="ghost" size="sm" className="font-bold text-[var(--brand)] text-[12.5px] h-8 shrink-0">
              <Plus className="size-3.5 mr-1" /> New Dossier
            </Button>
          </div>
        </section>

        {/* Right Column: Audience, Goal & Focus Topics Dropdowns */}
        <aside className="rise-in [animation-delay:80ms]">
          <div className="squircle-card overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
            {/* Header */}
            <div className="border-b border-[var(--line)] bg-[#fafbf9] px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Configuration</span>
                <span className="rounded-full bg-[var(--ok-bg)] px-2 py-0.5 text-[11px] font-bold text-[var(--ok)]">
                  Active
                </span>
              </div>
              <h2 className="mt-1 text-[17px] font-bold tracking-tight text-[var(--ink)]">
                {activeDossier.name} Dossier
              </h2>
            </div>

            {/* Dropdowns Form */}
            <div className="p-5 space-y-4">
              {/* 1. Target Audience */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                  <Users className="size-4 text-[var(--brand)]" />
                  Target Audience
                </label>
                <SelectMenu
                  value={audience}
                  onChange={(next) => setAudience(next as Audience)}
                  options={AUDIENCE_OPTIONS}
                  ariaLabel="Target Audience"
                  renderIcon={(item) => <AudienceIcon value={item} />}
                />
              </div>

              {/* 2. Campaign Goal */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                  <Target className="size-4 text-[var(--brand)]" />
                  Campaign Goal
                </label>
                <SelectMenu
                  value={goal}
                  onChange={(next) => setGoal(next)}
                  options={GOAL_OPTIONS}
                  ariaLabel="Campaign Goal"
                  renderIcon={() => <Target className="size-4 text-[var(--brand)]" />}
                />
              </div>

              {/* 3. Focus Topics (Multi-Select Dropdown) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                    <Layers className="size-4 text-[var(--brand)]" />
                    Focus Topics
                  </label>
                  <span className="text-[11px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                    {topics.length} selected
                  </span>
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

          <div className="mt-3 flex items-center justify-center gap-2 text-[12.5px] text-[var(--ink-muted)]">
            <ShieldCheck className="size-4 text-[var(--brand)]" />
            <span>Nothing is created until you confirm the plan.</span>
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
