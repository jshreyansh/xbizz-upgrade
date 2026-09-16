"use client";

import { useState } from "react";
import { useWorkspaceStore, type CreationMode } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";
import { AssetVideo } from "@/features/workspace/asset-video";

/**
 * Where a video starts.
 *
 * Six starting points rather than two engines. Reel or presenter is a
 * question the plan screen already asks with the brief in front of it; what
 * you actually know at this moment is what the video is for, which is what
 * each tile names. Every tile opens the same brand picker — the difference
 * between them is the work you have in mind, not a different pipeline.
 */
interface StartingPoint {
  id: string;
  title: string;
  subtitle: string;
  videoSrc: string;
  bg: string;
}

const STARTING_POINTS: StartingPoint[] = [
  {
    id: "scratch",
    title: "Create from Scratch",
    subtitle: "A blank brief, your own direction",
    videoSrc: "/reel-moa.mp4",
    bg: "linear-gradient(135deg, #09101d 0%, #152238 60%, #1f3557 100%)",
  },
  {
    id: "new-drug",
    title: "New Drug Release",
    subtitle: "Launch film for a newly approved brand",
    videoSrc: "/21617-319452308_medium.mp4",
    bg: "linear-gradient(135deg, #180924 0%, #2e1245 60%, #4a1d6e 100%)",
  },
  {
    id: "patient-handouts",
    title: "Patient Handouts",
    subtitle: "Plain language for someone starting treatment",
    videoSrc: "/Brevanta final draft-web.mp4",
    bg: "linear-gradient(135deg, #162022 0%, #25373b 60%, #3a555c 100%)",
  },
  {
    id: "clinical-results",
    title: "Clinical Results",
    subtitle: "Pivotal readout, endpoint by endpoint",
    videoSrc: "/27019-361107952_medium.mp4",
    bg: "linear-gradient(135deg, #0a1f18 0%, #13382c 60%, #1d5442 100%)",
  },
  {
    id: "drug-explainer",
    title: "Drug Explainer",
    subtitle: "How the mechanism works, in sequence",
    videoSrc: "/40781-426939561_medium.mp4",
    bg: "linear-gradient(135deg, #1b1622 0%, #352b42 60%, #524266 100%)",
  },
  {
    id: "field-rep-training",
    title: "Field Rep Training",
    subtitle: "Brief the field team before a launch",
    videoSrc: "/tecentriq-reel.mp4",
    bg: "linear-gradient(135deg, #221a16 0%, #3b2a25 60%, #5c413a 100%)",
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
          <button
            key={point.id}
            type="button"
            onClick={() => handleSelect("magic-reel")}
            className="rise-in-stagger group overflow-hidden rounded-card border border-hair bg-card text-left shadow-soft transition-all duration-200 hover:-translate-y-1"
            style={{ animationDelay: `${80 + i * 45}ms` }}
          >
            <div className="relative aspect-video overflow-hidden" style={{ background: point.bg }}>
              <AssetVideo src={point.videoSrc} />
            </div>
            <div className="p-3.5">
              <h3 className="text-body-lg font-[800] text-ink">{point.title}</h3>
              <p className="mt-0.5 text-label text-ink-3">{point.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Brand & Dossier Selection Pop-up Modal */}
      <BrandDossierModal open={dossierModalOpen} onClose={() => setDossierModalOpen(false)} />
    </div>
  );
}
