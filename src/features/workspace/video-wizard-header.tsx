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
  return (
    <header className="sticky top-0 z-40 flex h-[64px] w-full items-center justify-between border-b border-[var(--hair)] bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Back button + Mode Pill */}
      <div className="flex items-center gap-3 min-w-[200px]">
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

      {/* Center: Suave Apple-grade 3-Step Segmented Stepper */}
      <div className="flex items-center">
        <nav
          aria-label="Creation progress"
          className="flex items-center gap-1 rounded-full border border-[var(--hair-2)] bg-[#f4f5f3] p-1 shadow-inner"
        >
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12.5px] transition-all duration-200 ${
                  isCurrent
                    ? "bg-white font-bold text-[var(--ink)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[var(--hair-2)]"
                    : isCompleted
                    ? "font-semibold text-[var(--brand-deep)] hover:bg-white/60"
                    : "font-medium text-[var(--ink-4)]"
                }`}
              >
                <span
                  className={`grid size-4 place-items-center rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? "bg-[var(--brand)] text-white"
                      : isCompleted
                      ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                      : "bg-black/5 text-[var(--ink-4)]"
                  }`}
                >
                  {isCompleted ? <Check className="size-2.5" strokeWidth={3.5} /> : s.step}
                </span>
                <span>{s.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right: Clean Close Button (NO primary action button in header) */}
      <div className="flex items-center justify-end min-w-[200px]">
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
