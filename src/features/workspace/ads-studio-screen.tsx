"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Film,
  Image as ImageIcon,
  LayoutGrid,
  Lock,
  MessageCircle,
  MessageSquare,
  Package,
  PanelRight,
  Pause,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Type,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { WorkbenchLayout } from "@/components/patterns/workbench-layout";
import { ChatComposer, ComposerAttachButton } from "@/components/patterns/chat-composer";
import { ComposerTray } from "@/components/patterns/composer-tray";
import { RequestModal } from "@/components/patterns/request-modal";
import { SaveOrDiscardDialog } from "@/components/patterns/save-or-discard-dialog";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { Toast, useToast } from "@/components/patterns/toast";
import { cn } from "@/lib/cn";
import { Toggle } from "@/features/settings/settings-parts";
import { useSettingsStore } from "@/features/settings/settings-store";
import { DossierReaderModal } from "@/features/dossiers/dossier-reader-modal";
import { dossierFor } from "@/features/dossiers/dossier-for";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { moleculeFor } from "@/features/workspace/grounding-dossiers";
import { useWorkspaceStore, type AdCampaignSnapshot } from "@/features/workspace/workspace-store";
import { useBrandName } from "@/features/workspace/brand-catalogue";
import { DOSSIERS } from "@/features/workspace/brand-modal-data";
import { useProjectExit } from "@/features/workspace/project-exit";
import { ProjectMenu, ProjectTitle } from "@/features/workspace/project-title";
import { VersionChip, type AssetVersion } from "@/features/workspace/version-trail";
import { InspectorTabButton, INSPECTOR_TAB_STRIP } from "@/features/workspace/inspector-tabs";
import { FormattedMessageText, ChatChips } from "@/features/workspace/chat-message";
import { ChatAttachmentRow, useChatAttachments } from "@/features/workspace/chat-attachments";
import { EMPTY_STYLE, IconToggle, type TextStyle } from "@/features/workspace/canvas-text-toolbar";
import {
  EditorToolbar,
  ToolButton,
  ToolNote,
  textOptions,
  toolbarDivider,
  type ToolbarItem,
  type ToolbarSelection,
} from "@/features/workspace/editor-toolbar";
import {
  AD_KIND_PRESETS,
  adClaims,
  closingLine,
  defaultNextStep,
  leadMessages,
  type AdClaim,
} from "@/features/workspace/ad-options";
import {
  buildAdOutputs,
  buildAdStory,
  buildCarousel,
  buildImageAd,
  conditionFor,
  majorStatement,
} from "@/features/workspace/ad-campaign";
import { CAROUSEL_TEMPLATES, IMAGE_TEMPLATES } from "@/features/workspace/ad-templates";
import {
  AdCard,
  AdStill,
  AdVideoFrame,
  BANNER_SIZES,
  CARD_SIZE,
  STILL_SIZE,
  Scaled,
  VIDEO_SIZE,
  useFitWidth,
  type FrameEditing,
  type LogoCorner,
  type StillSize,
  type VideoShape,
} from "@/features/workspace/ad-frames";

/**
 * The Ads studio: every ad the campaign makes, edited in one place.
 *
 * Built after the video and document editors rather than out of them. The
 * rail lists the ads — the video story, the image ad, the carousel — and an
 * ad opens like an accordion onto what it is made of: the story's scenes, the
 * carousel's cards. The canvas shows the one being edited; All ads shows them
 * all at their real sizes. One toolbar across the top, like the document
 * editor's, changes with whatever is selected on the canvas — a headline, a
 * shot's footage, the packshot — and the panel beside it is the chat and the
 * approved claims, nothing else.
 *
 * "Edit once, update every size" is on by default: a change to the 16:9 is a
 * change to the 9:16 and 1:1 too. Turned off, a change stays in the size it
 * was made in, and that size is marked as edited.
 */

type Focus = "all" | "video" | "image" | "carousel";
type PanelTab = "assistant" | "evidence";

const DRAFT_ONLY: AssetVersion[] = [{ label: "Draft v1", state: "current", at: "Saved just now" }];

const PART_LABEL: Record<string, string> = {
  footage: "Shot footage",
  headline: "Headline",
  caption: "Caption",
  claim: "Claim",
  logo: "Logo",
  safety: "Safety information",
  picture: "Picture",
  support: "Supporting line",
  packshot: "Packshot",
  title: "Card title",
  body: "Card line",
  chart: "Chart",
};

/** The size each run of words is drawn at, so the size stepper starts somewhere true. */
const TEXT_BASE: Record<string, [number, number]> = {
  headline: [32, 900],
  caption: [15, 600],
  support: [14, 400],
  title: [28, 900],
  body: [13, 400],
};

const PART_ICON: Record<string, LucideIcon> = {
  footage: Film,
  picture: ImageIcon,
  packshot: Package,
  logo: BadgeCheck,
  claim: BadgeCheck,
  safety: ShieldCheck,
  chart: BarChart3,
};

const CORNERS: Array<{ id: LogoCorner; icon: LucideIcon; label: string }> = [
  { id: "tl", icon: ArrowUpLeft, label: "Top left" },
  { id: "tr", icon: ArrowUpRight, label: "Top right" },
  { id: "bl", icon: ArrowDownLeft, label: "Bottom left" },
  { id: "br", icon: ArrowDownRight, label: "Bottom right" },
];

function brandIdFor(dossierId: string | undefined) {
  if (!dossierId) return "";
  return DOSSIERS[dossierId]?.brandId ?? dossierId;
}

export function AdsStudioScreen() {
  const {
    sourcePayload,
    audience,
    adKind,
    adType,
    adPlacements,
    adCampaign,
    projectName,
    chatMessages,
    addChatMessage,
    copilotPanelOpen,
    copilotPanelWidth,
    setCopilotPanelWidth,
    setCopilotPanelOpen,
    toggleCopilotPanel,
  } = useWorkspaceStore();
  const exit = useProjectExit();
  const { message: toastMessage, open: toastOpen, tone: toastTone, showToast } = useToast();

  /* ── The campaign, rebuilt from what the plan settled ── */
  const brandName = useBrandName(sourcePayload?.dossierId);
  const brandId = brandIdFor(sourcePayload?.dossierId);
  const allClaims = adClaims(brandId);
  const who = audience === "HCP" ? "HCP" : "Patient";
  const title = projectName || `${brandName} · ${AD_KIND_PRESETS[adKind].noun}`;
  /* Opened without going through the plan (a reload, a dev shortcut): the plan's own defaults. */
  const campaign: AdCampaignSnapshot = adCampaign ?? {
    leadMessage: leadMessages(adType, brandName, allClaims)[0] ?? brandName,
    claimIds: allClaims.slice(0, 2).map((c) => c.id),
    closing: closingLine(defaultNextStep(adKind, who), adType, brandName),
    keptIds: buildAdOutputs(adPlacements, adType).map((o) => o.id),
    look: { mode: "template" },
  };
  const claims = allClaims.filter((c) => campaign.claimIds.includes(c.id));
  const words = { brandId, brand: brandName, adType, claims, leadMessage: campaign.leadMessage, closing: campaign.closing };
  const outputs = buildAdOutputs(adPlacements, adType).filter((o) => campaign.keptIds.includes(o.id));
  const story = buildAdStory(words);
  const imagePlan = buildImageAd(words);
  const cards = buildCarousel({ ...words, condition: conditionFor(brandId) });
  const safetyText = majorStatement(brandId, brandName);
  const number = claims.map((c) => c.text.match(/\d+%/)?.[0]).find(Boolean);
  const copy = { headline: imagePlan.headline, support: imagePlan.support, riskLine: imagePlan.riskLine, number, packshot: imagePlan.packshot };

  const kitColors = useSettingsStore((s) => s.brandKit.colors);
  const palette = adType === "unbranded" ? { primary: "#3f4a5a", callout: "#eef1f4" } : { primary: kitColors.primary, callout: kitColors.callout };

  const videoShapes = outputs.filter((o) => o.format === "video").map((o) => o.shape as VideoShape);
  const stillShapes = outputs.filter((o) => o.format === "image").map((o) => o.shape as StillSize);
  const hasBanners = outputs.some((o) => o.format === "banner");
  const imageSizes: StillSize[] = [...stillShapes, ...(hasBanners ? BANNER_SIZES : [])];
  const hasVideo = videoShapes.length > 0;
  const hasImage = imageSizes.length > 0;
  const hasCarousel = outputs.some((o) => o.format === "carousel");
  const sizeCount = videoShapes.length + stillShapes.length + (hasBanners ? BANNER_SIZES.length : 0) + (hasCarousel ? 1 : 0);
  const adCount = Number(hasVideo) + Number(hasImage) + Number(hasCarousel);

  const imageTemplate = IMAGE_TEMPLATES.find((t) => t.id === campaign.look.image);
  const carouselTemplate =
    CAROUSEL_TEMPLATES.find((t) => t.id === campaign.look.carousel) ??
    CAROUSEL_TEMPLATES.find((t) => t.layout === imageTemplate?.layout);
  const imageLayout = imageTemplate?.layout ?? "photo";
  const carouselLayout = carouselTemplate?.layout ?? "split";
  const lookNote =
    campaign.look.mode === "references" ? "Following your references" : campaign.look.mode === "fresh" ? "Designed by SwishX" : null;

  /* ── Making the ads: each one arrives in turn ── */
  const readyAt = (i: number) => 1800 + i * 1100;
  const [elapsed, setElapsed] = useState(0);
  const isReady = (id: string) => {
    const i = outputs.findIndex((o) => o.id === id);
    return i < 0 || elapsed >= readyAt(i);
  };
  const readyCount = outputs.filter((o) => isReady(o.id)).length;
  const allReady = readyCount === outputs.length;
  useEffect(() => {
    if (allReady) return;
    const timer = window.setInterval(() => setElapsed((e) => e + 400), 400);
    return () => window.clearInterval(timer);
  }, [allReady]);
  const itemReady = {
    video: outputs.filter((o) => o.format === "video").every((o) => isReady(o.id)),
    image: outputs.filter((o) => o.format === "image" || o.format === "banner").every((o) => isReady(o.id)),
    carousel: outputs.filter((o) => o.format === "carousel").every((o) => isReady(o.id)),
  };

  /* ── Where you are ── */
  const [focus, setFocus] = useState<Focus>("all");
  const [openItems, setOpenItems] = useState<Focus[]>([]);
  const [sceneId, setSceneId] = useState(story[0]?.id ?? "");
  const scene = story.find((s) => s.id === sceneId) ?? story[0];
  const [cardIndex, setCardIndex] = useState(0);
  const [videoShape, setVideoShape] = useState<VideoShape>(videoShapes[0] ?? "16:9");
  const [imageSize, setImageSize] = useState<StillSize>(imageSizes[0] ?? "4:5");
  const [selected, setSelected] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("assistant");

  const openAd = (next: Focus) => {
    setFocus(next);
    setSelected(null);
    if (next !== "all" && next !== "image") setOpenItems((prev) => (prev.includes(next) ? prev : [...prev, next]));
  };
  const toggleItem = (item: Focus) =>
    setOpenItems((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));

  /* ── The player: one scene at a time, like the video editor ── */
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const duration = scene?.duration ?? 0;
  const running = playing && time < duration && focus === "video";
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTime((t) => Math.min(+(t + 0.1).toFixed(1), duration)), 100);
    return () => window.clearInterval(timer);
  }, [running, duration]);
  const pickScene = (id: string) => {
    setSceneId(id);
    setTime(0);
    setPlaying(false);
    setSelected(null);
    openAd("video");
  };
  const shotIndex = Math.max(0, (scene?.shots ?? []).findIndex((s) => time >= s.startAt && time < s.endAt));
  const shot = scene?.shots?.[shotIndex];

  /* ── Edits: words, styles, the logo's corner ── */
  const [editOnce, setEditOnce] = useState(true);
  const [sameLook, setSameLook] = useState(true);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [styles, setStyles] = useState<Record<string, TextStyle>>({});
  const [logoCorner, setLogoCorner] = useState<Record<string, LogoCorner>>({});

  /* A style lives on the part, or on the part in one size when edits stay in that size. */
  const sizeOf = (id: string) => (id.startsWith("scene:") ? videoShape : id.startsWith("image.") ? imageSize : null);
  const baseKey = (id: string) => (sameLook ? id.replace(/^card:\d+/, "card") : id);
  const styleKey = (id: string) => {
    const size = sizeOf(id);
    return !editOnce && size ? `${baseKey(id)}@${size}` : baseKey(id);
  };
  const styleFor = (size?: string) => (id: string) => (size ? styles[`${baseKey(id)}@${size}`] : undefined) ?? styles[baseKey(id)];
  const textOf = (id: string, fallback: string) => texts[id] ?? fallback;
  const editedSizes = new Set(Object.keys(styles).filter((k) => k.includes("@")).map((k) => k.split("@")[1]));
  const patchStyle = (id: string, patch: Partial<TextStyle>) => {
    const key = styleKey(id);
    setStyles((prev) => ({
      ...prev,
      [key]: { ...EMPTY_STYLE, ...prev[key], ...patch },
    }));
  };

  const editing = (size?: string): FrameEditing => ({ selected, onSelect: setSelected, styleOf: styleFor(size), textOf });
  const still = (size?: string): FrameEditing => ({ styleOf: styleFor(size), textOf });

  /* ── What a part says, and which claim it carries ── */
  const claimFor = (id: string | null): AdClaim | undefined => {
    if (!id) return undefined;
    const part = id.split(".").pop();
    if (id === "image.headline") return claims.find((c) => c.text === imagePlan.headline);
    if (id === "image.support") return claims.find((c) => c.text === imagePlan.support);
    const card = id.match(/^card:(\d+)\.title$/);
    if (card) return claims.find((c) => c.text === cards[+card[1]]?.title);
    const sceneOf = id.match(/^scene:([^.]+)\./);
    if (sceneOf && (part === "caption" || part === "claim")) {
      const sc = story.find((s) => s.id === sceneOf[1]);
      return claims.find((c) => sc?.claim.startsWith(c.id));
    }
    return undefined;
  };

  /* ── The chat ── */
  const chatFiles = useChatAttachments();
  const [chatInput, setChatInput] = useState("");
  const [chatContexts, setChatContexts] = useState<Array<{ id: string; label: string; detail: string }>>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sizeWords = (sizes: string[]) =>
    sizes.length <= 1 ? sizes.join("") : `${sizes.slice(0, -1).join(", ")} and ${sizes[sizes.length - 1]}`;
  /* What a change made now reaches: one size, or every size of this ad. */
  const scopeLabel = (() => {
    if (focus === "all") return "Every ad in the campaign";
    const part = selected ? PART_LABEL[selected.split(".").pop() ?? ""] : null;
    if (focus === "video") {
      const where = `Scene ${scene?.number}${part ? ` · ${part.toLowerCase()}` : ""}`;
      return editOnce ? `${where}, in every video size` : `${where}, in ${videoShape} only`;
    }
    if (focus === "image") {
      const what = part ? `The ${part.toLowerCase()} on the image ad` : "The image ad";
      return editOnce ? `${what}, in every size` : `${what}, in ${imageSize} only`;
    }
    const what = part ? `Card ${cardIndex + 1} · ${part.toLowerCase()}` : `Card ${cardIndex + 1} of the carousel`;
    return sameLook && part ? `${what}, same look on every card` : what;
  })();
  const reach = focus === "video" ? (editOnce ? sizeWords(videoShapes) : videoShape) : focus === "image" ? (editOnce ? "every size" : imageSize) : "";

  const handToChat = (ctx: { id: string; label: string; detail: string }, prompt: string) => {
    setCopilotPanelOpen(true);
    setPanelTab("assistant");
    setChatContexts((prev) => (prev.some((c) => c.id === ctx.id) ? prev : [...prev, ctx]));
    setChatInput((prev) => (prev.trim() ? prev : prompt));
    requestAnimationFrame(() => document.querySelector<HTMLTextAreaElement>("[data-chat-composer]")?.focus());
  };

  const handleSendChat = (directText?: string) => {
    const attached = directText ? [] : chatFiles.take();
    const text = directText || chatInput.trim();
    if (!text && attached.length === 0) return;
    const context = directText ? [] : chatContexts;
    addChatMessage({
      role: "user",
      text: [text, ...context.map((c) => `\u{1F4CE} ${c.label}`), ...attached.map((f) => `\u{1F4CE} ${f.name}`)].filter(Boolean).join("\n"),
    });
    if (!directText) {
      setChatInput("");
      setChatContexts([]);
    }
    const lower = text.toLowerCase();
    setTimeout(() => {
      let reply = `Done: ${scopeLabel.charAt(0).toLowerCase()}${scopeLabel.slice(1)}. The words still come from approved claims, so nothing needs checking again.`;
      if (/short/.test(lower) && /headline|line|copy/.test(lower)) {
        const short = claims.find((c) => c.short)?.text;
        if (short && adType !== "unbranded") {
          setTexts((prev) => ({ ...prev, "image.headline": short }));
          const claim = claims.find((c) => c.short);
          reply = `The image ad's headline is now **${short}**, the approved claim ${claim?.id} written short for small sizes. It fits every size, the 320×50 banner included.`;
        } else {
          reply = "There's no shorter approved line to use. I'd keep the headline as it is rather than cut an approved claim.";
        }
      } else if (/caregiver/.test(lower)) {
        reply = `Scene 1 now opens on a caregiver at breakfast. The narration over it is unchanged, so the claims and timing stay approved. Updated in ${sizeWords(videoShapes)}.`;
      } else if (/safe area|safe-area|cropped|crop/.test(lower)) {
        reply = `I checked every ad against its placement's safe areas. Nothing important sits under the ${videoShapes.includes("9:16") ? "Reels caption and buttons" : "player controls"}, and the safety information stays clear on every size.`;
      } else if (/bigger|larger/.test(lower) && /pack/.test(lower)) {
        reply = `The packshot is bigger on the image ad, in ${editOnce ? "every size" : imageSize}. It still leaves the headline and the safety band clear.`;
      } else if (/reorder|swap the cards|card order/.test(lower)) {
        reply = "The Hook stays first and the safety information stays last, so the cards in between can swap. Which card should come second?";
      }
      addChatMessage({ role: "swishx", text: reply });
    }, 450);
  };

  const chips =
    focus === "video"
      ? ["Make the opening about a caregiver", "Slow down the safety scene", "Check every size for safe areas"]
      : focus === "image"
        ? ["Make the headline shorter", "Bigger packshot", "Swap the picture"]
        : focus === "carousel"
          ? ["Reorder the cards", "Make card 1 a photo", "Lead with the number"]
          : ["Check every ad for safe areas", "Make the headline shorter everywhere", "Warmer colour across all"];

  /* ── Requests that open a dialog ── */
  const [regenShot, setRegenShot] = useState(false);
  const [regenPicture, setRegenPicture] = useState<string | null>(null);
  const [dossier, setDossier] = useState<BrandDossier | null>(null);

  /* ── Submit for MLR ── */
  const [submitted, setSubmitted] = useState(false);
  const submitForMlr = () => {
    setSubmitted(true);
    setSelected(null);
    showToast(`Sent ${outputs.length} ads to MLR review`);
    addChatMessage({
      role: "swishx",
      text: `Sent to MLR review: **${outputs.length} ads** in ${sizeCount} sizes, each with its claims and references attached. The ads are locked while the review runs; I'll tell you here when it comes back.`,
    });
  };

  /* ── The toolbar's selection ── */
  const part = selected?.split(".").pop() ?? "";
  const owner = selected?.split(".")[0] ?? "";
  const partLabel = PART_LABEL[part] ?? part;
  const ownerLabel =
    owner === "image" ? "Image ad" : owner.startsWith("card:") ? `Card ${+owner.slice(5) + 1}` : owner.startsWith("scene:") ? `Scene ${scene?.number}` : "";
  const selectedClaim = claimFor(selected);

  let toolbarSelection: ToolbarSelection | null = null;
  if (selected && !submitted) {
    let items: ToolbarItem[] = [];
    if (TEXT_BASE[part]) {
      const [baseSize, baseWeight] = TEXT_BASE[part];
      items = textOptions({
        element: { id: selected, blockId: owner, label: partLabel, baseSize, baseWeight, citation: selectedClaim?.id },
        style: styleFor(sizeOf(selected) ?? undefined)(selected),
        onStyle: (patch) => patchStyle(selected, patch),
        onCite: () => {
          setCopilotPanelOpen(true);
          setPanelTab("evidence");
          showToast(`Pick the claim the ${partLabel.toLowerCase()} cites`);
        },
      });
    } else if (part === "footage") {
      items = [
        { key: "replace", node: <ToolButton icon={Upload} label="Replace clip" onClick={() => showToast("Pick a clip from the brand library or upload one")} /> },
        { key: "regenerate", node: <ToolButton icon={RefreshCw} label="Regenerate video" onClick={() => setRegenShot(true)} /> },
        toolbarDivider("d1"),
        {
          key: "shot",
          node: (
            <span className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-chip bg-subtle px-2 text-caption font-bold text-ink-3">
              Shot {shotIndex + 1} of {scene?.shots?.length ?? 1} · {shot ? +(shot.endAt - shot.startAt).toFixed(1) : duration}s
            </span>
          ),
        },
      ];
    } else if (part === "picture") {
      items = [
        { key: "replace", node: <ToolButton icon={Upload} label="Replace image" onClick={() => showToast("Pick an image from the brand library or upload one")} /> },
        { key: "regenerate", node: <ToolButton icon={RefreshCw} label="Regenerate image" onClick={() => setRegenPicture(selected)} /> },
      ];
    } else if (part === "packshot") {
      items = [
        { key: "approved", node: <ToolNote icon={BadgeCheck} tone="ok">Approved packshot</ToolNote> },
        { key: "replace", node: <ToolButton icon={Upload} label="Swap packshot" onClick={() => showToast("Pick another approved packshot from the brand library")} /> },
      ];
    } else if (part === "logo") {
      items = owner.startsWith("scene:")
        ? [
            { key: "kit", node: <ToolNote icon={BadgeCheck} tone="ok">From the brand kit</ToolNote> },
            toolbarDivider("d1"),
            ...CORNERS.map((c) => ({
              key: c.id,
              node: (
                <IconToggle active={(logoCorner[videoShape] ?? "tr") === c.id} title={c.label} onClick={() => setLogoCorner((prev) => (editOnce ? Object.fromEntries(videoShapes.map((s) => [s, c.id])) : { ...prev, [videoShape]: c.id }))}>
                  <c.icon className="size-3.5" />
                </IconToggle>
              ),
            })),
          ]
        : [{ key: "kit", node: <ToolNote icon={BadgeCheck} tone="ok">From the brand kit</ToolNote> }];
    } else if (part === "claim") {
      items = [
        { key: "claim", node: <ToolNote icon={BadgeCheck} tone="ok">{selectedClaim ? `Claim ${selectedClaim.id} · approved` : "Approved claim"}</ToolNote> },
        {
          key: "swap",
          node: (
            <ToolButton
              icon={BookOpen}
              label="See in Claims"
              onClick={() => {
                setCopilotPanelOpen(true);
                setPanelTab("evidence");
              }}
            />
          ),
        },
      ];
    } else if (part === "chart" && scene?.graph) {
      items = [
        { key: "source", node: <ToolNote icon={BadgeCheck} tone="ok">{scene.graph.footnote}</ToolNote> },
        {
          key: "data",
          node: (
            <ToolButton
              icon={BarChart3}
              label="Edit data"
              onClick={() => handToChat({ id: selected, label: `Scene ${scene.number} · Chart`, detail: scene.graph?.title ?? "Chart" }, "Change the chart so that ")}
            />
          ),
        },
      ];
    } else if (part === "safety") {
      items = [{ key: "locked", node: <ToolNote icon={Lock}>Required on every ad · from the label</ToolNote> }];
    }
    const where = `${ownerLabel} · ${partLabel}`;
    toolbarSelection = {
      id: selected,
      icon: TEXT_BASE[part] ? Type : PART_ICON[part] ?? ImageIcon,
      name: partLabel,
      path: where,
      items,
      onAddToChat: () => {
        handToChat(
          { id: selected, label: where, detail: focus === "video" ? `${scopeLabel}` : scopeLabel },
          part === "footage" || part === "picture" ? `Change the ${partLabel.toLowerCase()} so that ` : `Rewrite the ${partLabel.toLowerCase()} `
        );
        showToast(`${partLabel} added to the chat`);
      },
    };
  }

  /* ── The rail ── */
  /* Ready is the normal state, so only the exceptions are marked. */
  const statusChip = (ready: boolean) =>
    submitted || ready ? null : (
      <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-micro font-bold text-ink-3" title="Being made">
        <LogoMark size={10} className="animate-spin text-brand" />
      </span>
    );

  const railItem = ({
    item,
    thumb,
    label,
    sub,
    ready,
    children,
  }: {
    item: Focus;
    thumb: ReactNode;
    label: string;
    sub: string;
    ready: boolean;
    children?: ReactNode;
  }) => {
    const isOpen = openItems.includes(item);
    const on = focus === item;
    return (
      <div className={cn("overflow-hidden rounded-control border bg-card transition", on ? "border-brand ring-2 ring-brand/15" : "border-hair")}>
        <div className="flex items-center gap-1 p-1.5">
          {children ? (
            <button
              type="button"
              onClick={() => toggleItem(item)}
              aria-label={isOpen ? `Close ${label}` : `Open ${label}`}
              aria-expanded={isOpen}
              className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-glyph text-ink-4 transition hover:bg-subtle hover:text-ink"
            >
              <ChevronRight className={cn("size-3.5 transition-transform", isOpen && "rotate-90")} />
            </button>
          ) : (
            <span className="size-6 shrink-0" />
          )}
          <button type="button" onClick={() => openAd(item)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left">
            <span className="grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded-glyph bg-subtle">{thumb}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-label font-bold text-ink">{label}</span>
              <span className="block truncate text-micro text-ink-3">{sub}</span>
            </span>
            {statusChip(ready)}
          </button>
        </div>
        {children && isOpen && <div className="space-y-1.5 border-t border-hair bg-canvas p-2">{children}</div>}
      </div>
    );
  };

  const railThumbShape: VideoShape = videoShapes.includes("16:9") ? "16:9" : videoShapes[0] ?? "16:9";
  const rail = (
    <aside className="flex w-60 min-h-0 shrink-0 flex-col overflow-y-auto border-r border-hair bg-subtle">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-hair bg-card px-3">
        <span className="text-micro font-bold uppercase tracking-[0.12em] text-ink-3">
          Ads ({adCount}) · {sizeCount} sizes
        </span>
      </div>
      <div className="space-y-2 p-2.5">
        <button
          type="button"
          onClick={() => openAd("all")}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-control border bg-card p-1.5 pl-2 text-left transition",
            focus === "all" ? "border-brand ring-2 ring-brand/15" : "border-hair hover:border-hair-3"
          )}
        >
          <span className="grid h-9 w-12 shrink-0 place-items-center rounded-glyph bg-subtle text-ink-3">
            <LayoutGrid className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-label font-bold text-ink">All ads</span>
            <span className="block truncate text-micro text-ink-3">Every ad at its real size</span>
          </span>
        </button>

        {hasVideo &&
          railItem({
            item: "video",
            label: "Video story",
            sub: `${story.reduce((s, sc) => s + sc.duration, 0)} sec · ${story.length} scenes · ${videoShapes.length} ${videoShapes.length === 1 ? "size" : "sizes"}`,
            ready: itemReady.video,
            thumb: (
              <Scaled w={VIDEO_SIZE[railThumbShape].w} h={VIDEO_SIZE[railThumbShape].h} width={railThumbShape === "16:9" ? 48 : 20}>
                <AdVideoFrame scene={story[0]} shape={railThumbShape} brandName={brandName} adType={adType} prefix="thumb" edit={still()} />
              </Scaled>
            ),
            children: (
              <>
                {story.map((sc) => {
                  const on = focus === "video" && sc.id === scene?.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => pickScene(sc.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-control border bg-card p-1.5 text-left transition",
                        on ? "border-brand ring-2 ring-brand/15" : "border-hair hover:border-hair-3"
                      )}
                    >
                      <span className="shrink-0 overflow-hidden rounded-glyph">
                        <Scaled w={VIDEO_SIZE["16:9"].w} h={VIDEO_SIZE["16:9"].h} width={52}>
                          <AdVideoFrame scene={sc} shape="16:9" brandName={brandName} adType={adType} prefix={`thumb:${sc.id}`} edit={still("16:9")} />
                        </Scaled>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-caption font-bold text-ink">Scene {sc.number}</span>
                        <span className="block truncate text-micro text-ink-3">{sc.title}</span>
                      </span>
                      <span className="shrink-0 text-micro font-medium text-ink-3">{sc.duration}s</span>
                    </button>
                  );
                })}
              </>
            ),
          })}

        {hasImage &&
          railItem({
            item: "image",
            label: "Image ad",
            sub: [...stillShapes, ...(hasBanners ? [`${BANNER_SIZES.length} banners`] : [])].join(" · "),
            ready: itemReady.image,
            thumb: (
              <Scaled w={STILL_SIZE[imageSizes[0]].w} h={STILL_SIZE[imageSizes[0]].h} width={imageSizes[0] === "728×90" ? 48 : 28}>
                <AdStill size={imageSizes[0]} layout={imageLayout} copy={copy} palette={palette} brandName={brandName} adType={adType} prefix="thumb" edit={still(imageSizes[0])} />
              </Scaled>
            ),
          })}

        {hasCarousel &&
          railItem({
            item: "carousel",
            label: "Carousel",
            sub: `${cards.length} cards · 1:1`,
            ready: itemReady.carousel,
            thumb: (
              <Scaled w={CARD_SIZE.w} h={CARD_SIZE.h} width={36}>
                <AdCard card={cards[0]} index={0} layout={carouselLayout} palette={palette} brandName={brandName} adType={adType} riskLine={copy.riskLine} safetyText={safetyText} number={number} edit={still()} />
              </Scaled>
            ),
            children: (
              <>
                {cards.map((card, i) => {
                  const on = focus === "carousel" && i === cardIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCardIndex(i);
                        setSelected(null);
                        openAd("carousel");
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-control border bg-card p-1.5 text-left transition",
                        on ? "border-brand ring-2 ring-brand/15" : "border-hair hover:border-hair-3"
                      )}
                    >
                      <span className="shrink-0 overflow-hidden rounded-glyph border border-hair">
                        <Scaled w={CARD_SIZE.w} h={CARD_SIZE.h} width={40}>
                          <AdCard card={card} index={i} layout={carouselLayout} palette={palette} brandName={brandName} adType={adType} riskLine={copy.riskLine} safetyText={safetyText} number={number} edit={still()} />
                        </Scaled>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-caption font-bold text-ink">Card {i + 1}</span>
                        <span className="block truncate text-micro text-ink-3">{card.role}</span>
                      </span>
                    </button>
                  );
                })}
              </>
            ),
          })}
      </div>
    </aside>
  );

  /* ── The canvas ── */
  const making = (ready: boolean) =>
    !ready && (
      <div className="absolute inset-0 grid place-items-center bg-card/85 backdrop-blur-[2px]">
        <span className="inline-flex items-center gap-1.5 text-label font-bold text-ink-3">
          <LogoMark size={12} className="animate-spin text-brand" />
          Making…
        </span>
      </div>
    );

  const overview = (
    <div className="flex-1 overflow-y-auto p-6">
      {!allReady && (
        <div className="mb-5 flex items-center gap-3 rounded-control border border-tint-line bg-tint px-4 py-2.5">
          <LogoMark size={14} className="animate-spin text-brand" />
          <span className="text-body font-bold text-brand-deep">Making your ads</span>
          <span className="text-body text-brand-deep">
            {readyCount} of {outputs.length} ready
          </span>
          <span className="ml-auto h-1.5 w-56 overflow-hidden rounded-full bg-tint-line">
            <span className="block h-full rounded-full bg-brand transition-all" style={{ width: `${(readyCount / outputs.length) * 100}%` }} />
          </span>
        </div>
      )}
      <div className="space-y-7">
        {hasVideo && (
          <OverviewGroup title={`Video story · ${story.reduce((s, sc) => s + sc.duration, 0)} sec`}>
            {outputs
              .filter((o) => o.format === "video")
              .map((o) => {
                const shape = o.shape as VideoShape;
                const size = VIDEO_SIZE[shape];
                return (
                  <OverviewTile key={o.id} label={shape} sub={o.placements.map((p) => p.split(" · ")[1]).join(" · ")} edited={editedSizes.has(shape)} onOpen={() => { setVideoShape(shape); openAd("video"); }}>
                    <Scaled w={size.w} h={size.h} width={Math.round((size.w / size.h) * 176)}>
                      <AdVideoFrame scene={story[0]} shape={shape} brandName={brandName} adType={adType} logoCorner={logoCorner[shape]} prefix={`all:${shape}`} edit={still(shape)} />
                    </Scaled>
                    {making(isReady(o.id))}
                  </OverviewTile>
                );
              })}
          </OverviewGroup>
        )}
        {hasImage && (
          <OverviewGroup title="Image ad">
            {imageSizes.map((size) => {
              const box = STILL_SIZE[size];
              const ratio = box.w / box.h;
              const width = ratio > 2 ? Math.min(box.w * 0.6, 300) : Math.round(ratio * 176);
              return (
                <OverviewTile key={size} label={size} sub={BANNER_SIZES.includes(size) ? "Display" : outputs.find((o) => o.shape === size && o.format === "image")?.placements.map((p) => p.split(" · ")[1]).join(" · ") ?? ""} edited={editedSizes.has(size)} onOpen={() => { setImageSize(size); openAd("image"); }}>
                  <Scaled w={box.w} h={box.h} width={width}>
                    <AdStill size={size} layout={imageLayout} copy={copy} palette={palette} brandName={brandName} adType={adType} prefix={`all:${size}`} edit={still(size)} />
                  </Scaled>
                  {making(isReady(BANNER_SIZES.includes(size) ? "b-set" : outputs.find((o) => o.shape === size && o.format === "image")?.id ?? ""))}
                </OverviewTile>
              );
            })}
          </OverviewGroup>
        )}
        {hasCarousel && (
          <OverviewGroup title={`Carousel · ${cards.length} cards`}>
            {cards.map((card, i) => (
              <OverviewTile key={i} label={`Card ${i + 1}`} sub={card.role} onOpen={() => { setCardIndex(i); openAd("carousel"); }}>
                <Scaled w={CARD_SIZE.w} h={CARD_SIZE.h} width={150}>
                  <AdCard card={card} index={i} layout={carouselLayout} palette={palette} brandName={brandName} adType={adType} riskLine={copy.riskLine} safetyText={safetyText} number={number} edit={still()} />
                </Scaled>
                {making(isReady("c-1x1"))}
              </OverviewTile>
            ))}
          </OverviewGroup>
        )}
      </div>
    </div>
  );

  const canvasBar = (children: ReactNode) => (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-hair bg-card px-4 py-2">{children}</div>
  );
  const editOnceToggle = (
    <label className="ml-auto inline-flex shrink-0 items-center gap-2 text-label font-bold text-ink-2">
      <Toggle checked={editOnce} onChange={setEditOnce} label="Edit once, update every size" />
      Edit once, update every size
    </label>
  );

  const videoCanvas = scene && (
    <>
      {canvasBar(
        <>
          <span className="text-label font-bold text-ink">
            Scene {scene.number} of {story.length} · {scene.title}
          </span>
          <span className="text-label text-ink-3">{editOnce ? `Changes apply to ${sizeWords(videoShapes)}` : `Changes stay in ${videoShape}`}</span>
          {videoShapes.length > 1 && (
            <Segmented className="ml-auto">
              {videoShapes.map((s) => (
                <SegmentedButton key={s} active={videoShape === s} onClick={() => setVideoShape(s)}>
                  {s}
                  {editedSizes.has(s) && <span className="size-1.5 rounded-full bg-brand" title="Edited in this size" />}
                </SegmentedButton>
              ))}
            </Segmented>
          )}
          {videoShapes.length > 1 && editOnceToggle}
        </>
      )}
      <FitCanvas ratio={VIDEO_SIZE[videoShape].w / VIDEO_SIZE[videoShape].h} onClear={() => setSelected(null)}>
        {(width) => (
          <div className="relative overflow-hidden rounded-control shadow-float" style={{ width }}>
            <Scaled w={VIDEO_SIZE[videoShape].w} h={VIDEO_SIZE[videoShape].h} width={width}>
              <AdVideoFrame
                scene={scene}
                shape={videoShape}
                time={time}
                playing={running}
                brandName={brandName}
                adType={adType}
                logoCorner={logoCorner[videoShape]}
                prefix={`scene:${scene.id}`}
                edit={submitted ? still(videoShape) : editing(videoShape)}
              />
            </Scaled>
            {making(itemReady.video)}
            <PlayerBar
              time={time}
              duration={duration}
              playing={running}
              shots={(scene.shots ?? []).map((s) => s.startAt)}
              label={`Scene ${scene.number}`}
              onToggle={() => {
                if (time >= duration) setTime(0);
                setPlaying(!running);
              }}
              onSeek={(at) => {
                setTime(at);
                setPlaying(false);
              }}
            />
          </div>
        )}
      </FitCanvas>
    </>
  );

  const masterSize = imageSizes[0];
  const imageCanvas = hasImage && (
    <>
      {canvasBar(
        <>
          <span className="text-label font-bold text-ink">{imageSize === masterSize ? `Master · ${imageSize}` : imageSize}</span>
          <span className="text-label text-ink-3">{lookNote ?? `Template: ${imageTemplate?.name ?? "Full picture, words on top"}`}</span>
          {editOnceToggle}
        </>
      )}
      <div className="flex min-h-0 flex-1">
        <FitCanvas ratio={STILL_SIZE[imageSize].w / STILL_SIZE[imageSize].h} onClear={() => setSelected(null)}>
          {(width) => (
            <div className="relative overflow-hidden rounded-chip shadow-float">
              <Scaled w={STILL_SIZE[imageSize].w} h={STILL_SIZE[imageSize].h} width={width}>
                <AdStill size={imageSize} layout={imageLayout} copy={copy} palette={palette} brandName={brandName} adType={adType} edit={submitted ? still(imageSize) : editing(imageSize)} />
              </Scaled>
              {making(itemReady.image)}
            </div>
          )}
        </FitCanvas>
        {imageSizes.length > 1 && (
          <div className="w-56 shrink-0 space-y-3 overflow-y-auto border-l border-hair bg-canvas p-3">
            <div className="text-micro font-extrabold uppercase tracking-[0.12em] text-ink-4">{editOnce ? "Follows the master" : "Every size"}</div>
            <div className="flex flex-wrap items-end gap-3">
              {imageSizes.map((size) => {
                const box = STILL_SIZE[size];
                const ratio = box.w / box.h;
                const width = ratio > 2 ? 196 : ratio < 0.5 ? 40 : Math.round(ratio * 92);
                return (
                  <button key={size} type="button" onClick={() => { setImageSize(size); setSelected(null); }} className="group cursor-pointer text-left">
                    <span className={cn("block overflow-hidden rounded-glyph border transition", size === imageSize ? "border-brand ring-2 ring-brand/20" : "border-hair group-hover:border-hair-3")}>
                      <Scaled w={box.w} h={box.h} width={width}>
                        <AdStill size={size} layout={imageLayout} copy={copy} palette={palette} brandName={brandName} adType={adType} prefix={`side:${size}`} edit={still(size)} />
                      </Scaled>
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-micro font-bold text-ink-3">
                      {size}
                      {editedSizes.has(size) && <span className="size-1.5 rounded-full bg-brand" title="Edited in this size" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );

  const card = cards[cardIndex] ?? cards[0];
  const stepCard = (step: number) => {
    setCardIndex((i) => (i + step + cards.length) % cards.length);
    setSelected(null);
  };
  const carouselCanvas = hasCarousel && card && (
    <>
      {canvasBar(
        <>
          <span className="text-label font-bold text-ink">
            Card {cardIndex + 1} of {cards.length} · {card.role}
          </span>
          <span className="text-label text-ink-3">{lookNote ?? `Template: ${carouselTemplate?.name ?? "Picture, then words"}`}</span>
          <label className="ml-auto inline-flex shrink-0 items-center gap-2 text-label font-bold text-ink-2">
            <Toggle checked={sameLook} onChange={setSameLook} label="Same look on every card" />
            Same look on every card
          </label>
        </>
      )}
      <div className="relative flex min-h-0 flex-1 flex-col" onClick={() => setSelected(null)}>
        <div className="flex min-h-0 flex-1 items-stretch justify-center gap-5 px-6 pt-6">
          <CardArrow dir="prev" onClick={() => stepCard(-1)} />
          <FitCanvas ratio={1} onClear={() => setSelected(null)} className="max-w-[560px] p-0">
            {(width) => (
              <div className="relative overflow-hidden rounded-chip shadow-float">
                <Scaled w={CARD_SIZE.w} h={CARD_SIZE.h} width={width}>
                  <AdCard card={card} index={cardIndex} layout={carouselLayout} palette={palette} brandName={brandName} adType={adType} riskLine={copy.riskLine} safetyText={safetyText} number={number} edit={submitted ? still() : editing()} />
                </Scaled>
                {making(itemReady.carousel)}
              </div>
            )}
          </FitCanvas>
          <CardArrow dir="next" onClick={() => stepCard(1)} />
        </div>
        <div className="flex shrink-0 justify-center gap-1.5 py-4" aria-label={`Card ${cardIndex + 1} of ${cards.length}`}>
          {cards.map((_, i) => (
            <span key={i} className={cn("size-2 rounded-full", i === cardIndex ? "bg-brand" : "bg-hair-3")} />
          ))}
        </div>
      </div>
    </>
  );

  const main = (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#eef1ed]">
      {focus === "all" ? overview : focus === "video" ? videoCanvas : focus === "image" ? imageCanvas : carouselCanvas}
    </section>
  );

  const toolbar =
    focus === "all" || submitted ? (
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-hair bg-card px-4">
        <span className="text-label font-bold text-ink">{submitted ? "In MLR review" : "All ads"}</span>
        <span className="text-label text-ink-3">
          {submitted
            ? "Locked while the review runs. Comments from reviewers come back here."
            : `${adCount} ${adCount === 1 ? "ad" : "ads"} in ${sizeCount} sizes · ${allReady ? "all ready" : `${readyCount} of ${outputs.length} ready`} · open one to edit it`}
        </span>
      </div>
    ) : (
      <EditorToolbar
        selection={toolbarSelection}
        menus={["text", "image"]}
        onInsert={(menu, option) => {
          const where = focus === "video" ? `Scene ${scene?.number}` : focus === "image" ? "the image ad" : `card ${cardIndex + 1}`;
          handToChat(
            { id: `insert-${menu}-${option}`, label: `Insert ${option.toLowerCase()}`, detail: `In ${where}` },
            `Add ${option.toLowerCase()} to ${where} `
          );
          showToast(`${option} added to chat`);
        }}
      />
    );

  /* ── The panel: chat and claims ── */
  const panel = (
    <>
      <div className="border-b border-hair bg-subtle p-2.5">
        <div className={cn(INSPECTOR_TAB_STRIP, "bg-[#e6ebe6] shadow-inner-xs")}>
          <InspectorTabButton tab="assistant" current={panelTab} onClick={setPanelTab} icon={MessageCircle} badge={<span className="size-1.5 shrink-0 rounded-full bg-ok" />}>
            Chat
          </InspectorTabButton>
          <InspectorTabButton tab="evidence" current={panelTab} onClick={setPanelTab} icon={ShieldCheck} count={allClaims.length}>
            Claims
          </InspectorTabButton>
        </div>
      </div>

      {panelTab === "assistant" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-hair bg-tint px-3.5 py-2 text-label font-bold text-brand-deep">
            <MessageSquare className="size-3.5 shrink-0" />
            <span className="truncate">{scopeLabel}</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={cn("flex max-w-full gap-2.5", msg.role === "user" ? "ml-auto justify-end" : "mr-auto")}>
                {msg.role === "swishx" && (
                  <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand text-caption font-bold text-white shadow-2xs">SX</div>
                )}
                <div className="max-w-[85%] space-y-2">
                  <div className={cn("rounded-panel p-3 text-body leading-relaxed", msg.role === "user" ? "rounded-tr-xs bg-brand text-white" : "rounded-tl-xs border border-hair bg-subtle text-ink")}>
                    <FormattedMessageText text={msg.text} />
                    <ChatChips chips={msg.chips} onPick={(chip) => handleSendChat(chip)} />
                  </div>
                  {msg.role === "swishx" && idx === chatMessages.length - 1 && !submitted && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {chips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSendChat(chip)}
                          className="cursor-pointer rounded-chip border border-hair-2 bg-card px-2.5 py-1 text-label font-semibold text-ink-2 shadow-2xs transition hover:bg-tint hover:text-brand"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
          <div className="shrink-0 space-y-2 border-t border-hair bg-card p-3">
            <ChatComposer
              value={chatInput}
              onChange={setChatInput}
              onSubmit={() => handleSendChat()}
              disabled={submitted}
              placeholder={submitted ? "Locked while MLR reviews the ads" : reach ? `Ask SwishX or request a change (${reach})…` : "Ask SwishX or request a change…"}
              attachControl={<ComposerAttachButton onClick={chatFiles.open} label="Attach a file" />}
            >
              <ChatAttachmentRow attachments={chatFiles} />
              <ComposerTray
                items={chatContexts.map((c) => ({ id: c.id, icon: <MessageSquare className="size-3" />, label: c.label, detail: c.detail }))}
                onRemove={(id) => setChatContexts((prev) => prev.filter((c) => c.id !== id))}
              />
            </ChatComposer>
          </div>
        </div>
      ) : (
        <AdClaimsPanel
          claims={allClaims}
          inCampaign={campaign.claimIds}
          highlighted={selectedClaim?.id}
          usage={(claim) => [
            ...story.filter((sc) => sc.claim.startsWith(claim.id)).map((sc) => `Video · Scene ${sc.number}`),
            ...(hasImage && (imagePlan.headline === claim.text || imagePlan.support === claim.text) ? ["Image ad"] : []),
            ...(hasCarousel ? cards.flatMap((c, i) => (c.title === claim.text ? [`Card ${i + 1}`] : [])) : []),
          ]}
          onDossier={() => setDossier(dossierFor(brandName, moleculeFor(brandName)))}
        />
      )}
    </>
  );

  return (
    <WorkbenchLayout
      className="bg-[#edf0ed]"
      panelOpen={copilotPanelOpen}
      onPanelOpenChange={setCopilotPanelOpen}
      panelWidth={copilotPanelWidth}
      onPanelWidthChange={setCopilotPanelWidth}
      panelStorageKey="swishx.copilotPanelWidth"
      autoCollapsePanelBelow="laptop"
      panelMinCanvas={240 + 420}
      header={
        <ScreenHeader onClose={() => exit.requestExit()}>
          <SwishXMark compact />
          <div className="mx-3 h-5 w-px bg-hair" />
          <div className="min-w-0">
            <ProjectTitle kind="ad" fallback={title} className="text-body font-[800]" />
            <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
              Saved just now · {adCount} {adCount === 1 ? "ad" : "ads"} in {sizeCount} sizes
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ProjectMenu kind="ad" fallback={title} />
            <button
              type="button"
              onClick={toggleCopilotPanel}
              className={cn(
                "grid size-8 cursor-pointer place-items-center rounded-chip border transition-colors",
                copilotPanelOpen ? "border-hair-2 bg-black/5 text-ink hover:bg-black/10" : "border-hair-2 bg-card text-ink-3 shadow-2xs hover:border-brand hover:text-ink"
              )}
              title={copilotPanelOpen ? "Collapse sidebar (⌘\\)" : "Expand sidebar (⌘\\)"}
              aria-label="Toggle sidebar"
            >
              <PanelRight className="size-4" />
            </button>
            <VersionChip versions={DRAFT_ONLY} variant="button" />
            {submitted ? (
              <span className="inline-flex h-8 items-center gap-1.5 rounded-chip border border-info-line bg-info-bg px-3 text-label font-bold text-info">
                <Clapperboard className="size-3.5" />
                In MLR review
              </span>
            ) : (
              <Button
                size="sm"
                onClick={submitForMlr}
                disabled={!allReady}
                title={allReady ? undefined : `${outputs.length - readyCount} ${outputs.length - readyCount === 1 ? "ad is" : "ads are"} still being made`}
                className="gap-1.5 px-4 font-bold disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="size-3.5" />
                Submit for MLR
              </Button>
            )}
          </div>
        </ScreenHeader>
      }
      toolbar={toolbar}
      rail={rail}
      main={main}
      panel={panel}
      overlay={
        <>
          <Toast message={toastMessage} open={toastOpen} tone={toastTone} />
          {regenShot && scene && shot && (
            <RequestModal
              icon={RefreshCw}
              action="Regenerate"
              subject={`Scene ${scene.number} · Shot ${shotIndex + 1}`}
              previewBeside={videoShape === "9:16"}
              preview={
                <div className="overflow-hidden rounded-control">
                  <Scaled w={VIDEO_SIZE[videoShape].w} h={VIDEO_SIZE[videoShape].h} width={videoShape === "9:16" ? 180 : 440}>
                    <AdVideoFrame scene={scene} shape={videoShape} time={shot.startAt} brandName={brandName} adType={adType} logoCorner={logoCorner[videoShape]} prefix="regen" edit={still(videoShape)} />
                  </Scaled>
                </div>
              }
              current={shot.visualStory}
              currentLabel="What the shot shows now"
              label="What should change?"
              hint="Leave it empty for another take on the same shot. The narration and timing stay as they are."
              placeholder="e.g. a caregiver passing her the mug, warmer light"
              submitLabel="Regenerate video"
              onClose={() => setRegenShot(false)}
              onSubmit={(note) => {
                setRegenShot(false);
                showToast(`Regenerating Scene ${scene.number} · Shot ${shotIndex + 1}`);
                addChatMessage({
                  role: "swishx",
                  text: `Regenerating **Scene ${scene.number} · Shot ${shotIndex + 1}**${note.trim() ? `: ${note.trim()}` : ""}. The narration and timing stay as they are, and the new footage lands in ${editOnce ? sizeWords(videoShapes) : videoShape}.`,
                });
              }}
            />
          )}
          {regenPicture && (
            <RequestModal
              icon={RefreshCw}
              action="Regenerate"
              subject={regenPicture.startsWith("card:") ? `Card ${+regenPicture.split(".")[0].slice(5) + 1} · Picture` : "Image ad · Picture"}
              label="What should change?"
              hint="Leave it empty for another take on the same idea."
              placeholder="e.g. warmer light, the person looking toward the camera"
              submitLabel="Regenerate"
              onClose={() => setRegenPicture(null)}
              onSubmit={(note) => {
                const where = regenPicture.startsWith("card:") ? `card ${+regenPicture.split(".")[0].slice(5) + 1}` : "the image ad";
                setRegenPicture(null);
                showToast("Regenerating the picture");
                addChatMessage({
                  role: "swishx",
                  text: `Regenerating the picture on ${where}${note.trim() ? `: ${note.trim()}` : ""}. The words, the packshot and the safety band stay where they are.`,
                });
              }}
            />
          )}
          <DossierReaderModal dossier={dossier} onClose={() => setDossier(null)} />
          <SaveOrDiscardDialog
            open={!!exit.pending}
            destinationLabel={exit.pending?.label}
            onSaveDraft={() => exit.resolve(true)}
            onDiscard={() => exit.resolve(false)}
            onCancel={exit.cancel}
          />
        </>
      }
    />
  );
}

/* ── Pieces ── */

/** The canvas mat: centres a w:h frame at the largest size that fits. A click on the mat clears the selection. */
function FitCanvas({
  ratio,
  onClear,
  className,
  children,
}: {
  ratio: number;
  onClear: () => void;
  className?: string;
  children: (width: number) => ReactNode;
}) {
  const [ref, width] = useFitWidth(ratio);
  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 p-6", className)} onClick={onClear}>
      <div ref={ref} className="grid min-h-0 min-w-0 flex-1 place-items-center">
        {width > 0 && <div onClick={(e) => e.stopPropagation()}>{children(width)}</div>}
      </div>
    </div>
  );
}

/** The scene's own player, as in the video editor: one track, a cut at each shot. */
function PlayerBar({
  time,
  duration,
  playing,
  shots,
  label,
  onToggle,
  onSeek,
}: {
  time: number;
  duration: number;
  playing: boolean;
  shots: number[];
  label: string;
  onToggle: () => void;
  onSeek: (at: number) => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6">
      <div className="flex items-center gap-3 text-white">
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-md transition-transform hover:bg-brand-deep active:scale-95"
        >
          {playing ? <Pause className="size-3.5 fill-current" /> : <Play className="ml-0.5 size-3.5 fill-current" />}
        </button>
        <span className="shrink-0 font-mono text-label font-bold text-white/90">
          0:{Math.floor(time).toString().padStart(2, "0")} / 0:{duration}s
        </span>
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onSeek(+(((e.clientX - rect.left) / rect.width) * duration).toFixed(1));
          }}
          className="relative flex h-3 flex-1 cursor-pointer items-center overflow-hidden rounded-full bg-white/20"
        >
          <div style={{ width: `${(time / (duration || 1)) * 100}%` }} className="h-full rounded-full bg-brand transition-all duration-75" />
          {shots.slice(1).map((at) => (
            <span key={at} aria-hidden style={{ left: `${(at / (duration || 1)) * 100}%` }} className="pointer-events-none absolute inset-y-0 w-px bg-black/45" />
          ))}
        </div>
        <span className="hidden shrink-0 text-caption font-bold text-white/60 sm:inline">{label}</span>
      </div>
    </div>
  );
}

function CardArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous card" : "Next card"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="grid size-10 shrink-0 cursor-pointer place-items-center self-center rounded-full border border-hair-2 bg-card text-ink-2 shadow-soft transition hover:border-brand hover:text-brand"
    >
      <Icon className="size-5" />
    </button>
  );
}

function OverviewGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-micro font-extrabold uppercase tracking-[0.12em] text-ink-4">{title}</h3>
      <div className="flex flex-wrap items-end gap-5">{children}</div>
    </section>
  );
}

function OverviewTile({ label, sub, edited, onOpen, children }: { label: string; sub: string; edited?: boolean; onOpen: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onOpen} className="group flex cursor-pointer flex-col gap-1.5 text-left">
      <span className="relative block overflow-hidden rounded-chip border border-hair bg-card shadow-soft transition group-hover:border-brand group-hover:shadow-float">{children}</span>
      <span className="flex max-w-60 items-center gap-1.5">
        <span className="text-label font-bold text-ink">{label}</span>
        {edited && <span className="size-1.5 rounded-full bg-brand" title="Edited in this size" />}
        <span className="truncate text-caption text-ink-3">{sub}</span>
      </span>
    </button>
  );
}

/**
 * The campaign's approved claims, the way the other editors show theirs:
 * which ones this campaign uses, where, and the dossier each comes from.
 */
function AdClaimsPanel({
  claims,
  inCampaign,
  highlighted,
  usage,
  onDossier,
}: {
  claims: AdClaim[];
  inCampaign: string[];
  highlighted?: string;
  usage: (claim: AdClaim) => string[];
  onDossier: () => void;
}) {
  const ordered = [...claims].sort((a, b) => Number(inCampaign.includes(b.id)) - Number(inCampaign.includes(a.id)));
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      <div className="flex items-center justify-between border-b border-hair pb-2.5">
        <div>
          <div className="text-micro font-extrabold uppercase tracking-[0.12em] text-ink-3">Compliance grounding</div>
          <h2 className="mt-0.5 text-body-lg font-[800] text-ink">
            {claims.length} approved {claims.length === 1 ? "claim" : "claims"}
          </h2>
        </div>
        <span className="rounded-chip border border-ok-line bg-ok-bg px-2.5 py-0.5 text-micro font-bold text-ok">✓ PromoMats verified</span>
      </div>
      {claims.length === 0 && (
        <p className="text-body text-ink-3">This campaign is unbranded, so it makes no product claims. Its words come from the disease-awareness statements in the dossier.</p>
      )}
      <div className="space-y-2.5">
        {ordered.map((claim) => {
          const used = usage(claim);
          const chosen = inCampaign.includes(claim.id);
          return (
            <div
              key={claim.id}
              className={cn(
                "group rounded-control border p-3 transition-all duration-300",
                highlighted === claim.id ? "border-brand bg-tint shadow-sm ring-2 ring-brand/25" : "border-hair bg-canvas hover:border-brand/20"
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="rounded-glyph bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep">{claim.id}</span>
                <span className={cn("text-caption font-bold", chosen ? "text-ok" : "text-ink-4")}>{chosen ? "✓ In this campaign" : "Approved · not used"}</span>
              </div>
              <h4 className="text-body font-bold text-ink">{claim.text}</h4>
              <p className="mt-1 text-caption text-ink-3">{claim.source}{claim.short ? " · short enough for the smallest banner" : ""}</p>
              {chosen && (
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {used.length ? (
                    used.map((u) => (
                      <span key={u} className="rounded-glyph border border-hair-2 bg-card px-1.5 py-0.5 text-micro font-bold text-ink-2">
                        {u}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-glyph border border-dashed border-hair-2 px-1.5 py-0.5 text-micro font-semibold text-ink-4">Not placed yet</span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={onDossier}
                className={cn(
                  "focus-ring mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-glyph px-1.5 py-1 text-caption font-bold transition",
                  highlighted === claim.id ? "text-brand-deep hover:bg-white/60" : "text-ink-4 hover:bg-tint hover:text-brand-deep group-hover:text-ink-3"
                )}
              >
                <BookOpen className="size-3" />
                See in dossier
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

