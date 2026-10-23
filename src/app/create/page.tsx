"use client";

import { useEffect } from "react";
import { AppShell } from "@/features/workspace/app-shell";
import { MagicVideoModeScreen } from "@/features/workspace/magic-video-mode-screen";
import { CreativesModeScreen } from "@/features/workspace/creatives-mode-screen";
import { AdsModeScreen } from "@/features/workspace/ads-mode-screen";
import { MagicVideoSourceScreen } from "@/features/workspace/magic-video-source-screen";
import { CreateScreen } from "@/features/workspace/create-screen";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { StudioScreen } from "@/features/workspace/studio-screen";
import { InfographicStudioScreen } from "@/features/workspace/infographic-studio-screen";
import { AdsStudioScreen } from "@/features/workspace/ads-studio-screen";
import { VideoCreationWizard } from "@/features/workspace/video-creation-wizard";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { NoAccess, useCan } from "@/features/settings/view-as";

export default function CreatePage() {
  const view = useWorkspaceStore((state) => state.view);
  const videoSubStage = useWorkspaceStore((state) => state.videoSubStage);
  const assetType = useWorkspaceStore((state) => state.assetType);
  const setView = useWorkspaceStore((state) => state.setView);
  const studioEntry = useWorkspaceStore((state) => state.studioEntry);
  const { can } = useCan();

  useEffect(() => {
    if (view === "home") {
      setView("create");
    }
  }, [view, setView]);

  /* Making content needs Create, edit & publish. Opening something published
     to view it (from the library or a review) is open to everyone. */
  const viewingPublished = view === "studio" && studioEntry === "review";
  if (!can("create") && !viewingPublished) {
    return (
      <AppShell pageTitle="Studio">
        <NoAccess area="The studio" needs="create" instead="Published content is in the Content Library." />
      </AppShell>
    );
  }

  if (view === "directions") return <DirectionsScreen />;
  if (view === "studio") {
    if (assetType === "infographic") {
      return <InfographicStudioScreen />;
    }
    if (assetType === "ad") {
      return <AdsStudioScreen />;
    }
    return <StudioScreen />;
  }

  // Stage 1 (Mode Selection) renders within the platform shell with sidebar
  if (videoSubStage === "mode-select") {
    if (assetType === "ad") {
      return (
        <AppShell pageTitle="Create Ads">
          <AdsModeScreen />
        </AppShell>
      );
    }
    if (assetType === "infographic") {
      return (
        <AppShell pageTitle="Create Doc/Images">
          <CreativesModeScreen />
        </AppShell>
      );
    }
    return (
      <AppShell pageTitle="Create Videos">
        <MagicVideoModeScreen />
      </AppShell>
    );
  }

  // Once a card is clicked, transitions to the persistent VideoCreationWizard stepper
  return <VideoCreationWizard />;
}
