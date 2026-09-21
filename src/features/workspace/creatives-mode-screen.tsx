"use client";

import { useState } from "react";
import { Image as ImageIcon, Layers } from "lucide-react";
import { useWorkspaceStore, type CreationMode } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";
import { StartingPointCard, type StartingPointExample } from "@/features/workspace/starting-point-card";
import { CreateTile } from "@/components/patterns/create-tile";

/**
 * Where a creative starts. The same tile the video screen uses: the example
 * first, the name under it, two or three examples per tile that cycle while
 * you point at one.
 */
const CHART_EXAMPLES: StartingPointExample[] = [
  {
    id: "chart-stat",
    badge: "Clinical Infographic",
    aspect: "A4 Print / 3:4",
    eyebrow: "Stat Hero · Primary Endpoint",
    metric: "52% PASI 90",
    metricLabel: "vs 18% Placebo (p < 0.001)",
    caption: "Statistically significant skin clearance maintained through Week 52 with once-daily dosing.",
    citation: "EMBRACE-3 Pivotal Trial Readout, Table 2.4",
    bg: "linear-gradient(135deg, #0c1524 0%, #14233c 60%, #1e3458 100%)",
  },
  {
    id: "chart-moa",
    badge: "Cellular Pathway",
    aspect: "16:9 Screen",
    eyebrow: "Mechanism of Action (MoA) Cascade",
    metric: "Dual Kinase Block",
    metricLabel: "Targeted Cytokine Clearance",
    caption: "Selectively suppresses inflammatory phosphorylation without microvascular accumulation.",
    citation: "Lancet Dermatology 2024; 42:118-129",
    bg: "linear-gradient(135deg, #0f231e 0%, #173830 60%, #225247 100%)",
  },
  {
    id: "chart-cutoff",
    badge: "Dosing & Cut-Off",
    aspect: "3:4 Tablet",
    eyebrow: "License Boundary & Prescribing Cut-Off",
    metric: "eGFR ≥25",
    metricLabel: "mL/min/1.73m² Threshold",
    caption: "Approved indication cut-off with once-daily oral dosing protocol across all three organ domains.",
    citation: "FDA Prescribing Information §2.1",
    bg: "linear-gradient(135deg, #24142e 0%, #3a204b 60%, #542e6d 100%)",
  },
];

const DECK_EXAMPLES: StartingPointExample[] = [
  {
    id: "deck-vda",
    badge: "Interactive Detail Aid",
    aspect: "iPad 16:9",
    eyebrow: "Visual Detail Aid · Field Rep Flow",
    metric: "8 Slide Panels",
    metricLabel: "Efficacy vs Standard of Care",
    caption: "Interactive touch navigation with instant objection handling and citation drilldowns.",
    citation: "Veeva PromoMats Grounded Module §3",
    bg: "linear-gradient(135deg, #101c2e 0%, #182d4b 60%, #24426e 100%)",
  },
  {
    id: "deck-poster",
    badge: "2×1m Scientific Panel",
    aspect: "Vector CMYK",
    eyebrow: "Scientific Congress Poster Readout",
    metric: "N=613 Patients",
    metricLabel: "Kaplan-Meier Curves",
    caption: "High-density clinical study readouts with automated statistical footnotes and bleed marks.",
    citation: "AAD Congress 2026 Poster Readout",
    bg: "linear-gradient(135deg, #1c1428 0%, #2d1f42 60%, #442d65 100%)",
  },
  {
    id: "deck-journal",
    badge: "A4 Journal Spread",
    aspect: "Print & Digital",
    eyebrow: "Journal Advertisement Spread",
    metric: "21 CFR 202.1",
    metricLabel: "Full Fair Balance",
    caption: "Balanced visual hierarchy with automatic ISI placement and mandatory indication statements.",
    citation: "FDA Prescribing Information §5.2",
    bg: "linear-gradient(135deg, #12221b 0%, #1c382d 60%, #274f40 100%)",
  },
];

export function CreativesModeScreen() {
  const setCreationMode = useWorkspaceStore((s) => s.setCreationMode);
  const setAssetType = useWorkspaceStore((s) => s.setAssetType);
  const setBrief = useWorkspaceStore((s) => s.setBrief);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  const handleSelectMode = (mode: CreationMode, brief: string) => {
    setAssetType("infographic");
    setCreationMode(mode);
    setBrief(brief);
    setDossierModalOpen(true);
  };

  const handleSelectDossier = (dossierId: string) => {
    useWorkspaceStore.getState().setSourcePayload({ dossierId });
    useWorkspaceStore.getState().setVideoSubStage("intake");
    useWorkspaceStore.getState().setView("create");
    setDossierModalOpen(false);
  };

  return (
    <div className="page-enter max-w-[1140px] space-y-6 text-left">
      {/* Header, the same shape as the video screen's. */}
      <div>
        <h1 className="text-hero font-[800] leading-tight tracking-[-1px] text-ink">Create Doc/Images</h1>
        <p className="mt-1.5 max-w-[60ch] text-body-lg leading-relaxed text-ink-3">
          Grounded in your verified label claims, from the first page.
        </p>
      </div>

      {/* Three across, the same grid the video screen uses — two wide tiles
          beside a blank one was a different screen for the same decision. */}
      <div className="grid grid-cols-1 gap-5 pt-1 sm:grid-cols-2 lg:grid-cols-3">
        <CreateTile
          title="Start from Scratch"
          subtitle="A blank page and your own direction, grounded in the same approved claims."
          actionLabel="New doc"
          delayMs={80}
          onSelect={() => handleSelectMode("scratch", "")}
        />
        <StartingPointCard
          title="Infographic / Chart"
          subtitle="One page led by a figure, for HCPs or patients"
          examples={CHART_EXAMPLES}
          badgeIcon={<ImageIcon className="size-3 text-brand" />}
          delayMs={80}
          onSelect={() =>
            handleSelectMode(
              "magic-chart",
              "Create a high-impact clinical leave-behind infographic summarizing pivotal efficacy endpoints, mechanism of action, and licensed indication cut-offs."
            )
          }
        />
        <StartingPointCard
          title="Presentation / Deck"
          subtitle="Multi-panel detail aid for the field team"
          examples={DECK_EXAMPLES}
          badgeIcon={<Layers className="size-3 text-info" />}
          delayMs={125}
          onSelect={() =>
            handleSelectMode(
              "magic-chart",
              "Create an interactive visual detail aid (VDA) slide deck for field representatives covering pivotal Phase III efficacy, safety, and objection handling."
            )
          }
        />
      </div>

      {/* Brand & Dossier Selection Pop-up Modal */}
      <BrandDossierModal
        open={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        onSelectDossier={handleSelectDossier}
      />
    </div>
  );
}
