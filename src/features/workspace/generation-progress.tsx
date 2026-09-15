"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ListTree, X } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";

/**
 * Every wait in the studio, from one component.
 *
 * There were three of these, hand-written in three files, and they had already
 * drifted. Two more transitions had no wait at all and dropped you into a
 * canvas that was still assembling itself.
 *
 * The work is a feed, not a checklist. A fixed list of five steps with a "2/5"
 * beside it promises a shape the real job does not have — a render reports
 * whatever it happens to be doing, ten or thirty times, and the count would be
 * a lie the moment the backend changed. So the screen shows the last thing
 * finished and the thing running, the whole record lives behind one button,
 * and the only two numbers on it are the two that mean something: how far
 * along, and how much longer.
 */

export interface GenerationStep {
  label: string;
  /** Roughly how long this step takes. Also what the countdown is built from. */
  seconds: number;
}

/** Demo scaffolding: lets the team jump a wait. Strip before production. */
export const SHOW_DEMO_SKIP = true;

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
  /** Optional row under the feed — e.g. "Email notification queued". */
  footer?: React.ReactNode;
}) {
  const total = useMemo(() => steps.reduce((sum, s) => sum + s.seconds, 0), [steps]);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // Read from the clock rather than counting ticks. A background tab has its
    // timers throttled to about once a second, and an accumulator quietly
    // falls behind the wait it is describing.
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

  // Which step is running, and when each one started.
  let current = 0;
  let consumed = 0;
  const startsAt: number[] = [];
  for (let i = 0; i < steps.length; i += 1) {
    startsAt.push(consumed);
    if (elapsed < consumed + steps[i].seconds) {
      current = i;
      break;
    }
    consumed += steps[i].seconds;
    current = i;
  }
  for (let i = startsAt.length; i < steps.length; i += 1) startsAt.push(0);

  const percent = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;
  const remaining = Math.max(0, Math.ceil(total - elapsed));
  const nearlyDone = current === steps.length - 1 && remaining <= 1;
  const doneCount = current;

  const justFinished = current > 0 ? steps[current - 1] : null;

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
            {nearlyDone ? "Finishing up" : `~${remaining}s remaining`}
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

        {/* What just finished, and what is running. Everything else is in the
            log — a wait is glanced at, not read. */}
        <div className="mt-4 space-y-2 text-left" aria-live="polite">
          {justFinished && (
            <WorkRow key={justFinished.label} label={justFinished.label} state="done" muted />
          )}
          <WorkRow label={steps[current].label} state="running" />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setLogOpen(true)}
            className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-glyph px-2 py-1 text-label font-bold text-ink-3 transition hover:bg-black/5 hover:text-brand"
          >
            <ListTree className="size-3.5" />
            <span>Work log</span>
            {doneCount > 0 && (
              <span className="rounded-glyph bg-black/6 px-1.5 text-caption font-bold tabular-nums text-ink-3">
                {doneCount}
              </span>
            )}
          </button>

          {SHOW_DEMO_SKIP && (
            <button
              type="button"
              onClick={() => setFinished(true)}
              title="Demo only — jumps the wait so the team can see the next screen"
              className="cursor-pointer rounded-glyph px-2 py-1 text-caption font-bold text-ink-4 transition hover:bg-black/5 hover:text-ink-2"
            >
              Skip ahead ›
            </button>
          )}
        </div>
      </div>

      {footer && <div className="mt-5 text-body text-ink-3">{footer}</div>}

      {logOpen && (
        <WorkLogModal
          title={title}
          steps={steps}
          current={current}
          startsAt={startsAt}
          elapsed={elapsed}
          percent={percent}
          remaining={remaining}
          nearlyDone={nearlyDone}
          onClose={() => setLogOpen(false)}
        />
      )}
    </div>
  );
}

function WorkRow({
  label,
  state,
  muted,
  detail,
}: {
  label: string;
  state: "done" | "running";
  muted?: boolean;
  detail?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-control border p-3 text-body transition-all duration-300",
        state === "running"
          ? "border-brand/30 bg-card text-ink shadow-xs ring-1 ring-brand/10 animate-in fade-in slide-in-from-bottom-1"
          : "border-hair-2 bg-card text-ink shadow-2xs",
        muted && "opacity-60"
      )}
    >
      {state === "done" ? (
        <Check className="size-4.5 shrink-0 text-ok" strokeWidth={2.5} />
      ) : (
        <LogoMark size={18} className="shrink-0 animate-spin text-brand" />
      )}
      <span className="min-w-0 flex-1 font-semibold">{label}</span>
      {detail && <span className="shrink-0 text-caption tabular-nums text-ink-4">{detail}</span>}
    </div>
  );
}

/** The whole record: what ran, in order, with what each one took. */
function WorkLogModal({
  title,
  steps,
  current,
  startsAt,
  elapsed,
  percent,
  remaining,
  nearlyDone,
  onClose,
}: {
  title: string;
  steps: GenerationStep[];
  current: number;
  startsAt: number[];
  elapsed: number;
  percent: number;
  remaining: number;
  nearlyDone: boolean;
  onClose: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Follow the work as it arrives, the way a console does.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [current]);

  const ran = steps.slice(0, current + 1);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Work log"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-card border border-hair bg-card text-left shadow-float"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-hair px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-body-lg font-[850] tracking-tight text-ink">Work log</h2>
            <p className="truncate text-label text-ink-3">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-control text-ink-3 transition hover:bg-black/5 hover:text-ink"
            aria-label="Close work log"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex items-baseline justify-between gap-3 border-b border-hair bg-canvas px-4 py-2">
          <span className="text-label font-extrabold tabular-nums text-ink">{percent}%</span>
          <span className="text-label tabular-nums text-ink-3">
            {nearlyDone ? "Finishing up" : `~${remaining}s remaining`}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <ol className="space-y-1.5">
            {ran.map((step, index) => {
              const done = index < current;
              const took = done
                ? `${step.seconds.toFixed(1)}s`
                : `${Math.max(0, elapsed - startsAt[index]).toFixed(1)}s`;
              return (
                <li key={step.label}>
                  <div
                    className={cn(
                      "flex items-center gap-2.5 rounded-control px-2.5 py-2 text-body",
                      done ? "text-ink-2" : "bg-tint font-semibold text-brand-deep"
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5 shrink-0 text-ok" strokeWidth={3} />
                    ) : (
                      <LogoMark size={14} className="shrink-0 animate-spin text-brand" />
                    )}
                    <span className="min-w-0 flex-1">{step.label}</span>
                    <span className="shrink-0 text-caption tabular-nums text-ink-4">{took}</span>
                  </div>
                </li>
              );
            })}
          </ol>
          <div ref={endRef} />
        </div>

        <footer className="border-t border-hair px-4 py-2.5 text-caption text-ink-4">
          Updates as the render reports them. Closing this does not stop the work.
        </footer>
      </div>
    </div>
  );
}
