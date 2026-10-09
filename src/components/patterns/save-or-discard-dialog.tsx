"use client";

import { useState } from "react";
import { FileX2, Save, Trash2 } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";

/**
 * The one dialog that asks "keep this, or throw it away?" — before the
 * header's ✕ closes a project, and before either library modal below hands
 * the user off to a different page. Three call sites asking the same
 * question in three different pop-ups is how it drifts; this is the one
 * version, and where it's headed is the only thing that changes per call.
 *
 * Discarding asks once more. It is the one choice here that cannot be
 * undone, and it sits a button away from the one that keeps everything.
 */
export function SaveOrDiscardDialog({
  open,
  ...props
}: {
  open: boolean;
  /** Named in the body: "the Character Library", "the Voice Library", "home". */
  destinationLabel: string;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  /* Mounted only while open, so each opening starts at the first question. */
  return <SaveOrDiscardContent {...props} />;
}

function SaveOrDiscardContent({
  destinationLabel,
  onSaveDraft,
  onDiscard,
  onCancel,
}: {
  destinationLabel: string;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[60] grid place-items-center bg-ink/42 p-4 backdrop-blur-sm"
        role={confirmingDiscard ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="save-or-discard-title"
        aria-describedby="save-or-discard-body"
      >
        <div className="w-full max-w-[420px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
          {confirmingDiscard ? (
            <>
              <div className="p-5 sm:p-6">
                <span className="mb-3 grid size-10 place-items-center rounded-full bg-danger-bg text-danger">
                  <Trash2 className="size-5" />
                </span>
                <h2 id="save-or-discard-title" className="text-display font-bold tracking-tight">
                  Delete this project?
                </h2>
                <p id="save-or-discard-body" className="mt-1.5 text-body-lg text-ink-3">
                  If you discard it, it will be deleted permanently, and you can&rsquo;t recover it.
                </p>
              </div>
              <div className="flex flex-col gap-2 border-t border-hair bg-canvas/60 p-4 sm:p-5">
                <Button variant="danger" onClick={onDiscard} className="w-full cursor-pointer gap-1.5">
                  <Trash2 className="size-4" />
                  Yes, delete
                </Button>
                <Button variant="secondary" onClick={onSaveDraft} className="w-full cursor-pointer gap-1.5">
                  <Save className="size-4" />
                  No, save as draft
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="p-5 sm:p-6">
                <h2 id="save-or-discard-title" className="text-display font-bold tracking-tight">
                  Leave this project?
                </h2>
                <p id="save-or-discard-body" className="mt-1.5 text-body-lg text-ink-3">
                  You&rsquo;re heading to {destinationLabel}. Keep what you&rsquo;ve done here as a draft, or discard it.
                </p>
              </div>
              <div className="flex flex-col gap-2 border-t border-hair bg-canvas/60 p-4 sm:p-5">
                <Button onClick={onSaveDraft} className="w-full cursor-pointer gap-1.5">
                  <Save className="size-4" />
                  Save as draft
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setConfirmingDiscard(true)}
                  className="w-full cursor-pointer gap-1.5"
                >
                  <FileX2 className="size-4" />
                  Discard project
                </Button>
                <Button variant="ghost" onClick={onCancel} className="w-full cursor-pointer">
                  Stay here
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}
