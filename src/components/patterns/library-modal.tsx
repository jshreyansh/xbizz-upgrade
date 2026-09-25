"use client";

import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The header a "pick one from the library" modal opens with: a heading and
 * a close, nothing else. It used to carry a small eyebrow tag above the
 * heading ("PRESENTER LIBRARY", "VOICE LIBRARY") naming the modal that was
 * already named by the modal being open — the heading alone says what to do
 * ("Choose characters for your video"), and the tag only repeated the noun.
 */
export function LibraryModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between border-b border-hair p-5 sm:px-6">
      <h2 className="text-display font-bold tracking-tight">{title}</h2>
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
        <X className="size-4" />
      </Button>
    </div>
  );
}

/**
 * The footer every library-picker modal ends on: this list is a curated
 * shortlist, not the whole shelf, and the shelf itself — where you'd go to
 * add a new one — is a different screen. One consistent way there, rather
 * than each modal inventing its own link.
 */
export function LibraryModalGoTo({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="border-t border-hair p-4 sm:px-6">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-body font-bold text-brand hover:underline cursor-pointer"
      >
        {label}
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  );
}
