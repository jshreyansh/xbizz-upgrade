"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, FileText, Globe, Link2, Plus, ShieldCheck, Sparkles, X } from "lucide-react";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { Button } from "@/components/ui/button";
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
    status: "Verified & current",
    gradient: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
  },
  {
    id: "onkavia",
    name: "Onkavia",
    molecule: "relunocitinib",
    market: "🇪🇺 EMA",
    sections: 19,
    claims: 188,
    status: "Verified & current",
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
  const creationMode = useWorkspaceStore((s) => s.creationMode);
  const sourceType = useWorkspaceStore((s) => s.sourceType);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setSourceType = useWorkspaceStore((s) => s.setSourceType);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setBrief = useWorkspaceStore((s) => s.setBrief);
  const setSelectedSourceIds = useWorkspaceStore((s) => s.setSelectedSourceIds);

  const [selectedDossier, setSelectedDossier] = useState(sourcePayload.dossierId || "velmora");
  const [urlInput, setUrlInput] = useState(sourcePayload.url || "https://clinicaltrials.gov/study/NCT04892110");
  const [textInput, setTextInput] = useState(
    sourcePayload.text ||
      "Velmora (tirzelamide) demonstrated a 24% relative risk reduction in primary composite cardiovascular endpoints (CV death, nonfatal MI, nonfatal stroke) in patients with established atherosclerotic cardiovascular disease."
  );

  const modeLabel =
    creationMode === "magic-reel"
      ? "MagicReel™ (Short Video)"
      : creationMode === "magic-avatar"
      ? "MagicAvatar™ (Digital Twin)"
      : "Custom Video (Scratch)";

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

  return (
    <div className="page-enter min-h-screen bg-[#f3f5f2] pb-12">
      {/* Top Header */}
      <header className="flex h-[68px] items-center border-b border-[var(--line)] bg-white/95 px-4 backdrop-blur-xl sm:px-7">
        <button
          onClick={handleBackToMode}
          className="focus-ring mr-4 grid size-10 place-items-center rounded-[10px] text-[var(--ink-muted)] hover:bg-black/5"
          aria-label="Back to format"
        >
          <ArrowLeft className="size-[20px]" />
        </button>
        <SwishXMark />
        <div className="ml-5 hidden h-6 w-px bg-[var(--line)] sm:block" />
        <div className="ml-5 hidden sm:block">
          <div className="text-[14px] font-bold">{modeLabel}</div>
          <div className="text-[13px] text-[var(--ink-muted)]">Step 2 of 3 · Choose what it is written from</div>
        </div>

        {/* Top Right Action Button */}
        <div className="ml-auto flex items-center gap-3">
          <Button onClick={handleContinue} className="shadow-sm">
            Continue to job brief <ArrowRight className="size-4" />
          </Button>
          <Button onClick={handleBackToMode} variant="ghost" size="icon" aria-label="Close">
            <X className="size-[20px]" />
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1020px] px-4 py-8 sm:px-7">
        <div className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[12px] font-bold text-[var(--brand)]">
            <ShieldCheck className="size-3.5" /> Medical Record of Truth
          </span>
          <h1 className="mt-3 text-[30px] font-[800] tracking-[-0.04em] sm:text-[36px]">
            Choose what your video is written from
          </h1>
          <p className="mt-2 text-[15.5px] leading-6 text-[var(--ink-muted)]">
            SwishX never hallucinates clinical claims. Everything in your video is grounded and cited against the source you select below.
          </p>
        </div>

        {/* 3 Source Tabs Navigation */}
        <div className="grid grid-cols-3 gap-2.5 rounded-[16px] border border-[var(--line)] bg-white p-1.5 shadow-sm">
          {[
            { id: "dossier", label: "Brand Dossier", desc: "Verified 18-section library", icon: BookOpen },
            { id: "url", label: "Website / Study Link", desc: "ClinicalTrials / PubMed / PI", icon: Globe },
            { id: "text", label: "Custom Plain Text", desc: "Raw notes & approved messages", icon: FileText },
          ].map((tab) => {
            const isSelected = sourceType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSourceType(tab.id as SourceSelectionType)}
                className={`focus-ring flex items-center gap-3 rounded-[12px] p-3 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[1.5px] border-[var(--brand)] bg-[var(--tint)] shadow-sm text-[var(--brand-deep)]"
                    : "border border-transparent bg-transparent hover:bg-black/[0.02] text-[var(--ink)]"
                }`}
              >
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-[10px] transition-colors ${
                    isSelected ? "bg-[var(--brand)] text-white" : "bg-black/5 text-[var(--ink-3)]"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold">{tab.label}</span>
                  <span className="block truncate text-[11.5px] text-[var(--ink-muted)]">{tab.desc}</span>
                </div>
                {isSelected && (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Brand Dossier Selection */}
        {sourceType === "dossier" && (
          <div className="rise-in mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Select a Brand Dossier ({DOSSIERS.length} available)
              </span>
              <span className="text-[12px] font-semibold text-[var(--brand)]">
                ✓ Every claim cited against regulatory label
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {DOSSIERS.map((d) => {
                const isSelected = selectedDossier === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDossier(d.id)}
                    className={`squircle-card group relative flex flex-col p-5 border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[1.5px] border-[var(--brand)] bg-[var(--tint)] ring-2 ring-[var(--brand)] ring-offset-2 shadow-md"
                        : "border-[var(--line)] bg-white hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="grid size-10 place-items-center rounded-xl text-white font-extrabold text-[13px] shadow-sm"
                        style={{ background: d.gradient }}
                      >
                        {d.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[var(--ink-2)] border border-[var(--line)]">
                        {d.market}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-[17px] font-bold tracking-tight text-[var(--ink)]">{d.name}</h3>
                      <span className="text-[12px] text-[var(--ink-muted)] italic">{d.molecule}</span>
                    </div>

                    <div className="mt-4 space-y-1.5 border-t border-[var(--line)] pt-3 text-[12px] text-[var(--ink-2)]">
                      <div className="flex justify-between">
                        <span>Structure:</span>
                        <b className="font-semibold">{d.sections} sections</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Clinical Claims:</span>
                        <b className="font-semibold text-[var(--ok)]">{d.claims} cited</b>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2">
                      <span className="text-[11px] font-semibold text-[var(--ok)]">● {d.status}</span>
                      <span
                        className={`grid size-5 place-items-center rounded-full border transition ${
                          isSelected ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[#d6ddd9]"
                        }`}
                      >
                        {isSelected && <Check className="size-3" strokeWidth={3} />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explainer Drawer */}
            <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[var(--line)] bg-white p-4 text-[13px] text-[var(--ink-muted)]">
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 text-[var(--brand)] shrink-0" />
                <span>Need a brand dossier for a different molecule? You can build one in about 4 minutes.</span>
              </div>
              <Button variant="ghost" size="sm" className="text-[var(--brand)] font-bold">
                <Plus className="size-3.5 mr-1" /> New Dossier
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Website / Study Link */}
        {sourceType === "url" && (
          <div className="rise-in mt-6 squircle-card border border-[var(--line)] bg-white p-6 shadow-sm">
            <h3 className="text-[16px] font-bold">Paste a study or regulatory reference URL</h3>
            <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
              SwishX will parse the clinical trial registry, approved label, or published PubMed paper to extract efficacy metrics and indications.
            </p>

            <div className="mt-4 flex h-12 items-center gap-3 rounded-[14px] border border-[#e0e6e2] bg-[#fcfdfc] px-3.5 transition focus-within:border-[var(--brand)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--brand-soft)]">
              <Link2 className="size-[18px] text-[var(--ink-muted)]" />
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. https://clinicaltrials.gov/study/NCT04892110"
                className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none"
              />
            </div>

            <div className="mt-4 rounded-[12px] bg-[#f8faf8] p-3.5 border border-[var(--line)] text-[12.5px] text-[var(--ink-muted)] flex items-center gap-2">
              <ShieldCheck className="size-4 text-[var(--ok)] shrink-0" />
              <span>Supported domains: <b>ClinicalTrials.gov</b>, <b>PubMed / NCBI</b>, <b>FDA.gov PI</b>, <b>EMA SmPC</b></span>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Plain Text */}
        {sourceType === "text" && (
          <div className="rise-in mt-6 squircle-card border border-[var(--line)] bg-white p-6 shadow-sm">
            <h3 className="text-[16px] font-bold">Paste approved source text or notes</h3>
            <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
              Write or paste the exact clinical summary, indications, key messages, and safety warnings you want reflected in this video.
            </p>

            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
              className="mt-4 w-full rounded-[14px] border border-[#e0e6e2] bg-[#fcfdfc] p-4 text-[14.5px] leading-6 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-soft)]"
              placeholder="Paste approved prescribing information, key clinical takeaways, or medical writer draft..."
            />

            <div className="mt-2 flex justify-between text-[12px] text-[var(--ink-muted)]">
              <span>Plain text will be indexed into editable storyboard scenes.</span>
              <span>{textInput.length} characters</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
