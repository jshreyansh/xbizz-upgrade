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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudienceIcon } from "@/components/ui/select-icons";
import { SelectMenu } from "@/components/ui/select-menu";
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

const TOPIC_OPTIONS = [
  { id: "Product Introduction", label: "Product Introduction", desc: "Overview & unmet need", icon: Pill },
  { id: "Mechanism of Action", label: "Mechanism of Action", desc: "3D cellular pathway & receptor targets", icon: Activity },
  { id: "Indications", label: "Indications", desc: "Approved patient populations & criteria", icon: Target },
  { id: "Dosage & Safety", label: "Dosage & Safety", desc: "Administration, titration & tolerability", icon: ShieldAlert },
  { id: "Drug Interactions", label: "Drug Interactions", desc: "Metabolic pathways & contraindications", icon: Zap },
  { id: "Side Effects", label: "Side Effects", desc: "Adverse event rates & safety balance", icon: HelpCircle },
];

const GOAL_OPTIONS = [
  { id: "New Launch", label: "New Launch", desc: "Establish clinical role and lead with pivotal trial efficacy" },
  { id: "Awareness", label: "Awareness", desc: "Highlight unmet disease burden and MoA differentiation" },
  { id: "Retention", label: "Retention", desc: "Reinforce long-term safety, adherence, and real-world outcomes" },
];

export function MagicVideoSourceScreen({ embedded = false }: { embedded?: boolean }) {
  const audience = useWorkspaceStore((s) => s.audience);
  const setAudience = useWorkspaceStore((s) => s.setAudience);
  const goal = useWorkspaceStore((s) => s.goal);
  const setGoal = useWorkspaceStore((s) => s.setGoal);
  const topics = useWorkspaceStore((s) => s.topics);
  const toggleTopic = useWorkspaceStore((s) => s.toggleTopic);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);

  const selectedDossier = sourcePayload.dossierId || "velmora";

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
      {/* Standardized Heading (No Badge) */}
      <div className="mb-7">
        <h1 className="text-[28px] font-[800] tracking-tight text-[var(--ink)] sm:text-[34px]">
          Choose brand dossier &amp; goals
        </h1>
        <p className="mt-1 text-[15px] text-[var(--ink-3)]">
          Select a verified dossier to ground every claim, then configure your audience, focus topics, and campaign goal.
        </p>
      </div>

      <div className="space-y-8">
        {/* ── SECTION 1: Mandatory Brand Dossier Selection ── */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[var(--brand)] text-white text-[11px] font-bold">1</span>
              <h2 className="text-[16px] font-bold text-[var(--ink)]">Select Brand Dossier</h2>
              <span className="text-[12px] font-semibold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                Mandatory
              </span>
            </div>
            <span className="text-[12px] font-bold text-[var(--ok)]">
              ✓ 100% cited against regulatory label
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {DOSSIERS.map((d) => {
              const isSelected = selectedDossier === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => handleSelectDossier(d.id)}
                  className={`relative flex flex-col rounded-[22px] border p-4 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[var(--brand)] bg-[var(--tint)] ring-2 ring-[var(--brand)] ring-offset-2 shadow-md"
                      : "border-[var(--hair-2)] bg-white hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-sm"
                  }`}
                >
                  {/* Top Row: Monogram Avatar & Radio */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid size-10 place-items-center rounded-xl text-white font-extrabold text-[13px] shadow-sm"
                        style={{ background: d.avatarBg }}
                      >
                        {d.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="text-[16.5px] font-bold text-[var(--ink)]">{d.name}</h3>
                        <span className="text-[12px] italic text-[var(--ink-3)]">{d.molecule}</span>
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

                  {/* Dossier Document Skeleton Preview */}
                  <div className="mt-3.5 rounded-[12px] bg-black/[0.03] p-3 border border-black/[0.04]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--ink-3)] mb-2">
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
                          <sup className="text-[9px] font-bold text-[var(--brand)]">[{i + 1}]</sup>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--hair)] pt-2.5 text-[12px]">
                    <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-[var(--ink-2)] border border-[var(--hair-2)]">
                      {d.market}
                    </span>
                    <span className="font-bold text-[var(--ok)]">
                      {d.claims} claims cited
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Dossier */}
          <div className="mt-3 flex items-center justify-between rounded-[16px] border border-[var(--hair-2)] bg-white p-3.5 text-[13px] text-[var(--ink-3)] shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--brand)] shrink-0" />
              <span>Need a dossier for another molecule? Synthesize a new one from FDA / EMA labels.</span>
            </div>
            <Button variant="ghost" size="sm" className="font-bold text-[var(--brand)] text-[12.5px] h-8">
              <Plus className="size-3.5 mr-1" /> New Dossier
            </Button>
          </div>
        </div>

        {/* ── SECTION 2: Audience, Topics & Campaign Goal ── */}
        <div className="grid gap-6 lg:grid-cols-3 pt-2 border-t border-[var(--hair)]">
          {/* 1. Target Audience */}
          <div className="rounded-[22px] border border-[var(--hair-2)] bg-white p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Users className="size-4 text-[var(--brand)]" />
              <h3 className="text-[15px] font-bold text-[var(--ink)]">Target Audience</h3>
            </div>
            <p className="text-[13px] text-[var(--ink-3)] mb-4">
              Determines clinical vocabulary, fair balance density, and evidence depth.
            </p>
            <div className="mt-auto">
              <SelectMenu
                value={audience}
                onChange={(next) => setAudience(next as Audience)}
                options={AUDIENCE_OPTIONS}
                ariaLabel="Target Audience"
                renderIcon={(item) => <AudienceIcon value={item} />}
              />
            </div>
          </div>

          {/* 2. Campaign Goal */}
          <div className="rounded-[22px] border border-[var(--hair-2)] bg-white p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Target className="size-4 text-[var(--brand)]" />
              <h3 className="text-[15px] font-bold text-[var(--ink)]">Campaign Goal</h3>
            </div>
            <p className="text-[13px] text-[var(--ink-3)] mb-3">
              Establishes communication priority and storyline arc.
            </p>
            <div className="space-y-2 mt-auto">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`focus-ring w-full flex items-center justify-between p-2.5 rounded-[12px] border text-left transition-all ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-bold shadow-xs"
                        : "border-[var(--hair-2)] bg-[#fafbf9] text-[var(--ink)] hover:border-[var(--hair-3)] hover:bg-white"
                    }`}
                  >
                    <div>
                      <b className="block text-[13px]">{g.label}</b>
                      <span className="block text-[11px] text-[var(--ink-3)] font-normal">{g.desc}</span>
                    </div>
                    <span
                      className={`grid size-4 place-items-center rounded-full border shrink-0 ml-2 ${
                        isSelected ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--hair-3)]"
                      }`}
                    >
                      {isSelected && <Check className="size-2.5" strokeWidth={3.5} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Focus Topics (Multi-Select) */}
          <div className="rounded-[22px] border border-[var(--hair-2)] bg-white p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-[var(--brand)]" />
                <h3 className="text-[15px] font-bold text-[var(--ink)]">Focus Topics</h3>
              </div>
              <span className="text-[11.5px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                {topics.length} selected
              </span>
            </div>
            <p className="text-[13px] text-[var(--ink-3)] mb-3">
              Pick one or more clinical pillars to feature in the generated storyboard.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              {TOPIC_OPTIONS.map((t) => {
                const isSelected = topics.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopic(t.id)}
                    className={`focus-ring flex items-center gap-2 p-2 rounded-[11px] border text-left transition-all ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-bold shadow-xs"
                        : "border-[var(--hair-2)] bg-[#fafbf9] text-[var(--ink-2)] hover:border-[var(--hair-3)] hover:bg-white"
                    }`}
                  >
                    <span
                      className={`grid size-4 place-items-center rounded-full border shrink-0 ${
                        isSelected ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--hair-3)]"
                      }`}
                    >
                      {isSelected && <Check className="size-2.5" strokeWidth={3.5} />}
                    </span>
                    <span className="text-[12px] leading-tight truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  if (embedded) {
    return <div className="page-enter pb-12">{content}</div>;
  }

  return (
    <div className="page-enter min-h-screen bg-[#f7f8f6] pb-24">
      <VideoWizardHeader
        currentStep={1}
        onBack={handleBackToMode}
        onClose={handleClose}
      />
      {content}
    </div>
  );
}
