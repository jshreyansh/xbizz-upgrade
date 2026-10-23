"use client";

import type { ReactNode } from "react";
import { Check, Network, Stethoscope, Tv } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Audience } from "@/types/content";
import { AD_ACCOUNTS, AD_FORMATS, AD_PLACEMENTS, type AdAccount, type AdPlacement } from "@/features/workspace/ad-options";
import { GoogleAdsLogo, MetaLogo, TikTokLogo } from "@/features/workspace/platform-logos";

/**
 * Where the ads run, as tiles you recognise before you read them.
 *
 * Grouped by the account each placement is bought through, under that
 * platform's own mark. Each tile shows the shapes it will make, as small
 * frames, and what goes in them, as format chips — the specs are there for
 * whoever wants them, not the thing you have to read to choose.
 */

const ACCOUNT_MARK: Record<AdAccount, ReactNode> = {
  "Google Ads": <GoogleAdsLogo size={18} />,
  "Meta Ads": <MetaLogo size={18} />,
  "TikTok Ads": <TikTokLogo size={17} />,
  Programmatic: <Network className="size-4 text-accent-violet" />,
  "HCP networks": <Stethoscope className="size-4 text-accent-blue" />,
};

/* The frames each placement produces: w×h ratios, and whether they move. */
type Frame = { w: number; h: number; video?: boolean };
const FRAMES: Record<AdPlacement, Frame[]> = {
  youtube: [{ w: 16, h: 9, video: true }, { w: 9, h: 16, video: true }],
  "google-display": [{ w: 6, h: 5 }, { w: 16, h: 2 }, { w: 3, h: 7 }],
  "meta-feed": [{ w: 1, h: 1, video: true }, { w: 4, h: 5 }],
  "meta-reels-stories": [{ w: 9, h: 16, video: true }],
  "programmatic-display": [{ w: 6, h: 5 }, { w: 16, h: 2 }],
  "programmatic-video": [{ w: 16, h: 9, video: true }],
  ctv: [{ w: 16, h: 9, video: true }],
  "hcp-networks": [{ w: 1, h: 1, video: true }, { w: 6, h: 5 }],
  tiktok: [{ w: 9, h: 16, video: true }],
};

/* Consumer platforms reach doctors only through a matched list, never by targeting "doctors". */
const HCP_VIA: Partial<Record<AdPlacement, string>> = {
  youtube: "HCPs via an NPI-matched audience",
  "google-display": "HCPs via an NPI-matched audience",
  "meta-feed": "HCPs via an NPI-matched audience",
  "meta-reels-stories": "HCPs via an NPI-matched audience",
  tiktok: "HCPs via an NPI-matched audience",
};

function Frames({ frames, on }: { frames: Frame[]; on: boolean }) {
  const box = 34;
  return (
    <span className={cn("flex h-12 w-[76px] shrink-0 items-center justify-center gap-1.5 rounded-chip px-2", on ? "bg-card" : "bg-subtle")}>
      {frames.map((f, i) => {
        const scale = box / Math.max(f.w, f.h);
        return (
          <span
            key={i}
            className={cn("relative grid shrink-0 place-items-center rounded-[3px] border-[1.5px]", on ? "border-brand bg-tint" : "border-ink-4/50 bg-card")}
            style={{ width: Math.max(6, f.w * scale * 0.9), height: Math.max(6, f.h * scale * 0.9) }}
          >
            {f.video && (
              <span
                aria-hidden
                className={cn("block size-0 border-y-[4px] border-l-[6px] border-y-transparent", on ? "border-l-brand" : "border-l-ink-3")}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}

export function PlacementPicker({
  audience,
  selected,
  onToggle,
}: {
  audience: Audience;
  selected: AdPlacement[];
  onToggle: (id: AdPlacement) => void;
}) {
  return (
    <div className="space-y-4">
      {AD_ACCOUNTS.map((account) => {
        const rows = AD_PLACEMENTS.filter((p) => p.account === account.id && p.audiences.includes(audience));
        if (rows.length === 0) return null;
        return (
          <div key={account.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-chip border border-hair bg-card shadow-2xs">{ACCOUNT_MARK[account.id]}</span>
              <span className="text-body font-extrabold text-ink">{account.id}</span>
              {account.detail && <span className="text-caption text-ink-4">{account.detail}</span>}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {rows.map((placement) => {
                const on = selected.includes(placement.id);
                const via = audience === "HCP" ? HCP_VIA[placement.id] : undefined;
                return (
                  <button
                    key={placement.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggle(placement.id)}
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-3 rounded-control border p-2.5 pr-3 text-left transition-all duration-150",
                      on ? "border-brand bg-tint shadow-2xs ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3 hover:shadow-2xs"
                    )}
                  >
                    <Frames frames={FRAMES[placement.id]} on={on} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-body font-bold text-ink">{placement.label}</span>
                        {placement.id === "ctv" && <Tv className="size-3.5 shrink-0 text-ink-4" />}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1">
                        {placement.makes.map((f) => {
                          const format = AD_FORMATS.find((o) => o.id === f);
                          if (!format) return null;
                          const Icon = format.icon;
                          return (
                            <span
                              key={f}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-chip px-1.5 py-0.5 text-micro font-bold",
                                on ? "bg-card text-brand-deep" : "bg-subtle text-ink-3"
                              )}
                            >
                              <Icon className="size-3" />
                              {format.label}
                            </span>
                          );
                        })}
                      </span>
                      <span className="mt-1 block truncate text-caption text-ink-4" title={placement.sizes}>
                        {via ?? placement.sizes}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center self-start rounded-full border transition-colors",
                        on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card"
                      )}
                    >
                      {on && <Check className="size-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
