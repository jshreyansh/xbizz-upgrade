"use client";

import { PageHeading } from "@/components/patterns/page-heading";
import { useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";
import { StartingPointCard, type StartingPointExample } from "@/features/workspace/starting-point-card";
import { CreateTile } from "@/components/patterns/create-tile";
import { AD_KIND_PRESETS, type AdKind } from "@/features/workspace/ad-options";

/**
 * Where an ad campaign starts.
 *
 * The same page as Video and Docs: Create From Scratch, then the campaigns US
 * pharma brands actually run. Each one already knows its kind of ad, its
 * audience and its usual platforms, so the start modal opens with those
 * answered and the marketer only picks the brand.
 */
const DARK = "linear-gradient(135deg, #09101d 0%, #152238 60%, #1f3557 100%)";
const PLUM = "linear-gradient(135deg, #180924 0%, #2e1245 60%, #4a1d6e 100%)";
const FOREST = "linear-gradient(135deg, #0a1f18 0%, #13382c 60%, #1d5442 100%)";
const SLATE = "linear-gradient(135deg, #162022 0%, #25373b 60%, #3a555c 100%)";
const VIOLET = "linear-gradient(135deg, #1b1622 0%, #352b42 60%, #524266 100%)";
const UMBER = "linear-gradient(135deg, #221a16 0%, #3b2a25 60%, #5c413a 100%)";

const clip = (
  id: string,
  videoSrc: string,
  bg: string,
  badge: string,
  aspect: string
): StartingPointExample => ({ id, videoSrc, bg, badge, aspect });

const STARTING_POINTS: { id: Exclude<AdKind, "scratch">; subtitle: string; examples: StartingPointExample[] }[] = [
  {
    id: "brand-launch",
    subtitle: "Product claim ads for a newly approved drug",
    examples: [
      clip("launch-1", "/21617-319452308_medium.mp4", PLUM, "YouTube In-Stream", "16:9 · 30 sec"),
      clip("launch-2", "/133898-758336558_medium.mp4", DARK, "Instagram Reels", "9:16 · 15 sec"),
    ],
  },
  {
    id: "disease-awareness",
    subtitle: "About the condition, with no drug named",
    examples: [
      clip("awareness-1", "/6973-197914400_medium.mp4", FOREST, "TikTok In-Feed", "9:16 · 15 sec"),
      clip("awareness-2", "/Brevanta final draft-web.mp4", SLATE, "Connected TV", "16:9 · 30 sec"),
    ],
  },
  {
    id: "reminder",
    subtitle: "The brand name only, for short spots and search",
    examples: [
      clip("reminder-1", "/133900-758336565_medium.mp4", PLUM, "YouTube Bumper", "16:9 · 6 sec"),
      clip("reminder-2", "/326638_medium.mp4", DARK, "Display Banner", "300×250"),
    ],
  },
  {
    id: "hcp-campaign",
    subtitle: "Clinical claims for doctors on HCP networks",
    examples: [
      clip("hcp-1", "/27019-361107952_medium.mp4", FOREST, "Medscape In-Feed", "1:1 · 15 sec"),
      clip("hcp-2", "/46621-448480587_medium.mp4", DARK, "Doximity", "16:9 · 30 sec"),
    ],
  },
  {
    id: "savings",
    subtitle: "Drive sign-ups to the savings programme",
    examples: [
      clip("savings-1", "/4360-178617258_medium.mp4", UMBER, "Meta Feed", "4:5 · Image"),
      clip("savings-2", "/40781-426939561_medium.mp4", VIOLET, "Google Display", "300×600"),
    ],
  },
  {
    id: "new-indication",
    subtitle: "A new approval or trial result, for prescribers",
    examples: [
      clip("indication-1", "/tecentriq-reel.mp4", UMBER, "Programmatic Video", "16:9 · 15 sec"),
      clip("indication-2", "/reel-moa.mp4", VIOLET, "HCP Network", "1:1 · 15 sec"),
    ],
  },
];

export function AdsModeScreen() {
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  const handleSelect = (kind: AdKind) => {
    const preset = AD_KIND_PRESETS[kind];
    const store = useWorkspaceStore.getState();
    store.setAssetType("ad");
    store.setAdKind(kind);
    store.setAdType(preset.adType);
    store.setAdPlacements(preset.placements);
    setDossierModalOpen(true);
  };

  return (
    <div className="page-enter max-w-[1140px] space-y-6">
      <PageHeading title="Create Ads" description="Grounded in your verified label claims, ready for every platform." />

      <div className="grid grid-cols-1 gap-5 pt-1 sm:grid-cols-2 lg:grid-cols-3">
        <CreateTile
          title="Create From Scratch"
          subtitle="A blank brief and your own direction, grounded in the same approved claims."
          delayMs={80}
          onSelect={() => handleSelect("scratch")}
        />
        {STARTING_POINTS.map((point, i) => (
          <StartingPointCard
            key={point.id}
            title={AD_KIND_PRESETS[point.id].title}
            subtitle={point.subtitle}
            examples={point.examples}
            delayMs={125 + i * 45}
            onSelect={() => handleSelect(point.id)}
          />
        ))}
      </div>

      <BrandDossierModal open={dossierModalOpen} onClose={() => setDossierModalOpen(false)} />
    </div>
  );
}
