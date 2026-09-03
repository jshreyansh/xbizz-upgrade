"use client";

import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VideoWizardHeaderProps {
  currentStep: 1 | 2 | 3;
  onBack: () => void;
  onClose: () => void;
}

const STEP_CONFIG = [
  { step: 1, title: "Choose brand dossier & goals", short: "Source" },
  { step: 2, title: "Define the video brief", short: "Brief" },
  { step: 3, title: "Confirm the video plan", short: "Plan" },
] as const;

export function VideoWizardHeader({
  currentStep,
  onBack,
  onClose,
}: VideoWizardHeaderProps) {
  const currentStepConfig = STEP_CONFIG[currentStep - 1] || STEP_CONFIG[0];
  // Like onboarding: step 1 = 33%, step 2 = 66%, step 3 = 100%
  const progressPercent = (currentStep / 3) * 100;

  return (
    <header className="sticky top-0 z-40 relative flex h-[62px] w-full shrink-0 items-center justify-between bg-white px-6 sm:px-8 border-b border-[#eef0eb] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors duration-300">
      {/* Left: Back button with step indicator */}
      <div className="flex items-center gap-3 min-w-[140px]">
        <button
          onClick={onBack}
          className="focus-ring inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1.5 text-body-lg font-semibold text-ink-2 transition-all duration-200 hover:bg-black/5 hover:text-ink"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Center: Animated Title & Onboarding-style Step Dots */}
      <div className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 max-w-full">
          <h1 className="text-subhead font-[800] tracking-tight text-ink sm:text-title truncate transition-all duration-300">
            {currentStepConfig.title}
          </h1>
          <span className="shrink-0 rounded-full bg-tint px-2.5 py-0.5 text-label font-bold text-brand-deep border border-tint-line">
            Step {currentStep} of 3
          </span>
        </div>

        {/* Step dots under header text (smooth animated pill like onboarding) */}
        <div className="flex items-center gap-1.5">
          {STEP_CONFIG.map((s) => (
            <span
              key={s.step}
              className="block rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: currentStep === s.step ? 22 : 6,
                height: 4,
                backgroundColor:
                  currentStep >= s.step ? "var(--brand)" : "rgba(10,13,20,0.14)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Right: Exit / Close */}
      <div className="flex items-center justify-end min-w-[140px]">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="size-8 rounded-[9px] text-ink-3 hover:bg-black/5 hover:text-ink transition-colors"
          aria-label="Exit creation"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Persistent Full-Width Header Bottom Progress Bar (identical smooth easing to Onboarding) */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#eef0eb]" />
      <div
        className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-brand to-[#ff8f4d] shadow-[0_0_10px_rgba(253,72,22,0.45)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: `${progressPercent}%` }}
      />
    </header>
  );
}
