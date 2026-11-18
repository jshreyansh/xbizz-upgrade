"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import {
  AD_PLACEMENTS,
  BANNER_CREDITS,
  BANNER_SIZES,
  bannerOf,
  bannerSizesFor,
  type AdPlacement,
  type BannerMotion,
  type BannerSize,
} from "@/features/workspace/ad-options";

/**
 * The campaign's banner sizes, chosen in the production
 * plan beside what they cost, not in the project pop-up.
 *
 * Each size is drawn to its real shape with a rough layout inside (logo,
 * headline, button, safety band), so a 728×90 and a 300×600 read as the
 * different ads they are, not as two ratios. The five every media plan asks
 * for start ticked; the rest wait behind "More". Motion is one choice for the
 * set, since the set is designed together.
 */

const MOTIONS: Array<{ id: BannerMotion; label: string; note: string }> = [
  { id: "animated", label: "Animated", note: "HTML5, safety information scrolls inside the banner, motion stops by 30 sec" },
  { id: "static", label: "Static", note: "Image banners, safety information in a fixed band" },
];

/* A rough banner at the size's real proportions: wide ones run in a line, the rest stack with the safety band at the foot. */
function BannerMock({ size, on }: { size: BannerSize; on: boolean }) {
  const boxW = 88;
  const boxH = 60;
  const scale = Math.min(boxW / size.w, boxH / size.h);
  const w = Math.max(6, size.w * scale);
  const h = Math.max(6, size.h * scale);
  const wide = size.w / size.h >= 3;
  const ink = on ? "bg-brand" : "bg-ink-4";
  return (
    <span
      aria-hidden
      className={cn("flex overflow-hidden rounded-[2px] border", on ? "border-brand/60 bg-card" : "border-hair-3 bg-card")}
      style={{ width: w, height: h }}
    >
      {wide ? (
        <span className="flex w-full items-center gap-[3px] px-[3px]">
          <span className={cn("aspect-square h-1/2 shrink-0 rounded-[1px]", ink)} />
          <span className="h-[2px] flex-1 rounded-full bg-ink-4/60" />
          <span className={cn("h-1/2 w-1/6 shrink-0 rounded-full", ink)} />
        </span>
      ) : (
        <span className="flex w-full flex-col gap-[2px] p-[3px]">
          <span className={cn("size-[5px] shrink-0 rounded-[1px]", ink)} />
          <span className="h-[2px] w-4/5 shrink-0 rounded-full bg-ink-4/70" />
          <span className="h-[2px] w-3/5 shrink-0 rounded-full bg-ink-4/50" />
          <span className="flex-1" />
          <span className={cn("h-[4px] w-1/2 shrink-0 rounded-full", ink)} />
          {h >= 24 && <span className="-mx-[3px] -mb-[3px] mt-[1px] h-[18%] min-h-[4px] shrink-0 bg-subtle" />}
        </span>
      )}
    </span>
  );
}

const placementWords = (id: AdPlacement) => {
  const p = AD_PLACEMENTS.find((x) => x.id === id);
  return p ? `${p.account.replace(/ Ads$/, "")} ${p.label}` : id;
};
const listWords = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

/**
 * The campaign's banners: one set, used on every display placement, the
 * way a media plan traffics one set to several places. A size one of them
 * can't take is still made for the others, and says so. "Use different
 * sizes" splits it into a set per placement for the rare plan that needs it.
 */
export function BannerSet({ placements }: { placements: AdPlacement[] }) {
  const banners = useWorkspaceStore((s) => s.adBanners);
  const setBanners = useWorkspaceStore((s) => s.setAdBanners);
  const same = (a: AdPlacement, b: AdPlacement) => {
    const x = bannerOf(a, banners);
    const y = bannerOf(b, banners);
    return x.motion === y.motion && x.sizes.length === y.sizes.length && x.sizes.every((id) => y.sizes.includes(id));
  };
  const [split, setSplit] = useState(() => placements.some((p) => !same(p, placements[0])));
  const differs = placements.some((p) => !same(p, placements[0]));
  /* One set means one set: a placement added later takes the set as it stands. */
  useEffect(() => {
    if (split || !differs) return;
    const first = bannerOf(placements[0], banners);
    setBanners({ ...banners, ...Object.fromEntries(placements.map((p) => [p, first])) });
  }, [split, differs, placements, banners, setBanners]);
  if (placements.length === 0) return null;
  const several = placements.length > 1;

  const join = () => {
    const first = bannerOf(placements[0], banners);
    setBanners({ ...banners, ...Object.fromEntries(placements.map((p) => [p, first])) });
    setSplit(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-label font-extrabold text-ink">Banner Set</span>
        <span className="min-w-0 flex-1 text-caption text-ink-4">
          {split ? "A set for each placement" : `Used on ${listWords(placements.map(placementWords))}`}
        </span>
        {several && (
          <button
            type="button"
            onClick={() => (split ? join() : setSplit(true))}
            className="cursor-pointer text-caption font-bold text-brand hover:text-brand-deep"
          >
            {split ? "Use One Set for All" : "Use Different Sizes for Each Placement"}
          </button>
        )}
      </div>
      {split ? (
        placements.map((p) => <BannerSizes key={p} placements={[p]} title={placementWords(p)} />)
      ) : (
        <BannerSizes placements={placements} showCredits />
      )}
    </div>
  );
}

/** The size tiles and motion switch for one or more placements that share them. */
function BannerSizes({ placements, title, showCredits }: { placements: AdPlacement[]; title?: string; showCredits?: boolean }) {
  const banners = useWorkspaceStore((s) => s.adBanners);
  const setBanners = useWorkspaceStore((s) => s.setAdBanners);
  const { sizes, motion } = bannerOf(placements[0], banners);
  /* Every size at least one of these placements takes. */
  const all = BANNER_SIZES.filter((b) => placements.some((p) => bannerSizesFor(p).includes(b)));
  const extra = all.filter((s) => !s.standard);
  const [open, setOpen] = useState(() => extra.some((s) => sizes.includes(s.id)));
  const shown = open ? all : all.filter((s) => s.standard);
  const chosen = all.filter((s) => sizes.includes(s.id)).length;
  const save = (next: { sizes: string[]; motion: BannerMotion }) =>
    setBanners({ ...banners, ...Object.fromEntries(placements.map((p) => [p, next])) });
  const toggle = (id: string) => {
    const next = sizes.includes(id) ? sizes.filter((s) => s !== id) : [...sizes, id];
    if (next.length) save({ sizes: next, motion });
  };
  /* The placements that can't run a size, named on its tile. */
  const notOn = (size: BannerSize) => placements.filter((p) => size.notOn?.includes(p)).map(placementWords);

  return (
    <div className="rounded-control border border-hair bg-card p-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="min-w-0 flex-1 text-caption text-ink-4">
          <b className="font-bold text-ink-2">
            {title && <>{title} · </>}
            {chosen} {chosen === 1 ? "size" : "sizes"}
            {showCredits && <> · {(chosen * BANNER_CREDITS).toLocaleString()} credits</>}
          </b>{" "}
          · {MOTIONS.find((m) => m.id === motion)?.note}
        </span>
        <Segmented aria-label="Motion">
          {MOTIONS.map((m) => (
            <SegmentedButton key={m.id} active={motion === m.id} onClick={() => save({ sizes, motion: m.id })} className="px-2.5 py-1 text-caption">
              {m.label}
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {shown.map((size) => {
          const on = sizes.includes(size.id);
          const last = on && sizes.length === 1;
          const staticOnly = !size.animates && motion === "animated";
          const missing = notOn(size);
          return (
            <button
              key={size.id}
              type="button"
              aria-pressed={on}
              disabled={last}
              title={`${size.name} · ${size.w} × ${size.h} · ${size.ratio} · ${size.device}${staticOnly ? " · made static, too small to animate" : ""}${missing.length ? ` · not on ${listWords(missing)}` : ""}${last ? " · keep at least one size" : ""}`}
              onClick={() => toggle(size.id)}
              className={cn(
                "focus-ring relative flex w-[104px] cursor-pointer flex-col items-center gap-1 rounded-control border px-1.5 pb-1.5 pt-2 text-center transition-colors disabled:cursor-default",
                on ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-hair-3"
              )}
            >
              <span className="grid h-[60px] w-full place-items-center">
                <BannerMock size={size} on={on} />
              </span>
              <span className="w-full truncate text-caption font-bold leading-tight text-ink">{size.name}</span>
              <span className="text-micro font-semibold tabular-nums leading-tight text-ink-3">
                {size.w} × {size.h} · {size.ratio}
              </span>
              {staticOnly && <span className="text-micro font-bold leading-tight text-ink-4">Static Only</span>}
              {missing.length > 0 && <span className="w-full truncate text-micro font-bold leading-tight text-ink-4">Not on {missing.join(", ")}</span>}
              <span
                className={cn(
                  "absolute right-1 top-1 grid size-4 place-items-center rounded-full border transition-colors",
                  on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card"
                )}
              >
                {on && <Check className="size-2.5 stroke-[3]" />}
              </span>
            </button>
          );
        })}
        {extra.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="focus-ring flex w-[104px] cursor-pointer flex-col items-center justify-center gap-1 rounded-control border border-dashed border-hair-3 text-caption font-bold text-brand hover:border-brand hover:text-brand-deep"
          >
            {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
            {open ? "Fewer Sizes" : `${extra.length} More Sizes`}
          </button>
        )}
      </div>
    </div>
  );
}
