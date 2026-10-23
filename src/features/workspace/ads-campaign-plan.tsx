"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clapperboard,
  Image as ImageIcon,
  LayoutGrid,
  MessageSquareQuote,
  MousePointerClick,
  PanelsTopLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionBar } from "@/components/patterns/action-bar";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { cn } from "@/lib/cn";
import { ChipChoices, ChoiceGroup, DecisionRow } from "@/features/workspace/plan-decisions";
import { NarrationPlayer } from "@/features/workspace/narration-player";
import {
  RegenerateShotModal,
  ShotPreviewModal,
  StoryboardSceneTile,
  StoryboardSummary,
  storyShots,
  type StoryboardLayout,
} from "@/features/workspace/storyboard";
import { useShotPreviews } from "@/features/workspace/use-shot-previews";
import { AD_FORMATS, NEXT_STEPS, closingLine, type AdClaim, type AdFormat, type AdType } from "@/features/workspace/ad-options";
import {
  buildAdStory,
  buildCarousel,
  buildImageAd,
  conditionFor,
  type AdOutput,
  type CarouselCard,
  type ImageAdPlan,
} from "@/features/workspace/ad-campaign";

/**
 * The Ads campaign, in three parts.
 *
 * What the campaign says (key message and claims) and what it makes (ads to
 * make) are decided on Need your input, because the storyboards are written
 * from them: untick every video and there is no video storyboard to write;
 * change the key message and every scene's narration changes. The campaign
 * storyboard then shows only what follows from those decisions: the video
 * storyboard, and the plan for the image and carousel ads.
 */

const FORMAT_ICON: Record<AdFormat, typeof Clapperboard> = {
  video: Clapperboard,
  image: ImageIcon,
  carousel: LayoutGrid,
  banner: PanelsTopLeft,
};

/* ── Key message & claims — decided on Need your input ── */

export function KeyMessageFields({
  adType,
  brandName,
  messages,
  leadMessage,
  onLeadMessage,
  claims,
  pickedClaims,
  onToggleClaim,
  nextStep,
  onNextStep,
}: {
  adType: AdType;
  brandName: string;
  messages: string[];
  leadMessage: string;
  onLeadMessage: (next: string) => void;
  claims: AdClaim[];
  pickedClaims: string[];
  onToggleClaim: (text: string) => void;
  nextStep: string;
  onNextStep: (next: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const used = claims.filter((c) => pickedClaims.includes(c.text));
  return (
    <div className="space-y-2">
      <DecisionRow
        label="Key message"
        value={leadMessage}
        icon={<MessageSquareQuote className="size-4" />}
        editing={editing === "message"}
        onEdit={() => setEditing(editing === "message" ? null : "message")}
      >
        <ChoiceGroup
          label="The line every ad leads with"
          value={leadMessage}
          options={messages}
          onChange={(next) => {
            onLeadMessage(next);
            setEditing(null);
          }}
          icon={() => <MessageSquareQuote className="size-4" />}
          hint={(option) => (option === messages[0] ? "Recommended" : undefined)}
        />
      </DecisionRow>
      {adType === "product-claim" && (
        <DecisionRow
          label="Approved claims"
          value={used.map((c) => c.text).join(" · ")}
          icon={<ShieldCheck className="size-4" />}
          editing={editing === "claims"}
          onEdit={() => setEditing(editing === "claims" ? null : "claims")}
        >
          <ChipChoices
            label="From the Claims Library. New wording becomes a new claim that needs MLR."
            options={claims.map((c) => c.text)}
            values={pickedClaims}
            onToggle={onToggleClaim}
            onDone={() => setEditing(null)}
            footnote={claims.map((c) => `${c.id}: ${c.source}`).join(" · ")}
          />
        </DecisionRow>
      )}
      <DecisionRow
        label="Closing line"
        value={closingLine(nextStep, adType, brandName)}
        icon={<MousePointerClick className="size-4" />}
        editing={editing === "closing"}
        onEdit={() => setEditing(editing === "closing" ? null : "closing")}
      >
        <ChoiceGroup
          label="What every ad asks people to do"
          value={nextStep}
          options={NEXT_STEPS}
          onChange={(next) => {
            onNextStep(next);
            setEditing(null);
          }}
          icon={() => <MousePointerClick className="size-4" />}
          hint={(option) => closingLine(option, adType, brandName)}
        />
      </DecisionRow>
    </div>
  );
}

/* ── Ads to make — decided on Need your input ── */

export function AdsToMakeList({
  outputs,
  removed,
  onToggle,
}: {
  outputs: AdOutput[];
  removed: string[];
  onToggle: (id: string) => void;
}) {
  const kept = outputs.filter((o) => !removed.includes(o.id));
  const credits = kept.reduce((sum, o) => sum + o.credits, 0);
  /* A placement whose every ad was unticked has nothing to run. */
  const orphaned = (ad: AdOutput) => ad.placements.filter((p) => !kept.some((k) => k.id !== ad.id && k.placements.includes(p)));

  return (
    <div className="overflow-hidden rounded-control border border-hair bg-card">
      {outputs.map((ad) => {
        const on = !removed.includes(ad.id);
        const Icon = FORMAT_ICON[ad.format];
        const lost = on ? [] : orphaned(ad);
        return (
          <label
            key={ad.id}
            className="grid cursor-pointer items-start gap-3 border-b border-hair px-3.5 py-3 last:border-b-0 sm:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1.3fr)_auto]"
          >
            <input type="checkbox" checked={on} onChange={() => onToggle(ad.id)} className="mt-1 size-4 accent-brand" aria-label={`Make ${ad.name}`} />
            <span className={cn("min-w-0", !on && "opacity-55")}>
              <span className="flex items-center gap-2 text-body font-bold text-ink">
                <Icon className="size-3.5 shrink-0 text-brand" />
                {ad.name}
              </span>
              <span className="block text-label text-ink-3">
                {AD_FORMATS.find((f) => f.id === ad.format)?.label} · {ad.shape}
                {ad.length ? ` · ${ad.length}` : ""}
              </span>
            </span>
            <span className="min-w-0">
              <span className={cn("block text-label leading-snug text-ink-2", !on && "opacity-55")}>{ad.placements.join(", ")}</span>
              {lost.length > 0 && (
                <span className="mt-1 flex items-start gap-1.5 text-caption font-semibold text-danger">
                  <AlertTriangle className="mt-px size-3 shrink-0" />
                  {lost.join(" and ")} will have no ad
                </span>
              )}
            </span>
            <span className={cn("text-label font-bold tabular-nums text-ink-2", !on && "opacity-55")}>{ad.credits.toLocaleString()}</span>
          </label>
        );
      })}
      <div className="flex items-center justify-between bg-subtle px-3.5 py-2.5 text-label">
        <span className="font-bold text-ink-2">
          {kept.length} of {outputs.length} ads
        </span>
        <span className="font-bold tabular-nums text-ink">{credits.toLocaleString()} credits</span>
      </div>
    </div>
  );
}

/* ── The campaign storyboard ── */

type Tab = "video" | "visuals";
type VideoShape = "16:9" | "9:16" | "1:1";

const SHAPE_HINT: Record<VideoShape, string> = {
  "16:9": "YouTube, online video, connected TV",
  "9:16": "Reels, Stories, TikTok",
  "1:1": "Feed",
};

export function AdsCampaignStoryboard({
  brandId,
  brandName,
  adType,
  leadMessage,
  claims,
  closing,
  kept,
  onConfirm,
}: {
  brandId: string;
  brandName: string;
  adType: AdType;
  leadMessage: string;
  claims: AdClaim[];
  closing: string;
  kept: AdOutput[];
  onConfirm: (result: { ads: number; credits: number; hasStills: boolean }) => void;
}) {
  const input = { brandId, brand: brandName, adType, claims, leadMessage, closing };
  const story = buildAdStory(input);
  const imageAd = buildImageAd(input);
  const carousel = buildCarousel({ ...input, condition: conditionFor(brandId) });
  const credits = kept.reduce((sum, o) => sum + o.credits, 0);

  const videoShapes = kept.filter((o) => o.format === "video").map((o) => o.shape as VideoShape);
  const hasVideo = videoShapes.length > 0;
  const imageShapes = kept.filter((o) => o.format === "image").map((o) => o.shape);
  const hasBanners = kept.some((o) => o.format === "banner");
  const hasImage = imageShapes.length > 0 || hasBanners;
  const hasCarousel = kept.some((o) => o.format === "carousel");
  /* Image ads and carousels both get a template next; video-only goes straight on. */
  const hasStills = hasImage || hasCarousel;
  const storyLength = story.reduce((sum, s) => sum + s.duration, 0);

  const tabs: Array<{ id: Tab; label: string }> = [
    ...(hasVideo ? [{ id: "video" as const, label: "Video Ads" }] : []),
    ...(hasImage || hasCarousel ? [{ id: "visuals" as const, label: hasImage && hasCarousel ? "Image and Carousel Ads" : hasImage ? "Image Ads" : "Carousel Ads" }] : []),
  ];
  const [chosenTab, setTab] = useState<Tab>("video");
  const tab: Tab = tabs.some((t) => t.id === chosenTab) ? chosenTab : tabs[0]?.id ?? "video";

  /* The storyboard machinery, as in the video flow. */
  const [shape, setShape] = useState<VideoShape | null>(null);
  const activeShape: VideoShape = shape && videoShapes.includes(shape) ? shape : videoShapes[0] ?? "16:9";
  const portrait = activeShape === "9:16";
  const square = activeShape === "1:1";
  const shotIds = story.flatMap((s) => storyShots(s).map((shot) => shot.id));
  const previews = useShotPreviews(shotIds);
  const [layout, setLayout] = useState<StoryboardLayout>("side");
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [previewAt, setPreviewAt] = useState<{ sceneId: string; shotId: string } | null>(null);
  const [regenAt, setRegenAt] = useState<{ sceneId: string; shotId: string } | null>(null);
  const regenScene = regenAt ? story.find((s) => s.id === regenAt.sceneId) : undefined;
  const regenShot = regenScene ? storyShots(regenScene).find((s) => s.id === regenAt!.shotId) : undefined;

  const sectionHead = (title: string, hint: string) => (
    <div>
      <h3 className="text-subhead font-[850] tracking-tight text-ink">{title}</h3>
      <p className="text-label text-ink-3">{hint}</p>
    </div>
  );

  return (
    <>
      <div className="shrink-0 pb-1">
        <h2 className="text-display font-[850] tracking-tight text-ink">Campaign storyboard</h2>
        <p className="mt-0.5 text-body text-ink-3">What each ad will show, before anything is made. Select a scene or shot to change it in the chat.</p>
      </div>

      {/* What this was built from, confirmed on Need your input. Read-only:
          the storyboard is generated from it, so it isn't reopened here. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border border-hair bg-card px-4 py-2.5">
        <span className="min-w-0 text-label text-ink-3">
          Key message <b className="font-bold text-ink">{leadMessage}</b>
        </span>
        <span className="ml-auto text-label text-ink-3">
          <b className="font-bold text-ink">{kept.length}</b> ads · <b className="font-bold text-ink">{credits.toLocaleString()}</b> credits
        </span>
      </div>

      {tabs.length > 1 && (
        <Segmented role="tablist" aria-label="Campaign storyboard" className="w-fit bg-card">
          {tabs.map((t) => (
            <SegmentedButton
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              active={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn("whitespace-nowrap px-3 py-1.5", tab === t.id && "bg-ink text-white shadow-none")}
            >
              {t.label}
            </SegmentedButton>
          ))}
        </Segmented>
      )}

      <div className="pb-24">
        {/* ── Video ad storyboard: one story, reframed for each shape ── */}
        {tab === "video" && hasVideo && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              {sectionHead("Video Ads", `One ${storyLength}-second story. Each shape is the same story reframed for its screen; nothing is cut.`)}
              {videoShapes.length > 1 && (
                <Segmented role="group" aria-label="Video shape" className="bg-card">
                  {videoShapes.map((s) => (
                    <SegmentedButton
                      key={s}
                      active={activeShape === s}
                      title={SHAPE_HINT[s]}
                      onClick={() => setShape(s)}
                      className={cn("px-3 py-1", activeShape === s && "bg-ink text-white shadow-none")}
                    >
                      {s}
                    </SegmentedButton>
                  ))}
                </Segmented>
              )}
            </div>
            <p className="text-label text-ink-3">
              Showing <b className="font-bold text-ink-2">{activeShape}</b> for {SHAPE_HINT[activeShape]}. Text and the safety statement stay inside each platform&apos;s safe area.
            </p>
            <NarrationPlayer scenes={story} voice="Riya · friendly and clear" />
            <StoryboardSummary sceneCount={story.length} previews={previews} grounded={adType === "product-claim"} layout={layout} onLayout={setLayout} />
            <div className="@container flex flex-col gap-3.5">
              {story.map((sc) => (
                <StoryboardSceneTile
                  key={sc.id}
                  scene={sc}
                  brandName={brandName}
                  portrait={portrait}
                  square={square}
                  layout={layout}
                  previews={previews}
                  selected={selectedScene === sc.id}
                  selectedShotId={null}
                  pending={false}
                  onToggleScene={() => setSelectedScene(selectedScene === sc.id ? null : sc.id)}
                  onToggleShot={() => setSelectedScene(sc.id)}
                  onExpandShot={(shot) => setPreviewAt({ sceneId: sc.id, shotId: shot.id })}
                  onRegenerateShot={(shot) => setRegenAt({ sceneId: sc.id, shotId: shot.id })}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Image & carousel plan: what goes on each, as wireframes ── */}
        {tab === "visuals" && (
          <div className="space-y-8">
            {hasImage && (
              <section className="space-y-3">
                {sectionHead("Image ad", "What will be on the image, and where. The look and the exact layout are chosen on the next screen.")}
                <div className="grid gap-5 rounded-card border border-hair bg-card p-4 sm:grid-cols-[auto_minmax(0,1fr)]">
                  <ImageAdWireframe plan={imageAd} adType={adType} />
                  <div className="space-y-3">
                    <dl className="space-y-3 text-body">
                      {([
                        ["Headline", imageAd.headline],
                        ["Supporting claim", imageAd.support],
                        ["Picture", imageAd.imageIdea],
                        ["Safety", imageAd.riskLine],
                        ["Packshot", imageAd.packshot ? "From Product & Device Visual Assets" : "None. Unbranded ads can't show the product"],
                      ] as const)
                        .filter(([, value]) => !!value)
                        .map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-caption font-bold uppercase tracking-wide text-ink-4">{label}</dt>
                            <dd className="text-ink-2">{value}</dd>
                          </div>
                        ))}
                    </dl>
                    <p className="text-label text-ink-3">Made in {[...imageShapes, ...(hasBanners ? ["the banner sizes"] : [])].join(", ")}.</p>
                  </div>
                </div>
              </section>
            )}

            {hasCarousel && (
              <section className="space-y-3">
                {sectionHead(
                  "Carousel",
                  `For Meta Feed. What each card does, in the order it's swiped${adType === "product-claim" ? "; the last card is the safety information" : ""}. The art is made in the editor.`
                )}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {carousel.map((card, i) => (
                    <CarouselCardWireframe key={i} card={card} index={i} adType={adType} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <ActionBar
        icon={kept.length > 0 ? <CheckCircle2 className="size-4.5 shrink-0 text-ok-on-dark" /> : <Check className="size-4.5 shrink-0 text-warn-on-dark" />}
        title="Storyboard ready"
        description={`${kept.length} ads · ${credits.toLocaleString()} credits`}
        action={
          <Button
            onClick={() => onConfirm({ ads: kept.length, credits, hasStills })}
            className="h-9 shrink-0 cursor-pointer rounded-control bg-brand px-5 text-body font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-deep"
          >
            <span>{hasStills ? "Choose Templates" : "Create Ads"}</span>
            <ArrowRight className="ml-1.5 size-3.5" />
          </Button>
        }
      />

      {previewAt && (
        <ShotPreviewModal scenes={story} at={previewAt} portrait={portrait} square={square} brandName={brandName} onNavigate={setPreviewAt} onClose={() => setPreviewAt(null)} />
      )}
      {regenAt && regenScene && regenShot && (
        <RegenerateShotModal
          scene={regenScene}
          shot={regenShot}
          number={regenShot.index}
          portrait={portrait}
          brandName={brandName}
          onClose={() => setRegenAt(null)}
          onSubmit={() => {
            previews.redraw([regenShot.id]);
            setRegenAt(null);
          }}
        />
      )}
    </>
  );
}

/* ── Wireframes: what goes where, in words, never finished art ── */

function Block({ label, text, className }: { label: string; text?: string; className?: string }) {
  return (
    <div className={cn("rounded-glyph border border-dashed border-hair-3 bg-subtle px-2 py-1.5", className)}>
      <div className="text-micro font-extrabold uppercase tracking-wide text-ink-4">{label}</div>
      {text && <div className="mt-0.5 text-caption font-semibold leading-snug text-ink-2">{text}</div>}
    </div>
  );
}

/** The image ad as a 4:5 wireframe: where each part sits. The words are listed beside it. */
function ImageAdWireframe({ plan, adType }: { plan: ImageAdPlan; adType: AdType }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex aspect-[4/5] w-60 flex-col gap-1.5 rounded-control border border-hair-2 bg-card p-2.5">
        {adType !== "unbranded" && <Block label="Logo" className="w-16 py-1" />}
        <Block label="Headline" className="py-2.5" />
        {plan.support && <Block label="Supporting claim" />}
        <div className="flex min-h-0 flex-1 gap-1.5">
          <Block label="Picture" className="flex-1" />
          {plan.packshot && <Block label="Packshot" className="w-16 self-end" />}
        </div>
        {plan.riskLine && <Block label="Safety band" />}
      </div>
      <span className="text-caption font-bold text-ink-4">Wireframe · 4:5</span>
    </div>
  );
}

function CarouselCardWireframe({ card, index, adType }: { card: CarouselCard; index: number; adType: AdType }) {
  const safety = card.role === "Safety";
  return (
    <article className="flex w-48 shrink-0 flex-col gap-1.5">
      <div className="flex aspect-square flex-col gap-1.5 rounded-control border border-hair-2 bg-card p-2.5">
        <span className="w-fit rounded-chip bg-tint px-2 py-0.5 text-caption font-bold text-brand-deep">
          {index + 1} · {card.role}
        </span>
        {safety ? (
          <Block label="Safety information" text="Full text, no imagery" className="flex-1" />
        ) : (
          <>
            <Block label="Picture" text={card.image} className="flex-1 overflow-hidden" />
            <Block label="Headline" text={card.title} />
            {adType === "product-claim" && <Block label="Safety line" className="py-1" />}
          </>
        )}
      </div>
      <span className="px-0.5 text-caption text-ink-3">{card.body}</span>
    </article>
  );
}
