"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Columns2,
  Rows2,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import type { Scene, SceneCitation, Shot } from "@/types/content";
import { splitSegments } from "@/features/workspace/script-claims";
import { CitationPill } from "@/features/workspace/script-scene-card";
import { DynamicSceneComposition } from "@/features/workspace/video-composition";
import type { ShotPreviews } from "@/features/workspace/use-shot-previews";

/**
 * The storyboard: every scene, shot by shot, before anything is rendered.
 *
 * It replaces the production plan's two-column table. The "Scene and style"
 * column described each scene in one sentence; the shot strip shows it, one
 * picture per shot, each with its visual story and the words it carries. The
 * marketer decides what the video looks like while it is still a set of
 * pictures, so the editor after it only has to turn them into motion.
 */

export type StoryboardLayout = "side" | "stacked";

/**
 * A scene's shots as the storyboard shows them. A scene that declares none
 * is one shot, carrying the whole scene — it still gets a picture, because
 * "no preview" would read as "nothing to see here".
 */
export function storyShots(scene: Scene): Shot[] {
  if (scene.shots && scene.shots.length > 0) return scene.shots;
  return [
    {
      id: `${scene.id}-whole`,
      index: 1,
      startAt: 0,
      endAt: scene.duration || 10,
      label: scene.title,
      transitionIn: "Cut",
      narrationFragment: scene.narration,
      visualStory: scene.visual,
    },
  ];
}

const norm = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * Which shots carry a stretch of narration. A line is split for its
 * citations and a scene is split into shots, and the two splits do not
 * line up one-to-one — "blocking the downstream signal that drives plaque
 * formation" is one sentence and two shots — so either containing the
 * other counts as a match.
 */
function shotsForSegment(segment: string, shots: Shot[]) {
  const seg = norm(segment);
  if (!seg) return [];
  return shots
    .filter((shot) => {
      const frag = norm(shot.narrationFragment || "");
      return frag && (seg.includes(frag) || frag.includes(seg));
    })
    .map((shot) => shot.id);
}

/* ─────────────────────────────── Summary row ─────────────────────────────── */

function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ok" | "live" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label font-bold",
        tone === "ok" && "border-ok-line bg-ok-bg text-ok",
        tone === "live" && "border-tint-line bg-tint text-brand-deep",
        tone === "neutral" && "border-hair-2 bg-card text-ink-2"
      )}
    >
      {children}
    </span>
  );
}

export function StoryboardSummary({
  sceneCount,
  previews,
  grounded,
  layout,
  onLayout,
}: {
  sceneCount: number;
  previews: ShotPreviews;
  grounded: boolean;
  layout: StoryboardLayout;
  onLayout: (layout: StoryboardLayout) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-4">
      <Pill>{sceneCount} scenes</Pill>
      <Pill>{previews.total} shots</Pill>
      {grounded && (
        <Pill tone="ok">
          <ShieldCheck className="size-3.5" />
          Claims grounded
        </Pill>
      )}
      {previews.drawingCount > 0 ? (
        <Pill tone="live">
          <span className="size-2.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Redrawing {previews.drawingCount} preview{previews.drawingCount === 1 ? "" : "s"}
        </Pill>
      ) : previews.allReady ? (
        <Pill tone="ok">
          <Check className="size-3.5" strokeWidth={3} />
          All {previews.total} previews ready
        </Pill>
      ) : (
        <Pill tone="live">
          <span className="size-2.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Drawing previews · {previews.readyCount} of {previews.total}
        </Pill>
      )}

      {/* The marketer's call, so it sits with the board it changes rather
          than in a settings menu: narration beside the shots, or above them. */}
      <Segmented role="group" aria-label="Scene layout" className="ml-auto bg-card">
        {([
          { id: "side" as const, label: "Side by side", icon: Columns2, hint: "Narration beside the shots" },
          { id: "stacked" as const, label: "Stacked", icon: Rows2, hint: "Narration above the shots" },
        ]).map((option) => (
          <SegmentedButton
            key={option.id}
            active={layout === option.id}
            title={option.hint}
            onClick={() => onLayout(option.id)}
            className={cn("px-2.5 py-1", layout === option.id && "bg-ink text-white shadow-none")}
          >
            <option.icon className="size-3.5" />
            {option.label}
          </SegmentedButton>
        ))}
      </Segmented>
    </div>
  );
}

/* ─────────────────────────────── Shot preview ────────────────────────────── */

/**
 * One shot, as a still from the composition engine itself.
 *
 * Drawn by the same renderer the editor and the published review use, at
 * the middle of the shot and with playback held — so the preview shows what
 * is on screen at that moment (the copy that is in, the clip that has scaled
 * up, the chart mid-wipe) and cannot disagree with what renders later. It is
 * laid out at full frame size and scaled down, rather than drawn small,
 * because the composition's type and spacing are set for a real frame.
 */
export function ShotPreview({
  scene,
  shot,
  portrait,
  brandName,
}: {
  scene: Scene;
  shot: Shot;
  portrait: boolean;
  brandName: string;
}) {
  return (
    <FramePreview
      scene={scene}
      portrait={portrait}
      brandName={brandName}
      sceneTime={(shot.startAt + shot.endAt) / 2}
    />
  );
}

/**
 * A scene frame as a true miniature: the composition laid out at full frame
 * size in the project's shape, then scaled to whatever box holds it. Used
 * for shot previews and for the editor's scene rail, so a small picture of
 * a portrait scene is a small portrait scene rather than a landscape one
 * squeezed into a tall box.
 */
export function FramePreview({
  scene,
  portrait,
  brandName,
  sceneTime,
}: {
  scene: Scene;
  portrait: boolean;
  brandName: string;
  /** A moment in the scene. Without one, every element is shown. */
  sceneTime?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const width = portrait ? 360 : 640;
  const height = portrait ? 640 : 360;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setScale(node.clientWidth / width));
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 origin-top-left transition-opacity duration-500"
        style={{ width, height, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}
      >
        <DynamicSceneComposition scene={scene} brandName={brandName} isPlaying={false} sceneTime={sceneTime} />
      </div>
    </div>
  );
}

/* ──────────────────────────────── Shot card ──────────────────────────────── */

function ShotCard({
  scene,
  shot,
  number,
  portrait,
  layout,
  brandName,
  previews,
  selected,
  lit,
  onToggle,
  onHover,
}: {
  scene: Scene;
  shot: Shot;
  number: number;
  portrait: boolean;
  layout: StoryboardLayout;
  brandName: string;
  previews: ShotPreviews;
  selected: boolean;
  lit: boolean;
  onToggle: () => void;
  onHover: (id: string | null) => void;
}) {
  const status = previews.statusOf(shot.id);
  /* Portrait beside the narration turns the card sideways: a tall card there
     makes every tile twice the height of the text next to it. Stacked has
     the whole width, so the card stays the shape of the phone it plays on. */
  const sideways = portrait && layout === "side";

  return (
    <div
      role="button"
      tabIndex={0}
      data-shot={shot.id}
      aria-pressed={selected}
      aria-label={`Shot ${number} preview, ${shot.label}`}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onToggle(); }
      }}
      onMouseEnter={() => onHover(shot.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "focus-ring flex shrink-0 snap-start cursor-pointer overflow-hidden rounded-control border bg-card text-left transition-all duration-200",
        sideways ? "w-80 flex-row" : portrait ? "w-46 flex-col" : "w-62 flex-col",
        selected
          ? "border-brand shadow-soft ring-2 ring-brand"
          : lit
          ? "-translate-y-0.5 border-brand/45 shadow-soft"
          : "border-hair-2 hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-soft"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-[#0d1411]",
          portrait ? "aspect-[9/16]" : "aspect-video",
          sideways ? "w-28" : "w-full"
        )}
      >
        {status === "ready" ? (
          <ShotPreview
            key={previews.versionOf(shot.id)}
            scene={scene}
            shot={shot}
            portrait={portrait}
            brandName={brandName}
          />
        ) : (
          <div className="shimmer absolute inset-0 grid place-items-center bg-[#1a2620]">
            {previews.versionOf(shot.id) > 0 || previews.isUpdated(shot.id) ? (
              <span className="text-caption font-bold text-white/75">Redrawing…</span>
            ) : null}
          </div>
        )}
        <span
          className={cn(
            "absolute left-2 top-2 z-10 rounded-full border border-white/15 bg-black/55 font-extrabold text-white backdrop-blur-sm",
            sideways ? "px-1.5 py-0.5 text-micro" : "px-2 py-0.5 text-caption"
          )}
        >
          Shot {number} preview
        </span>
        {status === "ready" && previews.isUpdated(shot.id) && (
          <span className="absolute bottom-2 left-2 z-10 rounded-full bg-ok px-2 py-0.5 text-caption font-extrabold text-white">
            Updated
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-3 pb-3 pt-2.5">
        <span className="text-body font-extrabold text-ink">{shot.label}</span>
        <p className={cn("text-body leading-snug text-ink-2", sideways ? "line-clamp-5" : portrait ? "line-clamp-4" : "line-clamp-3")}>
          {shot.visualStory}
        </p>
        <div className="mt-auto flex items-start gap-1.5 border-t border-hair pt-2 text-label leading-snug text-ink-3">
          {shot.narrationFragment?.trim() ? (
            <>
              <Volume2 className="mt-0.5 size-3 shrink-0 text-ink-4" />
              <span>“{shot.narrationFragment.trim()}”</span>
            </>
          ) : (
            <span className="text-ink-4">No narration. The frame holds.</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── Shot strip ─────────────────────────────── */

/**
 * The scene's shots, scrolled sideways. Arrows and edge fades appear only
 * when there is more to scroll to, so a two-shot scene shows no controls.
 */
function ShotStrip({
  children,
  focusId,
  layoutKey,
  arrowTop,
}: {
  children: ReactNode;
  /** Scrolled into view when set — the shot whose words are hovered. */
  focusId: string | null;
  /** Changes whenever card sizes change, so the edges are re-measured. */
  layoutKey: string;
  arrowTop: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () =>
      setEdges({
        /* Snapping parks the first card a few pixels in; anything under
           the strip's own padding is still the start. */
        left: node.scrollLeft > 8,
        right: node.scrollLeft + node.clientWidth < node.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener("scroll", update, { passive: true });
    const frame = requestAnimationFrame(update);
    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [layoutKey]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !focusId) return;
    const card = node.querySelector<HTMLElement>(`[data-shot="${focusId}"]`);
    if (card) node.scrollTo({ left: Math.max(0, card.offsetLeft - 8), behavior: "smooth" });
  }, [focusId]);

  const step = (dir: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("[data-shot]");
    node.scrollBy({ left: dir * 2 * ((card?.offsetWidth ?? 248) + 12), behavior: "smooth" });
  };

  const mask =
    edges.left && edges.right
      ? "linear-gradient(to right, transparent, #000 40px, #000 calc(100% - 56px), transparent)"
      : edges.right
      ? "linear-gradient(to right, #000 calc(100% - 56px), transparent)"
      : edges.left
      ? "linear-gradient(to right, transparent, #000 40px)"
      : undefined;

  return (
    <div className="relative min-w-0">
      <div
        ref={ref}
        className="relative flex snap-x snap-mandatory scroll-pl-1 gap-3 overflow-x-auto pb-2.5 pl-1 pr-4 pt-1 [scrollbar-width:thin]"
        style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
      >
        {children}
      </div>
      {edges.left && (
        <button
          type="button"
          aria-label="Earlier shots"
          onClick={(e) => { e.stopPropagation(); step(-1); }}
          className={cn("absolute left-1 z-20 grid size-9 cursor-pointer place-items-center rounded-full border border-hair-2 bg-card text-ink-2 shadow-soft transition hover:border-brand hover:text-brand-deep", arrowTop)}
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      {edges.right && (
        <button
          type="button"
          aria-label="Later shots"
          onClick={(e) => { e.stopPropagation(); step(1); }}
          className={cn("absolute right-2 z-20 grid size-9 cursor-pointer place-items-center rounded-full border border-hair-2 bg-card text-ink-2 shadow-soft transition hover:border-brand hover:text-brand-deep", arrowTop)}
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────── Scene tile ─────────────────────────────── */

export function StoryboardSceneTile({
  scene,
  brandName,
  portrait,
  layout,
  previews,
  selected,
  selectedShotId,
  pending,
  onToggleScene,
  onToggleShot,
  onCitationDetails,
}: {
  scene: Scene;
  brandName: string;
  portrait: boolean;
  layout: StoryboardLayout;
  previews: ShotPreviews;
  /** The scene is in the chat's scope on its own. */
  selected: boolean;
  /** A shot of this scene is in the chat's scope, which brings the scene. */
  selectedShotId: string | null;
  /** Being rewritten right now — the narration is withheld, not half-shown. */
  pending: boolean;
  onToggleScene: () => void;
  onToggleShot: (shot: Shot) => void;
  onCitationDetails?: (claimId: string) => void;
}) {
  const shots = storyShots(scene);
  const [lit, setLit] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const side = layout === "side";

  /* The same splitter the citations are anchored against, so a badge lands
     on the sentence it backs. */
  const segments = splitSegments(scene.narration);
  const citations = pending ? [] : scene.citations ?? [];
  const byAnchor = new Map<number, SceneCitation[]>();
  const unanchored: SceneCitation[] = [];
  for (const citation of citations) {
    const at = citation.anchor;
    if (at === undefined || at < 0 || at >= segments.length) unanchored.push(citation);
    else byAnchor.set(at, [...(byAnchor.get(at) ?? []), citation]);
  }
  const segmentShots = segments.map((segment) => shotsForSegment(segment, shots));

  const meta = (
    <div className={cn("flex items-center gap-2", side ? "pl-7" : "ml-auto shrink-0")}>
      <span className="rounded-glyph bg-black/5 px-2 py-0.5 text-caption font-bold text-ink-3">
        {scene.narrativeTag || "Evidence"}
      </span>
      <span className="text-label font-semibold text-ink-4">
        {shots.length} shot{shots.length === 1 ? "" : "s"}
      </span>
    </div>
  );

  return (
    <article
      className={cn(
        "grid rounded-card border transition-all duration-200",
        side ? "grid-cols-1 @3xl:grid-cols-[17rem_minmax(0,1fr)]" : "grid-cols-1",
        selected
          ? "border-transparent bg-tint-strong shadow-soft ring-2 ring-brand/45"
          : selectedShotId
          ? "border-transparent ring-[1.5px] ring-brand/35"
          : "border-hair hover:border-hair-2",
        !selected && (scene.number % 2 === 1 ? "bg-tint" : "bg-card")
      )}
    >
      {/* ── The scene and what it says ── */}
      <div
        onClick={onToggleScene}
        className={cn(
          "flex min-w-0 cursor-pointer flex-col gap-2.5 p-4.5",
          side ? "border-b border-hair @3xl:border-b-0 @3xl:border-r" : "border-b border-hair"
        )}
      >
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden
            className={cn(
              "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full border transition-all",
              selected ? "border-brand bg-brand text-white" : "border-hair-3 bg-card text-transparent"
            )}
          >
            <Check className="size-2.5" strokeWidth={3.5} />
          </span>
          <div className="min-w-0 leading-snug">
            <span className="mr-1.5 text-subhead font-[850] tracking-tight text-ink">Scene {scene.number}:</span>
            <span className="text-body-lg font-semibold text-ink-2">{scene.title}</span>
          </div>
          {!side && meta}
        </div>
        {side && meta}

        <div className={cn("flex items-center gap-1.5 pt-1 text-caption font-extrabold uppercase tracking-[.08em] text-ink-4", !side && "pl-7")}>
          <Volume2 className="size-3" />
          Narration
        </div>

        {pending ? (
          <div className={cn("space-y-2", !side && "pl-7")} aria-live="polite" aria-busy>
            <div className="shimmer h-4 w-full rounded-glyph bg-hair" />
            <div className="shimmer h-4 w-[82%] rounded-glyph bg-hair" />
            <span className="block pt-0.5 text-caption font-bold text-brand">Rewriting…</span>
          </div>
        ) : (
          <p className={cn("text-body-lg leading-relaxed text-ink", !side && "max-w-[78ch] pl-7")}>
            {segments.map((segment, i) => {
              const linked = segmentShots[i];
              const on = !!lit && linked.includes(lit);
              return (
                <span key={i}>
                  <span
                    onMouseEnter={() => {
                      if (linked.length === 0) return;
                      setLit(linked[0]);
                      setFocusId(linked[0]);
                    }}
                    onMouseLeave={() => setLit(null)}
                    className={cn("rounded-glyph transition-colors", on && "bg-tint-strong ring-2 ring-tint-strong")}
                  >
                    {segment}
                  </span>
                  {byAnchor.get(i) && <CitationPill citations={byAnchor.get(i)!} onDetails={onCitationDetails} />}
                </span>
              );
            })}
          </p>
        )}

        {!pending && unanchored.length > 0 && (
          <div className={cn("flex flex-wrap items-center gap-1.5", !side && "pl-7")}>
            <span className="text-caption text-ink-4">Sources</span>
            <CitationPill citations={unanchored} onDetails={onCitationDetails} />
          </div>
        )}

        <span className={cn("mt-auto inline-flex min-w-0 items-center gap-1.5 pt-1 text-caption text-ink-4", !side && "pl-7")}>
          <ShieldCheck className="size-3 shrink-0 text-ok" />
          <span className="truncate">{scene.claim}</span>
        </span>
      </div>

      {/* ── What it shows, shot by shot ── */}
      <div className="flex min-w-0 flex-col gap-2 py-3.5 pl-4">
        <div className="flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-[.08em] text-ink-4">
          <Clapperboard className="size-3" />
          Visual story
          <span className="font-semibold normal-case tracking-normal">· {shots.length} shot{shots.length === 1 ? "" : "s"}</span>
        </div>
        <ShotStrip
          focusId={focusId}
          layoutKey={`${layout}-${portrait}-${shots.length}`}
          arrowTop={portrait ? (side ? "top-20" : "top-36") : "top-13"}
        >
          {shots.map((shot, i) => (
            <ShotCard
              key={shot.id}
              scene={scene}
              shot={shot}
              number={i + 1}
              portrait={portrait}
              layout={layout}
              brandName={brandName}
              previews={previews}
              selected={selectedShotId === shot.id}
              lit={lit === shot.id}
              onToggle={() => onToggleShot(shot)}
              onHover={setLit}
            />
          ))}
        </ShotStrip>
      </div>
    </article>
  );
}
