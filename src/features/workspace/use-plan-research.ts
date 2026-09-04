"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * The grounding research that runs when a brief becomes a plan.
 *
 * Submitting a brief used to swap the view synchronously, so the plan simply
 * appeared — fully cited, instantly, with no sense that anything had been
 * looked up. These are the steps that were always implied but never shown.
 */
export const RESEARCH_STEPS = [
  "Searching verified regulatory dossiers…",
  "Pulling SmPC and FDA label references…",
  "Validating claims against approved sources…",
  "Assembling the cited dossier…",
] as const;

const STEP_MS = 1500;
const SETTLE_MS = 500;

export interface PlanResearch {
  researching: boolean;
  /** How many steps have completed. */
  step: number;
  /** 1-based index of the step currently running — what a counter should show. */
  current: number;
  /** The step currently running — for the collapsed section's summary line. */
  label: string;
  total: number;
}

export function usePlanResearch(): PlanResearch {
  const researching = useWorkspaceStore((s) => s.planResearching);
  const setResearching = useWorkspaceStore((s) => s.setPlanResearching);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!researching) return;
    const timers = RESEARCH_STEPS.map((_, i) =>
      window.setTimeout(() => setStep(i + 1), (i + 1) * STEP_MS),
    );
    // The reset belongs here, in the completion callback, rather than
    // synchronously at the top of the effect — which would set state during
    // the effect body and cascade a render on every run.
    const done = window.setTimeout(() => {
      setResearching(false);
      setStep(0);
    }, RESEARCH_STEPS.length * STEP_MS + SETTLE_MS);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(done);
    };
  }, [researching, setResearching]);

  return {
    researching,
    step,
    current: Math.min(step + 1, RESEARCH_STEPS.length),
    label: RESEARCH_STEPS[Math.min(step, RESEARCH_STEPS.length - 1)],
    total: RESEARCH_STEPS.length,
  };
}
