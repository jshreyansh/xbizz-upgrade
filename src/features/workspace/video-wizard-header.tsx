"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VideoWizardHeaderProps {
  currentStep: 1 | 2 | 3;
  onBack: () => void;
  onClose: () => void;
}

const STEPS = [
  { step: 1, label: "Source" },
  { step: 2, label: "Brief" },
  { step: 3, label: "Plan" },
] as const;

const STEP_TITLES: Record<1 | 2 | 3, { title: string; subtitle: string }> = {
  1: {
    title: "Choose brand dossier & goals",
    subtitle: "Step 1 of 3 · Source grounding",
  },
  2: {
    title: "Define the video brief",
    subtitle: "Step 2 of 3 · Creative intake",
  },
  3: {
    title: "Confirm the video plan",
    subtitle: "Step 3 of 3 · Plan approval",
  },
};

export function VideoWizardHeader({
  currentStep,
  onBack,
  onClose,
}: VideoWizardHeaderProps) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const currentStepInfo = STEP_TITLES[currentStep];

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-[var(--hair)] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Tier 1: Stepper Navigation Bar */}
      <div className="flex h-[54px] w-full items-center justify-between px-7 border-b border-[var(--hair)]/70">
        {/* Left: Clean Back Navigation */}
        <div className="flex items-center w-[140px]">
          <button
            onClick={onBack}
            className="focus-ring inline-flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[13px] font-semibold text-[var(--ink-2)] transition hover:bg-black/5 hover:text-[var(--ink)]"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Center: Sleek Connected 3-Node Stepper with Animated Progress Track */}
        <div className="flex items-center justify-center flex-1">
          <nav aria-label="Creation progress" className="relative flex w-[320px] items-center justify-between">
            {/* Background Connecting Hairline Track */}
            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[2px] bg-[#e5e7eb] rounded-full z-0" />

            {/* Active Filling Animated Progress Line */}
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--brand)] rounded-full z-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_0_8px_rgba(253,72,22,0.35)]"
              style={{ width: `calc(${progressPercent}% * 0.92)` }}
            />

            {/* 3 Step Nodes */}
            {STEPS.map((s) => {
              const isCompleted = currentStep > s.step;
              const isCurrent = currentStep === s.step;
              return (
                <div key={s.step} className="relative z-10 flex items-center gap-2 bg-white px-2 py-0.5 rounded-full">
                  <div
                    className={`grid size-6 place-items-center rounded-full text-[11px] transition-all duration-300 ${
                      isCompleted
                        ? "bg-[var(--brand)] text-white shadow-sm ring-2 ring-white"
                        : isCurrent
                        ? "bg-white text-[var(--brand)] border-2 border-[var(--brand)] ring-4 ring-[var(--tint)] shadow-sm font-bold scale-105"
                        : "bg-[#f4f5f3] text-[var(--ink-4)] border border-[#e5e7eb] font-medium"
                    }`}
                  >
                    {isCompleted ? <Check className="size-3" strokeWidth={3.5} /> : s.step}
                  </div>
                  <span
                    className={`text-[12px] tracking-tight transition-colors duration-200 ${
                      isCurrent
                        ? "font-extrabold text-[var(--ink)]"
                        : isCompleted
                        ? "font-bold text-[var(--brand-deep)]"
                        : "font-medium text-[var(--ink-4)]"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right: Clean Exit Button */}
        <div className="flex items-center justify-end w-[140px]">
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
      </div>

      {/* Tier 2: Persistent Full-Width Step Title Bar */}
      <div className="h-[46px] w-full bg-[#fafbf9]/90 backdrop-blur-sm overflow-hidden">
        <div className="mx-auto h-full w-full max-w-[1280px] px-6 sm:px-8">
          <div
            key={currentStep}
            className="flex h-full w-full items-center justify-between step-transition"
          >
            <h1 className="text-[17px] font-[800] tracking-tight text-[var(--ink)] sm:text-[18px]">
              {currentStepInfo.title}
            </h1>
            <span className="text-[12px] font-semibold text-[var(--ink-muted)]">
              {currentStepInfo.subtitle}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
