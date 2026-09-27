"use client";

import { useEffect, useRef, useState } from "react";
import { Check, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * DEV ONLY — remove before release.
 *
 * Switches the project between landscape and portrait so the storyboard and
 * the video editor can be checked in both shapes without walking back to
 * the brief. A marketer sets the shape once, on the brief; this menu exists
 * for the people building the screens, and nothing else should depend on it.
 */
export function DevShapeMenu() {
  const format = useWorkspaceStore((s) => s.format);
  const setFormat = useWorkspaceStore((s) => s.setFormat);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = [
    { id: "16:9", label: "Landscape 16:9", shape: "h-2.5 w-4" },
    { id: "9:16", label: "Portrait 9:16", shape: "h-4 w-2.5 mx-0.75" },
  ];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "focus-ring grid size-8 cursor-pointer place-items-center rounded-chip text-ink-3 transition hover:bg-black/5 hover:text-ink",
          open && "bg-black/5 text-ink"
        )}
      >
        <EllipsisVertical className="size-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-60 rounded-panel border border-hair-2 bg-card p-1.5 shadow-float"
        >
          <div className="flex items-center gap-1.5 px-2.5 pb-1.5 pt-2 text-caption font-extrabold uppercase tracking-[.08em] text-ink-4">
            Video shape
            <span className="rounded-glyph bg-warn-bg px-1.5 py-px text-micro font-extrabold normal-case tracking-normal text-warn">
              Dev only
            </span>
          </div>
          {options.map((option) => {
            const active = format === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => { setFormat(option.id); setOpen(false); }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-body-lg transition-colors hover:bg-subtle",
                  active ? "font-extrabold text-ink" : "font-semibold text-ink-2"
                )}
              >
                <span className={cn("shrink-0 rounded-[3px] border-[1.5px] border-current opacity-70", option.shape)} />
                {option.label}
                {active && <Check className="ml-auto size-3.5 text-brand" strokeWidth={3} />}
              </button>
            );
          })}
          <p className="mx-1 mt-1 border-t border-hair px-1.5 pb-1 pt-2 text-caption leading-snug text-ink-4">
            For checking screens in both shapes. Remove this menu before release.
          </p>
        </div>
      )}
    </div>
  );
}
