"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { MagicVideoModeScreen } from "@/features/workspace/magic-video-mode-screen";
import { CreativesModeScreen } from "@/features/workspace/creatives-mode-screen";
import { AdsModeScreen } from "@/features/workspace/ads-mode-screen";
import { VideoCreationWizard } from "@/features/workspace/video-creation-wizard";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { HomeScreen } from "@/features/workspace/home-screen";
import { StudioScreen } from "@/features/workspace/studio-screen";
import { InfographicStudioScreen } from "@/features/workspace/infographic-studio-screen";
import { AdsStudioScreen } from "@/features/workspace/ads-studio-screen";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useCan } from "@/features/settings/view-as";

export function SwishXApplication() {
  const view = useWorkspaceStore((state) => state.view);
  const videoSubStage = useWorkspaceStore((state) => state.videoSubStage);
  const assetType = useWorkspaceStore((state) => state.assetType);
  const studioEntry = useWorkspaceStore((state) => state.studioEntry);
  const { can } = useCan();
  /* The root follows the last screen you were on, which may be a studio.
     Without Create that is Home instead; a published asset opened to view
     is still allowed, as on /create. */
  const viewingPublished = view === "studio" && studioEntry === "review";

  if (view === "home" || (!can("create") && !viewingPublished)) {
    return (
      <AppShell>
        <HomeScreen />
      </AppShell>
    );
  }

  if (view === "directions") {
    return <DirectionsScreen />;
  }

  if (view === "studio") {
    if (assetType === "infographic") {
      return <InfographicStudioScreen />;
    }
    if (assetType === "ad") {
      return <AdsStudioScreen />;
    }
    return <StudioScreen />;
  }

  if (view === "create") {
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
    return <VideoCreationWizard />;
  }

  return (
    <AppShell>
      <HomeScreen />
    </AppShell>
  );
}
