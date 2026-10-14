"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LayoutTemplate, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button, IconButton } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { TEMPLATE_ARCHETYPES, type TemplateArchetype } from "@/features/workspace/template-archetypes";

/**
 * Change the whole document's template from inside the editor.
 *
 * The same five families the layout step offered, as the same cards, so the
 * choice looks like the one already made. Picking one is not applying it:
 * every page is redrawn, so the second step says what carries over, takes an
 * optional note for SwishX, and asks for a yes. Applying goes to the chat like
 * every other request, and the canvas shows the redraw while it happens.
 *
 * Not to be confused with Insert › Layout, which arranges one part of a page.
 */
export function TemplateSwitchModal({
  currentId,
  pageCount,
  onApply,
  onClose,
}: {
  currentId: TemplateArchetype["id"];
  pageCount: number;
  onApply: (template: TemplateArchetype, note: string) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<TemplateArchetype | null>(null);
  const [note, setNote] = useState("");
  const current = TEMPLATE_ARCHETYPES.find((t) => t.id === currentId) ?? TEMPLATE_ARCHETYPES[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={picked ? `Apply the ${picked.name} template` : "Templates"}
        onClick={onClose}
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/75 p-4 backdrop-blur-sm sm:p-6"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex max-h-full w-full flex-col overflow-hidden rounded-card border border-hair bg-card shadow-modal",
            picked ? "max-w-[640px]" : "max-w-[880px]"
          )}
        >
          <div className="flex items-start gap-3 border-b border-hair px-5 py-3.5">
            <LayoutTemplate className="mt-0.5 size-4 shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="text-body-lg font-[850] text-ink">
                {picked ? `Apply the ${picked.name} template?` : "Templates"}
              </p>
              <p className="text-label text-ink-3">
                {picked
                  ? pageCount === 1
                    ? "The page is redrawn in the new template."
                    : `All ${pageCount} pages are redrawn in the new template.`
                  : "Change the template for the whole document. To rearrange one part of a page, use Insert › Layout."}
              </p>
            </div>
            <IconButton aria-label="Close" onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>

          {picked ? (
            <div className="min-h-0 space-y-4 overflow-y-auto p-5">
              {/* From what it is to what it will be, side by side. */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                <div className="space-y-1.5">
                  <div className="text-caption font-extrabold uppercase tracking-[.08em] text-ink-4">Now</div>
                  <Sample template={current} />
                  <div className="truncate text-label font-bold text-ink-2">{current.name}</div>
                </div>
                <ArrowRight className="size-4 text-ink-4" />
                <div className="space-y-1.5">
                  <div className="text-caption font-extrabold uppercase tracking-[.08em] text-brand-deep">New</div>
                  <Sample template={picked} />
                  <div className="truncate text-label font-bold text-ink">{picked.name}</div>
                </div>
              </div>

              <ul className="space-y-1.5 rounded-control border border-hair bg-subtle p-3 text-body text-ink-2">
                {[
                  "Every claim keeps its words and its citation.",
                  "Text you added and images you replaced move across where the new template has room.",
                  "Colours and styles set in the toolbar are reset to the new template's.",
                  "Version history keeps the document as it is now, so it can be restored.",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-ok" strokeWidth={3} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Field
                multiline
                rows={3}
                autoFocus
                label="Anything SwishX should know? (optional)"
                hint="What to keep, what to drop, which page matters most."
                placeholder="e.g. Keep the PASI 90 figure as the hero on page 1"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onApply(picked, note.trim());
                }}
              />
            </div>
          ) : (
            <div className="grid min-h-0 grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATE_ARCHETYPES.map((t) => {
                const isCurrent = t.id === currentId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => setPicked(t)}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-card border bg-card text-left transition",
                      isCurrent
                        ? "cursor-default border-brand ring-2 ring-brand/15"
                        : "cursor-pointer border-hair shadow-2xs hover:border-brand hover:shadow-xs"
                    )}
                  >
                    <div className="flex items-start gap-2 p-3 pb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-body-lg font-[850] tracking-tight text-ink">{t.name}</h3>
                        <p className="mt-0.5 line-clamp-2 text-label leading-snug text-ink-3">{t.tagline}</p>
                      </div>
                      {isCurrent && (
                        <span className="shrink-0 rounded-chip bg-brand px-2 py-0.5 text-caption font-bold text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="px-3 pb-3">
                      <Sample template={t} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {picked && (
            <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => {
                  setPicked(null);
                  setNote("");
                }}
              >
                <ArrowLeft className="size-3.5" />
                All templates
              </Button>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button size="sm" className="gap-1.5 font-bold" onClick={() => onApply(picked, note.trim())}>
                  <LayoutTemplate className="size-3.5" />
                  Apply template
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/** Whether a sample's ground is light, from the first colour in its gradient. */
function isLight(background: string) {
  const hex = background.match(/#([0-9a-f]{6})/i)?.[1];
  if (!hex) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6;
}

/** A template's sample, with its own figures and type — the same one the layout step shows. */
function Sample({ template }: { template: TemplateArchetype }) {
  const light = isLight(template.previewBg);
  return (
    <div style={{ background: template.previewBg }} className="flex flex-col gap-1 rounded-panel p-3">
      <span
        className={cn(
          "w-fit rounded-glyph px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wider",
          light ? "bg-white/70" : "bg-black/25 text-white/90"
        )}
        style={light ? { color: template.accent } : undefined}
      >
        {template.badge}
      </span>
      <span
        className={cn("truncate text-display font-[850] leading-tight tracking-tight", light ? "text-ink" : "text-white")}
      >
        {template.metric}
      </span>
      <span className={cn("truncate text-caption", light ? "text-ink-3" : "text-white/70")}>{template.metricSub}</span>
    </div>
  );
}
