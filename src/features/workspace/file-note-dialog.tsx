"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { FileText, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * A file arrives with a note about what to do with it.
 *
 * Attaching used to be the whole act: the file appeared in a list and the
 * plan carried on as if it knew what the file was. It did not — a PDF called
 * Q3_readout could be the evidence, the wording or the layout, and the three
 * produce different assets. The note is the thing that makes an attachment
 * usable, so it is collected when the attachment is made rather than guessed
 * at afterwards.
 *
 * It is required. A file with an empty note is the state this dialog exists
 * to prevent, and offering to skip would put it back.
 */
export interface PendingFile {
  id: string;
  name: string;
  kind: "doc" | "media";
  /** Prefilled when editing an existing note. */
  note?: string;
}

export function FileNoteDialog({
  files,
  title,
  prompt,
  placeholder,
  onCancel,
  onConfirm,
}: {
  files: PendingFile[];
  title: string;
  prompt: string;
  placeholder: string;
  onCancel: () => void;
  onConfirm: (notes: Record<string, string>) => void;
}) {
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(files.map((f) => [f.id, f.note ?? ""]))
  );
  const ready = files.every((f) => (notes[f.id] ?? "").trim().length > 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[86vh] w-full max-w-[520px] flex-col overflow-hidden rounded-card border border-hair-2 bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-subhead font-[850] tracking-tight text-ink">{title}</h2>
            <p className="mt-0.5 text-label leading-snug text-ink-3">{prompt}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="focus-ring grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {files.map((file) => (
            <div key={file.id} className="rounded-control border border-hair-2 bg-canvas p-3">
              <div className="flex min-w-0 items-center gap-2">
                {file.kind === "media" ? (
                  <ImageIcon className="size-3.5 shrink-0 text-brand" />
                ) : (
                  <FileText className="size-3.5 shrink-0 text-brand" />
                )}
                <span className="truncate text-body font-bold text-ink">{file.name}</span>
              </div>
              <textarea
                autoFocus={file.id === files[0]?.id}
                value={notes[file.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [file.id]: e.target.value }))}
                rows={2}
                placeholder={placeholder}
                className="mt-2 w-full resize-none rounded-control border border-hair-2 bg-card px-2.5 py-2 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-hair bg-canvas px-5 py-3">
          <span className={cn("text-label", ready ? "text-ink-3" : "text-ink-4")}>
            {ready
              ? `${files.length} ${files.length === 1 ? "file" : "files"} ready`
              : "Every file needs a note before it can be attached"}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onCancel} className="cursor-pointer text-label font-bold">
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!ready}
              onClick={() => onConfirm(notes)}
              className="cursor-pointer text-label font-bold disabled:opacity-40"
            >
              {files.some((f) => f.note !== undefined) ? "Save note" : "Attach"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
