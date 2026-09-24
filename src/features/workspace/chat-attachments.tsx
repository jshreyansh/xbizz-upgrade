"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Maximize2, Paperclip, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";

/**
 * Files attached to a message, wherever a message is written.
 *
 * The brief screen worked this out first — a thumbnail you can open for an
 * image or a clip, a filename for a PDF, and an × on each. Every chat input in
 * the app then had a "+" that either opened a menu of canned prompts or did
 * nothing at all. It is the same gesture and it should do the same thing, so
 * this is the one definition of it.
 */
export type AttachmentKind = "image" | "video" | "doc";

export interface LocalAttachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  previewUrl?: string;
}

export function attachmentKind(file: File): AttachmentKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "doc";
}

/**
 * The attachments on one chat input: the list, the picker's input element,
 * and the preview the thumbnails open.
 *
 * Object URLs are revoked when a file is dropped and when the component goes
 * away — an unreleased blob URL holds the whole file in memory, and a chat you
 * work in for an hour can accumulate a lot of them.
 */
export function useChatAttachments() {
  const [files, setFiles] = useState<LocalAttachment[]>([]);
  const [preview, setPreview] = useState<LocalAttachment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<LocalAttachment[]>([]);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(
    () => () => {
      filesRef.current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    },
    []
  );

  const open = () => inputRef.current?.click();

  const accept = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    setFiles((prev) => [
      ...prev,
      ...Array.from(picked).map((file, i) => {
        const kind = attachmentKind(file);
        return {
          id: `att-${Date.now()}-${i}`,
          name: file.name,
          kind,
          /* Documents get a URL too. They used to be left without one because
             nothing could open them; the viewer can, and a chip that opens an
             empty frame is worse than one that does not open. */
          previewUrl: URL.createObjectURL(file),
        } satisfies LocalAttachment;
      }),
    ]);
  };

  const remove = (target: LocalAttachment) => {
    if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setFiles((prev) => prev.filter((f) => f.id !== target.id));
    setPreview((p) => (p?.id === target.id ? null : p));
  };

  /** Hand them to the message being sent, and clear the row. */
  const take = () => {
    const sent = files;
    setFiles([]);
    return sent;
  };

  return { files, preview, setPreview, inputRef, open, accept, remove, take };
}

/** The row of chips, the hidden file input, and the preview, in one place. */
export function ChatAttachmentRow({
  attachments,
  className,
}: {
  attachments: ReturnType<typeof useChatAttachments>;
  className?: string;
}) {
  /* Destructured once: the row reads these during render, and the lint rule
     that guards ref access does not distinguish a ref from the object holding
     one. */
  const { files, preview, setPreview, inputRef, accept, remove } = attachments;
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          accept(e.target.files);
          e.target.value = "";
        }}
      />
      {files.length > 0 && (
        <div className={className ?? "flex flex-wrap gap-1.5 pb-1.5"}>
          {files.map((file) => (
            <AttachmentChip
              key={file.id}
              file={file}
              /* Documents open too: there is a viewer for one now, and a
                 chip you cannot open is a filename you have to trust. */
              onOpen={() => setPreview(file)}
              onRemove={() => remove(file)}
            />
          ))}
        </div>
      )}
      {preview && <AttachmentPreviewModal file={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

export function AttachmentChip({
  file,
  onOpen,
  onRemove,
}: {
  file: LocalAttachment;
  onOpen?: () => void;
  onRemove: () => void;
}) {
  const isMedia = file.kind !== "doc" && Boolean(file.previewUrl);
  return (
    <span className="flex min-h-9 items-center gap-2 rounded-chip border border-hair bg-[#edf1f4] py-1 pl-1 pr-1.5 text-body font-medium text-ink-3">
      {isMedia ? (
        <button
          type="button"
          onClick={onOpen}
          className="focus-ring group relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-glyph border border-hair bg-canvas cursor-pointer"
          aria-label={`Preview ${file.name}`}
        >
          {file.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <video src={file.previewUrl} muted playsInline className="size-full object-cover" />
          )}
          <span className="absolute inset-0 grid place-items-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 className="size-3 text-white" />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          disabled={!onOpen}
          className="focus-ring group relative grid size-7 shrink-0 place-items-center rounded-glyph border border-hair bg-canvas transition enabled:cursor-pointer enabled:hover:border-brand enabled:hover:text-brand"
          aria-label={onOpen ? `Preview ${file.name}` : undefined}
        >
          <Paperclip className="size-3.5 opacity-75 transition-opacity group-hover:opacity-0" />
          {onOpen && (
            <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 className="size-3" />
            </span>
          )}
        </button>
      )}
      <span className="max-w-[180px] truncate">{file.name}</span>
      <button
        onClick={onRemove}
        className="grid size-5 shrink-0 place-items-center rounded-full opacity-60 transition hover:bg-white/70 hover:opacity-100 cursor-pointer"
        aria-label={`Remove ${file.name}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export function AttachmentPreviewModal({ file, onClose }: { file: LocalAttachment; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-6 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-label={file.name}
        onClick={onClose}
      >
        <div
          className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b border-hair px-4 py-2.5">
            <span className="truncate text-body font-semibold text-ink">{file.name}</span>
            <button
              onClick={onClose}
              className="grid size-7 shrink-0 place-items-center rounded-control text-ink-3 transition hover:bg-black/5 hover:text-ink cursor-pointer"
              aria-label="Close preview"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid min-h-0 flex-1 place-items-center overflow-auto bg-canvas p-4">
            {file.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.previewUrl} alt={file.name} className="max-h-[calc(88vh-5rem)] max-w-full object-contain" />
            ) : file.kind === "video" ? (
              <video src={file.previewUrl} controls autoPlay className="max-h-[calc(88vh-5rem)] max-w-full" />
            ) : file.previewUrl ? (
              /* The browser's own document viewer. A PDF does not need a
                 reader written for it, and one written here would be worse
                 than the one already installed. */
              <iframe src={file.previewUrl} title={file.name} className="h-[calc(88vh-5rem)] w-full rounded-control border border-hair bg-card" />
            ) : (
              /* A document with nothing behind it yet. Saying so beats an empty
                 frame that looks like a viewer that failed. */
              <div className="grid min-h-[280px] w-full place-items-center gap-2 rounded-control border border-dashed border-hair-2 bg-card px-6 py-16 text-center">
                <FileText className="size-7 text-ink-4" />
                <p className="text-body-lg font-bold text-ink-2">{file.name}</p>
                <p className="max-w-[44ch] text-body text-ink-4">
                  No file is attached to this record yet, so there is nothing to display.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

