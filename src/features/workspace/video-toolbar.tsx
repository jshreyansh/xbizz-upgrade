"use client";

import {
  Atom,
  BadgeCheck,
  Captions,
  CaptionsOff,
  ChartColumn,
  Check,
  Film,
  Image as ImageIcon,
  Mic2,
  RefreshCw,
  Replace,
  Sparkles,
  Stamp,
  Tag,
  Type,
  UserRound,
  Wallpaper,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ToolButton, ToolMenu, ToolNote, textOptions, toolbarDivider, type ToolbarItem, type ToolbarSelection } from "@/features/workspace/editor-toolbar";
import type { TextStyle } from "@/features/workspace/canvas-text-toolbar";
import { CAPTION_STYLES, captionLabel, type CaptionStyle } from "@/features/workspace/subtitle-sync";
import { LOGO_CORNERS } from "@/features/workspace/logo-watermark";
import type { LogoMark } from "@/types/content";

/**
 * The captions choice, in the video's toolbar while nothing is selected and
 * again when the captions themselves are. A style, or off — the words are the
 * voiceover's, so there is nothing else here to change.
 */
export function CaptionsMenu({ value, onChange }: { value: CaptionStyle; onChange: (style: CaptionStyle) => void }) {
  const Icon = value === "off" ? CaptionsOff : Captions;
  return (
    <ToolMenu
      label="Captions"
      trigger={
        <span className="inline-flex items-center gap-1.5">
          <Icon className="size-3.5" />
          Captions: {captionLabel(value)}
        </span>
      }
    >
      {(close) => (
        <div className="grid w-72 gap-0.5">
          {CAPTION_STYLES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={value === c.id}
              onClick={() => {
                onChange(c.id);
                close();
              }}
              className={cn("focus-ring flex cursor-pointer items-center gap-2.5 rounded-chip p-1.5 text-left transition", value === c.id ? "bg-tint" : "hover:bg-subtle")}
            >
              {/* A sample of the style, on a frame-dark ground. */}
              <span className="grid h-9 w-16 shrink-0 place-items-end justify-center overflow-hidden rounded-chip bg-ink pb-1">
                <span
                  className={cn(
                    "rounded-glyph px-1 leading-tight text-card",
                    c.id === "standard" && "bg-black/55 text-micro font-medium",
                    c.id === "clean" && "text-micro font-semibold drop-shadow-md",
                    c.id === "large" && "bg-black/55 text-caption font-bold"
                  )}
                >
                  {c.id === "large" ? "Aa words" : "the words"}
                </span>
              </span>
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="text-body font-semibold text-ink">{c.label}</span>
                <span className="text-caption text-ink-3">{c.hint}</span>
              </span>
              {value === c.id && <Check className="size-3.5 shrink-0 text-brand" />}
            </button>
          ))}
          <span className="my-1 h-px bg-hair" />
          <button
            type="button"
            aria-pressed={value === "off"}
            onClick={() => {
              onChange("off");
              close();
            }}
            className={cn("focus-ring flex cursor-pointer items-start gap-2.5 rounded-chip p-1.5 text-left transition", value === "off" ? "bg-tint" : "hover:bg-subtle")}
          >
            <CaptionsOff className="mt-0.5 size-4 shrink-0 text-ink-3" />
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span className="text-body font-semibold text-ink">No captions</span>
              <span className="text-caption text-ink-3">People watching with the sound off won&apos;t hear the claims.</span>
            </span>
            {value === "off" && <Check className="size-3.5 shrink-0 text-brand" />}
          </button>
        </div>
      )}
    </ToolMenu>
  );
}

const PART: Record<string, { name: string; icon: LucideIcon }> = {
  headline: { name: "Headline", icon: Type },
  tag: { name: "Tag", icon: Tag },
  narration: { name: "Captions", icon: Captions },
  image: { name: "Image", icon: ImageIcon },
  "video-clip": { name: "Video clip", icon: Film },
  "bg-video": { name: "Background footage", icon: Film },
  moa: { name: "3D model", icon: Atom },
  graph: { name: "Chart", icon: ChartColumn },
  background: { name: "Background", icon: Wallpaper },
  avatar: { name: "Presenter", icon: UserRound },
  logo: { name: "Logo", icon: Stamp },
  claim: { name: "Claim badge", icon: BadgeCheck },
};

/**
 * What the toolbar offers for the part of the frame that is selected — the
 * Docs editor's toolbar, with what a video can't use left out. Anything that
 * needs SwishX to redraw goes to the chat with the part attached, the way the
 * Ads editor does it; the brand mark and the claim are locked.
 */
export function videoSelection({
  elementId,
  sceneId,
  sceneNumber,
  captions,
  onCaptions,
  textStyle,
  onTextStyle,
  logo,
  onLogo,
  shotReady,
  onRegenerateVideo,
  ask,
  onAddToChat,
}: {
  elementId: string;
  sceneId: string;
  sceneNumber: number;
  captions: CaptionStyle;
  onCaptions: (style: CaptionStyle) => void;
  textStyle: TextStyle | undefined;
  onTextStyle: (patch: Partial<TextStyle>) => void;
  logo: LogoMark;
  onLogo: (position: LogoMark["position"]) => void;
  /** Whether the footage under the playhead has finished rendering. */
  shotReady: boolean;
  onRegenerateVideo: () => void;
  /** Hand this part to the chat with a request started. */
  ask: (prompt: string) => void;
  onAddToChat: () => void;
}): ToolbarSelection {
  const part = PART[elementId] ?? { name: "Element", icon: Sparkles };
  const text = (label: string, baseSize: number, baseWeight: number) =>
    textOptions({ element: { id: elementId, blockId: sceneId, label, baseSize, baseWeight }, style: textStyle, onStyle: onTextStyle });

  let items: ToolbarItem[];
  switch (elementId) {
    case "headline":
      items = [...text("Headline", 30, 850), { key: "rewrite", node: <ToolButton icon={Sparkles} label="Rewrite" onClick={() => ask("Rewrite the headline so that ")} /> }];
      break;
    case "tag":
      items = text("Tag", 12, 800);
      break;
    case "narration":
      items = [
        { key: "captions", node: <CaptionsMenu value={captions} onChange={onCaptions} /> },
        toolbarDivider("d1"),
        { key: "words", node: <ToolNote icon={Check} tone="ok">Words follow the voiceover</ToolNote> },
        { key: "voiceover", node: <ToolButton icon={Mic2} label="Edit voiceover" onClick={() => ask("Change the voiceover so that ")} /> },
      ];
      break;
    case "image":
      items = [
        { key: "replace", node: <ToolButton icon={Replace} label="Replace" onClick={() => ask("Replace this image with ")} /> },
        { key: "regenerate", node: <ToolButton icon={RefreshCw} label="Regenerate image" onClick={() => ask("Regenerate this image so that ")} /> },
      ];
      break;
    case "video-clip":
    case "bg-video":
      items = [
        { key: "replace", node: <ToolButton icon={Replace} label="Replace" onClick={() => ask("Replace this footage with ")} /> },
        {
          key: "regenerate",
          node: <ToolButton icon={RefreshCw} label="Regenerate video" onClick={onRegenerateVideo} disabled={!shotReady} title={shotReady ? undefined : "Being made"} />,
        },
      ];
      break;
    case "moa":
      items = [{ key: "regenerate", node: <ToolButton icon={RefreshCw} label="Regenerate model" onClick={() => ask("Redraw the 3D model so that ")} /> }];
      break;
    case "graph":
      items = [{ key: "chart", node: <ToolButton icon={ChartColumn} label="Change the chart" onClick={() => ask("Change the chart so that ")} /> }];
      break;
    case "background":
      items = [{ key: "background", node: <ToolButton icon={Wallpaper} label="Change background" onClick={() => ask("Change the background to ")} /> }];
      break;
    case "avatar":
      items = [
        { key: "presenter", node: <ToolButton icon={UserRound} label="Change presenter" onClick={() => ask("Use a different presenter: ")} /> },
        { key: "voice", node: <ToolButton icon={Mic2} label="Change voice" onClick={() => ask("Change the presenter's voice to ")} /> },
      ];
      break;
    case "logo":
      items = [
        {
          key: "position",
          node: (
            <ToolMenu label="Logo position" trigger={<span>{LOGO_CORNERS.find((c) => c.id === logo.position)?.label ?? "Bottom right"}</span>}>
              {(close) => (
                <div className="grid w-60 gap-0.5">
                  {LOGO_CORNERS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={logo.position === c.id}
                      onClick={() => {
                        onLogo(c.id);
                        close();
                      }}
                      className={cn("focus-ring grid cursor-pointer gap-0.5 rounded-chip px-2.5 py-1.5 text-left transition", logo.position === c.id ? "bg-tint" : "hover:bg-subtle")}
                    >
                      <span className="text-body font-semibold text-ink">{c.label}</span>
                      <span className="text-caption text-ink-3">{c.hint}</span>
                    </button>
                  ))}
                </div>
              )}
            </ToolMenu>
          ),
        },
        { key: "kit", node: <ToolNote icon={Stamp} tone="ok">From the brand kit · every scene</ToolNote> },
      ];
      break;
    case "claim":
      items = [
        { key: "approved", node: <ToolNote icon={BadgeCheck} tone="ok">Approved claim · Claims Library</ToolNote> },
        { key: "swap", node: <ToolButton icon={RefreshCw} label="Swap claim" onClick={() => ask("Use a different approved claim here: ")} /> },
      ];
      break;
    default:
      items = [];
  }

  return { id: `${sceneId}:${elementId}`, icon: part.icon, name: part.name, path: `Scene ${sceneNumber} › ${part.name}`, items, onAddToChat };
}
