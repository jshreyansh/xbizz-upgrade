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

export function VideoWizardHeader({
  currentStep,
  onBack,
  onClose,
}: VideoWizardHeaderProps) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <header className="sticky top-0 z-40 flex h-[60px] w-full shrink-0 items-center justify-between border-b border-[var(--hair)] bg-white/95 px-7 backdrop-blur-md">
      {/* Left: Clean Back Navigation (Fixed Width, No Shifting SX Logo or Dynamic Text) */}
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

      {/* Right: Clean Exit Button (Fixed Width) */}
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
    </header>
  );
}
