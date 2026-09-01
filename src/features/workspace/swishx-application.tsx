"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { MagicVideoModeScreen } from "@/features/workspace/magic-video-mode-screen";
import { CreativesModeScreen } from "@/features/workspace/creatives-mode-screen";
import { VideoCreationWizard } from "@/features/workspace/video-creation-wizard";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { HomeScreen } from "@/features/workspace/home-screen";
import { StudioScreen } from "@/features/workspace/studio-screen";
import { InfographicStudioScreen } from "@/features/workspace/infographic-studio-screen";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export function SwishXApplication() {
  const view = useWorkspaceStore((state) => state.view);
  const videoSubStage = useWorkspaceStore((state) => state.videoSubStage);
  const assetType = useWorkspaceStore((state) => state.assetType);

  if (view === "home") {
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
    return <StudioScreen />;
  }

  if (view === "create") {
    if (videoSubStage === "mode-select") {
      if (assetType === "infographic") {
        return (
          <AppShell pageTitle="Magic Canvas">
            <CreativesModeScreen />
          </AppShell>
        );
      }
      return (
        <AppShell pageTitle="Magic Video">
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
