"use client";

import { FileX2, Save } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";

/**
 * The one dialog that asks "keep this, or throw it away?" — before the
 * header's ✕ closes a project, and before either library modal below hands
 * the user off to a different page. Three call sites asking the same
 * question in three different pop-ups is how it drifts; this is the one
 * version, and where it's headed is the only thing that changes per call.
 */
export function SaveOrDiscardDialog({
  open,
  destinationLabel,
  onSaveDraft,
  onDiscard,
  onCancel,
}: {
  open: boolean;
  /** Named in the body: "the Character Library", "the Voice Library", "home". */
  destinationLabel: string;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[60] grid place-items-center bg-ink/42 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-or-discard-title"
      >
        <div className="w-full max-w-[420px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
          <div className="p-5 sm:p-6">
            <h2 id="save-or-discard-title" className="text-display font-bold tracking-tight">
              Leave this project?
            </h2>
            <p className="mt-1.5 text-body-lg text-ink-3">
              You&rsquo;re heading to {destinationLabel}. Keep what you&rsquo;ve done here as a draft, or discard it.
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-hair bg-canvas/60 p-4 sm:p-5">
            <Button onClick={onSaveDraft} className="w-full cursor-pointer gap-1.5">
              <Save className="size-4" />
              Save as draft
            </Button>
            <Button variant="secondary" onClick={onDiscard} className="w-full cursor-pointer gap-1.5">
              <FileX2 className="size-4" />
              Discard project
            </Button>
            <Button variant="ghost" onClick={onCancel} className="w-full cursor-pointer">
              Stay here
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
