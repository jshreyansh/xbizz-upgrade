"use client";

import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VideoWizardHeaderProps {
  currentStep: 1 | 2 | 3;
  onBack: () => void;
  onClose: () => void;
}

const STEP_HEADINGS: Record<1 | 2 | 3, string> = {
  1: "Choose brand dossier & goals",
  2: "Define the video brief",
  3: "Confirm the video plan",
};

export function VideoWizardHeader({
  currentStep,
  onBack,
  onClose,
}: VideoWizardHeaderProps) {
  const currentHeading = STEP_HEADINGS[currentStep];
  const progressPercent = (currentStep / 3) * 100;

  return (
    <header className="sticky top-0 z-40 relative flex h-[60px] w-full shrink-0 items-center justify-between bg-white px-7 border-b border-[#eef0eb] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Clean Back Navigation (Fixed Width) */}
      <div className="flex items-center w-[160px]">
        <button
          onClick={onBack}
          className="focus-ring inline-flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[13px] font-semibold text-[var(--ink-2)] transition hover:bg-black/5 hover:text-[var(--ink)]"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Center: Step Heading + 'Step X of 3' Badge (Rock-Solid Persistent, No Remounting) */}
      <div className="flex items-center justify-center gap-2.5 flex-1 min-w-0">
        <h1 className="text-[16px] font-[800] tracking-tight text-[var(--ink)] sm:text-[17px] truncate">
          {currentHeading}
        </h1>
        <span className="shrink-0 rounded-full bg-[#f2f4f2] px-2.5 py-0.5 text-[11.5px] font-bold text-[var(--ink-3)] border border-[#e5e7eb]">
          Step {currentStep} of 3
        </span>
      </div>

      {/* Right: Clean Exit Button (Fixed Width) */}
      <div className="flex items-center justify-end w-[160px]">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="size-8 rounded-[9px] text-[var(--ink-3)] hover:bg-black/5 hover:text-[var(--ink)]"
          aria-label="Exit creation"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Full-Width Header Bottom Border Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#eef0eb]" />
      <div
        className="absolute bottom-0 left-0 h-[2.5px] bg-[var(--brand)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_0_10px_rgba(253,72,22,0.45)]"
        style={{ width: `${progressPercent}%` }}
      />
    </header>
  );
}
