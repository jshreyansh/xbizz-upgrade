"use client";

import { useState, type ReactNode } from "react";
import { Archive, Save, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button, IconButton } from "@/components/ui/button";

/**
 * The one dialog that asks "keep this as a draft, or discard it?" — before
 * the header's ✕ closes a project, and before either library modal hands the
 * user off to a different page. Three call sites asking the same question in
 * three different pop-ups is how it drifts; this is the one version.
 *
 * Discarding archives the project, it does not delete it: it lands in the
 * Content Library's Archived tab. It still asks once more, because it sits a
 * button away from the choice that keeps the project in progress.
 */
export function SaveOrDiscardDialog({
  open,
  ...props
}: {
  open: boolean;
  /** Where the user is heading, when it isn't the Content Library: "the Character Library". */
  destinationLabel?: string;
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
  destinationLabel?: string;
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
        <div className="relative w-full max-w-[420px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
          <IconButton aria-label="Close and stay in this project" onClick={onCancel} className="absolute right-3 top-3">
            <X className="size-4" />
          </IconButton>
          {confirmingDiscard ? (
            <>
              <Body
                icon={
                  <span className="mb-3 grid size-10 place-items-center rounded-full bg-warn-bg text-warn">
                    <Archive className="size-5" />
                  </span>
                }
                title="Discard and archive this project?"
              >
                It moves to the Archived tab in the Content Library. You can open it from there if you need it again.
              </Body>
              <div className="flex flex-col gap-2 border-t border-hair bg-canvas/60 p-4 sm:p-5">
                <Button onClick={onDiscard} className="w-full cursor-pointer gap-1.5">
                  <Archive className="size-4" />
                  Yes, discard and archive
                </Button>
                <Button variant="secondary" onClick={onSaveDraft} className="w-full cursor-pointer gap-1.5">
                  <Save className="size-4" />
                  No, save as draft
                </Button>
              </div>
            </>
          ) : (
            <>
              <Body title="Leave this project?">
                {destinationLabel ? `You're heading to ${destinationLabel}. ` : ""}
                Save it as a draft to carry on later, or discard it and move it to the archive. Both are in the
                Content Library.
              </Body>
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
                  <Archive className="size-4" />
                  Discard and archive
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

function Body({ icon, title, children }: { icon?: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="p-5 pr-14 sm:p-6 sm:pr-14">
      {icon}
      <h2 id="save-or-discard-title" className="text-display font-bold tracking-tight">
        {title}
      </h2>
      <p id="save-or-discard-body" className="mt-1.5 text-body-lg text-ink-3">
        {children}
      </p>
    </div>
  );
}
