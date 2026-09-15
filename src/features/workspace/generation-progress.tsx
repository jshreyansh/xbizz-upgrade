"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";

/**
 * Every wait in the studio, from one component.
 *
 * There were three of these, hand-written in three files, and they had already
 * drifted: three steps in one and five in another, different widths, a footer
 * on only one of them. Two more transitions had no wait at all and dropped you
 * into a canvas that was still assembling itself.
 *
 * The list rolls rather than sitting there greyed out. A checklist that shows
 * every step from the start tells you what has NOT happened, five times over;
 * what a person wants is what is happening now and what just finished. So
 * steps appear as they begin, tick as they finish, and age off the top — the
 * way an agent reports its own work.
 *
 * The percentage moves inside each step, from that step's own duration, so the
 * bar travels smoothly instead of jumping once per step.
 */

export interface GenerationStep {
  label: string;
  /** Roughly how long this step takes. Also what the countdown is built from. */
  seconds: number;
}

/** Demo scaffolding: lets the team jump a wait. Strip before production. */
export const SHOW_DEMO_SKIP = true;

/** How many finished steps stay on screen above the running one. */
const TRAIL = 3;
const TICK_MS = 100;

export function GenerationProgress({
  title,
  subtitle,
  steps,
  onDone,
  footer,
}: {
  title: string;
  subtitle: string;
  steps: GenerationStep[];
  /** Fired once when the last step completes, and by Skip. */
  onDone: () => void;
  /** Optional row under the list — e.g. "Email notification queued". */
  footer?: React.ReactNode;
}) {
  const total = useMemo(() => steps.reduce((sum, s) => sum + s.seconds, 0), [steps]);
  const [elapsed, setElapsed] = useState(0);

  // onDone is called from an interval, so it is read through a ref rather than
  // restarting the clock every time the parent re-renders with a new closure.
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // Read from the clock rather than counting ticks. A background tab has its
    // timers throttled to about once a second, and an accumulator quietly
    // falls behind the wait it is describing — so the bar would still say 30%
    // on a screen that had been sitting there for ten seconds.
    const startedAt = Date.now();
    const id = setInterval(() => {
      const next = (Date.now() - startedAt) / 1000;
      setElapsed(Math.min(next, total));
      if (next >= total) setFinished(true);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [total]);

  // Told once, and after the commit. Calling the parent from inside the timer
  // put its setState in the middle of this component's own update, which React
  // reports as updating one component while rendering another.
  const firedRef = useRef(false);
  useEffect(() => {
    if (!finished || firedRef.current) return;
    firedRef.current = true;
    doneRef.current();
  }, [finished]);

  // Which step is running, and how far into it.
  let current = 0;
  let consumed = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (elapsed < consumed + steps[i].seconds) {
      current = i;
      break;
    }
    consumed += steps[i].seconds;
    current = i;
  }

  const percent = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;
  const remaining = Math.max(0, Math.ceil(total - elapsed));
  const onLastStep = current === steps.length - 1;

  const from = Math.max(0, current - TRAIL);
  const visible = steps.slice(from, current + 1);

  return (
    <div className="my-auto flex flex-1 flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="mb-6 grid size-20 place-items-center rounded-card border border-tint-line bg-tint shadow-sm">
        <LogoMark size={40} className="animate-pulse text-brand" />
      </div>

      <h3 className="text-display font-extrabold tracking-tight text-ink">{title}</h3>
      <p className="mt-1.5 max-w-[460px] text-body-lg text-ink-3">{subtitle}</p>

      <div className="mt-7 w-full max-w-[420px]">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-label font-extrabold tabular-nums text-ink">{percent}%</span>
          <span className="text-label tabular-nums text-ink-3">
            {onLastStep && remaining <= 1 ? "Finishing up" : `~${remaining}s remaining`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={title}
          className="h-1.5 w-full overflow-hidden rounded-full bg-black/8"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-150 ease-linear"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* The rolling list. Only what has happened and what is happening. */}
        <ol className="mt-4 space-y-2 text-left text-body" aria-live="polite">
          {visible.map((step, i) => {
            const index = from + i;
            const done = index < current;
            // Oldest surviving row fades, so the list reads as a feed that
            // scrolls rather than a box that fills up.
            const age = current - index;
            return (
              <li
                key={step.label}
                className={cn(
                  "flex items-center gap-3 rounded-control border p-3 transition-all duration-300",
                  done
                    ? "border-hair-2 bg-card text-ink shadow-2xs"
                    : "border-brand/30 bg-card text-ink shadow-xs ring-1 ring-brand/10 animate-in fade-in slide-in-from-bottom-1",
                  age >= TRAIL && "opacity-45"
                )}
              >
                {done ? (
                  <Check className="size-4.5 shrink-0 text-ok" strokeWidth={2.5} />
                ) : (
                  <LogoMark size={18} className="shrink-0 animate-spin text-brand" />
                )}
                <span className="min-w-0 flex-1 font-semibold">{step.label}</span>
                {!done && (
                  <span className="shrink-0 text-caption font-bold tabular-nums text-ink-4">
                    {index + 1}/{steps.length}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {footer && <div className="mt-6 text-body text-ink-3">{footer}</div>}

      {SHOW_DEMO_SKIP && (
        <button
          type="button"
          onClick={() => setFinished(true)}
          title="Demo only — jumps the wait so the team can see the next screen"
          className="mt-5 cursor-pointer rounded-glyph px-2 py-1 text-caption font-bold text-ink-4 transition hover:bg-black/5 hover:text-ink-2"
        >
          Skip ahead ›
        </button>
      )}
    </div>
  );
}
