"use client";

import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { Button } from "@/components/ui/button";

export interface VideoWizardHeaderProps {
  currentStep: 1 | 2 | 3;
  onBack: () => void;
  onNext?: () => void;
  onClose: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
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
  onNext,
  onClose,
  nextLabel = "Continue",
  nextDisabled = false,
  modeLabel,
}: VideoWizardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-[64px] items-center border-b border-[var(--line)] bg-white/95 px-4 backdrop-blur-xl sm:px-7">
      {/* Left: Back button + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="focus-ring grid size-9 place-items-center rounded-[10px] text-[var(--ink-muted)] transition hover:bg-black/5 hover:text-[var(--ink)]"
          aria-label="Go back"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <SwishXMark compact />
        {modeLabel && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--brand)]">
            {modeLabel}
          </span>
        )}
      </div>

      {/* Center: Aesthetic 3-Step Progress Stepper */}
      <nav aria-label="Creation progress" className="mx-auto flex items-center gap-2 sm:gap-3">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <div key={s.step} className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold transition-all duration-300 ${
                  isCurrent
                    ? "bg-[var(--brand)] text-white shadow-sm ring-2 ring-[var(--brand)] ring-offset-2 scale-105"
                    : isCompleted
                    ? "bg-[var(--tint)] text-[var(--brand-deep)]"
                    : "bg-black/[0.04] text-[var(--ink-4)]"
                }`}
              >
                <span
                  className={`grid size-4 place-items-center rounded-full text-[10px] ${
                    isCurrent
                      ? "bg-white text-[var(--brand)]"
                      : isCompleted
                      ? "bg-[var(--brand)] text-white"
                      : "bg-black/10 text-[var(--ink-3)]"
                  }`}
                >
                  {isCompleted ? <Check className="size-2.5" strokeWidth={3.5} /> : s.step}
                </span>
                <span className="hidden xs:inline sm:inline">{s.label}</span>
              </div>

              {idx < STEPS.length - 1 && (
                <span
                  className={`h-0.5 w-4 sm:w-6 rounded-full transition-colors duration-300 ${
                    currentStep > s.step ? "bg-[var(--brand)]" : "bg-black/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Right: Next CTA + Close Button */}
      <div className="flex items-center gap-2">
        {onNext && (
          <Button
            size="sm"
            onClick={onNext}
            disabled={nextDisabled}
            className="shadow-sm font-bold text-[13px] px-3.5"
          >
            <span>{nextLabel}</span>
            <ArrowRight className="size-3.5 ml-1" />
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="size-9 rounded-[10px] text-[var(--ink-muted)] hover:bg-black/5"
          aria-label="Exit creation"
        >
          <X className="size-[18px]" />
        </Button>
      </div>
    </header>
  );
}
