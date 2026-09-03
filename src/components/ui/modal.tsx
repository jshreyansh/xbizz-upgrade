"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/text";
import { IconButton } from "@/components/ui/button";

/**
 * One dialog shell for the 13 that were hand-built.
 *
 * It owns the things each copy had to remember and mostly didn't: Escape to
 * close, a click-outside target, body scroll lock, initial focus, a focus
 * trap, and aria-modal wiring.
 *
 * It also owns the scroll boundary. The popover-clipping bugs that took
 * several passes to fix came from absolutely-positioned menus inside a
 * scrollable dialog body — here the body is the only scroll container and
 * the header and footer stay put, so content can grow without the dialog
 * itself scrolling.
 */

type ModalSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<ModalSize, string> = {
  sm: "max-w-[420px]",
  md: "max-w-[620px]",
  lg: "max-w-[820px]",
  xl: "max-w-[1040px]",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  /** Pinned below the scrolling body. */
  footer?: ReactNode;
  /** Hide the corner close button when the footer owns dismissal. */
  hideClose?: boolean;
  className?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open, onClose, title, description, size = "md",
  footer, hideClose, className, children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Surface
        ref={panelRef as React.Ref<HTMLElement>}
        radius="card"
        elevation="modal"
        className={cn("flex max-h-[88vh] w-full flex-col overflow-hidden", sizes[size], className)}
      >
        {(title || !hideClose) && (
          <div className="flex shrink-0 items-start gap-3 border-b border-hair px-5 py-4">
            <div className="flex-1 min-w-0">
              {title && <Text as="h2" size="subhead" weight="bold">{title}</Text>}
              {description && (
                <Text as="p" size="body" tone="subtle" className="mt-0.5">
                  {description}
                </Text>
              )}
            </div>
            {!hideClose && (
              <IconButton aria-label="Close" onClick={onClose} className="-mr-1 -mt-1">
                <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden="true">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </IconButton>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-hair px-5 py-3.5">
            {footer}
          </div>
        )}
      </Surface>
    </div>
  );
}
