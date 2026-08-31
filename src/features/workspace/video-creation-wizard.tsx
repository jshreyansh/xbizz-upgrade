"use client";

import { CreateScreen } from "@/features/workspace/create-screen";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export function VideoCreationWizard() {
  const view = useWorkspaceStore((s) => s.view);
  const videoSubStage = useWorkspaceStore((s) => s.videoSubStage);

  // Stage routing — each screen manages its own back navigation and header
  const isDirections = view === "directions" || videoSubStage === "directions";

  return (
    <>
      {isDirections ? <DirectionsScreen /> : <CreateScreen />}
    </>
  );
}

