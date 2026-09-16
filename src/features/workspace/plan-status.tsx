"use client";

import { AlertTriangle, Check, ChevronDown, Minus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
          ? "border-danger-line bg-danger-bg text-danger"
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

/**
 * One accordion row on a plan screen, for both flows.
 *
 * This is the third time the video and creative copies of this component have
 * had to be edited in lockstep, and they had already drifted — different
 * chevrons, and a state colour that keyed off `open` on one side. One shell,
 * and the drift has nowhere to start.
 *
 * The state is carried by the tile, not only by the chip on the end of it: a
 * column of identical rows makes you read every chip to find the one that
 * wants something.
 */
export function PlanSectionShell({
  icon: Icon,
  title,
  summary,
  source,
  state,
  error,
  open,
  onToggle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  /** Where the answer came from — background, shown muted beside the summary. */
  source?: string;
  state: PlanState;
  /** Set when this section is why Confirm refused. */
  error?: { title: string; detail: string } | null;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const tone = state === "needs-you" ? "attention" : state === "answered" ? "done" : "default";
  const needsAttention = state === "needs-you";
  const isDone = state === "answered";

  /**
   * The wash starts at the rail and is gone before the text.
   *
   * A flood fill cannot work here: the canvas behind these rows is off-white,
   * so a pale tint sits BEHIND plain white and the row that wants something
   * ends up the quietest thing on screen — which is exactly what the first
   * attempt at this did. Colour at the edge, white under the words, and the
   * row still reads as lifted off the canvas rather than sunk into it.
   *
   * Red is given more of everything than green on purpose. Eight settled
   * sections shouting as loudly as the one that is not settled is the same
   * failure in the other direction.
   */
  const wash =
    tone === "default"
      ? undefined
      : {
          backgroundImage: `linear-gradient(to right, ${
            needsAttention ? "var(--danger-bg)" : "var(--ok-bg)"
          }, var(--card) ${needsAttention ? "38%" : "22%"})`,
        };

  return (
    <section
      className={cn(
        "squircle-card relative transition-all duration-300 ease-entrance bg-card",
        open
          ? "z-20 w-full scale-100 border shadow-brand-soft rounded-card my-3.5"
          : "z-0 w-[93%] sm:w-[94%] mx-auto scale-[0.985] hover:shadow-xs border rounded-control my-1",
        /* The rail is the left border itself rather than a bar laid over one.
           An overlay cannot follow the corner radius — it ran straight past
           the curve at both ends — where a border is clipped to the shape by
           definition. */
        needsAttention
          ? "border-danger/45 border-l-[3px] border-l-danger ring-2 ring-danger/10 shadow-[0_6px_22px_-10px_rgba(159,58,56,.45)]"
          : isDone
            ? "border-ok-line border-l-2 border-l-ok"
            : "border-hair"
      )}
      /* Closed, the whole row carries the wash. Open, only its header does —
         the body below is a form, and tinting the ground behind input fields
         is noise rather than signal. */
      style={open ? undefined : wash}
    >
      <button
        onClick={onToggle}
        className={cn(
          "focus-ring group flex w-full items-center gap-3 text-left transition-all duration-200 cursor-pointer",
          open ? "min-h-[70px] px-4 sm:px-5 rounded-t-card" : "min-h-[44px] py-1.5 px-3 sm:px-3.5"
        )}
        style={open ? wash : undefined}
        aria-expanded={open}
      >
        {/* The icon is which section this is; the colour is what state it is
            in. Swapping the icon for a tick when a section was answered threw
            away the one mark that tells the rows apart. */}
        <span
          className={cn(
            "squircle-control relative grid shrink-0 place-items-center transition-transform group-hover:scale-105",
            open ? "size-10 rounded-control" : "size-7 rounded-chip",
            tone === "attention"
              ? "bg-danger-bg text-danger"
              : tone === "done"
                ? "bg-ok-bg text-ok"
                : "bg-[#edf3ef] text-brand"
          )}
        >
          <Icon className={cn(open ? "size-[19px]" : "size-3.5")} />

          {/* Open, the state is said outright as well as coloured. Ringed in
              the card's own background so it reads as a badge on the corner
              rather than a smudge inside it. */}
          {open && tone !== "default" && (
            <span
              aria-hidden
              className={cn(
                "absolute -right-1 -top-1 grid size-[15px] place-items-center rounded-full ring-2 ring-card",
                tone === "done" ? "bg-ok text-white" : "bg-danger text-white"
              )}
            >
              {tone === "done" ? (
                <Check className="size-2.5" strokeWidth={3.5} />
              ) : (
                <X className="size-2.5" strokeWidth={3.5} />
              )}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-bold tracking-tight transition-colors leading-snug",
              open ? "text-subhead text-ink" : "text-body-lg text-ink-2"
            )}
          >
            {title}
          </span>
          {/* The answer only when the section is open. Closed, eight rows each
              carrying a line of settled parameters is a wall of text you have
              to read past to find the row that wants something — and the
              answers are two clicks away in the row itself. */}
          {open && (
            <span className="mt-0.5 block truncate text-body text-ink-3">
              {summary}
              {source && <span className="ml-1.5 text-ink-4">· {source}</span>}
            </span>
          )}
        </span>

        <PlanStatusChip state={state} open={open} />

        <div
          className={cn(
            "grid place-items-center rounded-full transition-all duration-300",
            open ? "size-7 rotate-180 bg-tint text-brand" : "size-5.5 text-ink-3 group-hover:bg-black/5"
          )}
        >
          <ChevronDown className={cn(open ? "size-4" : "size-3")} />
        </div>
      </button>

      <div
        aria-hidden={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-entrance",
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-hair px-4 pb-5 pt-3.5 sm:px-5 sm:pb-6">
            {/* The error sits with the thing that has to change, not in a
                banner at the top of the page. A plan that bounces back should
                land you on the decision, already open, with the reason beside
                it. */}
            {error && (
              <div className="mb-3.5 flex items-start gap-2 rounded-control border border-warn-line bg-warn-bg p-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
                <div className="min-w-0">
                  <div className="text-body font-bold text-warn">{error.title}</div>
                  <p className="mt-0.5 text-label leading-snug text-ink-2">{error.detail}</p>
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
