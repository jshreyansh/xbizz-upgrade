"use client";

import { cn } from "@/lib/cn";

/**
 * What confirming this render costs, in one compact card.
 *
 * It used to be a hero figure, two full-width rows and a two-by-two grid —
 * about four hundred pixels to say three numbers, which pushed the thing the
 * dialog is actually for, the regulatory check, below the fold. A cost card
 * that hides the blockers has the priorities backwards.
 *
 * The arithmetic is still shown rather than implied: this total is the sum of
 * the two figures beside it, and a total nobody can reconcile was the defect
 * the card had in the first place.
 *
 * One component for both studios, so the video and the deck cannot start
 * telling the same story differently.
 */
export function GenerationCostCard({
  used,
  usedLabel,
  renderCost,
  budget,
  qualityLabel,
  facts,
}: {
  used: number;
  /** What the spend so far was on, e.g. "Page generation and edits". */
  usedLabel: string;
  renderCost: number;
  /** What was agreed at the start — the number an overrun is measured against. */
  budget: number;
  qualityLabel: string;
  /** Two to four short label/value pairs: format, render time, balance. */
  facts: { label: string; value: string; tone?: "ok" | "plain" }[];
}) {
  const total = used + renderCost;
  const over = total > budget;

  return (
    <div className="rounded-panel border border-white/10 bg-[#121614] p-3.5 text-white shadow-md">
      <div className="mb-1 flex items-start justify-between gap-3">
        <p className="text-micro text-white/45">{usedLabel}</p>
        <span className="shrink-0 rounded-chip border border-brand bg-brand/20 px-2.5 py-0.5 text-caption font-bold text-brand">
          {qualityLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-caption font-extrabold uppercase tracking-wider text-white/55">
          Used so far
        </span>
        <strong className="text-body-lg font-[900] tabular-nums text-white">
          {used.toLocaleString()}
        </strong>
        <span className="text-caption text-white/40">+</span>
        <span className="text-caption font-bold uppercase tracking-wider text-white/55">to render</span>
        <strong className="text-body-lg font-[900] tabular-nums text-white">
          {renderCost.toLocaleString()}
        </strong>
        <span className="text-caption text-white/40">=</span>
        <strong className="text-subhead font-[900] tabular-nums text-white">
          {total.toLocaleString()} Credits
        </strong>

        <span
          className={cn(
            "rounded-glyph border px-2 py-0.5 text-caption font-bold tabular-nums",
            over
              ? "border-warn-line/40 bg-warn-bg/15 text-warn-on-dark"
              : "border-ok/30 bg-ok/15 text-ok-on-dark"
          )}
        >
          {over
            ? `${(total - budget).toLocaleString()} over the ${budget.toLocaleString()} agreed`
            : `within the ${budget.toLocaleString()} agreed`}
        </span>

      </div>

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
