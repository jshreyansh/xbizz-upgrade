"use client";

import { Send } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The box you talk to SwishX in, once.
 *
 * Every stage had its own. The plan screen used a 38px single-line field with
 * a plus and a send button; the studio used a panel with a textarea, a
 * context row and a line saying what the answer is grounded against. Same
 * conversation, same agent, two controls that did not look related, and only
 * one of them had room to show what you had attached.
 *
 * So it is the studio's shape everywhere: whatever is attached sits above the
 * field, as chips you can open and remove, because context you cannot see is
 * context you cannot check. Under the field, the control that adds more, the
 * ground the answer will be checked against, and send.
 */
export function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  rows = 2,
  /** The attachment chips, and anything else attached to this message. */
  children,
  /** The control that adds context: a plain button, or one that opens a menu. */
  attachControl,
  /** What the reply will be checked against. */
  note,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  rows?: number;
  children?: React.ReactNode;
  attachControl?: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
}) {
  const canSend = !disabled && value.trim().length > 0;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className={cn(
        "flex flex-col gap-2 rounded-panel border border-hair bg-card p-2.5 shadow-xs transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15",
        className
      )}
    >
      {children}

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          /* Enter sends, Shift+Enter breaks the line. A chat field that
             needs a button for the common case is a form, not a chat. */
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-ink-3 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex items-center justify-between gap-2 border-t border-hair pt-1.5">
        <div className="flex min-w-0 items-center gap-2">
          {attachControl}
          {note && <div className="truncate text-caption text-ink-3">{note}</div>}
        </div>
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-brand text-white shadow-xs transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Send className="size-3.5" />
        </button>
      </div>
    </form>
  );
}

/** The circular control that opens the picker, or a menu of what to attach. */
export function ComposerAttachButton({
  onClick,
  label = "Add context",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-chip border border-hair-2 bg-card text-brand shadow-2xs transition-colors hover:bg-tint hover:text-brand-deep"
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M5 12h14M12 5v14" />
      </svg>
    </button>
  );
}
