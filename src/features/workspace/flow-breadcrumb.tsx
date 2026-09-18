"use client";


/**
 * Where you are in the flow.
 *
 * The whole trail used to be printed across the header: five steps, four
 * chevrons, most of them either done or unreachable. It spent the widest part
 * of the screen restating a sequence that does not change, to say one thing —
 * which step you are on. So it says that, with a position so the length of
 * the flow is still known.
 *
 * Moving back is the arrow beside it, which means one step back along this
 * trail and never home; home is what the logo is for. The steps themselves
 * were never a way to skip ahead — you cannot skip work you have not done —
 * so nothing is lost by not drawing them.
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
  const current = steps[currentIndex];
  if (!current) return null;

  return (
    <nav aria-label="Flow steps" className="ml-4 hidden min-w-0 items-center gap-1.5 lg:flex">
      <span
        aria-current="step"
        className="truncate rounded-chip border border-tint-line bg-tint px-2.5 py-0.5 text-caption font-extrabold text-brand-deep"
      >
        {current.label}
      </span>
      {currentIndex > 0 && (
        <span className="shrink-0 text-micro font-bold tabular-nums text-ink-4">
          {currentIndex + 1} of {steps.length}
        </span>
      )}
    </nav>
  );
}

/** The step before the one you are on, which is what Back means. */
export function previousStep(steps: FlowStep[], currentId: string): FlowStep | null {
  const i = steps.findIndex((s) => s.id === currentId);
  return i > 0 ? steps[i - 1] : null;
}
