"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * An explanation you can hover for, or click to keep.
 *
 * The title attribute is not an explanation: it waits a second, renders in
 * the operating system's own box, and is gone the moment the pointer moves.
 * Anything worth writing a sentence about deserves to stay on screen while
 * the sentence is read — so hovering opens this, and clicking pins it until
 * you click away.
 */
export function InfoTip({
  children,
  label = "What is this?",
  align = "right",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  /** Which edge the panel hangs from. */
  align?: "left" | "right";
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [at, setAt] = useState<{ top: number; left: number; right: number } | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const open = hovered || pinned;

  /* Portalled and positioned from the glyph's own rect. The canvas column
     clips its overflow, so a panel hanging below a control in the canvas
     header was in the DOM and invisible. */
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const box = wrapRef.current?.getBoundingClientRect();
      if (box) setAt({ top: box.bottom + 6, left: box.left, right: window.innerWidth - box.right });
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  /* A pinned panel closes on a click anywhere else — otherwise it follows you
     around the screen and has to be dismissed by finding the glyph again. */
  useEffect(() => {
    if (!pinned) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setPinned(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  return (
    <span ref={wrapRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setPinned((v) => !v)}
        /* Pointer and mouse both: a stylus, a touch device and an automated
           pointer do not all send the same pair, and an explanation that only
           opens for one of them is an explanation most people never see. */
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={cn(
          "focus-ring grid size-6 cursor-pointer place-items-center rounded-full border transition",
          open
            ? "border-brand bg-tint text-brand-deep"
            : "border-hair-2 bg-card text-ink-3 hover:border-brand hover:text-brand"
        )}
      >
        <Info className="size-3.5" />
      </button>

      {open &&
        at &&
        createPortal(
          <span
            role="note"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={
              align === "right"
                ? { top: at.top, right: at.right }
                : { top: at.top, left: at.left }
            }
            className="fixed z-[9999] w-[248px] rounded-panel border border-hair-2 bg-card p-2.5 text-left text-caption leading-snug text-ink-2 shadow-float"
          >
            {children}
          </span>,
          document.body
        )}
    </span>
  );
}
