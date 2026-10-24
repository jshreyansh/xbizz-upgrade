"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, LayoutTemplate, Upload } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { AssetStrip, MediaAssetTile, MediaAttachmentGrid, workspaceAssets, type WorkspaceAsset } from "@/features/workspace/workspace-assets";
import { Button } from "@/components/ui/button";
import { ActionBar } from "@/components/patterns/action-bar";
import { cn } from "@/lib/cn";
import { Toggle } from "@/features/settings/settings-parts";
import { useSettingsStore } from "@/features/settings/settings-store";
import type { AdType } from "@/features/workspace/ad-options";
import {
  CAROUSEL_TEMPLATES,
  IMAGE_TEMPLATES,
  rankTemplates,
  templateFit,
  type AdTemplate,
  type AdTemplateLayout,
} from "@/features/workspace/ad-templates";

/**
 * Choosing the templates for the still ads — the Ads version of the Docs
 * template step.
 *
 * Only what the campaign makes is asked: an image ad, a carousel, or both.
 * One image template covers every image size and banner, and the carousel
 * matches it unless you say otherwise, so most campaigns are one choice.
 * Each template is previewed with the campaign's own words in the real
 * shapes; the picture stays a placeholder, because this chooses the
 * composition, not the art. Above the templates, one choice decides whether
 * a template is needed at all: SwishX designs it fresh, it follows the user's
 * references, or a template is chosen. Only the last uses the grids below.
 */

/** How the still ads get their look: SwishX designs it, the user's references, or a template. */
export type LookMode = "fresh" | "references" | "template";

export interface AdReference {
  id: string;
  name: string;
  note?: string;
  previewUrl?: string;
}

interface Copy {
  headline: string;
  support?: string;
  riskLine?: string;
  number?: string;
  packshot: boolean;
}

export function AdsTemplateStep({
  brandName,
  adType,
  copy,
  hasImage,
  hasCarousel,
  imageShapes,
  hasBanners,
  references,
  onAddReference,
  onRemoveReference,
  onAddSuggested,
  adCount,
  credits,
  onContinue,
}: {
  brandName: string;
  adType: AdType;
  copy: Copy;
  hasImage: boolean;
  hasCarousel: boolean;
  imageShapes: string[];
  hasBanners: boolean;
  references: AdReference[];
  onAddReference: () => void;
  onRemoveReference: (id: string) => void;
  /** A reference the workspace already has, taken in from the suggestions. */
  onAddSuggested: (asset: WorkspaceAsset) => void;
  adCount: number;
  credits: number;
  onContinue: (choice: { mode: LookMode; image?: string; carousel?: string }) => void;
}) {
  const kitColors = useSettingsStore((s) => s.brandKit.colors);
  /* Unbranded ads can't look like the brand, so they get a neutral palette. */
  const palette = adType === "unbranded" ? { primary: "#3f4a5a", callout: "#eef1f4" } : { primary: kitColors.primary, callout: kitColors.callout };
  const hasReferences = references.length > 0;
  const ctx = { adType, hasNumber: !!copy.number, headline: copy.headline };

  const imageList = rankTemplates(IMAGE_TEMPLATES, { adType, hasReferences });
  const carouselList = rankTemplates(CAROUSEL_TEMPLATES, { adType, hasReferences });
  const firstFit = (list: AdTemplate[]) => list.find((t) => templateFit(t, ctx).ok)?.id ?? list[0].id;

  /* The look applies to every still: the image ad and the carousel alike. */
  const [mode, setMode] = useState<LookMode>(hasReferences ? "references" : "template");
  const [imageChoice, setImageChoice] = useState(firstFit(imageList));
  const [carouselChoice, setCarouselChoice] = useState(firstFit(carouselList));
  const [matches, setMatches] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const templatesOn = mode === "template";

  /* The carousel follows the image ad's family unless told otherwise. */
  const matchedCarousel = CAROUSEL_TEMPLATES.find((t) => t.layout === IMAGE_TEMPLATES.find((x) => x.id === imageChoice)?.layout)?.id ?? carouselList[0].id;
  const effectiveCarousel = hasImage && matches ? matchedCarousel : carouselChoice;
  const nameOf = (id: string, list: AdTemplate[]) => list.find((t) => t.id === id)?.name ?? "";

  const shownImages = showAll ? imageList : imageList.slice(0, 5);
  const sizes = [...imageShapes, ...(hasBanners ? ["the banner sizes"] : [])].join(", ");
  const blocked = mode === "references" && !hasReferences;

  const modes: Array<{ id: LookMode; title: string; blurb: string; icon: React.ReactNode }> = [
    { id: "fresh", title: "Let SwishX design it", blurb: "A fresh design from the brand kit and your key message.", icon: <LogoMark size={16} /> },
    {
      id: "references",
      title: "Follow my references",
      blurb: hasReferences ? `Composed after the ${references.length === 1 ? "reference" : `${references.length} references`} you added.` : "Add the look you're after; SwishX composes from it.",
      icon: <Upload className="size-4" />,
    },
    { id: "template", title: "Choose from templates", blurb: "Pick where the picture, words, packshot and safety sit.", icon: <LayoutTemplate className="size-4" /> },
  ];

  const description =
    mode === "fresh"
      ? "SwishX designs the still ads fresh"
      : mode === "references"
        ? hasReferences
          ? `Following ${references.length === 1 ? "your reference" : `your ${references.length} references`}`
          : "Add a reference to follow"
        : [hasImage ? `Image: ${nameOf(imageChoice, IMAGE_TEMPLATES)}` : null, hasCarousel ? `Carousel: ${nameOf(effectiveCarousel, CAROUSEL_TEMPLATES)}` : null].filter(Boolean).join(" · ");

  return (
    <>
      <div className="shrink-0">
        <h2 className="text-display font-[850] tracking-tight text-ink">Choose templates</h2>
        <p className="mt-0.5 text-body text-ink-3">How the image and carousel ads should look. Previews use your own words.</p>
      </div>

      {/* How the look is decided, for every still ad. */}
      <section className="space-y-3 rounded-card border border-hair bg-card p-4">
        <div className="grid gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="How the still ads should look">
          {modes.map((m) => {
            const on = mode === m.id;
            /* SwishX's own design isn't ready yet: shown, so it's known to be coming, but not choosable. */
            const soon = m.id === "fresh";
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-disabled={soon}
                disabled={soon}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-start gap-3 rounded-control border p-3 text-left transition",
                  soon
                    ? "cursor-not-allowed border-hair bg-canvas opacity-60"
                    : on
                      ? "cursor-pointer border-brand bg-tint ring-2 ring-brand/15"
                      : "cursor-pointer border-hair-2 bg-card hover:border-brand/50"
                )}
              >
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-control", on ? "bg-brand text-white" : "bg-tint text-brand")}>{m.icon}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-body font-[850] text-ink">
                    {m.title}
                    {soon && <span className="rounded-chip border border-hair-2 bg-subtle px-1.5 py-0.5 text-micro font-bold text-ink-3">Coming soon</span>}
                    {on && <Check className="size-3.5 text-brand" />}
                  </span>
                  <span className="mt-0.5 block text-label leading-snug text-ink-3">{m.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* The same uploader as Visual & creative references on Need your
            input: what was added there is here, and more can be added. */}
        {mode === "references" && (
          <div className="space-y-3 border-t border-hair pt-3">
            <p className="text-body leading-snug text-ink-3">
              Ads or campaigns with the look you want. Steers style and palette. <strong className="font-bold text-ink-2">Grounds no claims.</strong>
            </p>
            <MediaAttachmentGrid
              items={references.map((r) => ({ id: r.id, name: r.name, note: r.note, previewUrl: r.previewUrl, kind: "image" as const }))}
              uploadLabel={references.length === 0 ? "Upload a reference" : "Add another"}
              uploadHint="PNG, JPG, MP4, PDF, PPTX · a PDF or deck works for carousels, a page per card"
              onUpload={onAddReference}
              onRemove={onRemoveReference}
            />
            {(() => {
              const reusable = workspaceAssets(brandName, "reference").filter((a) => !references.some((r) => r.name === a.name));
              if (reusable.length === 0) return null;
              return (
                <div>
                  <span className="mb-1.5 block text-label font-bold uppercase tracking-wider text-ink-3">Suggested from platform</span>
                  <AssetStrip>
                    {reusable.map((asset) => (
                      <MediaAssetTile
                        key={asset.id}
                        source="workspace"
                        name={asset.name}
                        note={asset.note}
                        origin={asset.origin}
                        previewUrl={asset.previewUrl}
                        kind={asset.kind}
                        onAdd={() => onAddSuggested(asset)}
                      />
                    ))}
                  </AssetStrip>
                </div>
              );
            })()}
          </div>
        )}

        <p className="text-caption text-ink-4">
          {adType === "unbranded"
            ? "Help-seeking: a neutral campaign look, never the brand's colours or logo."
            : `Every option uses the ${brandName} brand kit: logo, colours and typefaces.`}
        </p>
      </section>

      {/* The templates. Only in use when "Choose from templates" is picked. */}
      <div className={cn("space-y-8 pb-24 transition-opacity", !templatesOn && "pointer-events-none select-none opacity-40")} aria-disabled={!templatesOn}>
        {!templatesOn && (
          <p className="text-label font-semibold text-ink-3">
            {mode === "fresh" ? "Not needed: SwishX designs the look fresh." : "Not needed: SwishX composes from your references."} Pick “Choose from templates” to use one.
          </p>
        )}
        {hasImage && (
          <section className="space-y-3">
            <div>
              <h3 className="text-subhead font-[850] tracking-tight text-ink">Image ad template</h3>
              <p className="text-label text-ink-3">One template for every image size and banner{sizes ? `: ${sizes}` : ""}.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shownImages.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  fit={templateFit(t, ctx)}
                  selected={templatesOn && imageChoice === t.id}
                  onSelect={() => setImageChoice(t.id)}
                  copy={copy}
                  palette={palette}
                  adType={adType}
                  shapes={["4:5", "9:16", "banner"]}
                />
              ))}
            </div>
            {imageList.length > 5 && (
              <button type="button" onClick={() => setShowAll(!showAll)} className="cursor-pointer text-label font-bold text-brand hover:underline">
                {showAll ? "Show fewer templates" : `Show ${imageList.length - 5} more templates`}
              </button>
            )}
          </section>
        )}

        {hasCarousel && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-subhead font-[850] tracking-tight text-ink">Carousel template</h3>
                <p className="text-label text-ink-3">The cards for Meta Feed, in the order planned on the storyboard.</p>
              </div>
              {hasImage && (
                <label className="flex cursor-pointer items-center gap-2.5 rounded-control border border-hair-2 bg-card px-3 py-2">
                  <Toggle checked={matches} onChange={setMatches} label="Carousel matches the image ad" />
                  <span className="text-label font-bold text-ink-2">Carousel matches the image ad</span>
                </label>
              )}
            </div>
            {hasImage && matches ? (
              <div className="flex items-center gap-3 rounded-control border border-hair bg-card px-4 py-3">
                <Check className="size-4 shrink-0 text-ok" />
                <span className="text-body text-ink-2">
                  Same look as the image ad: <b className="font-bold text-ink">{nameOf(matchedCarousel, CAROUSEL_TEMPLATES)}</b>
                </span>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {carouselList.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    fit={templateFit(t, ctx)}
                    selected={templatesOn && carouselChoice === t.id}
                    onSelect={() => setCarouselChoice(t.id)}
                    copy={copy}
                    palette={palette}
                    adType={adType}
                    shapes={["card", "card", "card"]}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <ActionBar
        icon={blocked ? <AlertTriangle className="size-4.5 shrink-0 text-warn-on-dark" /> : <CheckCircle2 className="size-4.5 shrink-0 text-ok-on-dark" />}
        title={blocked ? "No references to follow" : "Look chosen"}
        description={`${description} · ${adCount} ads · ${credits.toLocaleString()} credits`}
        action={
          <Button
            disabled={blocked}
            onClick={() =>
              onContinue({
                mode,
                image: templatesOn && hasImage ? imageChoice : undefined,
                carousel: templatesOn && hasCarousel ? effectiveCarousel : undefined,
              })
            }
            className="h-9 shrink-0 cursor-pointer rounded-control bg-brand px-5 text-body font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-deep disabled:opacity-40"
          >
            <span>Create Ads</span>
            <ArrowRight className="ml-1.5 size-3.5" />
          </Button>
        }
      />
    </>
  );
}

/* ── Cards ── */

function TemplateCard({
  template,
  fit,
  selected,
  onSelect,
  copy,
  palette,
  adType,
  shapes,
}: {
  template: AdTemplate;
  fit: { ok: boolean; note?: string };
  selected: boolean;
  onSelect: () => void;
  copy: Copy;
  palette: { primary: string; callout: string };
  adType: AdType;
  shapes: Array<"4:5" | "9:16" | "banner" | "card">;
}) {
  /* A div acting as the button, so the carousel's arrows can be real buttons inside it. */
  const carousel = shapes[0] === "card";
  return (
    <div
      role="button"
      tabIndex={fit.ok ? 0 : -1}
      aria-disabled={!fit.ok}
      aria-pressed={selected}
      onClick={() => fit.ok && onSelect()}
      onKeyDown={(e) => {
        if (fit.ok && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "focus-ring flex flex-col gap-3 rounded-card border p-3.5 text-left transition",
        !fit.ok
          ? "cursor-not-allowed border-hair bg-canvas opacity-60"
          : selected
            ? "cursor-pointer border-brand bg-card ring-2 ring-brand/20 shadow-soft"
            : "cursor-pointer border-hair bg-card hover:border-brand/50 hover:shadow-soft"
      )}
    >
      {carousel ? (
        <CarouselPreview layout={template.layout} copy={copy} palette={palette} adType={adType} />
      ) : (
        <div className="flex h-36 items-end justify-center gap-2 overflow-hidden rounded-control bg-subtle p-2.5">
          {shapes.map((shape, i) => (
            <TemplatePreview key={i} layout={template.layout} shape={shape} copy={copy} palette={palette} adType={adType} cardIndex={i} />
          ))}
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-body font-[850] text-ink">{template.name}</span>
          {selected && <Check className="size-4 shrink-0 text-brand" />}
        </div>
        <div className="text-label text-ink-3">{template.blurb}</div>
        {fit.note && (
          <div className={cn("mt-1.5 flex items-start gap-1.5 text-caption font-semibold", fit.ok ? "text-warn" : "text-danger")}>
            <AlertTriangle className="mt-px size-3 shrink-0" />
            {fit.note}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A carousel as people see it: one card, with arrows to the next. Showing
 * every card side by side read as several ads rather than one that swipes.
 */
function CarouselPreview({
  layout,
  copy,
  palette,
  adType,
}: {
  layout: AdTemplateLayout;
  copy: Copy;
  palette: { primary: string; callout: string };
  adType: AdType;
}) {
  const count = adType === "product-claim" ? 4 : 3;
  const [index, setIndex] = useState(0);
  const go = (e: React.MouseEvent, step: number) => {
    e.stopPropagation();
    setIndex((i) => (i + step + count) % count);
  };
  const arrow = (dir: "prev" | "next") => (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous card" : "Next card"}
      onClick={(e) => go(e, dir === "prev" ? -1 : 1)}
      className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border border-hair-2 bg-card text-label font-bold text-ink-2 shadow-2xs transition hover:border-brand hover:text-brand"
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
  return (
    <div className="flex h-36 flex-col items-center justify-center gap-1.5 rounded-control bg-subtle p-2.5">
      <div className="flex h-[82%] w-full items-center justify-center gap-2">
        {arrow("prev")}
        {index === 3 ? (
          <div className="flex aspect-square h-full shrink-0 flex-col justify-center gap-1 rounded-[4px] border border-hair-2 bg-card p-2 shadow-2xs">
            <div className="text-micro font-[850] text-ink">Important Safety Information</div>
            <div className="h-1 w-full rounded-[1px] bg-ink/15" />
            <div className="h-1 w-4/5 rounded-[1px] bg-ink/15" />
            <div className="h-1 w-full rounded-[1px] bg-ink/15" />
          </div>
        ) : (
          <div className="flex h-full shrink-0 items-center">
            <TemplatePreview layout={layout} shape="card" copy={copy} palette={palette} adType={adType} cardIndex={index} fill />
          </div>
        )}
        {arrow("next")}
      </div>
      <div className="flex gap-1" aria-label={`Card ${index + 1} of ${count}`}>
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={cn("size-1.5 rounded-full", i === index ? "bg-brand" : "bg-hair-3")} />
        ))}
      </div>
    </div>
  );
}

/* ── The preview: the composition, with real words and a placeholder picture ── */

const PICTURE = "repeating-linear-gradient(135deg, rgba(10,13,20,.07) 0 6px, rgba(10,13,20,.03) 6px 12px)";

function TemplatePreview({
  layout,
  shape,
  copy,
  palette,
  adType,
  cardIndex,
  fill,
}: {
  layout: AdTemplateLayout;
  shape: "4:5" | "9:16" | "banner" | "card";
  copy: Copy;
  palette: { primary: string; callout: string };
  adType: AdType;
  cardIndex: number;
  /** Fill the height it's given, for the single-card carousel preview. */
  fill?: boolean;
}) {
  const box = shape === "4:5" ? "h-full aspect-[4/5]" : shape === "9:16" ? "h-full aspect-[9/16]" : shape === "banner" ? "h-[60%] aspect-[6/5]" : fill ? "h-full aspect-square" : "w-[30%] aspect-square";
  const dark = layout === "headline";
  const words = (
    <div className="space-y-0.5">
      {layout === "stat" && copy.number && (
        <div className="text-body font-[850] leading-none" style={{ color: dark ? "#fff" : palette.primary }}>
          {copy.number}
        </div>
      )}
      {layout === "quote" && <div className="text-body font-[850] leading-none" style={{ color: palette.primary }}>&ldquo;</div>}
      <div className={cn("line-clamp-3 text-micro font-[850] leading-tight", dark ? "text-white" : "text-ink")}>
        {shape === "card" && cardIndex > 0 ? (cardIndex === 1 ? copy.support ?? copy.headline : "Ask your doctor") : copy.headline}
      </div>
      {shape !== "banner" && shape !== "card" && copy.support && layout !== "minimal" && (
        <div className={cn("line-clamp-2 text-micro leading-tight", dark ? "text-white/80" : "text-ink-3")}>{copy.support}</div>
      )}
    </div>
  );
  const picture = (className: string) => <div className={cn("rounded-[3px]", className)} style={{ background: PICTURE }} />;
  const pack = copy.packshot && adType !== "unbranded" ? <div className="size-3.5 shrink-0 self-end rounded-[2px] bg-hair-3" /> : null;
  const risk = copy.riskLine ? <div className="h-1.5 w-full shrink-0 rounded-[1px] bg-ink/25" title="Safety band" /> : null;

  return (
    <div
      className={cn("flex shrink-0 flex-col gap-1 overflow-hidden rounded-[4px] border border-hair-2 p-1.5 shadow-2xs", box)}
      style={{ background: dark ? palette.primary : "var(--card)" }}
    >
      {layout === "photo" ? (
        <div className="relative flex min-h-0 flex-1 flex-col justify-end rounded-[3px] p-1" style={{ background: PICTURE }}>
          <div className="rounded-[3px] bg-card/90 p-1">{words}</div>
        </div>
      ) : layout === "split" ? (
        <div className={cn("flex min-h-0 flex-1 gap-1", shape === "9:16" || shape === "card" ? "flex-col" : "flex-row")}>
          {picture("min-h-[30%] flex-1")}
          <div className="flex flex-1 flex-col justify-between">{words}{pack}</div>
        </div>
      ) : layout === "product" ? (
        <>
          {words}
          <div className="grid min-h-0 flex-1 place-items-center rounded-[3px]" style={{ background: palette.callout }}>
            <div className="h-1/2 w-1/3 rounded-[3px] bg-hair-3" />
          </div>
        </>
      ) : layout === "minimal" ? (
        <>
          <div className="flex-1" />
          {words}
          {picture("h-1/4 w-1/3 self-end")}
        </>
      ) : (
        <>
          {words}
          {picture("min-h-0 flex-1")}
          {pack}
        </>
      )}
      {risk}
    </div>
  );
}
