"use client";

import { ArrowRight, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoWizardHeader } from "@/features/workspace/video-wizard-header";
import { MagicVideoSourceScreen } from "@/features/workspace/magic-video-source-screen";
import { CreateScreen } from "@/features/workspace/create-screen";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { deriveContentPlan } from "@/features/workspace/content-plan";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export function VideoCreationWizard() {
  const router = useRouter();
  const view = useWorkspaceStore((s) => s.view);
  const videoSubStage = useWorkspaceStore((s) => s.videoSubStage);
  const creationMode = useWorkspaceStore((s) => s.creationMode);
  const sourceType = useWorkspaceStore((s) => s.sourceType);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);
  const setBrief = useWorkspaceStore((s) => s.setBrief);
  const setSelectedSourceIds = useWorkspaceStore((s) => s.setSelectedSourceIds);

  const brief = useWorkspaceStore((s) => s.brief);
  const audience = useWorkspaceStore((s) => s.audience);
  const intendedUse = useWorkspaceStore((s) => s.intendedUse);
  const presenter = useWorkspaceStore((s) => s.voice);
  const selectedSourceIds = useWorkspaceStore((s) => s.selectedSourceIds);

  // Determine current step index (1, 2, or 3)
  const currentStep: 1 | 2 | 3 =
    view === "directions" || videoSubStage === "directions"
      ? 3
      : videoSubStage === "intake"
      ? 2
      : 1;

  const market = useWorkspaceStore((s) => s.market);

  // Derive plan for Step 3 resolution check
  const derivedPlan = deriveContentPlan({
    assetType: "video",
    brief,
    audience,
    market,
    intendedUse,
    selectedSourceIds,
    creationMode,
    sourceType,
    sourcePayload,
  });

  const needsPresenter = derivedPlan.treatmentId === "presenter" || creationMode === "magic-avatar";
  const unresolvedCount =
    (needsPresenter && !presenter ? 1 : 0) +
    (derivedPlan.sourceConflict ? 1 : 0);

  // Handle Back
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

  // Handle Step Forward
  const handleContinue = () => {
    if (currentStep === 1) {
      // Advance to Brief
      if (sourceType === "dossier") {
        const dossierId = sourcePayload.dossierId || "velmora";
        setSelectedSourceIds(["dermora-core", "dermora-claims", "dermora-brand"]);
        if (!brief || brief.length < 10) {
          if (creationMode === "magic-reel") {
            setBrief(`Create a concise ${dossierId === "velmora" ? "Velmora" : "Onkavia"} HCP launch video explaining clinical need, mechanism, and pivotal risk reduction.`);
          } else if (creationMode === "magic-avatar") {
            setBrief(`Create a presenter-led clinical briefing video with Dr. Maya Kapoor highlighting the key trial readouts from the ${dossierId === "velmora" ? "Velmora" : "Onkavia"} dossier.`);
          }
        }
      } else if (sourceType === "url") {
        setSelectedSourceIds(["dermora-core"]);
        if (!brief || brief.length < 10) {
          setBrief(`Create a video based on the clinical trial evidence and prescribing data from ${sourcePayload.url || "study"}.`);
        }
      } else {
        setSelectedSourceIds([]);
        if (!brief || brief.length < 10) {
          setBrief((sourcePayload.text || "").slice(0, 160));
        }
      }
      setVideoSubStage("intake");
    } else if (currentStep === 2) {
      // Advance to Plan
      setView("directions");
      setVideoSubStage("directions");
    } else {
      // Advance to Studio
      setView("studio");
    }
  };

  // Forward button label & helper status text
  const ctaLabel =
    currentStep === 1
      ? "Continue to job brief"
      : currentStep === 2
      ? "Prepare content plan"
      : "Create storyboard";

  const helperStatus =
    currentStep === 1 ? (
      <div className="flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
        <ShieldCheck className="size-4 text-[var(--ok)]" />
        <span>Evidence grounded against verified regulatory label</span>
      </div>
    ) : currentStep === 2 ? (
      <div className="flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
        <ShieldCheck className="size-4 text-[var(--brand)]" />
        <span>Nothing is created until you confirm the plan</span>
      </div>
    ) : unresolvedCount === 0 ? (
      <div className="flex items-center gap-2 text-[13px] text-[var(--ok)] font-semibold">
        <CheckCircle2 className="size-4 text-[var(--ok)]" />
        <span>Plan ready for editable storyboard</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-[13px] text-[var(--warn)] font-semibold">
        <Info className="size-4 text-[var(--warn)]" />
        <span>{unresolvedCount} decision{unresolvedCount === 1 ? "" : "s"} need you</span>
      </div>
    );

  const forwardDisabled = currentStep === 3 && unresolvedCount > 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f6]">
      {/* Persistent Animated Header */}
      <VideoWizardHeader
        currentStep={currentStep}
        onBack={handleBack}
        onClose={handleClose}
      />

      {/* Main Step Canvas with Smooth Fade */}
      <div className="flex-1 transition-opacity duration-300">
        {currentStep === 1 && <MagicVideoSourceScreen embedded />}
        {currentStep === 2 && <CreateScreen embedded />}
        {currentStep === 3 && <DirectionsScreen embedded />}
      </div>

      {/* Persistent Standardized Bottom Action Dock */}
      <footer className="sticky bottom-0 z-30 flex h-[74px] w-full shrink-0 items-center justify-between border-t border-[var(--hair)] bg-white/95 px-8 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <div className="hidden sm:flex items-center">{helperStatus}</div>
        <div className="flex items-center gap-3 ml-auto">
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={forwardDisabled}
            className="focus-ring h-12 px-8 rounded-[14px] text-[15px] font-bold shadow-md bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white transition-all duration-200"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
