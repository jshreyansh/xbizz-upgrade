"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useResizablePanel } from "@/lib/use-resizable-panel";

export const SIDE_PANEL_DEFAULT_WIDTH = 410;
export const SIDE_PANEL_MIN_WIDTH = 320;
export const SIDE_PANEL_MAX_WIDTH = 720;

/** Width transition for the open/close animation — off while dragging. */
export const SIDE_PANEL_TRANSITION = "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * The right inspector — chat / edit / claims / comments — with a drag-to-resize
 * edge. Four screens had this aside byte-identical, which is what earned it a
 * component; the resize handle is why it needed one, since a per-screen copy
 * would be four copies of the pointer-capture logic.
 *
 * The handle lives INSIDE the panel at its left edge on purpose: the aside is
 * `overflow-hidden`, so anything positioned at a negative offset gets clipped.
 * 8px of overlap sits on the panel's own padding at every call site.
 */
export interface SidePanelProps {
  open?: boolean;
  width?: number;
  onWidthChange?: (width: number) => void;
  /** Fires on drag start/end. Callers whose adjacent region is sized by a
   *  calc() off this width use it to suspend that region's transition. */
  onResizingChange?: (resizing: boolean) => void;
  minWidth?: number;
  maxWidth?: number;
  /**
   * Floor for the region beside the panel; caps the effective max. Measured
   * against the VIEWPORT, which is correct for the real screens because the
   * panel row is viewport-wide. Nested inside a narrower container, cap
   * `maxWidth` instead.
   */
  minCanvas?: number;
  storageKey?: string;
  resizable?: boolean;
  className?: string;
  children: ReactNode;
}

export function SidePanel({
  open = true,
  width = SIDE_PANEL_DEFAULT_WIDTH,
  onWidthChange,
  onResizingChange,
  minWidth = SIDE_PANEL_MIN_WIDTH,
  maxWidth = SIDE_PANEL_MAX_WIDTH,
  minCanvas = 360,
  storageKey,
  resizable = true,
  className,
  children,
}: SidePanelProps) {
  const canResize = resizable && Boolean(onWidthChange) && open;

  const { resizing, handleProps } = useResizablePanel({
    width,
    onWidthChange: onWidthChange ?? (() => {}),
    defaultWidth: SIDE_PANEL_DEFAULT_WIDTH,
    minWidth,
    maxWidth,
    minCanvas,
    side: "left",
    onResizingChange,
    storageKey,
    disabled: !canResize,
  });

  return (
    <aside
      style={{
        width: open ? width : 0,
        minWidth: open ? width : 0,
        maxWidth: open ? width : 0,
        transition: resizing ? "none" : SIDE_PANEL_TRANSITION,
      }}
      className={cn(
        "relative z-10 flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-hair bg-card shadow-panel-left",
        !open && "pointer-events-none border-none",
        className,
      )}
    >
      {canResize && <ResizeGrip resizing={resizing} {...handleProps} />}
      {children}
    </aside>
  );
}

type ResizeGripProps = { resizing: boolean } & ReturnType<typeof useResizablePanel>["handleProps"];

function ResizeGrip({ resizing, ...handleProps }: ResizeGripProps) {
  return (
    <div
      {...handleProps}
      className={cn(
        // group/peer styling is done with data-resizing so the drag state
        // survives the pointer leaving the strip.
        "group absolute inset-y-0 left-0 z-30 w-2 cursor-col-resize touch-none select-none",
        "outline-none focus-visible:bg-brand/15",
      )}
      data-resizing={resizing || undefined}
    >
      {/* The edge line, sitting over the panel's own border. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-brand transition-opacity duration-150",
          resizing ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
        )}
      />
      {/* The grab affordance. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-[1px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full transition-all duration-150",
          resizing
            ? "bg-brand opacity-100"
            : "bg-ink-3/40 opacity-0 group-hover:bg-brand group-hover:opacity-100 group-focus-visible:opacity-100",
        )}
      />
    </div>
  );
}
