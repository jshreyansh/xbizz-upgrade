"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Where you are in the flow, and the way back through it.
 *
 * Every screen used to say this its own way: a bare pill on the plan screens,
 * a two-part crumb inside the video studio, nothing at all in the canvas. And
 * the back arrow beside them disagreed — in the video studio it went to the
 * app home from every mode, so the control shaped like "back" was the one that
 * left the project while the crumb next to it offered the real step back.
 *
 * One trail, both flows. Steps behind you are buttons, the one you are on is
 * plain, and steps ahead are dimmed and dead — you cannot skip work you have
 * not done. The arrow means one step back along this same trail, never home;
 * home is what the logo is for.
 */

export interface FlowStep {
  id: string;
  label: string;
  /** Omitted on the step you are on, and on steps not yet reached. */
  onGo?: () => void;
}

export function FlowBreadcrumb({
  steps,
  currentId,
}: {
  steps: FlowStep[];
  currentId: string;
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentId);

  return (
    <nav aria-label="Flow steps" className="ml-4 hidden min-w-0 items-center gap-1 lg:flex">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        return (
          <span key={step.id} className="flex min-w-0 items-center gap-1">
            {index > 0 && (
              <ChevronRight className="size-3 shrink-0 text-ink-4" aria-hidden />
            )}
            {isPast && step.onGo ? (
              <button
                type="button"
                onClick={step.onGo}
                className="focus-ring cursor-pointer truncate rounded-chip px-2 py-0.5 text-caption font-bold text-ink-3 transition hover:bg-tint hover:text-brand-deep"
              >
                {step.label}
              </button>
            ) : (
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "truncate rounded-chip px-2 py-0.5 text-caption font-extrabold",
                  isCurrent
                    ? "border border-tint-line bg-tint text-brand-deep"
                    : "text-ink-4"
                )}
              >
                {step.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** The step before the one you are on, which is what Back means. */
export function previousStep(steps: FlowStep[], currentId: string): FlowStep | null {
  const i = steps.findIndex((s) => s.id === currentId);
  return i > 0 ? steps[i - 1] : null;
}
