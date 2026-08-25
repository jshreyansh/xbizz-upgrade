"use client";

import { useRouter } from "next/navigation";
import { VideoWizardHeader } from "@/features/workspace/video-wizard-header";
import { MagicVideoSourceScreen } from "@/features/workspace/magic-video-source-screen";
import { CreateScreen } from "@/features/workspace/create-screen";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export function VideoCreationWizard() {
  const router = useRouter();
  const view = useWorkspaceStore((s) => s.view);
  const videoSubStage = useWorkspaceStore((s) => s.videoSubStage);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);

  // Determine current step index (1, 2, or 3)
  const currentStep: 1 | 2 | 3 =
    view === "directions" || videoSubStage === "directions"
      ? 3
      : videoSubStage === "intake"
      ? 2
      : 1;

  // Handle Back Navigation
  const handleBack = () => {
    if (currentStep === 3) {
      setVideoSubStage("intake");
      setView("create");
    } else if (currentStep === 2) {
      setVideoSubStage("source-select");
    } else {
      setVideoSubStage("mode-select");
    }
  };

  // Handle Close
  const handleClose = () => {
    setView("home");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f6]">
      {/* Persistent Animated Stepper Header */}
      <VideoWizardHeader
        currentStep={currentStep}
        onBack={handleBack}
        onClose={handleClose}
      />

      {/* Main Step Canvas */}
      <div className="flex-1">
        {currentStep === 1 && <MagicVideoSourceScreen embedded />}
        {currentStep === 2 && <CreateScreen embedded />}
        {currentStep === 3 && <DirectionsScreen embedded />}
      </div>
    </div>
  );
}
