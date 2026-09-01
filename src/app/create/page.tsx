"use client";

import { useEffect } from "react";
import { AppShell } from "@/features/workspace/app-shell";
import { MagicVideoModeScreen } from "@/features/workspace/magic-video-mode-screen";
import { CreativesModeScreen } from "@/features/workspace/creatives-mode-screen";
import { MagicVideoSourceScreen } from "@/features/workspace/magic-video-source-screen";
import { CreateScreen } from "@/features/workspace/create-screen";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { StudioScreen } from "@/features/workspace/studio-screen";
import { InfographicStudioScreen } from "@/features/workspace/infographic-studio-screen";
import { VideoCreationWizard } from "@/features/workspace/video-creation-wizard";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export default function CreatePage() {
  const view = useWorkspaceStore((state) => state.view);
  const videoSubStage = useWorkspaceStore((state) => state.videoSubStage);
  const assetType = useWorkspaceStore((state) => state.assetType);
  const setView = useWorkspaceStore((state) => state.setView);

  useEffect(() => {
    if (view === "home") {
      setView("create");
    }
  }, [view, setView]);

  if (view === "directions") return <DirectionsScreen />;
  if (view === "studio") {
    if (assetType === "infographic") {
      return <InfographicStudioScreen />;
    }
    return <StudioScreen />;
  }

  // Stage 1 (Mode Selection) renders within the platform shell with sidebar
  if (videoSubStage === "mode-select") {
    if (assetType === "infographic") {
      return (
        <AppShell pageTitle="Creatives">
          <CreativesModeScreen />
        </AppShell>
      );
    }
    return (
      <AppShell pageTitle="Create Videos with AI">
        <MagicVideoModeScreen />
      </AppShell>
    );
  }

  // Once a card is clicked, transitions to the persistent VideoCreationWizard stepper
  return <VideoCreationWizard />;
}
