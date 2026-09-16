"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Which version this is, and what the ones before it settled.
 *
 * The header used to carry a "Versions" button beside undo and redo on every
 * screen — including the ones where nothing is versioned yet, because no asset
 * exists to have a version. The version is a property of the draft, so it says
 * so where the draft is named, and opening it shows the trail.
 *
 * A trail, not a switcher. There is no way to jump into an old version from
 * here: a published asset is a record of what a reviewer approved, and letting
 * someone drop back into it mid-edit is how two people end up approving
 * different things under one name. What an earlier version is FOR is reading
 * what it settled — which comments were answered, and how.
 */

export interface AssetVersion {
  label: string;
  state: "published" | "current";
  at: string;
  /** What this version settled — the comments it closed. */
  resolved?: Array<{ text: string; by: string; rejected?: boolean }>;
}

export function VersionChip({ versions }: { versions: AssetVersion[] }) {
  const [open, setOpen] = useState(false);
  const current = versions.find((v) => v.state === "current") ?? versions[versions.length - 1];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Version history"
        className="focus-ring hidden shrink-0 cursor-pointer rounded-chip bg-ok-bg px-2 py-0.5 text-micro font-bold text-ink-3 transition hover:bg-tint hover:text-brand-deep sm:inline"
      >
        {current?.label ?? "Draft v1"}
      </button>

      {open && <VersionTrailModal versions={versions} onClose={() => setOpen(false)} />}
    </>
  );
}

function VersionTrailModal({
  versions,
  onClose,
}: {
  versions: AssetVersion[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Version history"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-card border border-hair bg-card text-left shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-hair px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-body-lg font-[850] tracking-tight text-ink">Version history</h2>
            <p className="text-label text-ink-3">What each version settled.</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-control text-ink-3 transition hover:bg-black/5 hover:text-ink"
            aria-label="Close version history"
          >
            <X className="size-4" />
          </button>
        </header>

        <ol className="max-h-[420px] overflow-y-auto p-3">
          {/* Newest first: the current draft is the one you are in. */}
          {[...versions].reverse().map((v) => (
            <li key={v.label} className="relative pl-5 pb-4 last:pb-0">
              {/* The spine, drawn between the marks rather than through them. */}
              <span
                aria-hidden
                className="absolute left-[5px] top-4 bottom-0 w-px bg-hair-2 last:hidden"
              />
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1.5 size-[11px] rounded-full ring-2 ring-card",
                  v.state === "current" ? "bg-brand" : "bg-ok"
                )}
              />
              <div className="flex items-baseline gap-2">
                <span className="text-body font-[800] text-ink">{v.label}</span>
                <span
                  className={cn(
                    "rounded-glyph border px-1.5 py-0.2 text-micro font-bold",
                    v.state === "current"
                      ? "border-brand/25 bg-tint text-brand-deep"
                      : "border-ok-line bg-ok-bg text-ok"
                  )}
                >
                  {v.state === "current" ? "Current draft" : "Published"}
                </span>
                <span className="ml-auto shrink-0 text-caption text-ink-4">{v.at}</span>
              </div>

              {v.resolved && v.resolved.length > 0 ? (
                <ul className="mt-1.5 space-y-1">
                  {v.resolved.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-caption leading-snug text-ink-2">
                      {r.rejected ? (
                        <X className="mt-0.5 size-3 shrink-0 text-ink-4" />
                      ) : (
                        <Check className="mt-0.5 size-3 shrink-0 text-ok" />
                      )}
                      <span>
                        {r.text}
                        <span className="ml-1 text-ink-4">— {r.by}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-caption italic text-ink-4">
                  {v.state === "current" ? "Nothing closed in this draft yet." : "No comments were open."}
                </p>
              )}
            </li>
          ))}
        </ol>

        <footer className="border-t border-hair px-4 py-2.5 text-caption text-ink-4">
          A published version is the record a reviewer approved — it is read here, not reopened.
        </footer>
      </div>
    </div>
  );
}
