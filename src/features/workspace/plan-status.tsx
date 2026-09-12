"use client";

import { AlertTriangle, Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * What a plan section's chip says, and what it is allowed to say.
 *
 * The chips had grown seven labels — "From source", "From brief", "Confirmed",
 * "Recommended", "Optional", "Needs you", "Needs Assets" — doing two different
 * jobs at once: whether the section needs you, and where its answer came from.
 * Mixed into one badge they cancel each other out, because "Recommended" and
 * "Needs you" look like peers and only one of them is a call to action.
 *
 * So there are three states and only three, and provenance is demoted to
 * muted text in the summary line where it belongs — it is background, not a
 * thing to act on.
 */
export type PlanState = "needs-you" | "answered" | "optional";

export function planState(needsYou: boolean, optional = false): PlanState {
  return needsYou ? "needs-you" : optional ? "optional" : "answered";
}

const STATE_LABEL: Record<PlanState, string> = {
  "needs-you": "Needs you",
  answered: "Answered",
  optional: "Optional",
};

export function PlanStatusChip({ state, open }: { state: PlanState; open?: boolean }) {
  return (
    <span
      className={cn(
        "hidden shrink-0 items-center gap-1 rounded-full border font-bold sm:inline-flex",
        open ? "px-2.5 py-1 text-label" : "px-2 py-0.5 text-micro",
        state === "needs-you"
          ? "border-warn-line bg-warn-bg text-warn"
          : state === "answered"
            ? "border-ok-line bg-ok-bg text-ok"
            : "border-hair bg-subtle text-ink-4"
      )}
    >
      {state === "needs-you" ? (
        <AlertTriangle className="size-2.5" />
      ) : state === "answered" ? (
        <Check className="size-2.5 stroke-[3]" />
      ) : (
        <Minus className="size-2.5" />
      )}
      {STATE_LABEL[state]}
    </span>
  );
}

/**
 * The shape of the work, before you start scrolling for it.
 *
 * A column of accordions tells you nothing about how much is left — you find
 * that out by opening all of them. One line and a segment per section says it
 * at a glance, and the segments are in page order so the bar is a map rather
 * than a score.
 */
export function PlanProgress({
  sections,
  onJump,
}: {
  sections: { id: string; title: string; state: PlanState }[];
  /** Jump to a section from its segment. */
  onJump?: (id: string) => void;
}) {
  const needsYou = sections.filter((s) => s.state === "needs-you");
  const answered = sections.filter((s) => s.state === "answered").length;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-panel border border-hair bg-card px-3.5 py-2.5 shadow-2xs">
      <span className="shrink-0 text-body font-bold text-ink">
        {needsYou.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-ok">
            <Check className="size-3.5 stroke-[3]" />
            Everything answered
          </span>
        ) : (
          <>
            <span className="tabular-nums text-warn">{needsYou.length}</span>
            {needsYou.length === 1 ? " section needs you" : " sections need you"}
          </>
        )}
      </span>

      <span className="text-caption text-ink-4">
        {answered} of {sections.length} answered
      </span>

      <div className="flex min-w-[140px] flex-1 items-center gap-1">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onJump?.(section.id)}
            title={`${section.title} — ${STATE_LABEL[section.state].toLowerCase()}`}
            aria-label={`${section.title}: ${STATE_LABEL[section.state]}`}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              onJump && "cursor-pointer hover:h-2",
              section.state === "needs-you"
                ? "bg-warn"
                : section.state === "answered"
                  ? "bg-ok"
                  : "bg-hair-2"
            )}
          />
        ))}
      </div>
    </div>
  );
}
