"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Clock, History, RotateCcw, Sparkles, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button, IconButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Version history, the way Google Docs keeps it.
 *
 * A version is a working session: it starts when the document opens and
 * closes when you leave, refresh, or go quiet for a while. Every edit in
 * between belongs to it, so the history reads as "what happened on Tuesday
 * afternoon" rather than four hundred single keystrokes. Any closed version
 * can be restored; restoring first keeps the session you are in as a version
 * of its own, so nothing is lost by trying.
 *
 * Published versions stay what a reviewer approved: they are marked in the
 * list, and the session that published one is the one to restore.
 */

export interface SessionVersion {
  id: string;
  /** "Today", "Yesterday", "12 Oct". */
  day: string;
  /** "11:20 – 11:48", or "14:02 – now" for the open one. */
  span: string;
  author: string;
  edits: number;
  /** The edits grouped the way a person would describe them. */
  summary: Array<{ text: string; by?: "you" | "swishx" }>;
  /** This session ended in a publish. */
  published?: string;
  current?: boolean;
}

/** Earlier sessions on this document. Sample data until versions are stored. */
const PAST_SESSIONS: SessionVersion[] = [
  {
    id: "s-3",
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
  {
    id: "s-2",
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
    id: "s-1",
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
];

export function VersionHistoryButton({
  label,
  sessionStart,
  editCount,
  author,
  onRestore,
}: {
  /** "Draft v1". */
  label: string;
  /** "14:02". */
  sessionStart: string;
  /** Edits made in the session that is open now. */
  editCount: number;
  author: string;
  onRestore: (version: SessionVersion) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Version history"
        className="focus-ring hidden h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-chip border border-hair-2 bg-card px-2.5 text-label font-bold text-ink-2 shadow-2xs transition hover:border-brand hover:text-brand-deep sm:inline-flex"
      >
        <History className="size-3.5" />
        {label}
      </button>
      {open && (
        <VersionHistoryModal
          current={{
            id: "current",
            day: "Today",
            span: `${sessionStart} – now`,
            author,
            edits: editCount,
            summary: [],
            current: true,
          }}
          onRestore={(v) => {
            setOpen(false);
            onRestore(v);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function VersionHistoryModal({
  current,
  onRestore,
  onClose,
}: {
  current: SessionVersion;
  onRestore: (version: SessionVersion) => void;
  onClose: () => void;
}) {
  const versions = [current, ...PAST_SESSIONS];
  const [selectedId, setSelectedId] = useState(PAST_SESSIONS[0].id);
  const [confirming, setConfirming] = useState(false);
  const selected = versions.find((v) => v.id === selectedId) ?? current;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Grouped by day, newest first. */
  const days = versions.reduce<Array<{ day: string; items: SessionVersion[] }>>((acc, v) => {
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
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/75 p-4 backdrop-blur-sm sm:p-6"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex h-[min(560px,100%)] w-full max-w-[780px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-modal"
        >
          <div className="flex items-start gap-3 border-b border-hair px-5 py-3.5">
            <History className="mt-0.5 size-4 shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="text-body-lg font-[850] text-ink">Version history</p>
              <p className="text-label text-ink-3">
                Each version is one working session. Pick one to see what changed, and restore it if you need to.
              </p>
            </div>
            <IconButton aria-label="Close" onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>

          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            {/* The sessions. */}
            <ol className="max-h-56 shrink-0 overflow-y-auto border-b border-hair p-2 sm:max-h-none sm:w-64 sm:border-b-0 sm:border-r">
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
                            <span className="text-body font-bold tabular-nums text-ink">{v.span}</span>
                            {v.current && (
                              <span className="rounded-glyph bg-brand px-1.5 py-px text-micro font-bold text-white">Current</span>
                            )}
                          </span>
                          <span className="text-caption text-ink-3">
                            {v.author} · {v.edits} {v.edits === 1 ? "edit" : "edits"}
                          </span>
                          {v.published && (
                            <span className="inline-flex items-center gap-1 text-caption font-bold text-ok">
                              <BadgeCheck className="size-3" />
                              {v.published}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            {/* What the chosen one holds. */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-subhead font-[850] tracking-tight text-ink">
                      {selected.day}, {selected.span}
                    </h3>
                    {selected.current && (
                      <span className="rounded-chip border border-tint-line bg-tint px-2 py-0.5 text-caption font-bold text-brand-deep">
                        Open now
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-label text-ink-3">
                    {selected.author} · {selected.edits} {selected.edits === 1 ? "edit" : "edits"}
                  </p>
                </div>

                {selected.current ? (
                  <div className="space-y-2 rounded-control border border-hair bg-subtle p-3.5 text-body text-ink-2">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      <Clock className="size-3.5 text-brand" />
                      This session is still open.
                    </p>
                    <p>
                      {selected.edits > 0
                        ? `${selected.edits} ${selected.edits === 1 ? "edit is" : "edits are"} saved in it so far.`
                        : "No edits yet."}{" "}
                      It becomes a version when you leave the document, refresh, or after 30 minutes without an edit.
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

                {confirming && !selected.current && (
                  <div className="space-y-1 rounded-control border border-warn-line bg-warn-bg p-3.5 text-body text-ink-2">
                    <p className="font-bold text-ink">
                      Restore the version from {selected.day.toLowerCase() === "today" || selected.day.toLowerCase() === "yesterday" ? selected.day.toLowerCase() : selected.day}, {selected.span.split(" – ")[0]}?
                    </p>
                    <p>The document goes back to how it was at the end of that session. The session you are in is kept as a version first, so you can come back to it.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-hair px-5 py-3">
                {selected.current ? (
                  <span className="mr-auto text-label text-ink-4">The open session cannot be restored. It is where you are.</span>
                ) : confirming ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="gap-1.5 font-bold" onClick={() => onRestore(selected)}>
                      <RotateCcw className="size-3.5" />
                      Restore
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setConfirming(true)}>
                    <RotateCcw className="size-3.5" />
                    Restore this version
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
