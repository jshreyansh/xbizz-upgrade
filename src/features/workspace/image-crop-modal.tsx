"use client";

import { useEffect, useRef, useState } from "react";
import { Crop, Minus, Plus, RotateCcw, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button, IconButton } from "@/components/ui/button";

/**
 * Fit an uploaded image to the box it is replacing.
 *
 * The way a profile picture is set: the image sits behind a frame the exact
 * shape of the slot, and is moved and zoomed until the right part is inside
 * it. The image always covers the frame — it can be zoomed in, never out past
 * the edges — so the slot never shows a gap. Applying draws what is inside the
 * frame, at twice the slot's size so it stays sharp.
 */

const STAGE_W = 560;
const STAGE_H = 360;
const MARGIN = 36;
const ZOOM_MAX = 4;

interface Offset {
  x: number;
  y: number;
}

export function ImageCropModal({
  src,
  fileName,
  mime,
  aspect,
  slotLabel,
  onApply,
  onClose,
}: {
  /** An object URL for the uploaded file. */
  src: string;
  fileName: string;
  mime: string;
  /** Width over height of the slot. */
  aspect: number;
  /** "the header image", for the subtitle. */
  slotLabel: string;
  onApply: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; from: Offset } | null>(null);

  /* The frame: as large as the stage allows, in the slot's own shape. */
  const frameW = Math.min(STAGE_W - MARGIN * 2, (STAGE_H - MARGIN * 2) * aspect);
  const frameH = frameW / aspect;
  /* At zoom 1 the image just covers the frame. */
  const base = natural ? Math.max(frameW / natural.w, frameH / natural.h) : 1;
  const dispW = natural ? natural.w * base * zoom : 0;
  const dispH = natural ? natural.h * base * zoom : 0;

  /** Keep the frame covered: the image can move only as far as its overhang. */
  const clamp = (o: Offset, z = zoom): Offset => {
    if (!natural) return o;
    const w = natural.w * base * z;
    const h = natural.h * base * z;
    const maxX = Math.max(0, (w - frameW) / 2);
    const maxY = Math.max(0, (h - frameH) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) };
  };

  const setZoomClamped = (z: number) => {
    const next = Math.max(1, Math.min(ZOOM_MAX, z));
    setZoom(next);
    setOffset((o) => clamp(o, next));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const apply = () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    const scale = base * zoom;
    const left = (frameW - dispW) / 2 + offset.x;
    const top = (frameH - dispH) / 2 + offset.y;
    /* Twice the frame on screen, so the slot stays sharp on a print proof. */
    const outW = Math.round(Math.min(2000, frameW * 2));
    const outH = Math.round(outW / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -left / scale, -top / scale, frameW / scale, frameH / scale, 0, 0, outW, outH);
    onApply(canvas.toDataURL(mime === "image/png" ? "image/png" : "image/jpeg", 0.92));
  };

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Fit ${fileName}`}
        onClick={onClose}
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/75 p-4 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex w-full max-w-[608px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-modal"
        >
          <div className="flex items-start gap-3 border-b border-hair px-5 py-3.5">
            <Crop className="mt-0.5 size-4 shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-lg font-[850] text-ink">Fit {fileName}</p>
              <p className="text-label text-ink-3">
                The frame is the shape of {slotLabel}. Drag to move the image, scroll or use the slider to zoom.
              </p>
            </div>
            <IconButton aria-label="Close" onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>

          <div className="grid justify-items-center gap-4 p-5">
            <div
              className="relative cursor-grab touch-none select-none overflow-hidden rounded-panel bg-ink active:cursor-grabbing"
              style={{ width: STAGE_W, height: STAGE_H }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { x: e.clientX, y: e.clientY, from: offset };
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d) return;
                setOffset(clamp({ x: d.from.x + e.clientX - d.x, y: d.from.y + e.clientY - d.y }));
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onWheel={(e) => setZoomClamped(zoom - e.deltaY * 0.002)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt=""
                draggable={false}
                onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                className="pointer-events-none absolute max-w-none"
                style={
                  natural
                    ? {
                        width: dispW,
                        height: dispH,
                        left: STAGE_W / 2 - dispW / 2 + offset.x,
                        top: STAGE_H / 2 - dispH / 2 + offset.y,
                      }
                    : { opacity: 0 }
                }
              />
              {/* The frame, with everything outside it dimmed, and thirds to line things up on. */}
              <div
                aria-hidden
                className="pointer-events-none absolute rounded-control ring-2 ring-white"
                style={{
                  width: frameW,
                  height: frameH,
                  left: (STAGE_W - frameW) / 2,
                  top: (STAGE_H - frameH) / 2,
                  boxShadow: "0 0 0 9999px rgba(10, 13, 20, 0.62)",
                }}
              >
                <span className="absolute inset-y-0 left-1/3 w-px bg-white/35" />
                <span className="absolute inset-y-0 left-2/3 w-px bg-white/35" />
                <span className="absolute inset-x-0 top-1/3 h-px bg-white/35" />
                <span className="absolute inset-x-0 top-2/3 h-px bg-white/35" />
              </div>
              {!natural && (
                <span className="absolute inset-0 grid place-items-center text-label font-semibold text-white/70">
                  Loading image…
                </span>
              )}
            </div>

            <div className="flex w-full max-w-[420px] items-center gap-2.5">
              <IconButton aria-label="Zoom out" size={8} onClick={() => setZoomClamped(zoom - 0.2)}>
                <Minus className="size-4" />
              </IconButton>
              <input
                type="range"
                min={1}
                max={ZOOM_MAX}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoomClamped(Number(e.target.value))}
                aria-label="Zoom"
                className="h-1.5 flex-1 cursor-pointer accent-brand"
              />
              <IconButton aria-label="Zoom in" size={8} onClick={() => setZoomClamped(zoom + 0.2)}>
                <Plus className="size-4" />
              </IconButton>
              <span className="w-11 text-right text-label font-bold tabular-nums text-ink-2">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
            >
              <RotateCcw className="size-3.5" />
              Fit to frame
            </Button>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={apply} disabled={!natural}>
                Use this crop
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
