"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BadgeCheck, Clock, History, RotateCcw, Sparkles, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button, IconButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Version history, the way Google Docs keeps it — numbered the way releases are.
 *
 * A version is a working session: it starts when the document opens and
 * closes when you leave, refresh, or go quiet for a while. Every edit in
 * between belongs to it, so the history reads as "what happened on Tuesday
 * afternoon" rather than four hundred single keystrokes.
 *
 * Sessions are numbered against what has been published. Before the first
 * publish they are v0.1, v0.2, v0.3; publishing makes Version 1; the sessions
 * after it are v1.1, v1.2, until Version 2. So the number says at a glance
 * whether a version is something a reviewer approved or work towards the
 * next one.
 *
 * Opening a version shows it, the way Preview and Publish shows the asset,
 * with what changed beside it. Any closed version can be restored; restoring
 * keeps the session you are in as a version of its own, so nothing is lost
 * by trying.
 */

/** A working session as recorded, before it is numbered. */
export interface SampleSession {
  /** "Today", "Yesterday", "12 Oct". */
  day: string;
  /** "11:20 – 11:48". */
  span: string;
  author: string;
  edits: number;
  /** The edits grouped the way a person would describe them. */
  summary: Array<{ text: string; by?: "you" | "swishx" }>;
}

export interface HistoryVersion extends SampleSession {
  id: string;
  /** "v0.3", "Version 1", "v1.1". */
  label: string;
  kind: "session" | "published" | "current";
}

/** Earlier sessions on a document, oldest first. Sample data until versions are stored. */
export const DOC_SESSIONS: SampleSession[] = [
  {
    day: "12 Oct",
    span: "10:12 – 10:31",
    author: "Maya Kapoor",
    edits: 6,
    summary: [
      { text: "Opened from the Stat Hero layout", by: "swishx" },
      { text: "Regenerated the mechanism illustration", by: "swishx" },
      { text: "Shortened the safety band intro" },
    ],
  },
  {
    day: "Yesterday",
    span: "16:05 – 16:40",
    author: "Maya Kapoor",
    edits: 9,
    summary: [
      { text: "Applied 3 suggestions from the chat", by: "swishx" },
      { text: "Added page 2, Evidence & Tolerability" },
      { text: "Changed the body font to Inter" },
    ],
  },
  {
    day: "Today",
    span: "11:20 – 11:48",
    author: "Maya Kapoor",
    edits: 14,
    summary: [
      { text: "Header band filled navy, with a 2px border" },
      { text: "Added a Heading and Body text on page 1" },
      { text: "Replaced the header image, cropped to the slot" },
      { text: "Moved the hero stat card up" },
      { text: "Rewrote the efficacy line from the approved claims", by: "swishx" },
    ],
  },
];

/** Earlier sessions on a video, oldest first. Sample data until versions are stored. */
export const VIDEO_SESSIONS: SampleSession[] = [
  {
    day: "12 Oct",
    span: "09:48 – 10:20",
    author: "Maya Kapoor",
    edits: 5,
    summary: [
      { text: "Storyboard approved, 18 shots", by: "swishx" },
      { text: "Swapped the background footage in scene 2" },
    ],
  },
  {
    day: "Yesterday",
    span: "15:20 – 16:02",
    author: "Maya Kapoor",
    edits: 8,
    summary: [
      { text: "Added scene 5, the call to action" },
      { text: "Changed the voice to Rohan, clear and measured" },
      { text: "Applied 2 suggestions from the chat", by: "swishx" },
    ],
  },
  {
    day: "Today",
    span: "11:05 – 11:41",
    author: "Maya Kapoor",
    edits: 12,
    summary: [
      { text: "Scene 3 headline shortened to fit the lower third" },
      { text: "Moved the presenter left in scene 2" },
      { text: "Regenerated shot 2 of scene 1 with a closer framing", by: "swishx" },
      { text: "Narration in scene 4 condensed to 135 wpm", by: "swishx" },
    ],
  },
];

/**
 * The history, newest first, numbered against what has been published.
 *
 * The sample sessions are the work towards Version 1. Each later version
 * gets one session of its own before it, so a document on Version 2 reads
 * v0.1 – v0.3, Version 1, v1.1, Version 2 — and the open session is the
 * next point after the last of them.
 */
export function buildHistory({
  samples,
  publishedCount,
  current,
}: {
  samples: SampleSession[];
  publishedCount: number;
  current: SampleSession;
}): HistoryVersion[] {
  const out: HistoryVersion[] = samples.map((s, i) => ({ ...s, id: `v0.${i + 1}`, label: `v0.${i + 1}`, kind: "session" }));
  const lastEnd = (s: SampleSession) => s.span.split(" – ")[1] ?? s.span;
  for (let n = 1; n <= publishedCount; n += 1) {
    const before = out[out.length - 1];
    if (n > 1) {
      const between: HistoryVersion = {
        id: `v${n - 1}.1`,
        label: `v${n - 1}.1`,
        kind: "session",
        day: "Today",
        span: "12:10 – 12:34",
        author: before.author,
        edits: 4,
        summary: [{ text: "Answered the reviewer's comments", by: "swishx" }, { text: "Tightened the headline" }],
      };
      out.push(between);
    }
    const from = out[out.length - 1];
    out.push({
      id: `V${n}`,
      label: `Version ${n}`,
      kind: "published",
      day: from.day,
      span: `Published ${lastEnd(from)}`,
      author: from.author,
      edits: from.edits,
      summary: [{ text: `Passed the MLR review and was published as Version ${n}`, by: "swishx" }, ...from.summary.slice(0, 2)],
    });
  }
  const point = publishedCount === 0 ? `v0.${samples.length + 1}` : `v${publishedCount}.1`;
  out.push({ ...current, id: "current", label: point, kind: "current" });
  return out.reverse();
}

export function VersionHistoryButton({
  publishedCount,
  sessionStart,
  editCount,
  author,
  samples = DOC_SESSIONS,
  preview,
  onClose,
  onRestore,
}: {
  publishedCount: number;
  /** "14:02". */
  sessionStart: string;
  /** Edits made in the session that is open now. */
  editCount: number;
  author: string;
  /** The closed sessions before Version 1, oldest first. */
  samples?: SampleSession[];
  /** The asset, as Preview and Publish shows it. */
  preview: ReactNode;
  onClose?: () => void;
  onRestore: (version: HistoryVersion) => void;
}) {
  const [open, setOpen] = useState(false);
  const versions = buildHistory({
    samples,
    publishedCount,
    current: { day: "Today", span: `${sessionStart} – now`, author, edits: editCount, summary: [] },
  });
  const close = () => {
    setOpen(false);
    onClose?.();
  };
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Version history"
        className="focus-ring hidden h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-chip border border-hair-2 bg-card px-2.5 text-label font-bold text-ink-2 shadow-2xs transition hover:border-brand hover:text-brand-deep sm:inline-flex"
      >
        <History className="size-3.5" />
        Draft {versions[0].label}
      </button>
      {open && (
        <VersionHistoryModal
          versions={versions}
          preview={preview}
          onRestore={(v) => {
            close();
            onRestore(v);
          }}
          onClose={close}
        />
      )}
    </>
  );
}

function VersionHistoryModal({
  versions,
  preview,
  onRestore,
  onClose,
}: {
  versions: HistoryVersion[];
  preview: ReactNode;
  onRestore: (version: HistoryVersion) => void;
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState(versions[1]?.id ?? versions[0].id);
  const [confirming, setConfirming] = useState(false);
  const selected = versions.find((v) => v.id === selectedId) ?? versions[0];
  const isCurrent = selected.kind === "current";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Grouped by day, newest first. */
  const days = versions.reduce<Array<{ day: string; items: HistoryVersion[] }>>((acc, v) => {
    const last = acc[acc.length - 1];
    if (last && last.day === v.day) last.items.push(v);
    else acc.push({ day: v.day, items: [v] });
    return acc;
  }, []);

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Version history"
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-ink/75 p-3 backdrop-blur-sm sm:p-5"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex h-full w-full flex-col overflow-hidden rounded-card border border-hair bg-card shadow-modal"
        >
          <div className="flex items-start gap-3 border-b border-hair px-5 py-3.5">
            <History className="mt-0.5 size-4 shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="text-body-lg font-[850] text-ink">Version history</p>
              <p className="text-label text-ink-3">
                Each session is a point version (v0.1, v1.1); publishing makes a full version. Pick one to see it, and restore it if you need to.
              </p>
            </div>
            <IconButton aria-label="Close" onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* The versions. */}
            <ol className="max-h-48 shrink-0 overflow-y-auto border-b border-hair p-2 lg:max-h-none lg:w-64 lg:border-b-0 lg:border-r">
              {days.map((group) => (
                <li key={group.day}>
                  <div className="px-2 pb-1 pt-2 text-caption font-extrabold uppercase tracking-[.08em] text-ink-4">
                    {group.day}
                  </div>
                  <ul className="space-y-0.5">
                    {group.items.map((v) => (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(v.id);
                            setConfirming(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer flex-col gap-0.5 rounded-control px-2.5 py-2 text-left transition",
                            v.id === selectedId ? "bg-tint ring-1 ring-tint-line" : "hover:bg-subtle"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <VersionTag version={v} />
                            <span className="text-body font-bold tabular-nums text-ink">{v.span}</span>
                          </span>
                          <span className="text-caption text-ink-3">
                            {v.author} · {v.edits} {v.edits === 1 ? "edit" : "edits"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            {/* The version itself, as Preview and Publish shows the asset. */}
            <div className="relative min-h-[260px] min-w-0 flex-1 overflow-hidden bg-subtle">
              {preview}
              <span className="pointer-events-none absolute left-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-chip bg-ink/80 px-2.5 py-1 text-caption font-bold text-white ring-1 ring-white/15 backdrop-blur-sm">
                {selected.label} · {isCurrent ? "as it is now" : `${selected.day}, ${selected.span}`}
              </span>
            </div>

            {/* What changed in it, and restoring it. */}
            <div className="flex min-h-0 shrink-0 flex-col border-t border-hair lg:w-80 lg:border-l lg:border-t-0">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <VersionTag version={selected} large />
                    <h3 className="text-subhead font-[850] tracking-tight text-ink">
                      {selected.day}, {selected.span}
                    </h3>
                  </div>
                  <p className="mt-1 text-label text-ink-3">
                    {selected.author} · {selected.edits} {selected.edits === 1 ? "edit" : "edits"}
                  </p>
                </div>

                {isCurrent ? (
                  <div className="space-y-2 rounded-control border border-hair bg-subtle p-3.5 text-body text-ink-2">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      <Clock className="size-3.5 text-brand" />
                      This session is still open.
                    </p>
                    <p>
                      {selected.edits > 0
                        ? `${selected.edits} ${selected.edits === 1 ? "edit is" : "edits are"} saved in it so far.`
                        : "No edits yet."}{" "}
                      It becomes {selected.label} when you leave, refresh, or after 30 minutes without an edit. Publishing makes it the next full version.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-caption font-extrabold uppercase tracking-[.08em] text-ink-4">What changed</div>
                    <ul className="space-y-1.5">
                      {selected.summary.map((s) => (
                        <li key={s.text} className="flex items-start gap-2 text-body leading-relaxed text-ink-2">
                          {s.by === "swishx" ? (
                            <Sparkles className="mt-1 size-3.5 shrink-0 text-brand" />
                          ) : (
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-4" />
                          )}
                          <span>
                            {s.text}
                            {s.by === "swishx" && <span className="text-ink-4"> · SwishX</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {confirming && !isCurrent && (
                  <div className="space-y-1 rounded-control border border-warn-line bg-warn-bg p-3.5 text-body text-ink-2">
                    <p className="font-bold text-ink">Restore {selected.label}?</p>
                    <p>
                      The asset goes back to {selected.label}. The session you are in is kept as {versions[0].label} first, so you can come back to it.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-hair px-5 py-3">
                {isCurrent ? (
                  <span className="mr-auto text-label text-ink-4">The open session is where you are.</span>
                ) : confirming ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="gap-1.5 font-bold" onClick={() => onRestore(selected)}>
                      <RotateCcw className="size-3.5" />
                      Restore {selected.label}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setConfirming(true)}>
                    <RotateCcw className="size-3.5" />
                    Restore {selected.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/** The version number, styled by what it is: published, open, or a session between. */
function VersionTag({ version, large }: { version: HistoryVersion; large?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-glyph px-1.5 py-px font-bold tabular-nums",
        large ? "text-label" : "text-micro",
        version.kind === "published"
          ? "border border-ok-line bg-ok-bg text-ok"
          : version.kind === "current"
            ? "bg-brand text-white"
            : "border border-hair-2 bg-card text-ink-2"
      )}
    >
      {version.kind === "published" && <BadgeCheck className="size-3" />}
      {version.label}
      {version.kind === "current" && " · Current"}
    </span>
  );
}
