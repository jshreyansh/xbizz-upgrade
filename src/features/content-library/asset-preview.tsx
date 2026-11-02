"use client";

import { cn } from "@/lib/cn";
import { AssetVideo } from "@/features/workspace/asset-video";
import type { LibraryAsset } from "@/features/content-library/content-library-data";

export const STATUS_STYLE: Record<LibraryAsset["status"], { bg: string; fg: string; line: string }> = {
  Draft: { bg: "var(--color-subtle)", fg: "var(--ink-3)", line: "var(--hair-2)" },
  Published: { bg: "var(--ok-bg)", fg: "var(--ok)", line: "var(--ok-line)" },
  Approved: { bg: "var(--tint-2)", fg: "var(--brand-deep)", line: "var(--tint-line)" },
  "In MLR review": { bg: "#fff4e5", fg: "#b45309", line: "#fcd9a4" },
  "Changes requested": { bg: "var(--warn-bg)", fg: "var(--warn)", line: "var(--warn-line)" },
};

export function StatusChip({ status }: { status: LibraryAsset["status"] }) {
  const tone = STATUS_STYLE[status];
  return (
    <span className="rounded-chip px-2 py-0.5 text-caption font-bold" style={{ background: tone.bg, color: tone.fg, border: `1px solid ${tone.line}` }}>
      {status}
    </span>
  );
}

/**
 * The asset itself, not a coloured rectangle standing in for it. A film plays
 * its own reel and a deck shows the figure it leads on — the only thing that
 * tells two of these apart at a glance. Wherever a library asset is picked,
 * it looks the way it does on the shelf.
 */
export function AssetPreview({ asset, className }: { asset: Pick<LibraryAsset, "gradient" | "videoSrc" | "badge" | "metric" | "metricLabel">; className?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)} style={{ background: asset.gradient }}>
      {asset.videoSrc && <AssetVideo src={asset.videoSrc} />}
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{ width: "70%", height: "70%", right: "-10%", top: "-10%", background: "radial-gradient(circle,rgba(255,255,255,.22),transparent 70%)" }}
      />
      {!asset.videoSrc && asset.metric && (
        <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end p-3.5">
          <span className="text-micro font-extrabold uppercase tracking-[.06em] text-white/60">{asset.badge}</span>
          <span className="mt-0.5 text-subhead font-black leading-tight tracking-tight text-white">{asset.metric}</span>
          <span className="mt-0.5 text-caption text-white/65">{asset.metricLabel}</span>
        </div>
      )}
    </div>
  );
}
