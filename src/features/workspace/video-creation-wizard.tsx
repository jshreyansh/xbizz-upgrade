"use client";

import { MagicVideoSourceScreen } from "@/features/workspace/magic-video-source-screen";
import { CreateScreen } from "@/features/workspace/create-screen";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export function VideoCreationWizard() {
  const view = useWorkspaceStore((s) => s.view);
  const videoSubStage = useWorkspaceStore((s) => s.videoSubStage);

  // Stage routing — each screen manages its own back navigation and header
  const stage: 1 | 2 | 3 =
    view === "directions" || videoSubStage === "directions"
      ? 3
      : videoSubStage === "intake"
      ? 2
      : 1;

  return (
    <>
      {stage === 1 && <MagicVideoSourceScreen />}
      {stage === 2 && <CreateScreen />}
      {stage === 3 && <DirectionsScreen />}
    </>
  );
}
