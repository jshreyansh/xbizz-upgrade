"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Scene } from "@/types/content";
import type { AdType } from "@/features/workspace/ad-options";
import type { AdTemplateLayout } from "@/features/workspace/ad-templates";
import type { CarouselCard, DocPage } from "@/features/workspace/ad-campaign";
import { textStyleCss, type TextStyle } from "@/features/workspace/canvas-text-toolbar";
import { SceneGraphLayer } from "@/features/workspace/scene-graph";

/**
 * The ads themselves, drawn at their real pixel size and scaled to fit.
 *
 * One renderer per kind of ad — the video frame, the image ad in each of its
 * sizes, a carousel card — used by the canvas, the All ads overview and the
 * rail's thumbnails alike, so the thumbnail is always the ad and never a
 * picture of it. On the canvas each part is selectable; everywhere else the
 * same parts are inert.
 *
 * The artwork is illustration: its colours are the brand kit's and the
 * picture's, so they are set inline rather than through the app's tokens.
 */

/* ── Sizes ── */

export type VideoShape = "16:9" | "9:16" | "1:1";
export type StillSize = "4:5" | "9:16" | "1:1" | "300×250" | "728×90" | "300×600" | "160×600" | "320×50";

export const VIDEO_SIZE: Record<VideoShape, { w: number; h: number }> = {
  "16:9": { w: 640, h: 360 },
  "9:16": { w: 360, h: 640 },
  "1:1": { w: 480, h: 480 },
};

export const STILL_SIZE: Record<StillSize, { w: number; h: number }> = {
  "4:5": { w: 400, h: 500 },
  "9:16": { w: 360, h: 640 },
  "1:1": { w: 450, h: 450 },
  "300×250": { w: 300, h: 250 },
  "728×90": { w: 728, h: 90 },
  "300×600": { w: 300, h: 600 },
  "160×600": { w: 160, h: 600 },
  "320×50": { w: 320, h: 50 },
};

export const BANNER_SIZES: StillSize[] = ["300×250", "728×90", "300×600", "160×600", "320×50"];
export const CARD_SIZE = { w: 450, h: 450 };
export const DOC_SIZE = { w: 400, h: 500 };

/* The pictures: frames from the same footage the video story is cut from,
   so the image ad and the carousel look like the same campaign. */
const FOOTAGE = {
  people: "/21617-319452308_medium.mp4",
  science: "/27019-361107952_medium.mp4",
  product: "/133898-758336558_medium.mp4",
  calm: "/6973-197914400_medium.mp4",
};
const PACKSHOT = "/products/injection.jpg";

/* ── Scaling ── */

/** The largest width a w:h box can take inside the measured element. */
export function useFitWidth(ratio: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setBox({ w: node.clientWidth, h: node.clientHeight }));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, Math.max(0, Math.floor(Math.min(box.w, box.h * ratio)))] as const;
}

/** Artwork drawn at w×h, shown at the given width. */
export function Scaled({ w, h, width, className, children }: { w: number; h: number; width: number; className?: string; children: ReactNode }) {
  const scale = width / w;
  return (
    <div className={cn("relative shrink-0 overflow-hidden", className)} style={{ width, height: Math.round(h * scale) }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: w, height: h, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

/* ── Selection ── */

export interface FrameEditing {
  selected?: string | null;
  onSelect?: (id: string) => void;
  styleOf?: (id: string) => TextStyle | undefined;
  textOf?: (id: string, fallback: string) => string;
}

/** One selectable part of an ad. Inert when the frame isn't being edited. */
function Part({
  id,
  edit,
  className,
  style,
  children,
}: {
  id: string;
  edit: FrameEditing;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  if (!edit.onSelect) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  const on = edit.selected === id;
  /* Pictures run to the frame's edge, so they are outlined inside, where the edge can't clip it. */
  const fills = /\.(picture|footage)$/.test(id);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={on}
      data-part={id}
      onClick={(e) => {
        e.stopPropagation();
        edit.onSelect?.(id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          edit.onSelect?.(id);
        }
      }}
      className={cn(
        "cursor-pointer transition-[outline-color]",
        fills ? "-outline-offset-4" : "outline-offset-2",
        on ? "outline-2 outline-dashed outline-brand" : "outline-1 outline-transparent hover:outline-dashed hover:outline-white/70",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

/** Words that can be retyped and restyled from the toolbar. */
function Words({ id, edit, text, className, style }: { id: string; edit: FrameEditing; text: string; className?: string; style?: CSSProperties }) {
  return (
    <Part id={id} edit={edit} className={className} style={{ ...style, ...textStyleCss(edit.styleOf?.(id)) }}>
      {edit.textOf ? edit.textOf(id, text) : text}
    </Part>
  );
}

/** A still from the footage, filling its box. */
function Picture({ src, at = 1.5, className, style }: { src: string; at?: number; className?: string; style?: CSSProperties }) {
  return (
    <video
      src={`${src}#t=${at}`}
      muted
      playsInline
      preload="metadata"
      aria-hidden
      className={cn("pointer-events-none size-full object-cover", className)}
      style={style}
    />
  );
}

const FONT = "Figtree, system-ui, sans-serif";

/* ── The video frame ── */

export type LogoCorner = "tl" | "tr" | "bl" | "br";

const CORNER: Record<LogoCorner, CSSProperties> = {
  tl: { left: 16, top: 16 },
  tr: { right: 16, top: 16 },
  bl: { left: 16, bottom: 56 },
  br: { right: 16, bottom: 56 },
};

/**
 * One scene of the video story in one shape, at a moment in it. The parts —
 * the shot's footage, the headline, the caption, the claim, the logo — are
 * where the video editor has them, rearranged for tall and square frames.
 */
export function AdVideoFrame({
  scene,
  shape,
  time = 0,
  playing = false,
  brandName,
  adType,
  logoCorner = "tr",
  prefix,
  edit = {},
}: {
  scene: Scene;
  shape: VideoShape;
  time?: number;
  playing?: boolean;
  brandName: string;
  adType: AdType;
  logoCorner?: LogoCorner;
  /** Namespaces the parts' ids, e.g. "scene:ad-b1". */
  prefix: string;
  edit?: FrameEditing;
}) {
  const { w, h } = VIDEO_SIZE[shape];
  const videoRef = useRef<HTMLVideoElement>(null);
  const shot = scene.shots?.find((s) => time >= s.startAt && time < s.endAt) ?? scene.shots?.[0];
  const safety = scene.narrativeTag === "Safety";
  const branded = adType !== "unbranded";
  const hasClaim = branded && /·/.test(scene.claim);
  const portrait = shape === "9:16";
  const id = (part: string) => `${prefix}.${part}`;

  /* The footage follows the player: it plays with it, and a paused frame
     shows the moment the playhead is on. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
      if (Math.abs(video.currentTime - time) > 0.25) video.currentTime = time + 0.5;
    }
  }, [playing, time]);

  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, background: "#0f2d22", fontFamily: FONT }}>
      <Part id={id("footage")} edit={edit} className="absolute inset-0">
        {scene.bgVideoSrc && (
          <video
            ref={videoRef}
            src={`${scene.bgVideoSrc}#t=0.5`}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="pointer-events-none size-full object-cover"
          />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: safety
              ? "rgba(8,22,17,.82)"
              : "linear-gradient(180deg, rgba(8,22,17,.15) 0%, rgba(8,22,17,.35) 45%, rgba(8,22,17,.85) 100%)",
          }}
        />
      </Part>

      <span
        className="pointer-events-none absolute uppercase"
        style={{ left: 18, top: 16, fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "#d5ee5b", border: "1px solid rgba(213,238,91,.5)", borderRadius: 6, padding: "2px 7px" }}
      >
        {scene.narrativeTag}
      </span>

      {branded && (
        <Part id={id("logo")} edit={edit} className="absolute" style={CORNER[logoCorner]}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 900, background: "#fff", color: "#0a0d14", borderRadius: 8, padding: "4px 9px" }}>{brandName}</span>
        </Part>
      )}

      <div
        className="absolute"
        style={
          portrait
            ? { left: 22, right: 22, top: safety ? 120 : 150 }
            : shape === "1:1"
              ? { left: 28, right: 28, top: safety ? 70 : 120 }
              : { left: 30, top: safety ? 56 : 104, width: safety ? 560 : 420 }
        }
      >
        <Words
          id={id("headline")}
          edit={edit}
          text={scene.title}
          style={{ color: "#fff", fontSize: safety ? 22 : portrait ? 34 : 32, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-.01em" }}
        />
        {scene.graph && !safety && (
          /* The chart draws up from its cue; away from the canvas it is shown drawn. */
          <Part id={id("chart")} edit={edit} className="mt-3" style={{ maxWidth: 320 }}>
            <SceneGraphLayer graph={scene.graph} progress={edit.onSelect ? (time - 2) / Math.max(1, scene.duration - 3) : 1} />
          </Part>
        )}
        {safety && (
          <Part id={id("safety")} edit={edit} className="mt-3">
            <p style={{ color: "rgba(255,255,255,.92)", fontSize: portrait ? 15 : 14, lineHeight: 1.5, margin: 0 }}>{scene.narration}</p>
          </Part>
        )}
      </div>

      {!safety && shot && (
        <div className="absolute inset-x-0 flex justify-center" style={{ bottom: portrait ? 120 : 62, padding: "0 24px" }}>
          <Words
            id={id("caption")}
            edit={edit}
            text={shot.narrationFragment || scene.narration}
            style={{ color: "#fff", background: "rgba(0,0,0,.55)", borderRadius: 8, padding: "5px 10px", fontSize: 15, fontWeight: 600, lineHeight: 1.35, textAlign: "center", maxWidth: "100%" }}
          />
        </div>
      )}

      {hasClaim && !safety && (
        <Part id={id("claim")} edit={edit} className="absolute" style={{ left: 18, bottom: portrait ? 84 : 22 }}>
          <span style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#86efac", background: "rgba(2,44,34,.85)", border: "1px solid rgba(52,211,153,.4)", borderRadius: 6, padding: "2px 7px" }}>
            {scene.claim}
          </span>
        </Part>
      )}
    </div>
  );
}

/* ── The image ad ── */

export interface StillCopy {
  headline: string;
  support?: string;
  riskLine?: string;
  number?: string;
  packshot: boolean;
}

export interface Palette {
  primary: string;
  callout: string;
}

/**
 * The image ad in one of its sizes. The feed and story sizes follow the
 * template's composition; the banners have their own, because a 728×90 strip
 * cannot hold what a 4:5 post does, but they keep its words and its colour.
 */
export function AdStill({
  size,
  layout,
  copy,
  palette,
  brandName,
  adType,
  prefix = "image",
  edit = {},
}: {
  size: StillSize;
  layout: AdTemplateLayout;
  copy: StillCopy;
  palette: Palette;
  brandName: string;
  adType: AdType;
  prefix?: string;
  edit?: FrameEditing;
}) {
  const { w, h } = STILL_SIZE[size];
  const id = (part: string) => `${prefix}.${part}`;
  const branded = adType !== "unbranded";
  const pack = copy.packshot && branded;
  const dark = layout === "headline";
  const ink = dark ? "#fff" : "#0a0d14";

  const logo = branded ? (
    <Part id={id("logo")} edit={edit}>
      <span style={{ display: "inline-block", fontSize: 12, fontWeight: 900, color: dark ? palette.primary : "#fff", background: dark ? "#fff" : palette.primary, borderRadius: 7, padding: "3px 8px" }}>
        {brandName}
      </span>
    </Part>
  ) : null;
  const safety = copy.riskLine ? (
    <Part id={id("safety")} edit={edit} className="shrink-0">
      <div style={{ fontSize: 10, lineHeight: 1.35, color: "#3c414d", background: "rgba(255,255,255,.96)", padding: "6px 10px" }}>{copy.riskLine}</div>
    </Part>
  ) : null;
  const packshot = (box: number) =>
    pack ? (
      <Part id={id("packshot")} edit={edit} className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PACKSHOT} alt="" style={{ width: box, height: box, objectFit: "cover", borderRadius: 6, border: "2px solid rgba(255,255,255,.7)" }} />
      </Part>
    ) : null;
  const picture = (style: CSSProperties, className?: string) => (
    <Part id={id("picture")} edit={edit} className={cn("overflow-hidden", className)} style={style}>
      <Picture src={FOOTAGE.people} />
    </Part>
  );
  const headline = (fontSize: number, extra?: CSSProperties) => (
    <Words id={id("headline")} edit={edit} text={copy.headline} style={{ color: ink, fontSize, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-.01em", ...extra }} />
  );
  const support = (fontSize: number, extra?: CSSProperties) =>
    copy.support && layout !== "minimal" ? (
      <Words id={id("support")} edit={edit} text={copy.support} style={{ color: dark ? "rgba(255,255,255,.85)" : "#3c414d", fontSize, lineHeight: 1.35, ...extra }} />
    ) : null;
  const stat = layout === "stat" && copy.number ? (
    <div style={{ color: palette.primary, fontSize: size === "300×250" ? 40 : 72, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-.03em" }}>{copy.number}</div>
  ) : null;

  const frame = (children: ReactNode, background = "#fff") => (
    <div className="relative flex flex-col overflow-hidden" style={{ width: w, height: h, background, fontFamily: FONT }}>
      {children}
    </div>
  );

  /* Strips: the words in a line, the safety information scrolling beside them. */
  if (size === "728×90" || size === "320×50") {
    const small = size === "320×50";
    return frame(
      <div className="flex h-full items-center" style={{ gap: small ? 8 : 14, padding: small ? "0 8px" : "0 12px 0 0" }}>
        {!small && picture({ width: 120, height: 90 })}
        <div className="min-w-0 flex-1">{headline(small ? 13 : 20, { lineHeight: 1.1 })}</div>
        {!small && logo}
        {copy.riskLine && (
          <Part id={id("safety")} edit={edit} className="shrink-0">
            <div style={{ width: small ? 52 : 190, height: small ? 34 : 70, overflow: "hidden", fontSize: small ? 8 : 9, lineHeight: 1.3, color: "#3c414d", borderLeft: "1px solid rgba(10,13,20,.14)", paddingLeft: 8 }}>
              {small ? "Safety info ▸" : copy.riskLine}
            </div>
          </Part>
        )}
      </div>,
      dark ? palette.primary : "#fff"
    );
  }

  /* Skyscrapers and the medium rectangle: stacked, safety panel at the foot. */
  if (size === "300×600" || size === "160×600" || size === "300×250") {
    const narrow = size === "160×600";
    const short = size === "300×250";
    return frame(
      <>
        {picture({ height: short ? 110 : narrow ? 200 : 260 }, "shrink-0")}
        <div className="flex min-h-0 flex-1 flex-col" style={{ gap: 8, padding: narrow ? 10 : 14 }}>
          {logo}
          {stat && !narrow ? <div style={{ transform: "scale(.6)", transformOrigin: "left top", height: short ? 26 : 46 }}>{stat}</div> : null}
          {headline(short ? 17 : narrow ? 17 : 24)}
          {!short && support(narrow ? 11 : 13)}
          <div className="flex-1" />
          {!short && <div className="flex justify-end">{packshot(narrow ? 44 : 60)}</div>}
        </div>
        {safety}
      </>,
      dark ? palette.primary : "#fff"
    );
  }

  /* Feed and story sizes, by template. */
  const tall = size === "9:16";
  const big = tall ? 36 : 32;
  const pad = 22;
  switch (layout) {
    case "photo":
      return frame(
        <>
          {picture({ position: "absolute", inset: 0 })}
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.05) 30%, rgba(0,0,0,.7) 100%)" }} />
          <div className="absolute" style={{ left: pad, top: pad }}>{logo}</div>
          <div className="relative mt-auto flex items-end" style={{ gap: 12, padding: `0 ${pad}px ${pad - 6}px` }}>
            <div className="min-w-0 flex-1 space-y-2">
              {headline(big, { color: "#fff" })}
              {support(14, { color: "rgba(255,255,255,.88)" })}
            </div>
            {packshot(72)}
          </div>
          <div className="relative">{safety}</div>
        </>,
        "#0f2d22"
      );
    case "stat":
    case "minimal":
    case "quote":
      return frame(
        <>
          <div className="flex items-center justify-between" style={{ padding: `${pad}px ${pad}px 0` }}>
            {logo}
            {layout === "minimal" && picture({ width: 110, height: 110, borderRadius: 10 })}
          </div>
          <div className="flex flex-col" style={{ gap: 10, padding: `${layout === "minimal" ? 40 : 18}px ${pad}px 12px` }}>
            {layout === "quote" && <div style={{ color: palette.primary, fontSize: 64, fontWeight: 900, lineHeight: 0.6 }}>&ldquo;</div>}
            {stat}
            {headline(layout === "stat" ? 24 : big)}
            {support(14)}
          </div>
          {layout !== "minimal" && (
            <div className="relative min-h-0 flex-1" style={{ margin: `0 ${pad}px 14px` }}>
              {picture({ position: "absolute", inset: 0, borderRadius: layout === "quote" ? 999 : 10 })}
              <div className="absolute" style={{ right: 10, bottom: 10 }}>{packshot(64)}</div>
            </div>
          )}
          {layout === "minimal" && <div className="flex-1" />}
          {layout === "minimal" && <div className="flex justify-end" style={{ padding: `0 ${pad}px 14px` }}>{packshot(56)}</div>}
          {safety}
        </>
      );
    case "product":
      return frame(
        <>
          <div className="flex flex-col" style={{ gap: 10, padding: pad }}>
            {logo}
            {headline(big - 4)}
            {support(14)}
          </div>
          <Part id={id("packshot")} edit={edit} className="grid min-h-0 flex-1 place-items-center" style={{ margin: `0 ${pad}px 14px`, background: palette.callout, borderRadius: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PACKSHOT} alt="" style={{ width: "55%", aspectRatio: "1", objectFit: "cover", borderRadius: 10 }} />
          </Part>
          {safety}
        </>
      );
    case "split":
      return frame(
        <>
          {picture({ height: tall ? "48%" : "46%" }, "shrink-0")}
          <div className="flex min-h-0 flex-1 flex-col" style={{ gap: 10, padding: pad }}>
            {logo}
            {headline(big - 4)}
            {support(14)}
            <div className="flex-1" />
            <div className="flex justify-end">{packshot(60)}</div>
          </div>
          {safety}
        </>
      );
    case "headline":
    default:
      return frame(
        <>
          <div className="flex min-h-0 flex-1 flex-col" style={{ gap: 14, padding: pad + 4 }}>
            {logo}
            <div className="flex-1" />
            {headline(big + 6)}
            {support(15)}
            <div className="flex items-end justify-between">
              {picture({ width: 120, height: 120, borderRadius: 999, border: "3px solid rgba(255,255,255,.4)" })}
              {packshot(64)}
            </div>
          </div>
          {safety}
        </>,
        palette.primary
      );
  }
}

/* ── The carousel card ── */

const CARD_FOOTAGE: Record<CarouselCard["role"], string> = {
  Hook: FOOTAGE.people,
  Proof: FOOTAGE.science,
  Ask: FOOTAGE.calm,
  Safety: FOOTAGE.calm,
};

/**
 * One card of the carousel. Every card carries the risk line; the last card
 * is the safety information itself, text only.
 */
export function AdCard({
  card,
  index,
  layout,
  palette,
  brandName,
  adType,
  riskLine,
  safetyText,
  number,
  edit = {},
}: {
  card: CarouselCard;
  index: number;
  layout: AdTemplateLayout;
  palette: Palette;
  brandName: string;
  adType: AdType;
  riskLine?: string;
  /** The full safety statement, for the last card. */
  safetyText: string;
  /** A result with a number, which number-led cards lead with. */
  number?: string;
  edit?: FrameEditing;
}) {
  const { w, h } = CARD_SIZE;
  const id = (part: string) => `card:${index}.${part}`;
  const branded = adType !== "unbranded";
  const band = riskLine ? (
    <Part id={id("safety")} edit={edit} className="shrink-0">
      <div style={{ fontSize: 10, lineHeight: 1.35, color: "#3c414d", background: "rgba(255,255,255,.96)", padding: "6px 10px" }}>See Important Safety Information</div>
    </Part>
  ) : null;
  const tag = (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,.28)", borderRadius: 999, padding: "3px 10px" }}>
      {index + 1} · {card.role}
    </span>
  );

  if (card.role === "Safety") {
    return (
      <div className="flex flex-col" style={{ width: w, height: h, background: "#f7f8f6", padding: 26, gap: 12, fontFamily: FONT }}>
        <Words id={id("title")} edit={edit} text={card.title} style={{ fontSize: 22, fontWeight: 900, color: "#0a0d14" }} />
        <Part id={id("safety")} edit={edit}>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "#3c414d", margin: 0 }}>{safetyText}</p>
        </Part>
      </div>
    );
  }

  const photo = layout === "photo";
  const solid = layout === "headline";
  const lead = layout === "stat" && card.role === "Proof" && number && card.title.includes(number);
  const titleText = lead ? card.title.replace(number, "").replace(/^\s+/, "") : card.title;
  const words = (
    <div className="space-y-2">
      {lead && <div style={{ color: photo || solid ? "#fff" : palette.primary, fontSize: 72, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-.03em" }}>{number}</div>}
      <Words id={id("title")} edit={edit} text={titleText} style={{ color: photo || solid ? "#fff" : "#0a0d14", fontSize: lead ? 22 : 28, fontWeight: 900, lineHeight: 1.1 }} />
      <Words id={id("body")} edit={edit} text={card.body} style={{ color: photo || solid ? "rgba(255,255,255,.8)" : "#6b7280", fontSize: 13 }} />
    </div>
  );
  const picture = (style: CSSProperties) => (
    <Part id={id("picture")} edit={edit} className="overflow-hidden" style={style}>
      <Picture src={CARD_FOOTAGE[card.role]} at={1 + index} />
    </Part>
  );

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ width: w, height: h, background: solid ? palette.primary : photo ? "#0f2d22" : "#fff", fontFamily: FONT }}>
      {photo ? (
        <>
          {picture({ position: "absolute", inset: 0 })}
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.1) 20%, rgba(0,0,0,.75) 100%)" }} />
          <div className="relative" style={{ padding: 18 }}>{tag}</div>
          <div className="relative mt-auto" style={{ padding: "0 22px 16px" }}>{words}</div>
        </>
      ) : solid ? (
        <>
          <div style={{ padding: 18 }}>{tag}</div>
          <div className="mt-auto" style={{ padding: "0 24px 18px" }}>{words}</div>
        </>
      ) : (
        <>
          {picture({ height: lead ? "34%" : "52%", flexShrink: 0 })}
          <div className="absolute" style={{ left: 16, top: 16 }}>{tag}</div>
          <div className="flex min-h-0 flex-1 flex-col justify-center" style={{ padding: "14px 22px" }}>{words}</div>
        </>
      )}
      {branded && card.role === "Ask" && (
        <Part id={id("logo")} edit={edit} className="absolute" style={{ right: 18, top: 18 }}>
          <span style={{ display: "block", fontSize: 12, fontWeight: 900, background: "#fff", color: palette.primary, borderRadius: 7, padding: "3px 8px" }}>{brandName}</span>
        </Part>
      )}
      <div className="relative">{band}</div>
    </div>
  );
}

/* ── The document page ── */

const PAGE_FOOTAGE: Partial<Record<DocPage["role"], string>> = {
  Cover: FOOTAGE.people,
  Context: FOOTAGE.calm,
  Evidence: FOOTAGE.science,
};

/**
 * One page of the document ad, at 4:5. The cover and the evidence pages carry
 * a picture; the ask closes on the brand; safety and references are text
 * only. A product claim document keeps its risk line on every page but the
 * safety page itself.
 */
export function AdDocPage({
  page,
  index,
  total,
  palette,
  brandName,
  adType,
  riskLine,
  edit = {},
}: {
  page: DocPage;
  index: number;
  total: number;
  palette: Palette;
  brandName: string;
  adType: AdType;
  riskLine?: string;
  edit?: FrameEditing;
}) {
  const { w, h } = DOC_SIZE;
  const id = (part: string) => `page:${index}.${part}`;
  const branded = adType !== "unbranded";
  const folio = (
    <div className="flex items-center justify-between" style={{ fontSize: 10, fontWeight: 700, color: "#8a909c", padding: "10px 22px" }}>
      <span>{branded ? brandName : "Talk to your doctor"}</span>
      <span>
        {index + 1} / {total}
      </span>
    </div>
  );
  const band =
    riskLine && page.role !== "Safety" && page.role !== "References" ? (
      <Part id={id("safety")} edit={edit} className="shrink-0">
        <div style={{ fontSize: 10, lineHeight: 1.35, color: "#3c414d", background: "#f1f3f0", padding: "6px 22px" }}>See Important Safety Information on page {total - 1}</div>
      </Part>
    ) : null;

  if (page.role === "Safety" || page.role === "References") {
    return (
      <div className="flex flex-col" style={{ width: w, height: h, background: "#fff", fontFamily: FONT }}>
        <div className="flex min-h-0 flex-1 flex-col" style={{ padding: "26px 26px 0", gap: 12 }}>
          <Words id={id("title")} edit={edit} text={page.title} style={{ fontSize: 20, fontWeight: 900, color: "#0a0d14" }} />
          <Words id={id("body")} edit={edit} text={page.body} style={{ fontSize: page.role === "Safety" ? 12.5 : 11, lineHeight: 1.6, color: "#3c414d" }} />
        </div>
        {folio}
      </div>
    );
  }

  if (page.role === "Cover") {
    return (
      <div className="relative flex flex-col overflow-hidden" style={{ width: w, height: h, background: "#0f2d22", fontFamily: FONT }}>
        <Part id={id("picture")} edit={edit} className="absolute inset-0 overflow-hidden">
          <Picture src={PAGE_FOOTAGE.Cover!} at={1.2} />
        </Part>
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.05) 30%, rgba(0,0,0,.8) 100%)" }} />
        {branded && (
          <Part id={id("logo")} edit={edit} className="absolute" style={{ left: 22, top: 22 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 900, background: "#fff", color: palette.primary, borderRadius: 7, padding: "4px 9px" }}>{brandName}</span>
          </Part>
        )}
        <div className="relative mt-auto space-y-2" style={{ padding: "0 26px 20px" }}>
          <Words id={id("title")} edit={edit} text={page.title} style={{ color: "#fff", fontSize: 30, fontWeight: 900, lineHeight: 1.08 }} />
          <Words id={id("body")} edit={edit} text={page.body} style={{ color: "rgba(255,255,255,.82)", fontSize: 14 }} />
        </div>
        <div className="relative">{band}</div>
      </div>
    );
  }

  const ask = page.role === "Ask";
  const footage = PAGE_FOOTAGE[page.role];
  return (
    <div className="relative flex flex-col overflow-hidden" style={{ width: w, height: h, background: ask ? palette.primary : "#fff", fontFamily: FONT }}>
      {footage && (
        <Part id={id("picture")} edit={edit} className="shrink-0 overflow-hidden" style={{ height: "42%" }}>
          <Picture src={footage} at={1 + index} />
        </Part>
      )}
      <div className={cn("flex min-h-0 flex-1 flex-col space-y-2", ask ? "justify-end" : "justify-center")} style={{ padding: "18px 26px" }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: ask ? "rgba(255,255,255,.7)" : palette.primary }}>{page.role}</span>
        <Words id={id("title")} edit={edit} text={page.title} style={{ color: ask ? "#fff" : "#0a0d14", fontSize: ask ? 28 : 22, fontWeight: 900, lineHeight: 1.12 }} />
        <Words id={id("body")} edit={edit} text={page.body} style={{ color: ask ? "rgba(255,255,255,.82)" : "#6b7280", fontSize: 13, lineHeight: 1.45 }} />
      </div>
      {ask && branded && (
        <Part id={id("logo")} edit={edit} className="absolute" style={{ right: 22, top: 22 }}>
          <span style={{ display: "block", fontSize: 12, fontWeight: 900, background: "#fff", color: palette.primary, borderRadius: 7, padding: "3px 8px" }}>{brandName}</span>
        </Part>
      )}
      {!ask && folio}
      {band}
    </div>
  );
}

