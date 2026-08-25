"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, FileText, Globe, Link2, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoWizardHeader } from "@/features/workspace/video-wizard-header";
import { useWorkspaceStore, type SourceSelectionType } from "@/features/workspace/workspace-store";

interface DossierItem {
  id: string;
  name: string;
  molecule: string;
  market: string;
  sections: number;
  claims: number;
  status: string;
  gradient: string;
}

const DOSSIERS: DossierItem[] = [
  {
    id: "velmora",
    name: "Velmora",
    molecule: "tirzelamide",
    market: "🇺🇸 FDA",
    sections: 18,
    claims: 214,
    status: "Verified",
    gradient: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
  },
  {
    id: "onkavia",
    name: "Onkavia",
    molecule: "relunocitinib",
    market: "🇪🇺 EMA",
    sections: 19,
    claims: 188,
    status: "Verified",
    gradient: "linear-gradient(140deg,#22c07a,#12784a)",
  },
  {
    id: "nirvexa",
    name: "Nirvexa",
    molecule: "brentaxaban",
    market: "🇬🇧 MHRA",
    sections: 16,
    claims: 142,
    status: "Draft v2",
    gradient: "linear-gradient(140deg,#9b6bff,#5b21b6)",
  },
];

export function MagicVideoSourceScreen() {
  const router = useRouter();
  const creationMode = useWorkspaceStore((s) => s.creationMode);
  const sourceType = useWorkspaceStore((s) => s.sourceType);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setSourceType = useWorkspaceStore((s) => s.setSourceType);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);
  const setBrief = useWorkspaceStore((s) => s.setBrief);
  const setSelectedSourceIds = useWorkspaceStore((s) => s.setSelectedSourceIds);

  const [selectedDossier, setSelectedDossier] = useState(sourcePayload.dossierId || "velmora");
  const [urlInput, setUrlInput] = useState(sourcePayload.url || "https://clinicaltrials.gov/study/NCT04892110");
  const [textInput, setTextInput] = useState(
    sourcePayload.text ||
      "Velmora (tirzelamide) demonstrated a 24% relative risk reduction in primary composite CV endpoints."
  );

  const modeLabel =
    creationMode === "magic-reel"
      ? "MagicReel™"
      : creationMode === "magic-avatar"
      ? "MagicAvatar™"
      : "Custom Video";

  const handleContinue = () => {
    if (sourceType === "dossier") {
      setSourcePayload({ dossierId: selectedDossier });
      setSelectedSourceIds(["dermora-core", "dermora-claims", "dermora-brand"]);
      if (creationMode === "magic-reel") {
        setBrief(`Create a concise ${selectedDossier === "velmora" ? "Velmora" : "Onkavia"} HCP launch video explaining clinical need, mechanism, and pivotal risk reduction.`);
      } else if (creationMode === "magic-avatar") {
        setBrief(`Create a presenter-led clinical briefing video with Dr. Maya Kapoor highlighting the key trial readouts from the ${selectedDossier === "velmora" ? "Velmora" : "Onkavia"} dossier.`);
      }
    } else if (sourceType === "url") {
      setSourcePayload({ url: urlInput });
      setSelectedSourceIds(["dermora-core"]);
      setBrief(`Create a video based on the clinical trial evidence and prescribing data from ${urlInput}.`);
    } else {
      setSourcePayload({ text: textInput });
      setSelectedSourceIds([]);
      setBrief(textInput.slice(0, 160) + (textInput.length > 160 ? "..." : ""));
    }

    setVideoSubStage("intake");
  };

  const handleBackToMode = () => {
    setVideoSubStage("mode-select");
  };

  const handleClose = () => {
    setView("home");
    router.push("/");
  };

  return (
    <div className="page-enter min-h-screen bg-[#f3f5f2] pb-14">
      {/* Aesthetic 3-Step Header */}
      <VideoWizardHeader
        currentStep={1}
        onBack={handleBackToMode}
        onNext={handleContinue}
        onClose={handleClose}
        nextLabel="Continue to brief"
        modeLabel={modeLabel}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[980px] px-4 py-7 sm:px-7">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-3 py-0.5 text-[11.5px] font-bold text-[var(--brand)]">
            <ShieldCheck className="size-3.5" /> Grounded Evidence
          </span>
          <h1 className="mt-2 text-[26px] font-[800] tracking-tight sm:text-[32px]">
            Select your evidence source
          </h1>
          <p className="mt-1 text-[14.5px] text-[var(--ink-muted)]">
            Every statement and citation will be grounded in this source material.
          </p>
        </div>

        {/* 3 Source Tabs Navigation */}
        <div className="grid grid-cols-3 gap-2 rounded-[14px] border border-[var(--line)] bg-white p-1.5 shadow-sm">
          {[
            { id: "dossier", label: "Brand Dossier", desc: "18-section library", icon: BookOpen },
            { id: "url", label: "Website / Link", desc: "ClinicalTrials / PubMed", icon: Globe },
            { id: "text", label: "Plain Text / Notes", desc: "Custom notes", icon: FileText },
          ].map((tab) => {
            const isSelected = sourceType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSourceType(tab.id as SourceSelectionType)}
                className={`focus-ring flex items-center gap-2.5 rounded-[10px] p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-[1.5px] border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] shadow-sm"
                    : "border border-transparent hover:bg-black/[0.02] text-[var(--ink)]"
                }`}
              >
                <div
                  className={`grid size-8 shrink-0 place-items-center rounded-[8px] transition-colors ${
                    isSelected ? "bg-[var(--brand)] text-white" : "bg-black/5 text-[var(--ink-3)]"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold">{tab.label}</span>
                  <span className="block truncate text-[11px] text-[var(--ink-muted)]">{tab.desc}</span>
                </div>
                {isSelected && (
                  <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white">
                    <Check className="size-2.5" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Brand Dossier Selection */}
        {sourceType === "dossier" && (
          <div className="rise-in mt-5 space-y-3.5">
            <div className="flex items-center justify-between text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              <span>Verified Dossiers ({DOSSIERS.length})</span>
              <span className="text-[var(--ok)]">✓ Regulatory compliant</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {DOSSIERS.map((d) => {
                const isSelected = selectedDossier === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDossier(d.id)}
                    className={`squircle-card group relative flex flex-col p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[1.5px] border-[var(--brand)] bg-[var(--tint)] ring-2 ring-[var(--brand)] ring-offset-2 shadow-sm"
                        : "border-[var(--line)] bg-white hover:-translate-y-0.5 hover:border-[var(--brand)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="grid size-9 place-items-center rounded-lg text-white font-extrabold text-[12px] shadow-sm"
                        style={{ background: d.gradient }}
                      >
                        {d.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-bold text-[var(--ink-2)] border border-[var(--line)]">
                        {d.market}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-[16px] font-bold text-[var(--ink)]">{d.name}</h3>
                      <span className="text-[11.5px] text-[var(--ink-muted)] italic">{d.molecule}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2.5 text-[11.5px] text-[var(--ink-2)]">
                      <span>{d.sections} sections</span>
                      <b className="text-[var(--ok)]">{d.claims} claims</b>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-white p-3 text-[12.5px] text-[var(--ink-muted)]">
              <span>Need a new molecule dossier? Build one in ~4 minutes.</span>
              <Button variant="ghost" size="sm" className="text-[var(--brand)] font-bold text-[12px] h-7">
                <Plus className="size-3 mr-1" /> New Dossier
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Website / Study Link */}
        {sourceType === "url" && (
          <div className="rise-in mt-5 squircle-card border border-[var(--line)] bg-white p-5 shadow-sm">
            <h3 className="text-[15px] font-bold">Study or regulatory link</h3>
            <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
              Extracts claims and endpoints from ClinicalTrials.gov, PubMed, or FDA label.
            </p>

            <div className="mt-3 flex h-11 items-center gap-2.5 rounded-[10px] border border-[#e0e6e2] bg-[#fcfdfc] px-3 focus-within:border-[var(--brand)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--brand-soft)]">
              <Link2 className="size-4 text-[var(--ink-muted)] shrink-0" />
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. https://clinicaltrials.gov/study/NCT04892110"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Custom Plain Text */}
        {sourceType === "text" && (
          <div className="rise-in mt-5 squircle-card border border-[var(--line)] bg-white p-5 shadow-sm">
            <h3 className="text-[15px] font-bold">Approved message summary / notes</h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-[10px] border border-[#e0e6e2] bg-[#fcfdfc] p-3 text-[13.5px] leading-relaxed outline-none focus:border-[var(--brand)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-soft)]"
              placeholder="Paste approved prescribing information, key clinical takeaways, or medical writer draft..."
            />
            <div className="mt-1 flex justify-between text-[11px] text-[var(--ink-muted)]">
              <span>Used as message boundary</span>
              <span>{textInput.length} chars</span>
            </div>
          </div>
        )}

        {/* Bottom Synced Continue Action */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleContinue} size="lg" className="w-full sm:w-auto px-8 shadow-sm">
            Continue to job brief →
          </Button>
        </div>
      </main>
    </div>
  );
}
