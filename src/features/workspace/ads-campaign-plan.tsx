"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  MessageSquareQuote,
  MousePointerClick,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { ActionBar } from "@/components/patterns/action-bar";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { cn } from "@/lib/cn";
import { ChipChoices, ChoiceGroup, DecisionRow } from "@/features/workspace/plan-decisions";
import { NarrationPlayer } from "@/features/workspace/narration-player";
import { brandAdFacts } from "@/features/workspace/ad-options";
import {
  RegenerateShotModal,
  ShotPreviewModal,
  StoryboardSceneTile,
  StoryboardSummary,
  storyShots,
  type StoryboardLayout,
} from "@/features/workspace/storyboard";
import { useShotPreviews } from "@/features/workspace/use-shot-previews";
import { AD_PLACEMENTS, NEXT_STEPS, closingLine, type AdClaim, type AdFormat, type AdFormatChoice, type AdPlacement, type AdType } from "@/features/workspace/ad-options";
import {
  buildAdStory,
  buildCarousel,
  buildDocumentAd,
  buildImageAd,
  conditionFor,
  type AdOutput,
  type CarouselCard,
  type DocPage,
  type ImageAdPlan,
  buildSearchAd,
  searchCombination,
  HEADLINE_MAX,
  DESCRIPTION_MAX,
} from "@/features/workspace/ad-campaign";
import { SearchAdCard, SearchChecks, SearchLines } from "@/features/workspace/search-ad-preview";
import { ACCOUNT_MARK, FormatChips } from "@/features/workspace/placement-picker";

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

/* ── Key message & claims — decided on Need your input ── */

export function KeyMessageFields({
  fromInput = [],
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
  /** Options SwishX wrote from the marketer's chat; marked as theirs. */
  fromInput?: string[];
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
          hint={(option) => (fromInput.includes(option) ? "From your input" : option === messages[0] ? "Recommended" : undefined)}
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

/**
 * What the campaign makes, one row per placement: its formats as chips, and
 * the ads those formats produce. Turning a chip off is how an ad comes out;
 * the × drops a placement the campaign no longer needs. One list, not a list
 * and a grid of the same ads.
 */
export function AdsToMakeList({
  outputs,
  placements,
  formats,
  onToggleFormat,
  onRemovePlacement,
}: {
  outputs: AdOutput[];
  placements: AdPlacement[];
  formats?: AdFormatChoice;
  onToggleFormat: (id: AdPlacement, format: AdFormat) => void;
  onRemovePlacement: (id: AdPlacement) => void;
}) {
  return (
    <div className="divide-y divide-hair rounded-control border border-hair-2 bg-canvas">
      {placements.map((id) => {
        const placement = AD_PLACEMENTS.find((p) => p.id === id);
        if (!placement) return null;
        const label = `${placement.account} · ${placement.label}`;
        /* The ads this placement gets, by shape: "1:1 video · 4:5 image". */
        const makes = outputs
          .filter((o) => o.placements.includes(label))
          .map((o) =>
            o.format === "banner" ? `${o.shape.split(" · ").length} banner sizes` : o.format === "text" ? "15 headlines · 4 descriptions" : o.format === "document" ? "6-page PDF" : `${o.shape.split(" · ")[0]} ${o.format}`
          )
          .join(" · ");
        return (
          <div key={id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2 pl-3 pr-1.5">
            <span className="flex min-w-0 items-center gap-2 sm:w-56">
              <span className="grid size-6 shrink-0 place-items-center rounded-chip border border-hair bg-card">{ACCOUNT_MARK[placement.account]}</span>
              <span className="truncate text-label font-bold text-ink">
                {placement.account.replace(/ Ads$/, "")} · {placement.label}
              </span>
            </span>
            <FormatChips placement={id} formats={formats} onToggleFormat={onToggleFormat} />
            <span className="ml-auto truncate text-caption text-ink-4">{makes}</span>
            <IconButton
              aria-label={`Remove ${label}`}
              title={placements.length === 1 ? "The campaign needs at least one placement" : `Remove ${label}`}
              size={7}
              disabled={placements.length === 1}
              onClick={() => onRemovePlacement(id)}
            >
              <X className="size-3.5" />
            </IconButton>
          </div>
        );
      })}
    </div>
  );
}

/* ── The campaign storyboard ── */

type Tab = "video" | "visuals" | "document" | "search";
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
  condition,
}: {
  /** What the ads are about, when it isn't the product's own condition. */
  condition?: string;
  brandId: string;
  brandName: string;
  adType: AdType;
  leadMessage: string;
  claims: AdClaim[];
  closing: string;
  kept: AdOutput[];
  onConfirm: (result: { ads: number; credits: number; hasStills: boolean }) => void;
}) {
  const input = { brandId, brand: brandName, adType, claims, leadMessage, closing, condition: condition ?? conditionFor(brandId) };
  const story = buildAdStory(input);
  const imageAd = buildImageAd(input);
  const carousel = buildCarousel(input);
  const docPages = buildDocumentAd(input);
  const credits = kept.reduce((sum, o) => sum + o.credits, 0);

  const videoShapes = kept.filter((o) => o.format === "video").map((o) => o.shape as VideoShape);
  const hasVideo = videoShapes.length > 0;
  const imageShapes = kept.filter((o) => o.format === "image").map((o) => o.shape);
  const hasBanners = kept.some((o) => o.format === "banner");
  const hasImage = imageShapes.length > 0 || hasBanners;
  const hasCarousel = kept.some((o) => o.format === "carousel");
  const hasSearch = kept.some((o) => o.format === "text");
  const hasDocument = kept.some((o) => o.format === "document");
  /* Where a format runs, in words: "Meta Ads · Feed and LinkedIn Ads · Feed". */
  const runsOn = (format: AdFormat) => kept.find((o) => o.format === format)?.placements.join(" and ") ?? "";
  /* The search ad's words: written here, with every combination checked. */
  const searchPlan = hasSearch ? buildSearchAd({ ...input, boxedWarning: brandAdFacts(brandId).boxedWarning }) : null;
  const [searchCombo, setSearchCombo] = useState(0);
  /* Image ads, carousels and documents get a template next; video and search go straight on. */
  const hasStills = hasImage || hasCarousel || hasDocument;
  const storyLength = story.reduce((sum, s) => sum + s.duration, 0);

  const tabs: Array<{ id: Tab; label: string }> = [
    ...(hasVideo ? [{ id: "video" as const, label: "Video Ads" }] : []),
    ...(hasImage || hasCarousel ? [{ id: "visuals" as const, label: hasImage && hasCarousel ? "Image and Carousel Ads" : hasImage ? "Image Ads" : "Carousel Ads" }] : []),
    ...(hasDocument ? [{ id: "document" as const, label: "Document Ads" }] : []),
    ...(hasSearch ? [{ id: "search" as const, label: "Search Ads" }] : []),
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

        {/* ── Search ads: the lines Google mixes, and the checks on every mix ── */}
        {tab === "search" && searchPlan && (
          <section className="space-y-4">
            {sectionHead("Search Ads", "Text ads on Google's results. Google mixes these lines, up to three headlines and two descriptions at a time, so every combination is checked.")}
            <div className="space-y-2 rounded-card border border-hair bg-subtle p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-label text-ink-3">
                  When someone searches <b className="font-bold text-ink-2">&ldquo;{searchPlan.query}&rdquo;</b>
                </span>
                <Button size="sm" variant="secondary" onClick={() => setSearchCombo((n) => n + 1)}>
                  Show another combination
                </Button>
              </div>
              <SearchAdCard plan={searchPlan} combo={searchCombination(searchPlan, searchCombo)} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <SearchLines title="Headlines" lines={searchPlan.headlines} max={HEADLINE_MAX} limit={15} idPrefix="h" />
              <SearchLines title="Descriptions" lines={searchPlan.descriptions} max={DESCRIPTION_MAX} limit={4} idPrefix="d" />
            </div>
            <div className="rounded-card border border-hair bg-card p-4">
              <p className="mb-2 text-label font-bold text-ink-2">Checked against every combination</p>
              <SearchChecks checks={searchPlan.checks} />
            </div>
          </section>
        )}

        {/* ── Document plan: what each page says, in reading order ── */}
        {tab === "document" && (
          <section className="space-y-3">
            {sectionHead(
              "Document",
              `For ${runsOn("document")}. A short PDF people page through in the feed, one approved claim to a page${adType === "product-claim" ? ", ending on the safety information and the references" : ""}. The pages are designed in the editor.`
            )}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {docPages.map((page, i) => (
                <DocPageWireframe key={i} page={page} index={i} adType={adType} />
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
                        ["Packshot", imageAd.packshot ? "From Product & Device Visual Assets" : "None. Help-seeking ads can't show the product"],
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
                  `For ${runsOn("carousel")}. What each card does, in the order it's swiped${adType === "product-claim" ? "; the last card is the safety information" : ""}. The art is made in the editor.`
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

function DocPageWireframe({ page, index, adType }: { page: DocPage; index: number; adType: AdType }) {
  const textOnly = page.role === "Safety" || page.role === "References";
  return (
    <article className="flex w-44 shrink-0 flex-col gap-1.5">
      <div className="flex aspect-[4/5] flex-col gap-1.5 rounded-control border border-hair-2 bg-card p-2.5">
        <span className="flex items-center justify-between gap-1">
          <span className="w-fit rounded-chip bg-tint px-2 py-0.5 text-caption font-bold text-brand-deep">
            {index + 1} · {page.role}
          </span>
          {page.claimId && <span className="rounded-chip border border-ok-line bg-ok-bg px-1.5 py-0.5 text-micro font-bold text-ok">{page.claimId}</span>}
        </span>
        {textOnly ? (
          <Block label={page.role === "Safety" ? "Safety information" : "References"} text="Full text, no imagery" className="flex-1" />
        ) : (
          <>
            {page.role !== "Ask" && <Block label="Picture" text={page.visual} className="flex-1 overflow-hidden" />}
            <Block label="Headline" text={page.title} className={page.role === "Ask" ? "flex-1" : undefined} />
            {adType === "product-claim" && <Block label="Safety line" className="py-1" />}
          </>
        )}
      </div>
      <span className="line-clamp-2 px-0.5 text-caption text-ink-3">{page.body}</span>
    </article>
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
