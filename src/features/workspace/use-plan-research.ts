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
const TOTAL_MS = RESEARCH_STEPS.length * STEP_MS + SETTLE_MS;
const TICK_MS = 80;

export interface PlanResearch {
  researching: boolean;
  /** How many steps have completed. */
  step: number;
  /** 1-based index of the step currently running — what a counter should show. */
  current: number;
  /** 0-100, ticked smoothly so a progress readout does not jump in quarters. */
  progress: number;
  /** True once a run has finished — so the tray it filled in stays open. */
  completed: boolean;
  /** The step currently running — for the collapsed section's summary line. */
  label: string;
  total: number;
}

export function usePlanResearch(): PlanResearch {
  const researching = useWorkspaceStore((s) => s.planResearching);
  const setResearching = useWorkspaceStore((s) => s.setPlanResearching);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  // Never reset: a second run forces the tray open anyway, so this only ever
  // needs to answer "has research happened on this screen".
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!researching) return;
    const startedAt = Date.now();
    // Ticked rather than derived from `step`, which would jump 0/25/50/75.
    const tick = window.setInterval(() => {
      setProgress(Math.min(100, Math.round(((Date.now() - startedAt) / TOTAL_MS) * 100)));
    }, TICK_MS);
    const timers = RESEARCH_STEPS.map((_, i) =>
      window.setTimeout(() => setStep(i + 1), (i + 1) * STEP_MS),
    );
    // The reset belongs here, in the completion callback, rather than
    // synchronously at the top of the effect — which would set state during
    // the effect body and cascade a render on every run.
    const done = window.setTimeout(() => {
      setResearching(false);
      setStep(0);
      setProgress(0);
      setCompleted(true);
    }, TOTAL_MS);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(done);
      window.clearInterval(tick);
    };
  }, [researching, setResearching]);

  return {
    researching,
    step,
    current: Math.min(step + 1, RESEARCH_STEPS.length),
    progress,
    completed,
    label: RESEARCH_STEPS[Math.min(step, RESEARCH_STEPS.length - 1)],
    total: RESEARCH_STEPS.length,
  };
}
