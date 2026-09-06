"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";

/**
 * The last gate before spending credits on a render: six automated regulatory
 * and quality checks, any of which can block generation.
 *
 * Two screens had this as near-identical copies, and both had the same problem
 * — an amber container holding a red card, an amber card and two green cards.
 * Four tints competing meant nothing read as more urgent than anything else,
 * and the fix buttons were coloured by SEVERITY, which made the remedy look
 * like the warning.
 *
 * So: the container is neutral and the ROWS carry the alarm; severity is a
 * left rule rather than a fill; passes collapse to one line because a pass
 * needs reassurance, not a card; and there is one remedy colour, brand, since
 * "fix this" is the same action whatever tripped it.
 */
export type PreflightSeverity = "blocker" | "warning";

export interface PreflightCheck {
  id: string;
  /** Which system flagged it — shown as a tag so the title can be the problem. */
  source: string;
  title: string;
  detail: string;
  /** Set when the check is failing; omit for a passed check. */
  severity?: PreflightSeverity;
  onFix?: () => void;
}

export interface PreflightPanelProps {
  checks: PreflightCheck[];
  onFixAll?: () => void;
  className?: string;
}

const RULE: Record<PreflightSeverity, string> = {
  blocker: "bg-danger",
  warning: "bg-warn",
};

const TAG: Record<PreflightSeverity, string> = {
  blocker: "border-danger/30 bg-danger-bg text-danger",
  warning: "border-warn-line bg-warn-bg text-warn",
};

export function PreflightPanel({ checks, onFixAll, className }: PreflightPanelProps) {
  const [showPassed, setShowPassed] = useState(false);

  const failing = checks.filter((c) => c.severity);
  const passed = checks.filter((c) => !c.severity);
  const allClear = failing.length === 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-panel border",
        allClear ? "border-ok-line bg-ok-bg/40" : "border-hair bg-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {allClear ? (
            <ShieldCheck className="size-4 shrink-0 text-ok" />
          ) : (
            <AlertTriangle className="size-4 shrink-0 text-danger" />
          )}
          <span className="truncate text-body font-bold text-ink">Quality and regulatory check</span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {/* One segment per check. Reading the state should not require
              reading a sentence. */}
          <div className="flex items-center gap-1" role="img"
               aria-label={allClear ? "All checks passed" : `${failing.length} of ${checks.length} checks blocking`}>
            {checks.map((c) => (
              <span
                key={c.id}
                className={cn(
                  "h-1.5 w-4 rounded-full transition-colors duration-300",
                  c.severity ? RULE[c.severity] : "bg-ok",
                )}
              />
            ))}
          </div>
          <span className={cn("text-label font-bold tabular-nums", allClear ? "text-ok" : "text-danger")}>
            {allClear ? "All clear" : `${failing.length} to fix`}
          </span>
        </div>
      </div>

      {failing.length > 0 && (
        <ul className="border-t border-hair">
          {failing.map((c) => (
            <li key={c.id} className="flex gap-3 border-b border-hair px-4 py-3 last:border-b-0">
              <span aria-hidden className={cn("w-[3px] shrink-0 rounded-full", RULE[c.severity!])} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn("shrink-0 rounded-chip border px-1.5 py-px text-micro font-bold", TAG[c.severity!])}>
                    {c.source}
                  </span>
                  <span className="text-body font-bold text-ink">{c.title}</span>
                </div>
                <p className="mt-0.5 text-label leading-snug text-ink-3">{c.detail}</p>
              </div>
              {c.onFix && (
                <button
                  type="button"
                  onClick={c.onFix}
                  className="shrink-0 self-center rounded-control px-2.5 py-1.5 transition-colors hover:bg-tint cursor-pointer"
                >
                  {/* Size lives on the span: globals.css sets an unlayered
                      `button { font: inherit }`, so a text-* class on the
                      button itself is overridden and renders at 16px. */}
                  <span className="text-label font-bold text-brand">Fix with SwishX</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {passed.length > 0 && (
        <div className="border-t border-hair">
          <button
            type="button"
            onClick={() => setShowPassed((v) => !v)}
            aria-expanded={showPassed}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left cursor-pointer"
          >
            <Check className="size-3.5 shrink-0 text-ok" strokeWidth={3} />
            <span className="text-label font-semibold text-ink-2">
              {passed.length} {passed.length === 1 ? "check" : "checks"} passed
            </span>
            <ChevronDown
              className={cn("ml-auto size-3.5 shrink-0 text-ink-3 transition-transform duration-200", showPassed && "rotate-180")}
            />
          </button>

          {showPassed && (
            <ul className="px-4 pb-3 animate-in fade-in duration-150">
              {passed.map((c) => (
                <li key={c.id} className="flex gap-2 py-1.5">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-ok" strokeWidth={3} />
                  <div className="min-w-0">
                    <span className="text-label font-semibold text-ink">{c.title}</span>
                    <span className="ml-1.5 text-label text-ink-3">{c.detail}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {failing.length > 1 && onFixAll && (
        <div className="border-t border-hair bg-subtle px-4 py-2.5">
          <button
            type="button"
            onClick={onFixAll}
            className="flex w-full items-center justify-center gap-1.5 rounded-control bg-brand px-3 py-2 text-white shadow-2xs transition-colors hover:bg-brand-deep cursor-pointer"
          >
            <LogoMark size={14} />
            {/* Short on purpose: two rows directly above already say
                "Fix with SwishX", so repeating it a third time is noise. */}
            <span className="text-label font-bold">
              {failing.length === 2 ? "Fix both" : `Fix all ${failing.length}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
