"use client";

import { Check, Pin, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SearchAdPlan, SearchLine } from "@/features/workspace/ad-campaign";

/**
 * A search ad as Google shows it, and the lines it is assembled from.
 *
 * Shared by the campaign storyboard and the Ads studio, so the ad reviewed
 * in one is the ad edited in the other.
 */

/** One result on a Google results page: the sponsored ad. */
export function SearchAdCard({
  plan,
  combo,
  className,
}: {
  plan: SearchAdPlan;
  combo: { headlines: SearchLine[]; descriptions: SearchLine[] };
  className?: string;
}) {
  return (
    <div className={cn("rounded-control border border-hair bg-card p-4 shadow-2xs", className)} style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-hair bg-subtle text-caption font-bold text-ink-3">
          {plan.displayUrl.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-label text-ink">
            <b className="font-bold">Sponsored</b>
          </span>
          <span className="block truncate text-caption text-ink-3">https://www.{plan.displayUrl}</span>
        </span>
      </div>
      {/* Google's own blue for the headline: this is a picture of their page. */}
      <p className="text-subhead leading-snug" style={{ color: "#1a0dab" }}>
        {combo.headlines.map((h) => h.text).join(" | ")}
      </p>
      <p className="mt-1 text-body leading-snug text-ink-2">{combo.descriptions.map((d) => d.text).join(" ")}</p>
    </div>
  );
}

/** Headlines or descriptions, each with its length, its claim and whether it's pinned. */
export function SearchLines({
  title,
  lines,
  max,
  limit,
  selected,
  onSelect,
  idPrefix,
}: {
  title: string;
  lines: SearchLine[];
  max: number;
  /** How many Google takes at most. */
  limit: number;
  selected?: string | null;
  onSelect?: (id: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-label font-bold text-ink-2">{title}</span>
        <span className="text-caption text-ink-4">
          {lines.length} of up to {limit} · {max} characters each
        </span>
      </div>
      <div className="overflow-hidden rounded-control border border-hair bg-card">
        {lines.map((line, i) => {
          const id = `${idPrefix}.${i}`;
          const on = selected === id;
          const Row = onSelect ? "button" : "div";
          return (
            <Row
              key={id}
              type={onSelect ? "button" : undefined}
              onClick={onSelect ? () => onSelect(id) : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 border-b border-hair px-3 py-2 text-left last:border-b-0",
                onSelect && "cursor-pointer transition hover:bg-subtle",
                on && "bg-tint"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-body text-ink">{line.text}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-chip bg-subtle px-1.5 py-0.5 text-micro font-bold text-ink-3">{line.role}</span>
                  {line.claimId && (
                    <span className="rounded-chip border border-ok-line bg-ok-bg px-1.5 py-0.5 text-micro font-bold text-ok">{line.claimId}</span>
                  )}
                  {line.pin && (
                    <span className="inline-flex items-center gap-1 rounded-chip border border-tint-line bg-tint px-1.5 py-0.5 text-micro font-bold text-brand-deep">
                      <Pin className="size-2.5" />
                      Pinned to {line.pin}
                    </span>
                  )}
                </span>
              </span>
              <span className={cn("shrink-0 text-caption font-bold tabular-nums", line.text.length > max ? "text-danger" : "text-ink-4")}>
                {line.text.length}/{max}
              </span>
            </Row>
          );
        })}
      </div>
    </div>
  );
}

/** The checks, run against every combination Google could show. */
export function SearchChecks({ checks }: { checks: SearchAdPlan["checks"] }) {
  return (
    <ul className="space-y-1.5">
      {checks.map((c) => (
        <li key={c.label} className="flex items-start gap-2 text-label text-ink-2">
          <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-white", c.ok ? "bg-ok" : "bg-danger")}>
            {c.ok ? <Check className="size-2.5 stroke-[3]" /> : <X className="size-2.5 stroke-[3]" />}
          </span>
          {c.label}
        </li>
      ))}
    </ul>
  );
}

