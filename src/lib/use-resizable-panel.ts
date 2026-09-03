"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drag-to-resize for an edge panel — the DevTools / Codex behaviour.
 *
 * Pointer events (not mouse) so a trackpad, a pen and a tablet touch all work
 * from one code path, and `setPointerCapture` so the drag keeps tracking when
 * the pointer leaves the 8px strip. That is the whole reason this is a hook
 * rather than an onMouseMove on the handle: without capture, a fast drag drops
 * the gesture the moment the cursor outruns the element.
 */
export interface ResizablePanelOptions {
  /** Current width in px. Controlled — the owner holds it. */
  width: number;
  onWidthChange: (width: number) => void;
  /** Reset target for double-click and Home. Defaults to the initial width. */
  defaultWidth?: number;
  minWidth?: number;
  /**
   * Hard ceiling. The effective max is also capped so the region the panel
   * sits next to keeps at least `minCanvas` px — a panel dragged past the
   * viewport is never what anyone means.
   */
  maxWidth?: number;
  minCanvas?: number;
  /** Which edge the handle sits on. "left" = the panel is docked right. */
  side?: "left" | "right";
  /** Fires on drag start/end so callers can suspend width transitions. */
  onResizingChange?: (resizing: boolean) => void;
  /** localStorage key. Omit to not persist. */
  storageKey?: string;
  disabled?: boolean;
}

export interface ResizableHandleProps {
  role: "separator";
  "aria-orientation": "vertical";
  "aria-valuenow": number;
  "aria-valuemin": number;
  "aria-valuemax": number;
  "aria-label": string;
  tabIndex: number;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onDoubleClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

const KEY_STEP = 16;
const KEY_STEP_COARSE = 64;

export function useResizablePanel(options: ResizablePanelOptions) {
  const {
    width, onWidthChange, defaultWidth, minWidth = 320, maxWidth = 720,
    minCanvas = 360, side = "left", onResizingChange, storageKey, disabled,
  } = options;

  const [resizing, setResizing] = useState(false);

  const restoreWidth = useRef(defaultWidth ?? width);

  // No ref caching the current width. An earlier version kept one, synced in
  // an effect to satisfy the refs-during-render rule — which meant a gesture
  // starting before that effect ran captured a stale start width and applied
  // the previous drag's target. These handlers are only ever read at gesture
  // start, so closing over the props directly is both simpler and correct.
  const clamp = useCallback((next: number) => {
    const viewportMax = typeof window === "undefined"
      ? maxWidth
      : Math.max(minWidth, window.innerWidth - minCanvas);
    return Math.round(Math.min(Math.min(maxWidth, viewportMax), Math.max(minWidth, next)));
  }, [minWidth, maxWidth, minCanvas]);

  // Restore a persisted width once, after mount — never during render, or the
  // server and client markup disagree.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === null) return;
      const parsed = Number.parseInt(stored, 10);
      if (Number.isFinite(parsed)) onWidthChange(clamp(parsed));
    } catch {
      // Private mode / disabled storage. A default width is a fine outcome.
    }
    // Deliberately mount-only: this is a restore, not a sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const commit = useCallback((next: number) => {
    const value = clamp(next);
    onWidthChange(value);
    if (storageKey) {
      try { window.localStorage.setItem(storageKey, String(value)); } catch { /* ignore */ }
    }
    return value;
  }, [clamp, onWidthChange, storageKey]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const el = e.currentTarget;
    const startX = e.clientX;
    const startWidth = width;
    // Capture can throw if the pointer is already gone; the drag still works
    // from the element's own listeners, so a failure here is not fatal.
    try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }

    setResizing(true);
    onResizingChange?.(true);
    // Hold the resize cursor for the whole gesture — otherwise it reverts to
    // whatever is under the pointer as soon as the drag outruns the strip.
    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      // A handle on the panel's left edge grows the panel when dragged left.
      commit(side === "left" ? startWidth - delta : startWidth + delta);
    };
    const onUp = (ev: PointerEvent) => {
      el.releasePointerCapture?.(ev.pointerId);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
      setResizing(false);
      onResizingChange?.(false);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
  }, [commit, disabled, onResizingChange, side, width]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    const grow = side === "left" ? "ArrowLeft" : "ArrowRight";
    const shrink = side === "left" ? "ArrowRight" : "ArrowLeft";
    const step = e.shiftKey ? KEY_STEP_COARSE : KEY_STEP;
    if (e.key === grow) { e.preventDefault(); commit(width + step); }
    else if (e.key === shrink) { e.preventDefault(); commit(width - step); }
    else if (e.key === "Home") { e.preventDefault(); commit(restoreWidth.current); }
  }, [commit, disabled, side, width]);

  const handleProps: ResizableHandleProps = {
    role: "separator",
    "aria-orientation": "vertical",
    "aria-valuenow": width,
    "aria-valuemin": minWidth,
    "aria-valuemax": maxWidth,
    "aria-label": "Resize panel",
    tabIndex: disabled ? -1 : 0,
    onPointerDown,
    onDoubleClick: () => { if (!disabled) commit(restoreWidth.current); },
    onKeyDown,
  };

  return { resizing, handleProps, reset: () => commit(restoreWidth.current) };
}
