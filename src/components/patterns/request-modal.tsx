"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button, IconButton } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";

/**
 * Ask SwishX for one thing, about one thing.
 *
 * The same pop-up wherever an editor asks for something it then hands to the
 * chat: regenerating a shot or a piece of art, adding a scene or a page. A
 * heading that names the action and its subject, the thing itself when there
 * is something to show, what it shows now, and one box for what should
 * change. Sending goes to the chat, so every request is in one record.
 */
export function RequestModal({
  icon: Icon,
  action,
  subject,
  preview,
  previewBeside,
  current,
  currentLabel = "Shows now",
  label,
  hint,
  placeholder,
  submitLabel,
  required,
  onSubmit,
  onClose,
}: {
  icon: LucideIcon;
  /** "Regenerate", "Add a page". */
  action: string;
  /** "Scene 1 · Shot 1". */
  subject: string;
  /** The thing as it is now. Omit when there is nothing yet, as for a new page. */
  preview?: ReactNode;
  /** Put a tall preview beside the box rather than above it. */
  previewBeside?: boolean;
  /** What it shows now, in words. */
  current?: string;
  currentLabel?: string;
  label: string;
  hint?: string;
  placeholder: string;
  submitLabel: string;
  /** A new page or scene needs to be about something; a regeneration does not. */
  required?: boolean;
  onSubmit: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const ready = !required || note.trim().length > 0;
  const submit = () => ready && onSubmit(note.trim());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${action} ${subject}`}
        onClick={onClose}
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/75 p-4 backdrop-blur-sm sm:p-6"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex max-h-full w-full flex-col overflow-hidden rounded-card border border-hair bg-card shadow-modal",
            preview && previewBeside ? "max-w-[760px]" : preview ? "max-w-[640px]" : "max-w-[520px]"
          )}
        >
          <div className="flex items-center gap-3 border-b border-hair px-5 py-3">
            <Icon className="size-4 shrink-0 text-brand" />
            <span className="min-w-0 truncate text-body-lg font-bold text-ink">
              <span className="font-[850]">{action}</span> · {subject}
            </span>
            <IconButton aria-label="Close" onClick={onClose} className="ml-auto">
              <X className="size-4" />
            </IconButton>
          </div>

          <div className={cn("min-h-0 overflow-y-auto p-5", preview && previewBeside ? "flex gap-5" : "space-y-4")}>
            {preview && (previewBeside ? <div className="shrink-0">{preview}</div> : preview)}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              {current && (
                <div className="space-y-1">
                  <div className="text-caption font-extrabold uppercase tracking-[.08em] text-ink-4">{currentLabel}</div>
                  <p className="text-body leading-relaxed text-ink-2">{current}</p>
                </div>
              )}
              <Field
                multiline
                rows={3}
                autoFocus
                label={label}
                hint={hint}
                placeholder={placeholder}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
                }}
              />
              <Button onClick={submit} disabled={!ready} className="mt-auto gap-1.5 self-end font-bold">
                <Icon className="size-4" />
                {submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/** The "Current" tag on a preview. */
export function CurrentTag() {
  return (
    <span className="absolute left-2 top-2 rounded-chip bg-black/60 px-2 py-0.5 text-caption font-bold text-white backdrop-blur-sm">
      Current
    </span>
  );
}
