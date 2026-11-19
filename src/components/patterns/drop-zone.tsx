"use client";

import { useRef, useState, type ReactNode } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/text";

/**
 * Where a file goes in: a dashed box you click to choose, or drop onto.
 *
 * Five copies (email insert, research sources, voice clone, new brand, and
 * the brand dossier upload), each a <label> or <button> over a hidden input,
 * and only one of them actually accepted a drop despite four saying "Drop".
 * This one takes both, and lights up while a file is held over it.
 *
 * Two ways to wire it:
 *   onFiles   it owns the hidden input; you get the File[] from a pick or a drop
 *   onChoose  you own the picker (a sample library, a modal); it is just the
 *             button, and a drop still arrives through onFiles if you pass it
 *
 * `tone="tint"` is for the one place an upload is the main thing on the
 * screen (a new brand), where a grey box would read as optional.
 */
export function DropZone({
  title,
  hint,
  icon,
  accept,
  multiple,
  onFiles,
  onChoose,
  tone = "canvas",
  size = "md",
  disabled,
  className,
}: {
  /** Sentence case: "Drop a file or choose one". */
  title: ReactNode;
  /** What it takes: "PDF, Word or PowerPoint". */
  hint?: ReactNode;
  /** Replaces the upload arrow. */
  icon?: ReactNode;
  /** Passed to the input, e.g. "image/*" or ".pdf,.docx". */
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  /** Open your own picker instead of the file dialog. */
  onChoose?: () => void;
  tone?: "canvas" | "card" | "tint";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const take = (list: FileList | null) => {
    const files = list ? Array.from(list) : [];
    if (files.length) onFiles?.(multiple ? files : files.slice(0, 1));
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (onChoose ? onChoose() : inputRef.current?.click())}
        onDragOver={(e) => {
          if (!onFiles || disabled) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (!onFiles || disabled) return;
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
        className={cn(
          "focus-ring grid w-full cursor-pointer justify-items-center gap-1.5 rounded-panel border border-dashed px-4 text-center transition-colors disabled:opacity-50",
          size === "md" ? "py-7" : "py-5",
          tone === "tint" ? "border-tint-line bg-tint-2" : tone === "card" ? "border-hair-3 bg-card" : "border-hair-3 bg-canvas",
          over ? "border-brand bg-tint" : "hover:border-brand hover:bg-tint",
          className,
        )}
      >
        <span className="text-brand">{icon ?? <Upload className="size-5" aria-hidden />}</span>
        <Text size={size === "md" ? "body-lg" : "body"} weight="bold">{title}</Text>
        {hint && <Text size="label" tone="subtle">{hint}</Text>}
      </button>
      {!onChoose && (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={(e) => {
            take(e.target.files);
            e.target.value = "";
          }}
        />
      )}
    </>
  );
}
