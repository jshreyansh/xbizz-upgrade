"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { MagicVideoModeScreen } from "@/features/workspace/magic-video-mode-screen";
import { VideoCreationWizard } from "@/features/workspace/video-creation-wizard";
import { HomeScreen } from "@/features/workspace/home-screen";
import { StudioScreen } from "@/features/workspace/studio-screen";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export function SwishXApplication() {
  const view = useWorkspaceStore((state) => state.view);
  const videoSubStage = useWorkspaceStore((state) => state.videoSubStage);

  if (view === "create") {
    if (videoSubStage === "mode-select") {
      return (
        <AppShell pageTitle="Magic Video">
          <MagicVideoModeScreen />
        </AppShell>
      );
    }
    return <VideoCreationWizard />;
  }
  if (view === "directions") return <VideoCreationWizard />;
  if (view === "studio") return <StudioScreen />;

  return (
    <AppShell>
      <HomeScreen />
    </AppShell>
  );
}
