"use client";

import { useEffect, useState } from "react";
import { Layers, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button, IconButton } from "@/components/ui/button";
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
 * It stays short: past `max` rows the rest fold behind "View all", so a long
 * markup session cannot push the conversation off the screen. A row shows one
 * line; clicking it, or View all, opens every item in full — a long
 * suggestion cut off mid-sentence is not something you can check before
 * sending.
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
  /* The item to open the full list at, or "all"; null while closed. */
  const [viewing, setViewing] = useState<string | null>(null);
  if (items.length === 0) return null;
  const shown = items.slice(0, max);
  const hidden = items.length - shown.length;

  return (
    <div className="space-y-1 border-b border-hair pb-2">
      {shown.map((item) => (
        <div key={item.id} className="group flex min-w-0 items-center gap-2 rounded-glyph px-1 py-0.5 hover:bg-subtle">
          <span className="grid size-4 shrink-0 place-items-center text-brand">{item.icon}</span>
          <button
            type="button"
            onClick={() => setViewing(item.id)}
            title="See it in full"
            className="min-w-0 flex-1 cursor-pointer truncate text-left text-label text-ink"
          >
            <span className="font-bold">{item.label}</span>
            {item.detail && <span className="text-ink-3"> · {item.detail}</span>}
            {item.quote && <span className="text-ink-2"> &ldquo;{item.quote}&rdquo;</span>}
          </button>
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
      {items.length > 1 && (
        <button
          type="button"
          onClick={() => setViewing("all")}
          className={cn("cursor-pointer px-1 text-label font-bold text-brand hover:text-brand-deep")}
        >
          {hidden > 0 ? `+${hidden} more · View all ${items.length}` : `View all ${items.length}`}
        </button>
      )}
      {viewing && (
        <ComposerTrayModal
          items={items}
          focusId={viewing === "all" ? null : viewing}
          onRemove={onRemove}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

/** Everything going with the next message, each item whole. */
function ComposerTrayModal({
  items,
  focusId,
  onRemove,
  onClose,
}: {
  items: ComposerTrayItem[];
  focusId: string | null;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Open at the item that was clicked. */
  useEffect(() => {
    if (!focusId) return;
    document.querySelector(`[data-tray-item="${CSS.escape(focusId)}"]`)?.scrollIntoView({ block: "center" });
  }, [focusId]);

  /* Removing the last item leaves nothing to show. */
  useEffect(() => {
    if (items.length === 0) onClose();
  }, [items.length, onClose]);

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="With your next message"
        onClick={onClose}
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/75 p-4 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[80vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-modal"
        >
          <div className="flex items-start gap-3 border-b border-hair px-5 py-3.5">
            <Layers className="mt-0.5 size-4 shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="text-body-lg font-[850] text-ink">With your next message</p>
              <p className="text-label text-ink-3">
                {items.length} {items.length === 1 ? "item goes" : "items go"} to SwishX when you send. Remove anything that should not.
              </p>
            </div>
            <IconButton aria-label="Close" onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>

          <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden p-4">
            {items.map((item, i) => (
              <li
                key={item.id}
                data-tray-item={item.id}
                className={cn(
                  "flex gap-3 rounded-control border p-3",
                  item.id === focusId ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair bg-card"
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tint text-brand">{item.icon}</span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-caption font-bold tabular-nums text-ink-4">{i + 1}</span>
                    <span className="min-w-0 text-body font-bold text-ink [overflow-wrap:anywhere]">{item.label}</span>
                  </div>
                  {item.detail && <p className="whitespace-pre-line text-body leading-relaxed text-ink-2 [overflow-wrap:anywhere]">{item.detail}</p>}
                  {item.quote && (
                    <blockquote className="whitespace-pre-line border-l-2 border-brand pl-2.5 text-body leading-relaxed text-ink [overflow-wrap:anywhere]">
                      {item.quote}
                    </blockquote>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.label}`}
                  title="Remove"
                  className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-ink-4 transition hover:bg-black/5 hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ol>

          <div className="flex justify-end border-t border-hair px-5 py-3">
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
