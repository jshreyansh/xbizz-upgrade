"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ComposerTrayItem {
  id: string;
  /** What kind of thing it is: an element, a scene, a suggestion. */
  icon: React.ReactNode;
  /** Where it is — "Scene 3 · Headline", "Characters". */
  label: string;
  /** What it currently says or is set to. */
  detail?: string;
  /** Your own words on it — a suggestion's comment, shown as a quote. */
  quote?: string;
}

/**
 * Everything going with the next message, inside the box you type it in.
 *
 * There were two of these. Elements added to the chat sat as chips in a
 * grey tray inside the composer; suggestions sat in a separate card above
 * it with their own send button and checkboxes that did nothing. Two places
 * to look for what was about to go, and two buttons that sent it. Now it is
 * one list of rows above the field, each with its own ×, and the composer's
 * send takes all of it.
 *
 * It stays short: past `max` rows the rest fold behind "+N more", so a long
 * markup session cannot push the conversation off the screen.
 */
export function ComposerTray({
  items,
  onRemove,
  max = 3,
}: {
  items: ComposerTrayItem[];
  onRemove: (id: string) => void;
  max?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  const shown = expanded ? items : items.slice(0, max);
  const hidden = items.length - shown.length;

  return (
    <div className="space-y-1 border-b border-hair pb-2">
      {shown.map((item) => (
        <div key={item.id} className="group flex min-w-0 items-center gap-2 rounded-glyph px-1 py-0.5 hover:bg-subtle">
          <span className="grid size-4 shrink-0 place-items-center text-brand">{item.icon}</span>
          <span className="min-w-0 flex-1 truncate text-label text-ink" title={[item.label, item.detail, item.quote].filter(Boolean).join(" · ")}>
            <span className="font-bold">{item.label}</span>
            {item.detail && <span className="text-ink-3"> · {item.detail}</span>}
            {item.quote && <span className="text-ink-2"> &ldquo;{item.quote}&rdquo;</span>}
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.label}`}
            className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-full text-ink-4 transition hover:bg-black/5 hover:text-ink"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
      {(hidden > 0 || expanded) && items.length > max && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn("cursor-pointer px-1 text-label font-bold text-brand hover:text-brand-deep")}
        >
          {expanded ? "Show fewer" : `+${hidden} more`}
        </button>
      )}
    </div>
  );
}
