"use client";

import { useState } from "react";
import { ChevronDown, MessageSquarePlus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface VideoSettingRow {
  id: string;
  icon: LucideIcon;
  label: string;
  /** What was chosen, in words — also what the chat context carries. */
  value: string;
  /** Faces, where the value is people. */
  avatars?: string[];
}

/**
 * The choices that hold for the whole video, above the selected scene.
 *
 * Everything here was decided in the flow — cast, voice, treatment, frame,
 * structure, mark, quality, sources — and none of it belongs to one scene,
 * so it sits once, above the scene, instead of nowhere. It is shown, not
 * set: each row hands itself to the chat like the scene's own copy does, so
 * there is one route to a change and the agent can say what it ripples into
 * (a new treatment re-cuts scenes; a new quality changes the cost).
 */
export function VideoSettings({
  rows,
  highlightId,
  onAddToChat,
}: {
  rows: VideoSettingRow[];
  /** A row to point at — the brand mark, when the logo is selected on the canvas. */
  highlightId?: string;
  onAddToChat: (row: VideoSettingRow) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="space-y-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 text-left"
      >
        <span className="min-w-0">
          <span className="block text-subhead font-[850] text-ink">Video</span>
          <span className="block text-caption text-ink-4">Applies to every scene</span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-ink-3 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="divide-y divide-hair overflow-hidden rounded-control border border-hair-2 bg-canvas">
          {rows.map((row) => (
            <div
              key={row.id}
              className={cn(
                "flex items-start gap-2.5 px-2.5 py-2 transition-colors",
                highlightId === row.id && "bg-tint ring-1 ring-inset ring-brand/30"
              )}
            >
              <row.icon className="mt-1 size-3.5 shrink-0 text-ink-4" />
              <div className="min-w-0 flex-1">
                {/* The action rides the label's line, so the value below gets
                    the row's full width in a narrow panel. */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-caption font-bold text-ink-3">{row.label}</span>
                  <button
                    type="button"
                    onClick={() => onAddToChat(row)}
                    aria-label={`Add ${row.label.toLowerCase()} to chat`}
                    className="-my-1 -mr-1 inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-glyph px-1.5 py-1 text-caption font-bold text-brand transition-colors hover:bg-tint"
                  >
                    <MessageSquarePlus className="size-3" />
                    <span>Add to chat</span>
                  </button>
                </div>
                {row.avatars && row.avatars.length > 0 && (
                  <span className="mt-1 flex -space-x-1.5">
                    {row.avatars.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="size-6 rounded-full border-2 border-canvas object-cover" />
                    ))}
                  </span>
                )}
                <span className="mt-0.5 block text-body font-medium leading-snug text-ink">{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
