"use client";

import { cn } from "@/lib/cn";

/**
 * The budget this project was given, in one compact card.
 *
 * It used to show the spend so far plus the cost of this render, summed —
 * three numbers and an arithmetic, in front of a person deciding one thing.
 * None of them was the number that had already been agreed on the plan
 * screen, which is the one they recognise: the budget is set there, and this
 * is where it is spent.
 *
 * One component for both studios, so the video and the deck cannot start
 * telling the same story differently.
 */
export function GenerationCostCard({
  budget,
  qualityLabel,
  facts,
}: {
  /** The project budget, as agreed on the plan screen. */
  budget: number;
  qualityLabel: string;
  /** Two or three short label/value pairs: format, render time. */
  facts: { label: string; value: string; tone?: "ok" | "plain" }[];
}) {
  return (
    <div className="rounded-panel border border-white/10 bg-[#121614] p-3.5 text-white shadow-md">
      <div className="mb-1 flex items-start justify-between gap-3">
        <span className="text-caption font-extrabold uppercase tracking-wider text-white/55">
          Project Budget
        </span>
        <span className="shrink-0 rounded-chip border border-brand bg-brand/20 px-2.5 py-0.5 text-caption font-bold text-brand">
          {qualityLabel}
        </span>
      </div>

      <strong className="text-subhead font-[900] tabular-nums text-white">
        ⚡ {budget.toLocaleString()} Credits
      </strong>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-2.5 text-caption">
        {facts.map((fact) => (
          <span key={fact.label} className="inline-flex items-baseline gap-1.5">
            <span className="font-bold uppercase tracking-wider text-white/45">{fact.label}</span>
            <strong className={cn("tabular-nums", fact.tone === "ok" ? "text-ok-on-dark" : "text-white")}>
              {fact.value}
            </strong>
          </span>
        ))}
      </div>
    </div>
  );
}
