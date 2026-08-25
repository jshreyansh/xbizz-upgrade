"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { Button } from "@/components/ui/button";

export interface VideoWizardHeaderProps {
  currentStep: 1 | 2 | 3;
  onBack: () => void;
  onClose: () => void;
  modeLabel?: string;
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
  modeLabel,
}: VideoWizardHeaderProps) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <header className="sticky top-0 z-40 flex h-[64px] w-full shrink-0 items-center justify-between border-b border-[var(--hair)] bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Back button + Product Mark + Mode Pill */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <button
          onClick={onBack}
          className="focus-ring grid size-9 place-items-center rounded-[10px] text-[var(--ink-3)] transition hover:bg-black/5 hover:text-[var(--ink)]"
          aria-label="Go back"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <SwishXMark compact />
        {modeLabel && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[11.5px] font-semibold text-[var(--brand-deep)] border border-[var(--tint-line)]">
            {modeLabel}
          </span>
        )}
      </div>

      {/* Center: Connected 3-Node Stepper with Animated Progress Line */}
      <div className="flex items-center">
        <nav aria-label="Creation progress" className="relative flex w-[280px] items-center justify-between">
          {/* Background Connecting Line */}
          <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[2px] bg-[#e5e7eb] rounded-full z-0" />

          {/* Active Filling Progress Line */}
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 h-[2.5px] bg-[var(--brand)] rounded-full z-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `calc(${progressPercent}% * 0.92)` }}
          />

          {/* 3 Step Nodes */}
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center gap-1 bg-white px-1">
                <div
                  className={`grid size-7 place-items-center rounded-full text-[11.5px] transition-all duration-300 ${
                    isCompleted
                      ? "bg-[var(--brand)] text-white border-2 border-[var(--brand)] shadow-sm"
                      : isCurrent
                      ? "bg-white text-[var(--brand)] border-2 border-[var(--brand)] ring-4 ring-[var(--tint)] shadow-sm font-bold scale-105"
                      : "bg-[#f4f5f3] text-[var(--ink-4)] border-2 border-[#e5e7eb] font-semibold"
                  }`}
                >
                  {isCompleted ? <Check className="size-3.5" strokeWidth={3.5} /> : s.step}
                </div>
                <span
                  className={`text-[11.5px] transition-colors duration-200 ${
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

      {/* Right: Clean Close Button */}
      <div className="flex items-center justify-end min-w-[220px]">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="size-9 rounded-[10px] text-[var(--ink-3)] hover:bg-black/5 hover:text-[var(--ink)]"
          aria-label="Exit creation"
        >
          <X className="size-[18px]" />
        </Button>
      </div>
    </header>
  );
}
