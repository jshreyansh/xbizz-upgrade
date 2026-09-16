"use client";

import { useState } from "react";
import { useWorkspaceStore, type CreationMode } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";
import { StartingPointCard, type StartingPointExample } from "@/features/workspace/starting-point-card";

/**
 * Where a video starts.
 *
 * Six starting points rather than two engines. Reel or presenter is a
 * question the plan screen already asks with the brief in front of it; what
 * you know at this moment is what the video is for, which is what each tile
 * names. Every tile opens the same brand picker — the difference between them
 * is the work you have in mind, not a different pipeline.
 */
const DARK = "linear-gradient(135deg, #09101d 0%, #152238 60%, #1f3557 100%)";
const PLUM = "linear-gradient(135deg, #180924 0%, #2e1245 60%, #4a1d6e 100%)";
const FOREST = "linear-gradient(135deg, #0a1f18 0%, #13382c 60%, #1d5442 100%)";
const SLATE = "linear-gradient(135deg, #162022 0%, #25373b 60%, #3a555c 100%)";
const VIOLET = "linear-gradient(135deg, #1b1622 0%, #352b42 60%, #524266 100%)";
const UMBER = "linear-gradient(135deg, #221a16 0%, #3b2a25 60%, #5c413a 100%)";

const clip = (id: string, videoSrc: string, bg: string): StartingPointExample => ({ id, videoSrc, bg });

const STARTING_POINTS: { id: string; title: string; subtitle: string; examples: StartingPointExample[] }[] = [
  {
    id: "scratch",
    title: "Create from Scratch",
    subtitle: "A blank brief, your own direction",
    examples: [
      clip("scratch-1", "/reel-moa.mp4", DARK),
      clip("scratch-2", "/4360-178617258_medium.mp4", VIOLET),
      clip("scratch-3", "/326638_medium.mp4", FOREST),
    ],
  },
  {
    id: "new-drug",
    title: "New Drug Release",
    subtitle: "Launch film for a newly approved brand",
    examples: [
      clip("new-drug-1", "/21617-319452308_medium.mp4", PLUM),
      clip("new-drug-2", "/133898-758336558_medium.mp4", DARK),
    ],
  },
  {
    id: "patient-handouts",
    title: "Patient Handouts",
    subtitle: "Plain language for someone starting treatment",
    examples: [
      clip("patient-1", "/Brevanta final draft-web.mp4", SLATE),
      clip("patient-2", "/6973-197914400_medium.mp4", FOREST),
    ],
  },
  {
    id: "clinical-results",
    title: "Clinical Results",
    subtitle: "Pivotal readout, endpoint by endpoint",
    examples: [
      clip("results-1", "/27019-361107952_medium.mp4", FOREST),
      clip("results-2", "/46621-448480587_medium.mp4", DARK),
    ],
  },
  {
    id: "drug-explainer",
    title: "Drug Explainer",
    subtitle: "How the mechanism works, in sequence",
    examples: [
      clip("explainer-1", "/40781-426939561_medium.mp4", VIOLET),
      clip("explainer-2", "/133900-758336565_medium.mp4", PLUM),
    ],
  },
  {
    id: "field-rep-training",
    title: "Field Rep Training",
    subtitle: "Brief the field team before a launch",
    examples: [
      clip("field-1", "/tecentriq-reel.mp4", UMBER),
      clip("field-2", "/avatar-showcase.mp4", VIOLET),
    ],
  },
];

export function MagicVideoModeScreen() {
  const setCreationMode = useWorkspaceStore((s) => s.setCreationMode);
  const setPresentationMode = useWorkspaceStore((s) => s.setPresentationMode);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  const handleSelect = (mode: CreationMode) => {
    setCreationMode(mode);
    setPresentationMode("narrated");
    setDossierModalOpen(true);
  };

  return (
    <div className="page-enter max-w-[1140px] space-y-6">
      <div>
        <h1 className="text-hero font-[800] leading-tight tracking-[-1px] text-ink">Create Videos</h1>
        <p className="mt-1.5 max-w-[60ch] text-body-lg leading-relaxed text-ink-3">
          Grounded in your verified label claims, from the first scene.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 pt-1 sm:grid-cols-2 lg:grid-cols-3">
        {STARTING_POINTS.map((point, i) => (
          <StartingPointCard
            key={point.id}
            title={point.title}
            subtitle={point.subtitle}
            examples={point.examples}
            delayMs={80 + i * 45}
            onSelect={() => handleSelect("magic-reel")}
          />
        ))}
      </div>

      {/* Brand & Dossier Selection Pop-up Modal */}
      <BrandDossierModal open={dossierModalOpen} onClose={() => setDossierModalOpen(false)} />
    </div>
  );
}
