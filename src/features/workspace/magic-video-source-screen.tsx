"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, FileText, Globe, Link2, Plus, ShieldCheck, Sparkles } from "lucide-react";
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
    market: "🇺🇸 US · FDA",
    sections: 18,
    claims: 214,
    status: "Verified",
    gradient: "linear-gradient(140deg,#3b82f6,#1d4ed8)",
  },
  {
    id: "onkavia",
    name: "Onkavia",
    molecule: "relunocitinib",
    market: "🇪🇺 EU · EMA",
    sections: 19,
    claims: 188,
    status: "Verified",
    gradient: "linear-gradient(140deg,#10b981,#059669)",
  },
  {
    id: "nirvexa",
    name: "Nirvexa",
    molecule: "brentaxaban",
    market: "🇬🇧 UK · MHRA",
    sections: 16,
    claims: 142,
    status: "Draft v2",
    gradient: "linear-gradient(140deg,#8b5cf6,#6d28d9)",
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
    <div className="page-enter min-h-screen bg-[#f7f8f6] pb-24">
      {/* Consistent 3-Step Header (NO continue button in header) */}
      <VideoWizardHeader
        currentStep={1}
        onBack={handleBackToMode}
        onClose={handleClose}
        modeLabel={modeLabel}
      />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[940px] px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint)] px-3 py-0.5 text-[12px] font-bold text-[var(--brand-deep)] border border-[var(--tint-line)]">
              <ShieldCheck className="size-3.5 text-[var(--brand)]" /> Step 1 of 3 · Grounded Evidence
            </span>
          </div>
          <h1 className="mt-2.5 text-[28px] font-[800] tracking-tight text-[var(--ink)] sm:text-[32px]">
            Choose evidence source
          </h1>
          <p className="mt-1 text-[15px] text-[var(--ink-3)]">
            Every clinical statement, claim, and on-screen citation will be verified against this source.
          </p>
        </div>

        {/* Suave Segmented Control Tabs */}
        <div className="flex rounded-full border border-[var(--hair-2)] bg-[#eceee9] p-1 shadow-inner">
          {[
            { id: "dossier", label: "Brand Dossier", icon: BookOpen },
            { id: "url", label: "Website / Study Link", icon: Globe },
            { id: "text", label: "Custom Plain Text", icon: FileText },
          ].map((tab) => {
            const isSelected = sourceType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSourceType(tab.id as SourceSelectionType)}
                className={`focus-ring flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13.5px] transition-all duration-200 ${
                  isSelected
                    ? "bg-white font-bold text-[var(--ink)] shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[var(--hair-2)]"
                    : "font-semibold text-[var(--ink-3)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className={`size-4 ${isSelected ? "text-[var(--brand)]" : "text-[var(--ink-4)]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Brand Dossier Cards */}
        {sourceType === "dossier" && (
          <div className="rise-in mt-6 space-y-4">
            <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--ink-3)]">
              <span>Select an approved dossier ({DOSSIERS.length} available)</span>
              <span className="font-bold text-[var(--ok)]">✓ Cited against regulatory label</span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-3">
              {DOSSIERS.map((d) => {
                const isSelected = selectedDossier === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDossier(d.id)}
                    className={`relative flex flex-col rounded-[22px] border p-4 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--tint)] ring-2 ring-[var(--brand)] ring-offset-2 shadow-md"
                        : "border-[var(--hair-2)] bg-white hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-sm"
                    }`}
                  >
                    {/* Top Row: Avatar & Radio */}
                    <div className="flex items-center justify-between">
                      <span
                        className="grid size-10 place-items-center rounded-xl text-white font-extrabold text-[13px] shadow-sm"
                        style={{ background: d.gradient }}
                      >
                        {d.name.slice(0, 2).toUpperCase()}
                      </span>
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

                    {/* Brand Info */}
                    <div className="mt-3.5">
                      <h3 className="text-[17px] font-bold text-[var(--ink)]">{d.name}</h3>
                      <span className="text-[12.5px] italic text-[var(--ink-3)]">{d.molecule}</span>
                    </div>

                    {/* Meta Chips */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[var(--hair)] pt-3 text-[12px]">
                      <span className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-[var(--ink-2)] border border-[var(--hair-2)]">
                        {d.market}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-0.5 font-bold text-[var(--ok)] border border-[var(--ok-line)]">
                        {d.claims} cited claims
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Dossier Creator */}
            <div className="flex items-center justify-between rounded-[16px] border border-[var(--hair-2)] bg-white p-3.5 text-[13px] text-[var(--ink-3)] shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--brand)] shrink-0" />
                <span>Need a dossier for another molecule? Build one in ~4 minutes.</span>
              </div>
              <Button variant="ghost" size="sm" className="font-bold text-[var(--brand)] text-[12.5px] h-8">
                <Plus className="size-3.5 mr-1" /> New Dossier
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Website / Study Link */}
        {sourceType === "url" && (
          <div className="rise-in mt-6 rounded-[22px] border border-[var(--hair-2)] bg-white p-6 shadow-sm">
            <h3 className="text-[16px] font-bold text-[var(--ink)]">Paste study or regulatory reference URL</h3>
            <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">
              SwishX parses the study registry, published PubMed literature, or approved label.
            </p>

            <div className="mt-4 flex h-12 items-center gap-3 rounded-[14px] border border-[var(--hair-2)] bg-[#fcfdfc] px-3.5 focus-within:border-[var(--brand)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--brand-soft)]">
              <Link2 className="size-4 text-[var(--ink-3)] shrink-0" />
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. https://clinicaltrials.gov/study/NCT04892110"
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
              />
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--ink-3)]">
              <span className="font-semibold text-[var(--ink-4)]">Supported sources:</span>
              <span className="rounded-full bg-[#f4f5f3] px-2.5 py-0.5 font-medium text-[var(--ink-2)] border border-[var(--hair)]">ClinicalTrials.gov</span>
              <span className="rounded-full bg-[#f4f5f3] px-2.5 py-0.5 font-medium text-[var(--ink-2)] border border-[var(--hair)]">PubMed / NCBI</span>
              <span className="rounded-full bg-[#f4f5f3] px-2.5 py-0.5 font-medium text-[var(--ink-2)] border border-[var(--hair)]">FDA / EMA Labels</span>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Plain Text */}
        {sourceType === "text" && (
          <div className="rise-in mt-6 rounded-[22px] border border-[var(--hair-2)] bg-white p-6 shadow-sm">
            <h3 className="text-[16px] font-bold text-[var(--ink)]">Paste approved messaging notes or script</h3>
            <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">
              Write or paste the exact clinical summary, indications, key messages, and safety warnings.
            </p>

            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={5}
              className="mt-4 w-full rounded-[14px] border border-[var(--hair-2)] bg-[#fcfdfc] p-3.5 text-[14px] leading-relaxed outline-none focus:border-[var(--brand)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-soft)]"
              placeholder="Paste approved prescribing information, key clinical takeaways, or medical writer draft..."
            />

            <div className="mt-2 flex justify-between text-[11.5px] text-[var(--ink-4)]">
              <span>Used as message boundary for generated video</span>
              <span>{textInput.length} characters</span>
            </div>
          </div>
        )}

        {/* Bottom Primary Action CTA (Positioned cleanly at bottom, NOT in header) */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full sm:w-auto px-8 h-12 text-[15px] font-bold shadow-md rounded-[14px]"
          >
            Continue to job brief →
          </Button>
        </div>
      </main>
    </div>
  );
}
