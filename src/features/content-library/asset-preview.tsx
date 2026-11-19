"use client";

import { cn } from "@/lib/cn";
import { Chip, type ChipProps } from "@/components/ui/chip";
import { AssetVideo } from "@/features/workspace/asset-video";
import type { LibraryAsset } from "@/features/content-library/content-library-data";

/* The library's status tags on the shared Chip tones. "In MLR review" keeps
   its amber ink so it still reads apart from "Changes requested". */
const STATUS_CHIP: Record<LibraryAsset["status"], { tone: ChipProps["tone"]; className?: string }> = {
  Draft: { tone: "neutral", className: "border-hair-2" },
  Published: { tone: "ok" },
  Approved: { tone: "brand", className: "bg-tint-2" },
  "In MLR review": { tone: "warn", className: "text-accent-amber" },
  "Changes requested": { tone: "warn" },
};

export function StatusChip({ status }: { status: LibraryAsset["status"] }) {
  const { tone, className } = STATUS_CHIP[status];
  return (
    <Chip tone={tone} weight="bold" className={className}>
      {status}
    </Chip>
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
