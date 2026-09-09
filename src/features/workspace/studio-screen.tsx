"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Expand,
  FileCheck2,
  FileText,
  Film,
  History,
  Image as ImageIcon,
  Layers,
  LayoutPanelTop,
  Maximize2,
  MessageSquare,
  MessageSquarePlus,
  Mic2,
  MoreHorizontal,
  Move,
  Music2,
  Package,
  PanelRight,
  PanelRightClose,
  PanelRightOpen,
  Paperclip,
  Pause,
  Pencil,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  ScanLine,
  Send,
  Share2,
  Sliders,
  SlidersHorizontal,
  Tag,
  Timer,
  Type,
  Undo2,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { scenes } from "@/features/workspace/mock-data";
import {
  DynamicSceneComposition,
  MasterVideoSequenceComposition,
} from "@/features/workspace/video-composition";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { ShareReviewModal } from "@/features/workspace/share-review-modal";
import { cn } from "@/lib/cn";
import type { EvidenceState, InspectorTab, Scene } from "@/types/content";
import { ScriptSceneCard } from "@/features/workspace/script-scene-card";
import { APPROVED_CLAIMS, citationsFor } from "@/features/workspace/script-claims";
import { CommentsModal, ElementActionBar, ELEMENT_LABELS, type SceneComment } from "@/features/workspace/scene-comments";
import { ReviewComments } from "@/features/workspace/review-comments";
import { AudioGeneratingPill, MediaPlaceholder } from "@/features/workspace/media-placeholder";
import { elementMotion, motionTransition } from "@/features/workspace/element-motion";
import { ShotCards } from "@/features/workspace/shot-cards";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { LogoMark } from "@/components/ui/logo-mark";
import { ActionBar } from "@/components/patterns/action-bar";
import { WorkbenchLayout } from "@/components/patterns/workbench-layout";
import { PreflightPanel } from "@/features/workspace/preflight-panel";

const evidenceConfig: Record<EvidenceState, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-[#e5f1e9] text-[#2d6749]" },
  supported: { label: "Supported", className: "bg-[#e8eef6] text-[#45617e]" },
  changed: { label: "Changed", className: "bg-warn-bg text-warn" },
  unsupported: { label: "Unsupported", className: "bg-[#danger-soft] text-danger" },
};

const dossierNames: Record<string, string> = {
  velmora: "Velmora",
  onkavia: "Onkavia",
  nirvexa: "Nirvexa",
  cardioxa: "Cardioxa",
  pulmovax: "PulmoVax",
};

/**
 * Which later beats a change to one beat invalidates. Narration is not a list
 * of independent lines: rewrite the burden in the intro and the evidence and
 * dosing beats that reference it no longer follow. Editing one scene therefore
 * pulls its dependents in rather than leaving the script quietly inconsistent.
 */
/** What a rewritten beat gains. Enough to see the line actually changed. */
const REWRITE_CLAUSE_BY_TAG: Record<string, string> = {
  "Intro":         " Daily function and quality of life are affected alongside the visible signs.",
  "Clinical Need": " Many patients remain inadequately controlled on current therapy.",
  "Mechanism":     " Selective binding keeps activity to the intended pathway.",
  "Evidence":      " The primary endpoint was met at week 24 in the pivotal trial.",
  "Dosing":        " Once-daily dosing requires no titration.",
  "Safety":        " The adverse event profile was consistent with the approved label.",
  "Outro":         " Full prescribing information is available in the approved label.",
};

const TAG_DEPENDENTS: Record<string, string[]> = {
  "Intro":         ["Evidence", "Dosing"],
  "Clinical Need": ["Evidence", "Dosing"],
  "Mechanism":     ["Evidence"],
  "Evidence":      ["Outro"],
  "Dosing":        ["Safety", "Outro"],
  "Safety":        ["Outro"],
  "Outro":         [],
};

function FormattedMessageText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
}

export function StudioScreen() {
  const {
    selectedSceneId,
    setSelectedSceneId,
    inspectorTab,
    setInspectorTab,
    setView,
    setVideoSubStage,
    creationMode,
    sourcePayload,
    copilotPanelOpen,
    copilotPanelWidth,
    copilotPanelResizing,
    setCopilotPanelWidth,
    setCopilotPanelResizing,
    setCopilotPanelOpen,
    toggleCopilotPanel,
  } = useWorkspaceStore();

  const [studioMode, setStudioMode] = useState<"scenes" | "editor" | "generating" | "review">("scenes");
  const [activeTab, setActiveTab] = useState<"assistant" | "edit" | "comments" | "evidence">("assistant");

  const [generateVideoModalOpen, setGenerateVideoModalOpen] = useState(false);
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [relatedOpen, setRelatedOpen] = useState(false);
  const [addSceneModalOpen, setAddSceneModalOpen] = useState(false);
  const selectedQuality = useWorkspaceStore((s) => s.selectedQuality);

  // Keyboard shortcut: ⌘\ or Ctrl+\ to toggle right panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleCopilotPanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCopilotPanel]);

  // In Script Stage (studioMode === "scenes"), edit tab should not be available
  useEffect(() => {
    if (studioMode === "scenes" && activeTab === "edit") {
      setActiveTab("assistant");
    }
  }, [studioMode, activeTab]);

  /**
   * How far each scene has been generated.
   *
   *   0  nothing yet — a skeleton in the rail, not openable
   *   1  STRUCTURE: text, layout, transitions, subtitle/voiceover are real.
   *      Editing unlocks here. Media renders as a placeholder that already
   *      holds its position, its in/out timing and its transition.
   *   2  MEDIA: background, image and video have arrived.
   *
   * Keyed by scene rather than a flat "generated" list, because the old model
   * finished one scene entirely before starting the next — so scene 5 was
   * untouchable for twenty seconds while scene 1 was already idle.
   */
  const [scenePhase, setScenePhase] = useState<Record<string, 0 | 1 | 2>>({});

  const [toastMessage, setToMessage] = useState<string | null>(null);

  const [sceneList, setSceneList] = useState<Scene[]>(() =>
    // Every line of an approved script IS grounded — the badges are not a
    // reward for having edited it. Seeded here rather than in an effect so
    // the first paint already shows them.
    scenes.map((sc) => ({
      ...sc,
      citations: sc.citations ?? citationsFor(sc.narrativeTag ?? "Evidence", sc.narration),
    }))
  );
  const isScriptComplete = sceneList.length > 0 && sceneList.every((s) => s.narration && s.narration.trim().length > 0);

  const [directorInput, setDirectorInput] = useState("");
  const chatMessages = useWorkspaceStore((s) => s.chatMessages);
  const setChatMessages = useWorkspaceStore((s) => s.setChatMessages);
  const addChatMessage = useWorkspaceStore((s) => s.addChatMessage);
  const studioChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessages.length === 0) {
      const bName = dossierNames[sourcePayload?.dossierId || "velmora"] || "Velmora";
      setChatMessages([
        { role: "user", text: `Create a concise ${bName} HCP launch video explaining clinical need, mechanism, and pivotal risk reduction.` },
        { role: "swishx", text: `I've structured a 5-scene video plan grounded in the **${bName}** dossier and approved claims.` },
        { role: "user", text: "Confirm plan & build script" },
        { role: "swishx", text: `Script & storyboard scenes generated for **${bName}**! You can review or edit script narration in-place on the left canvas, or chat with me to make adjustments.` },
      ]);
    }
  }, [chatMessages.length, sourcePayload?.dossierId, setChatMessages]);

  useEffect(() => {
    studioChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const [timelineOpen, setTimelineOpen] = useState(false);

  const selectedScene = useMemo(
    () => sceneList.find((scene) => scene.id === selectedSceneId) ?? sceneList[0] ?? scenes[0],
    [sceneList, selectedSceneId]
  );
  /**
   * A scene's real in/out and transition for one element. Returns undefined
   * rather than inventing numbers — a placeholder with guessed timing would
   * move the frame when the asset arrived, and the placeholder exists
   * precisely so that cannot happen.
   */
  const timingFor = (scene: Scene, elementId: string) =>
    scene.timings?.find((entry) => entry.elementId === elementId);


  const phaseOf = (sceneId: string) => scenePhase[sceneId] ?? 0;
  /**
   * Editing opens when every scene has its structure, not when everything has
   * finished. Waiting for the media would keep the user idle through the slow
   * half for no reason — nothing they can do at that point moves a pixel of it.
   */
  const structureReady = sceneList.length > 0 && sceneList.every((sc) => phaseOf(sc.id) >= 1);
  const selectedScenePhase = phaseOf(selectedScene.id);

  const isScenes = studioMode === "scenes";
  const isEditor = studioMode === "editor";
  const isGenerating = studioMode === "generating";
  const isReview = studioMode === "review";

  const brandName = dossierNames[sourcePayload?.dossierId || "velmora"] || "Velmora";
  const projectTitle = `${brandName} HCP launch`;

  const totalDurationSeconds = useMemo(
    () => sceneList.reduce((acc, sc) => acc + (sc.duration || 10), 0),
    [sceneList]
  );

  const chapters = useMemo(() => {
    let accumulated = 0;
    return sceneList.map((sc) => {
      const start = accumulated;
      const duration = sc.duration || 10;
      accumulated += duration;
      const end = accumulated;
      return {
        ...sc,
        start,
        end,
        duration,
      };
    });
  }, [sceneList]);

  const [scenePlaying, setScenePlaying] = useState(false);
  const [sceneCurrentTime, setSceneCurrentTime] = useState(2.4);
  /**
   * The in/out motion for the two media slots, shared by the generating
   * placeholder and the finished asset. One slot, two renderings — so the
   * transition the placeholder shows is the transition the asset performs.
   */
  const motionImage = elementMotion(timingFor(selectedScene, "image"), sceneCurrentTime);
  const motionVideoClip = elementMotion(timingFor(selectedScene, "video-clip"), sceneCurrentTime);
  // The text follows the timeline too: the headline leaves when its window
  // closes rather than sitting over the whole scene, which is what made the
  // declared timings decorative for everything except the media.
  const motionHeadline = elementMotion(timingFor(selectedScene, "headline"), sceneCurrentTime);
  const motionNarration = elementMotion(timingFor(selectedScene, "narration"), sceneCurrentTime);
  const canvasVideoRef = useRef<HTMLVideoElement | null>(null);

  // Sync canvas video element playback with scenePlaying
  useEffect(() => {
    if (!canvasVideoRef.current) return;
    if (scenePlaying) {
      canvasVideoRef.current.play().catch(() => {});
    } else {
      canvasVideoRef.current.pause();
    }
  }, [scenePlaying]);

  // Sync canvas video element currentTime with scene scrubber
  useEffect(() => {
    if (!canvasVideoRef.current) return;
    if (Math.abs(canvasVideoRef.current.currentTime - sceneCurrentTime) > 0.35) {
      try {
        canvasVideoRef.current.currentTime = sceneCurrentTime;
      } catch {}
    }
  }, [sceneCurrentTime]);

  // Reset video and pause state when switching scenes
  useEffect(() => {
    setScenePlaying(false);
    setSceneCurrentTime(0);
    if (canvasVideoRef.current) {
      canvasVideoRef.current.pause();
      try {
        canvasVideoRef.current.currentTime = 0;
      } catch {}
    }
  }, [selectedScene.id]);
  const [selectedCanvasElementId, setSelectedCanvasElementId] = useState<string | null>("headline");
  const [hoveredCanvasElementId, setHoveredCanvasElementId] = useState<string | null>(null);

  interface AttachedChatContext {
    id: string;
    type: "element" | "scene" | "file" | "dossier";
    label: string;
    detail?: string;
  }

  const [attachedContexts, setAttachedContexts] = useState<AttachedChatContext[]>([]);
  /** Cards whose narration is unlocked. Read-only is the default. */
  const [editingSceneIds, setEditingSceneIds] = useState<string[]>([]);
  /** Cards being rewritten right now. Drives the shimmer. */
  const [pendingSceneIds, setPendingSceneIds] = useState<string[]>([]);
  /**
   * The credit story, which is a budget against an actual — not one number.
   *
   * The modal used to say "2,500 Credits deducted", which is the BUDGET agreed
   * at the start. By the time you reach it you have already spent credits
   * generating partials and re-running scenes, and the final render costs more
   * on top. Three different numbers were being shown as one, so the only
   * figure a user could act on — how much more this will cost — was missing.
   */
  const [creditsUsed, setCreditsUsed] = useState(0);
  const creditBudget = selectedQuality === "cinematic" ? 7500 : 2500;
  /** What the final render costs on top of what has already been spent. */
  const finalRenderCost = selectedQuality === "cinematic" ? 3000 : 1000;
  const creditsOverBudget = Math.max(0, creditsUsed - creditBudget);
  const creditsTotal = creditsUsed + finalRenderCost;
  const teamBalance = 50000;

  /** The claim a citation's Details action jumped to. Clears itself after 2s. */
  const [highlightedClaimId, setHighlightedClaimId] = useState<string | null>(null);

  const [comments, setComments] = useState<SceneComment[]>([]);
  /** Monotonic ids without reading the clock during render. */
  const commentSeq = useRef(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  /**
   * Where the last canvas click landed, so the element actions appear next to
   * the thing they act on. Captured from the click rather than measured per
   * element — eight elements would otherwise each need their own anchor.
   */
  const [elementMenuAt, setElementMenuAt] = useState<{ x: number; y: number } | null>(null);
  /** Team comments only exist after a version has been published. */
  const [teamCommentsUnlocked, setTeamCommentsUnlocked] = useState(false);

  /**
   * Where the element actions should appear.
   *
   * A React listener on any ancestor cannot work: handlePointerDownElement
   * calls stopPropagation as its first statement (it has to, or the stage's
   * click-to-deselect fights the drag), so no ancestor ever sees an element's
   * pointerdown. A native listener on the document in the CAPTURE phase runs
   * before any of that and cannot be stopped by it — one listener, all eight
   * elements, no per-element wiring.
   */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      // Clicking inside the actions themselves must not move them.
      if (target?.closest("[data-element-actions]")) return;
      // Only a click on the canvas stage opens element actions. Without this
      // the listener is document-wide and selectedCanvasElementId defaults to
      // "headline", so the actions popped up on any click on any screen —
      // including the script view, which has no canvas at all.
      if (!target?.closest("[data-canvas-stage]")) {
        setElementMenuAt(null);
        setSelectedCanvasElementId(null);
        return;
      }
      setElementMenuAt({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, []);

  const openComments = comments.filter((c) => c.status === "open");

  const addComment = (elementId: string, text: string, alsoSendToChat: boolean) => {
    const comment: SceneComment = {
      id: `cm-${(commentSeq.current += 1)}`,
      sceneId: selectedScene.id,
      sceneNumber: selectedScene.number,
      elementId,
      elementLabel: ELEMENT_LABELS[elementId] ?? "Element",
      text,
      author: "You",
      source: "mine",
      at: "Just now",
      status: "open",
      sentToChat: alsoSendToChat,
    };
    setComments((prev) => [comment, ...prev]);
    if (alsoSendToChat) sendCommentToAgent(comment);
  };

  /**
   * Handing a comment to the agent. The agent then closes it itself: resolved
   * when it acted, rejected when the note is too thin to act on — and a
   * rejection carries its reason, or it is indistinguishable from being
   * ignored.
   */
  const sendCommentToAgent = (comment: SceneComment) => {
    setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, sentToChat: true } : c)));
    addChatMessage({
      role: "user",
      text: `[Scene ${comment.sceneNumber} · ${comment.elementLabel}] ${comment.text}`,
    });

    const actionable = comment.text.trim().split(/\s+/).filter(Boolean).length >= 3;
    setTimeout(() => {
      if (actionable) {
        addChatMessage({
          role: "swishx",
          text: `Done — applied that to **Scene ${comment.sceneNumber} · ${comment.elementLabel}** and marked the comment resolved. It stays in the list with my name against it, so you can check what I changed.`,
        });
        setComments((prev) =>
          prev.map((c) =>
            c.id === comment.id
              ? {
                  ...c,
                  status: "resolved" as const,
                  closedBy: "agent" as const,
                  // The agent writes its own note, for the same reason the
                  // owner has to: whoever raised it may only see the link.
                  closedReason: `Applied to Scene ${comment.sceneNumber} · ${comment.elementLabel}.`,
                }
              : c
          )
        );
      } else {
        addChatMessage({
          role: "swishx",
          text: `I can't act on **Scene ${comment.sceneNumber} · ${comment.elementLabel}** from that — it doesn't say what should change. I've marked it rejected rather than guess; reopen it with more detail and I'll take another run.`,
        });
        setComments((prev) =>
          prev.map((c) =>
            c.id === comment.id
              ? { ...c, status: "rejected" as const, closedBy: "agent" as const, closedReason: "SwishX could not tell what should change from this note." }
              : c
          )
        );
      }
    }, 1500);
  };

  const closeComment = (id: string, status: "resolved" | "rejected", reason: string) =>
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              closedBy: "user" as const,
              // The note the modal collected. Required for a team comment,
              // because the reviewer who wrote it sees only the shared link.
              closedReason: reason || undefined,
            }
          : c
      )
    );

  const jumpToComment = (comment: SceneComment) => {
    setCommentsOpen(false);
    setSelectedSceneId(comment.sceneId);
    setSelectedCanvasElementId(comment.elementId);
  };

  /**
   * The chat's scene scope lives in attachedContexts, so the canvas ticks and
   * the chat's attach menu are two views of ONE list. Selecting a card in the
   * canvas shows a chip in the chat, and attaching Scene 4 from the chat ticks
   * the card — without a second piece of state that can disagree.
   */
  const scopedSceneIds = attachedContexts
    .filter((c) => c.id.startsWith("scene-"))
    .map((c) => c.id.slice("scene-".length));

  const toggleSceneScope = (scene: Scene) => {
    const key = `scene-${scene.id}`;
    setAttachedContexts((prev) =>
      prev.some((c) => c.id === key)
        ? prev.filter((c) => c.id !== key)
        : [...prev, { id: key, type: "scene" as const, label: `Scene ${scene.number}`, detail: scene.title }]
    );
  };

  const toggleSceneEditing = (id: string) =>
    setEditingSceneIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /**
   * A citation is only useful if you can reach the claim behind it. Details
   * switches the panel to Claims and marks the card for two seconds — long
   * enough to find it in the list, short enough to leave no stuck state.
   */
  const handleCitationDetails = (claimId: string) => {
    setActiveTab("evidence");
    setHighlightedClaimId(claimId);
    window.setTimeout(() => setHighlightedClaimId(null), 2000);
  };
  const [chatContextMenuOpen, setChatContextMenuOpen] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);


  // Canvas Element Drag & Drop Positioning State
  const [elementOffsets, setElementOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);

  const handlePointerDownElement = (e: React.PointerEvent, elementId: string) => {
    e.stopPropagation();
    handleSelectCanvasElement(elementId);
    setDraggingElementId(elementId);
    const currentOffset = elementOffsets[elementId] || { x: 0, y: 0 };
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: currentOffset.x,
      startY: currentOffset.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveElement = (e: React.PointerEvent, elementId: string) => {
    if (draggingElementId !== elementId || !dragStartRef.current) return;
    const { startX, startY, clientX, clientY } = dragStartRef.current;
    const dx = e.clientX - clientX;
    const dy = e.clientY - clientY;
    const nextX = Math.round(startX + dx);
    const nextY = Math.round(startY + dy);
    setElementOffsets((prev) => ({
      ...prev,
      [elementId]: {
        x: nextX,
        y: nextY,
      },
    }));
  };

  const handlePointerUpElement = (e: React.PointerEvent, elementId: string) => {
    if (draggingElementId === elementId) {
      setDraggingElementId(null);
      dragStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleResetElementPosition = (elementId: string) => {
    setElementOffsets((prev) => {
      const next = { ...prev };
      delete next[elementId];
      return next;
    });
  };

  /** Label and detail for an element, shared by the chat attach and comments. */
  const describeElement = (elementId: string) => {
    let label = "Element";
    let detail = "";
    if (elementId === "headline") {
      label = `Scene ${selectedScene.number} · Headline`;
      detail = `"${selectedScene.title}"`;
    } else if (elementId === "narration") {
      label = `Scene ${selectedScene.number} · Voiceover Sync`;
      detail = `"${selectedScene.narration}"`;
    } else if (elementId === "image") {
      label = `Scene ${selectedScene.number} · Anatomical Heart Image`;
      detail = selectedScene.mediaImageSrc || "/anatomical-heart.png";
    } else if (elementId === "video-clip") {
      label = `Scene ${selectedScene.number} · 3D Video Clip`;
      detail = selectedScene.mediaVideoSrc || "/reel-moa.mp4";
    } else if (elementId === "moa") {
      label = `Scene ${selectedScene.number} · 3D MoA Target`;
      detail = selectedScene.visual || "3D kinematic target model";
    } else if (elementId === "tag") {
      label = `Scene ${selectedScene.number} · Tag`;
      detail = `(${selectedScene.narrativeTag || "Evidence"})`;
    } else if (elementId === "claim") {
      label = `Scene ${selectedScene.number} · Claim Badge`;
      detail = selectedScene.claim;
    }
    return { label, detail };
  };

  /**
   * Selecting an element only selects it. It used to attach itself to the chat
   * as a side effect, which meant you could not look at something without
   * aiming the agent at it — and left no room for the second thing you might
   * want to do with it, which is leave a note.
   */
  const handleSelectCanvasElement = (elementId: string) => {
    setSelectedCanvasElementId(elementId);
  };

  const attachElementToChat = (elementId: string) => {
    const { label, detail } = describeElement(elementId);
    setAttachedContexts((prev) => [
      ...prev.filter((c) => c.type !== "element"),
      { id: `element-${elementId}-${Date.now()}`, type: "element" as const, label, detail },
    ]);
  };


  useEffect(() => {
    if (!scenePlaying) return;
    const interval = setInterval(() => {
      setSceneCurrentTime((prev) => {
        const dur = selectedScene.duration || 10;
        if (prev >= dur) return 0;
        return Math.min(dur, +(prev + 0.1).toFixed(1));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [scenePlaying, selectedScene.duration]);

  const [masterPlaying, setMasterPlaying] = useState(false);
  const [masterCurrentTime, setMasterCurrentTime] = useState(14.0);
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredChapter, setHoveredChapter] = useState<{ number: number; title: string; start: number; end: number } | null>(null);
  const [hoveredScrubTime, setHoveredScrubTime] = useState<number | null>(null);

  useEffect(() => {
    if (!masterPlaying) return;
    const interval = setInterval(() => {
      setMasterCurrentTime((prev) => {
        if (prev >= totalDurationSeconds) {
          setMasterPlaying(false);
          return 0;
        }
        return Math.min(totalDurationSeconds, +(prev + 0.1).toFixed(1));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [masterPlaying, totalDurationSeconds]);

  const activeMasterChapter = useMemo(() => {
    return chapters.find((c) => masterCurrentTime >= c.start && masterCurrentTime < c.end) || chapters[0];
  }, [chapters, masterCurrentTime]);



  const handleStartSceneEditor = () => {
    setStudioMode("editor");
    setActiveTab("assistant");
    setScenePhase({});
    setToMessage(`Opening Scene Canvas Editor in ${selectedQuality === "hd" ? "HD" : "Cinematic"}...`);
    setTimeout(() => setToMessage(null), 2500);

    /**
     * Two passes over every scene, not one pass per scene.
     *
     * Pass 1 lays down structure for all of them in quick succession, which is
     * what the user actually needs to start working: the words, where things
     * sit, when they appear. Pass 2 fills in the heavy assets behind that.
     *
     * The point is that pass 2 needs no layout decisions — the placeholder
     * already occupies the right box for the right seconds with the right
     * transition, so an arriving asset changes what is in the frame and
     * nothing about the frame.
     */
    /**
     * Structure lands across every scene inside the first ten seconds, then
     * the media arrives in sequence between twenty and fifty. Those are real
     * render durations rather than a demo tempo: an image or a motion asset is
     * tens of seconds of work, and pretending otherwise would design the UI
     * around a wait that does not exist.
     */
    // Generating the partials is what the agreed budget buys.
    setCreditsUsed(creditBudget);

    const STRUCTURE_BY = 10_000;
    const MEDIA_FIRST = 20_000;
    const MEDIA_LAST = 50_000;
    const count = sceneList.length;

    sceneList.forEach((sc, idx) => {
      setTimeout(() => {
        setScenePhase((prev) => ({ ...prev, [sc.id]: 1 }));
      }, Math.round(((idx + 1) / count) * STRUCTURE_BY));
    });

    const step = count > 1 ? (MEDIA_LAST - MEDIA_FIRST) / (count - 1) : 0;
    sceneList.forEach((sc, idx) => {
      setTimeout(() => {
        setScenePhase((prev) => ({ ...prev, [sc.id]: 2 }));
      }, Math.round(MEDIA_FIRST + idx * step));
    });
  };

  const [videoGenStep, setVideoGenStep] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [mlrCheckResolved, setMlrCheckResolved] = useState(false);
  const [qaCheckResolved, setQaCheckResolved] = useState(false);
  const hasBlockers = !mlrCheckResolved || !qaCheckResolved;
  const blockerCount = (!mlrCheckResolved ? 1 : 0) + (!qaCheckResolved ? 1 : 0);

  const handleFixMlrBlocker = () => {
    setGenerateVideoModalOpen(false);
    setCopilotPanelOpen(true);
    setActiveTab("assistant");
    const prompt = "@MLR Check: Please revise comparative wording in Scene 3 to strictly cite EMBRACE-3 PASI 90 rate (p < 0.001) without unverified superiority claims.";
    setDirectorInput(prompt);
    setAttachedContexts([{ id: "mlr-fix", type: "scene", label: "MLR Blocker", detail: "Comparative claim in Scene 3" }]);
    setToMessage("Tagged MLR issue in SwishX Chat");
    setTimeout(() => setToMessage(null), 2500);
  };

  const handleFixQaBlocker = () => {
    setGenerateVideoModalOpen(false);
    setCopilotPanelOpen(true);
    setActiveTab("assistant");
    const prompt = "@Quality Check: Tighten Scene 3 voiceover narration to 135 wpm speech cadence and remove redundant cellular descriptors.";
    setDirectorInput(prompt);
    setAttachedContexts([{ id: "qa-fix", type: "scene", label: "Quality Blocker", detail: "Voiceover density >150 wpm" }]);
    setToMessage("Tagged Quality issue in SwishX Chat");
    setTimeout(() => setToMessage(null), 2500);
  };

  const handleAutoFixBoth = () => {
    setMlrCheckResolved(true);
    setQaCheckResolved(true);
    setSceneList((prev) =>
      prev.map((s, idx) =>
        idx === 2
          ? {
              ...s,
              title: "Pivotal EMBRACE-3 PASI 90 Response",
              headline: "Pivotal EMBRACE-3 PASI 90 Response",
              narration: "In the EMBRACE-3 trial, 52% of patients achieved PASI 90 at Week 16 versus 18% with placebo (p < 0.001).",
            }
          : s
      )
    );
    addChatMessage({
      role: "swishx",
      text: "✓ **Quality & MLR Pre-Flight Passed**: Auto-resolved both blockers. Rephrased Scene 3 to cite EMBRACE-3 Table 2.4 and adjusted narration to 135 wpm speech cadence. Ready to Generate and Publish.",
    });
    setToMessage("Resolved 2 pre-flight blockers with AI");
    setTimeout(() => setToMessage(null), 2500);
  };

  const handleOpenGenerateVideoModal = () => setGenerateVideoModalOpen(true);

  const handleConfirmVideoGeneration = () => {
    if (hasBlockers) return;
    setGenerateVideoModalOpen(false);
    setStudioMode("generating");
    setActiveTab("assistant");
    setVideoGenStep(1);
    const creditsDeducted = selectedQuality === "cinematic" ? "7,500" : "2,500";
    addChatMessage({
      role: "swishx",
      text: `⚡ Video generation initiated in **${selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"}** (${creditsDeducted} credits deducted). Neural rendering is processing in the cloud. You will receive an email once your final video is ready. Feel free to continue chatting with me about your project.`,
    });
    setToMessage(`Video generation queued · ${creditsDeducted} credits deducted`);
    setTimeout(() => setToMessage(null), 3500);

    setTimeout(() => setVideoGenStep(2), 1200);
    setTimeout(() => setVideoGenStep(3), 2400);
    setTimeout(() => setVideoGenStep(4), 3800);
    setTimeout(() => {
      setVideoGenStep(5);
      setTimeout(() => {
        handleEnterReviewView();
        /**
         * Publishing is what creates a shared link, and a shared link is what
         * creates team comments — so the Team tab only becomes real here.
         * These arrive as somebody else's words: they are listed and can be
         * handed to the agent with Add to chat, but nothing acts on them by
         * itself. Anyone with the link would otherwise be able to drive the
         * generator.
         */
        setTeamCommentsUnlocked(true);
        setComments((prev) => [
          ...prev,
          {
            id: "team-1", sceneId: sceneList[2]?.id ?? sceneList[0].id, sceneNumber: 3,
            elementId: "narration", elementLabel: ELEMENT_LABELS.narration,
            text: "Week 16 is the primary endpoint but the voiceover says it like a secondary finding. Can it lead the line?",
            author: "Dr. Anita Rao · Medical", source: "team", at: "2 min ago", status: "open", sentToChat: false,
          },
          {
            id: "team-2", sceneId: sceneList[3]?.id ?? sceneList[0].id, sceneNumber: 4,
            elementId: "headline", elementLabel: ELEMENT_LABELS.headline,
            text: "\u201cDesigned for practice\u201d reads promotional to me. Suggest \u201cDosing in practice\u201d.",
            author: "Sanjay Kulkarni · Legal", source: "team", at: "5 min ago", status: "open", sentToChat: false,
          },
          {
            id: "team-3", sceneId: sceneList[0].id, sceneNumber: 1,
            elementId: "background", elementLabel: ELEMENT_LABELS.background,
            text: "Opening background is very dark on a projector. Worth lifting.",
            author: "Priya Menon · Brand", source: "team", at: "8 min ago", status: "open", sentToChat: false,
          },
        ]);
      }, 1600);
    }, 5200);
  };

  const handleEnterReviewView = () => {
    setStudioMode("review");
    setActiveTab("comments");
    setMasterCurrentTime(0);
    setMasterPlaying(true);
    setToMessage("Final Master Video ready for review & comments");
    setTimeout(() => setToMessage(null), 3000);
  };

  const handleReturnToScript = () => { setStudioMode("scenes"); setActiveTab("assistant"); };
  const handleReturnToEditor = () => { setStudioMode("editor"); setActiveTab("edit"); };

  const handleAddDirectScriptScene = () => {
    const nextNum = sceneList.length + 1;
    const defaultTag = nextNum === 1 ? "Intro" : nextNum >= 5 ? "Outro" : "Evidence";
    const newScene = {
      id: `scene-${Date.now()}`,
      number: nextNum,
      title: `Scene ${nextNum}: Clinical Message`,
      duration: 10,
      narration: "",
      visual: "High-clarity clinical anatomical visualization with verified safety parameters.",
      claim: "Dossier §5.1 verified",
      evidenceState: "approved" as const,
      narrativeTag: defaultTag,
    };
    const updated = [...sceneList, newScene].map((s, idx) => ({ ...s, number: idx + 1 }));
    setSceneList(updated);
    setSelectedSceneId(newScene.id);
    setToMessage(`Added Script Scene ${nextNum} (${defaultTag})`);
    setTimeout(() => setToMessage(null), 2500);
  };



  const handleUpdateSceneTitle = (id: string, nextTitle: string) => {
    setSceneList((prev) => prev.map((s) => (s.id === id ? { ...s, title: nextTitle } : s)));
  };

  const handleUpdateSceneNarration = (id: string, nextNarration: string) => {
    // Anchors are sentence indices, so editing the text can strand them past
    // the end of the line. Recomputed on every edit rather than left to rot.
    setSceneList((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, narration: nextNarration, citations: citationsFor(s.narrativeTag ?? "Evidence", nextNarration) }
          : s
      )
    );
  };


  const handleCreateSceneFromModal = (sceneData: {
    insertPosition: number;
    title: string;
    script: string;
    visualText: string;
    negativeVisual: string;
    category: "normal" | "intro" | "outro" | "product";
  }) => {
    const targetPos = Math.max(1, Math.min(sceneData.insertPosition, sceneList.length + 1));
    const tag = sceneData.category === "intro" ? "Intro" : sceneData.category === "outro" ? "Outro" : sceneData.category === "product" ? "Mechanism" : "Evidence";
    const newScene = {
      id: `scene-${Date.now()}`,
      number: targetPos,
      title: sceneData.title || `Scene ${targetPos}: ${sceneData.category === "intro" ? "Brand Introduction" : sceneData.category === "outro" ? "Clinical Summary & Outro" : sceneData.category === "product" ? "Product Profile" : "Clinical Statement"}`,
      duration: 10,
      narration: sceneData.script || "A balanced clinical statement aligned with verified label claims and dosing protocols.",
      visual: sceneData.visualText || "High-clarity clinical anatomical visualization with verified safety parameters.",
      claim: "Dossier §5.1 verified",
      evidenceState: "approved" as const,
      narrativeTag: tag,
    };

    const updated = [...sceneList];
    updated.splice(targetPos - 1, 0, newScene);
    const renumbered = updated.map((s, idx) => ({ ...s, number: idx + 1 }));
    setSceneList(renumbered);
    setSelectedSceneId(newScene.id);
    setAddSceneModalOpen(false);
    setToMessage(`Scene ${targetPos} added (${tag})`);
    setTimeout(() => setToMessage(null), 2800);
  };





  const handleSendChatMessage = (presetText?: string) => {
    const rawInput = (presetText || directorInput).trim();
    if (!rawInput) return;

    let fullPrompt = rawInput;
    if (!presetText && attachedContexts.length > 0) {
      const contextPrefix = attachedContexts
        .map((c) => `[Context: ${c.label} - ${c.detail}]`)
        .join("\n");
      fullPrompt = `${contextPrefix}\n\n${rawInput}`;
    }

    setDirectorInput("");
    setAttachedContexts([]);
    addChatMessage({ role: "user", text: fullPrompt });

    const isCommentIntent = rawInput.toLowerCase().includes("comment") || rawInput.toLowerCase().includes("note") || rawInput.toLowerCase().includes("feedback");

    /**
     * An instruction aimed at specific scenes rewrites those scenes — and then
     * the beats that depend on them. The dependents are announced as a separate
     * step rather than folded into the first message, because the user asked
     * for the scenes they picked; the extra ones are the agent's call and it
     * should say so before changing them.
     */
    const targetIds = scopedSceneIds.filter((id) => sceneList.some((s) => s.id === id));
    if (targetIds.length > 0 && !isCommentIntent) {
      const targets = sceneList.filter((s) => targetIds.includes(s.id));
      const nameOf = (s: Scene) => `Scene ${s.number} — ${s.title}`;

      setPendingSceneIds(targetIds);
      addChatMessage({
        role: "swishx",
        text: `Rewriting **${targets.map(nameOf).join("**, **")}** against the approved sources...`,
      });

      setTimeout(() => {
        const dependentTags = new Set(
          targets.flatMap((s) => TAG_DEPENDENTS[s.narrativeTag || "Evidence"] ?? [])
        );
        const dependents = sceneList.filter(
          (s) => !targetIds.includes(s.id) && dependentTags.has(s.narrativeTag || "Evidence")
        );

        if (dependents.length > 0) {
          setPendingSceneIds((prev) => [...prev, ...dependents.map((d) => d.id)]);
          addChatMessage({
            role: "swishx",
            text: `That changes what follows — **${dependents.map(nameOf).join("**, **")}** ${dependents.length > 1 ? "both build" : "builds"} on it, so ${dependents.length > 1 ? "they are" : "it is"} being updated to stay consistent.`,
          });
        }

        const changedIds = [...targetIds, ...dependents.map((d) => d.id)];
        setTimeout(() => {
          setSceneList((prev) =>
            prev.map((sc) => {
              if (!changedIds.includes(sc.id)) return sc;
              const tag = sc.narrativeTag || "Evidence";
              const clause = REWRITE_CLAUSE_BY_TAG[tag] ?? "";
              const nextNarration = sc.narration.includes(clause.trim()) ? sc.narration : `${sc.narration}${clause}`;
              return {
                ...sc,
                narration: nextNarration,
                citations: citationsFor(tag, nextNarration),
              };
            })
          );
          setPendingSceneIds([]);
          // Re-running a scene costs credits, which is how a project goes over
          // the budget it was quoted: 400 per scene touched.
          setCreditsUsed((prev) => prev + changedIds.length * 400);
          addChatMessage({
            role: "swishx",
            text: `Updated ${changedIds.length} scene${changedIds.length > 1 ? "s" : ""}. Every line resolves to an approved source — open the source pill under a line to see which.`,
          });
        }, 1500);
      }, 1100);
      return;
    }

    setTimeout(() => {
      if (rawInput.includes("Update other scenes")) {
        setSceneList((prev) =>
          prev.map((s) => ({
            ...s,
            visual: `${s.visual} (enhanced with 3D kinematic lighting and high-contrast clinical boundaries)`,
            negativeVisual: "Overly stylized cartoons, text overlays, harsh shadows, low quality rendering.",
          }))
        );
        addChatMessage({
          role: "swishx",
          text: `✓ Successfully propagated visual styling and pacing across all ${sceneList.length} scenes in the storyboard. All regulatory citations (§5.1, CLEARSKIN trial) remain grounded.`,
        });
      } else if (rawInput.includes("Keep remaining")) {
        addChatMessage({
          role: "swishx",
          text: `Understood! Preserving individual scene customizations. You can continue editing in the canvas or click **Generate Video** on top right when ready.`,
        });
      } else if (isReview && isCommentIntent) {
        const timeMatch = rawInput.match(/0:\d{2}|\d{1,2}s|\d{1,2}\s*sec/i);
        const extractedSec = timeMatch ? parseInt(timeMatch[0].replace(/[^0-9]/g, ""), 10) : Math.floor(masterCurrentTime);
        const formatted = `0:${extractedSec.toString().padStart(2, "0")}`;
        const created: SceneComment = {
          id: `cm-${(commentSeq.current += 1)}`,
          sceneId: selectedScene.id,
          sceneNumber: activeMasterChapter?.number || 1,
          elementId: "narration",
          elementLabel: ELEMENT_LABELS.narration,
          text: rawInput.replace(/add\s+(a\s+)?comment(\s+at\s+\S+)?\s*(that|to|for|:)?\s*/i, "").trim() || rawInput,
          author: "You",
          source: "mine",
          at: "Just now",
          status: "open",
          sentToChat: true,
        };
        setComments((prev) => [created, ...prev]);
        addChatMessage({ role: "swishx", text: `✓ I've added a timestamped reviewer comment at **${formatted}** (${activeMasterChapter?.title}): *" ${created.text} "*` });
      } else if (rawInput.toLowerCase().includes("mlr") || rawInput.toLowerCase().includes("comparative") || rawInput.toLowerCase().includes("embrace-3")) {
        setMlrCheckResolved(true);
        setSceneList((prev) =>
          prev.map((s, idx) =>
            idx === 2
              ? {
                  ...s,
                  title: "Pivotal EMBRACE-3 PASI 90 Response",
                  headline: "Pivotal EMBRACE-3 PASI 90 Response",
                  narration: "In the EMBRACE-3 trial, 52% of patients achieved PASI 90 at Week 16 versus 18% with placebo (p < 0.001).",
                }
              : s
          )
        );
        addChatMessage({
          role: "swishx",
          text: `✓ **MLR Blocker Resolved**: Rephrased Scene 3 to cite verified EMBRACE-3 PASI 90 readout (52% vs 18% placebo, p < 0.001). Removed ungrounded superiority claims. MLR pre-flight clearance granted.`,
        });
      } else if (rawInput.toLowerCase().includes("quality") || rawInput.toLowerCase().includes("cadence") || rawInput.toLowerCase().includes("pacing") || rawInput.toLowerCase().includes("135 wpm")) {
        setQaCheckResolved(true);
        setSceneList((prev) =>
          prev.map((s, idx) =>
            idx === 2
              ? {
                  ...s,
                  narration: "52% of patients achieved PASI 90 at Week 16 versus 18% with placebo (p < 0.001), sustained through Week 52.",
                }
              : s
          )
        );
        addChatMessage({
          role: "swishx",
          text: `✓ **Quality Blocker Resolved**: Condensed Scene 3 narration script to 135 wpm speech cadence. Removed redundant descriptors. Audio-visual pacing verified.`,
        });
      } else if (isReview) {
        addChatMessage({ role: "swishx", text: `I've analyzed your question against the **${dossierNames[sourcePayload?.dossierId || "velmora"] || "Velmora"}** FDA prescribing information and PromoMats evidence library. All clinical claims are 100% grounded.` });
      } else {
        addChatMessage({ role: "swishx", text: `Applied direction across Scene ${selectedScene.number}. All visual boundaries and claim groundings have been refreshed.` });
      }
    }, 500);
  };

  return (
    <WorkbenchLayout
      className="bg-[#edf0ed]"
      panelOpen={copilotPanelOpen}
      onPanelOpenChange={setCopilotPanelOpen}
      panelWidth={copilotPanelWidth}
      onPanelWidthChange={setCopilotPanelWidth}
      onPanelResizingChange={setCopilotPanelResizing}
      panelStorageKey="swishx.copilotPanelWidth"
      /* Below 1024 there is not enough width for canvas + inspector:
         the panel closes once on the way down, and a deliberate
         re-open sticks. Tablet portrait is review-only by design. */
      autoCollapsePanelBelow="laptop"
      /* The editor and review modes put a fixed rail left of the canvas, so
         the canvas floor has to account for it or a full-width drag at tablet
         size leaves ~140px of canvas. */
      panelMinCanvas={isReview ? 240 + 360 : isEditor ? 220 + 360 : 360}
      header={
        <ScreenHeader>
          <button onClick={() => setView("home")} className="focus-ring mr-2 grid size-8 place-items-center rounded-chip text-ink-3 hover:bg-black/5" aria-label="Back home">
            <ArrowLeft className="size-4" />
          </button>
          <SwishXMark compact />
          <div className="mx-3 h-5 w-px bg-hair" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-body font-[800] text-ink">{sourcePayload?.dossierId ? `${dossierNames[sourcePayload.dossierId] || "Velmora"} HCP launch` : "DERMORA HCP launch"}</span>
              <span className="hidden rounded-chip bg-ok-bg px-2 py-0.5 text-micro font-bold text-ink-3 sm:inline">Draft v1</span>
            </div>
            <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">Saved just now · Maya Kapoor</div>
          </div>

          <div className="ml-6 hidden items-center gap-1 sm:flex">
            {studioMode === "scenes" && <span className="rounded-chip bg-tint px-2.5 py-0.5 text-caption font-extrabold tracking-wide text-brand-deep border border-tint-line">Script View</span>}
            {studioMode === "editor" && (
              <div className="flex items-center gap-1.5">
                <button onClick={handleReturnToScript} className="focus-ring flex items-center gap-1.5 rounded-chip border border-hair bg-canvas px-2.5 py-1 text-label font-bold text-ink-2 transition hover:border-brand hover:bg-tint hover:text-brand shadow-xs cursor-pointer">
                  <FileText className="size-3.5 text-brand" /> <span>Script View</span>
                </button>
                <span className="text-ink-3">/</span>
                <span className="rounded-chip bg-tint px-2.5 py-0.5 text-caption font-extrabold text-brand-deep border border-tint-line">Canvas Editor</span>
              </div>
            )}
            {studioMode === "generating" && <span className="inline-flex items-center gap-1.5 rounded-chip bg-tint border border-tint-line px-3 py-1 text-caption font-extrabold text-brand-deep animate-pulse"><span>Generating High-Res Video...</span></span>}
            {studioMode === "review" && (
              <div className="flex items-center gap-1.5">
                <button onClick={handleReturnToEditor} className="focus-ring flex items-center gap-1.5 rounded-chip border border-hair bg-canvas px-2.5 py-1 text-label font-bold text-ink-2 transition hover:border-brand hover:bg-tint hover:text-brand shadow-xs cursor-pointer"><Pencil className="size-3 text-brand" /> <span>Editor</span></button>
                <span className="text-ink-3">/</span>
                <span className="rounded-chip bg-ok-bg px-3 py-0.5 text-caption font-extrabold text-ok border border-ok-line">Shared Review View · Final Master ({totalDurationSeconds}s)</span>
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Owner-only. A reviewer on the shared link reads comments in
                the Comments tab, which is scoped to what they may see — the
                My/Team split behind this counter is the owner's view of the
                same records. */}
            {!isReview && (
            <button
              type="button"
              onClick={() => setCommentsOpen(true)}
              title="Comments"
              aria-label={`Comments — ${openComments.length} open`}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-chip border px-2.5 transition-colors cursor-pointer",
                openComments.length > 0
                  ? "border-brand/25 bg-tint text-brand-deep hover:bg-tint-strong"
                  : "border-hair-2 bg-card text-ink-3 hover:border-brand hover:text-ink shadow-2xs"
              )}
            >
              <MessageSquare className="size-3.5" />
              <span className="text-caption font-bold tabular-nums">{openComments.length}</span>
            </button>
            )}

            {/* Toggle Right Sidebar Panel Button (Icon Only) */}
            <button
              type="button"
              onClick={toggleCopilotPanel}
              className={cn(
                "grid size-8 place-items-center rounded-chip border transition-colors cursor-pointer",
                copilotPanelOpen
                  ? "border-hair-2 bg-black/5 text-ink hover:bg-black/10"
                  : "border-hair-2 bg-card text-ink-3 hover:text-ink hover:border-brand shadow-2xs"
              )}
              title={copilotPanelOpen ? "Collapse sidebar (⌘\\)" : "Expand sidebar (⌘\\)"}
              aria-label="Toggle sidebar"
            >
              <PanelRight className="size-4" />
            </button>

            {isEditor && (
              <>
                <Button size="sm" onClick={handleOpenGenerateVideoModal} className="bg-brand hover:bg-brand-deep text-white font-bold px-4 cursor-pointer shadow-xs gap-1.5"><LogoMark size={14} /> <span>Generate and Publish</span></Button>
              </>
            )}
            {isReview && (
              <Button
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="bg-brand hover:bg-brand-deep text-white font-bold px-4 cursor-pointer shadow-xs gap-1.5"
              >
                <Share2 className="size-3.5" />
                <span>Share Link</span>
              </Button>
            )}
          </div>
        </ScreenHeader>
      }
      rail={
          <aside
            style={{
              width: isReview ? 240 : isEditor ? 220 : copilotPanelOpen ? `calc(100% - ${copilotPanelWidth}px)` : "100%",
              minWidth: isReview ? 240 : isEditor ? 220 : copilotPanelOpen ? `calc(100% - ${copilotPanelWidth}px)` : "100%",
              maxWidth: isReview ? 240 : isEditor ? 220 : copilotPanelOpen ? `calc(100% - ${copilotPanelWidth}px)` : "100%",
              transition: copilotPanelResizing ? "none" : "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className={cn(
              "flex flex-col shrink-0 min-h-0 border-r border-hair overflow-hidden transition-colors duration-300",
              isGenerating ? "bg-[#eef1ed] p-4 sm:p-6 lg:p-7" : isReview ? "bg-canvas" : isEditor ? "bg-[#f8f9f7]" : "bg-[#eef1ed] p-4 sm:p-6 lg:p-7"
            )}
          >
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 my-auto">
                <div className="size-20 rounded-card bg-tint border border-tint-line flex items-center justify-center mb-6 shadow-sm">
                  <LogoMark size={40} className="text-brand animate-pulse" />
                </div>

                <h3 className="text-display font-extrabold text-ink tracking-tight">
                  Generating High-Resolution Video Master...
                </h3>
                <p className="text-body-lg text-ink-3 mt-1.5 max-w-[460px]">
                  Synthesizing kinematic 3D scene models, rendering voiceover audio sync, and verifying fair balance across all {sceneList.length} scenes.
                </p>

                <div className="mt-8 w-full max-w-[380px] space-y-2.5 text-left text-body">
                  <div className={cn("flex items-center gap-3 p-3 rounded-control border transition", videoGenStep >= 1 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                    <Check className={cn("size-4.5 shrink-0", videoGenStep >= 1 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                    <span className="font-semibold">Parsed {sceneList.length} storyboard scenes &amp; timing</span>
                  </div>
                  <div className={cn("flex items-center gap-3 p-3 rounded-control border transition", videoGenStep >= 2 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                    <Check className={cn("size-4.5 shrink-0", videoGenStep >= 2 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                    <span className="font-semibold">Synthesized 3D visual kinematics &amp; lighting</span>
                  </div>
                  <div className={cn("flex items-center gap-3 p-3 rounded-control border transition", videoGenStep >= 3 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                    <Check className={cn("size-4.5 shrink-0", videoGenStep >= 3 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                    <span className="font-semibold">Synced clinical voiceover narration</span>
                  </div>
                  <div className={cn("flex items-center gap-3 p-3 rounded-control border transition", videoGenStep >= 4 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                    <Check className={cn("size-4.5 shrink-0", videoGenStep >= 4 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                    <span className="font-semibold">Linking citations to FDA label §5.1</span>
                  </div>
                  <div className={cn("flex items-center gap-3 p-3 rounded-control border transition", videoGenStep >= 5 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                    {videoGenStep >= 5 ? (
                      <Check className="size-4.5 shrink-0 text-ok" strokeWidth={2.5} />
                    ) : (
                      <LogoMark size={18} className="shrink-0 text-brand animate-spin" />
                    )}
                    <span className="font-semibold">Final cloud master render ({selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"})</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4 text-body text-ink-3">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span>✉ Email notification queued</span>
                  </span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleEnterReviewView}
                    className="font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Preview Master Video</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isReview ? (
                  <div className="flex h-11 shrink-0 items-center justify-between border-b border-hair px-3.5 bg-card">
                    <span className="text-caption font-extrabold uppercase tracking-[0.12em] text-[#596660] flex items-center gap-1.5"><Film className="size-3.5 text-brand" /> <span>Video Chapters · {chapters.length}</span></span>
                    <span className="text-caption font-bold text-ink-3">{totalDurationSeconds}s</span>
                  </div>
                ) : isEditor ? (
                  <div className="flex h-11 shrink-0 items-center justify-between border-b border-hair px-3 bg-card">
                    <span className="text-micro font-bold uppercase tracking-[0.12em] text-[#77817c]">Scenes · {totalDurationSeconds} sec</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pb-4 shrink-0">
                    <div>
                      <h2 className="text-display font-[850] text-ink tracking-tight">
                        Script
                      </h2>
                      <p className="text-body text-ink-3 mt-0.5">
                        Review and shape the clinical narrative before generating the full visual canvas.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddDirectScriptScene}
                      size="sm"
                      className="bg-card border border-hair text-ink hover:border-brand hover:bg-tint hover:text-brand-deep font-bold shadow-2xs transition-all gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="size-3.5 text-brand" />
                      <span>Add Script Scene</span>
                    </Button>
                  </div>
                )}

                <div className={cn("flex-1 min-h-0 overflow-y-auto space-y-2.5", isReview ? "p-2.5 space-y-2" : isEditor ? "p-2.5" : "p-1 pr-2 space-y-3")}>
                  {isReview
                    ? chapters.map((ch) => {
                        const isCurrent = activeMasterChapter?.id === ch.id;
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => {
                              setMasterCurrentTime(ch.start);
                              setMasterPlaying(true);
                            }}
                            className={cn(
                              "group relative flex w-full flex-col rounded-control border p-2.5 text-left transition-all cursor-pointer",
                              isCurrent
                                ? "border-brand bg-tint shadow-xs ring-2 ring-brand/15"
                                : "border-hair bg-card hover:border-hair-3 hover:bg-canvas"
                            )}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={cn(
                                  "rounded-glyph px-1.5 py-0.5 text-micro font-extrabold",
                                  isCurrent ? "bg-brand text-white" : "bg-black/5 text-ink-3"
                                )}
                              >
                                0:{ch.start.toString().padStart(2, "0")} – 0:{ch.end.toString().padStart(2, "0")}
                              </span>
                              <span className="text-micro text-ink-3 font-bold">{ch.duration}s</span>
                            </div>
                            <div className="text-label font-bold text-ink line-clamp-1 group-hover:text-brand-deep">
                              {ch.number}. {ch.title}
                            </div>
                            <div className="text-caption text-ink-3 line-clamp-1 mt-0.5">{ch.narration}</div>
                          </button>
                        );
                      })
                    : isEditor
                    ? sceneList.map((sc) => {
                        const isSelected = selectedScene.id === sc.id;
                        const phase = phaseOf(sc.id);
                        return (
                          <button
                            key={sc.id}
                            type="button"
                            disabled={phase === 0}
                            onClick={() => {
                              setSelectedSceneId(sc.id);
                              setSelectedCanvasElementId("headline");
                              setSceneCurrentTime(0);
                              setScenePlaying(true);
                            }}
                            className={cn(
                              "group relative flex w-full flex-col rounded-control border p-2 text-left transition-all cursor-pointer",
                              phase === 0
                                ? "border-hair bg-card opacity-50 cursor-not-allowed"
                                : isSelected
                                ? "border-brand bg-card shadow-xs ring-2 ring-brand/15"
                                : "border-hair bg-card hover:border-hair-3"
                            )}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="text-caption font-bold text-ink">
                                Scene {sc.number}
                              </span>
                              <div className="flex items-center gap-1">
                                {/* Three states: nothing, structure, done. The
                                    middle one is the whole point — a scene you
                                    can already work on while its media renders. */}
                                {phase === 2 ? (
                                  <span className="size-1.5 rounded-full bg-ok" title="Ready" />
                                ) : phase === 1 ? (
                                  <span className="size-1.5 rounded-full bg-brand" title="Editable · media still rendering" />
                                ) : (
                                  <LogoMark size={10} className="text-brand animate-spin" />
                                )}
                                <span className="text-micro text-ink-3 font-medium">{sc.duration}s</span>
                              </div>
                            </div>

                            <div className="relative aspect-video w-full rounded-chip overflow-hidden border border-hair-2 bg-[#173d31]">
                              <DynamicSceneComposition scene={sc} compact />
                            </div>

                            <div className="mt-1.5 text-label font-semibold text-ink-2 line-clamp-1">
                              {sc.title}
                            </div>
                          </button>
                        );
                      })
                    : (
                      <>
                        {sceneList.map((sc) => (
                          <ScriptSceneCard
                            key={sc.id}
                            scene={sc}
                            selected={scopedSceneIds.includes(sc.id)}
                            onToggleSelect={() => toggleSceneScope(sc)}
                            editing={editingSceneIds.includes(sc.id)}
                            onToggleEdit={() => toggleSceneEditing(sc.id)}
                            pending={pendingSceneIds.includes(sc.id)}
                            onCitationDetails={handleCitationDetails}
                            onTitleChange={(v) => handleUpdateSceneTitle(sc.id, v)}
                            onNarrationChange={(v) => handleUpdateSceneNarration(sc.id, v)}
                          />
                        ))}

                        <button
                          type="button"
                          onClick={handleAddDirectScriptScene}
                          className="flex w-full items-center justify-center gap-2 rounded-panel border-2 border-dashed border-hair-2 p-4 text-body font-bold text-ink-2 hover:border-brand hover:bg-tint/50 hover:text-brand-deep transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="size-4 text-brand" />
                          <span>Add Script Scene</span>
                        </button>
                      </>
                    )}
                </div>

                {!isEditor && !isReview && !isGenerating && (
                  <ActionBar
                    gutter={false}
                    icon={isScriptComplete
                      ? <CheckCircle2 className="size-4.5 text-ok-on-dark shrink-0" />
                      : <AlertCircle className="size-4.5 text-warn-on-dark shrink-0" />}
                    title={isScriptComplete ? "Script approved & claims grounded" : "Script incomplete"}
                    action={
                      <Button
                        onClick={handleStartSceneEditor}
                        disabled={!isScriptComplete}
                        size="sm"
                        className={cn(
                          "h-9.5 px-5 rounded-control text-body-lg font-bold shadow-sm transition-all duration-200 shrink-0",
                          isScriptComplete
                            ? "bg-brand hover:bg-brand-deep text-white hover:-translate-y-0.5 cursor-pointer"
                            : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                        )}
                      >
                        <LogoMark size={14} className="mr-1.5" /> <span>Generate Scenes</span>
                      </Button>
                    }
                  />
                )}
              </>
            )}
          </aside>
      }
      main={
          <main
            style={{
              flex: isEditor || isReview ? 1 : "0 0 0px",
              width: isEditor || isReview ? "auto" : "0px",
              minWidth: 0,
              opacity: isEditor || isReview ? 1 : 0,
              transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className={cn(
              "flex flex-col min-h-0 overflow-hidden",
              !isEditor && !isReview && "pointer-events-none"
            )}
          >
            {/* ══════════════════════════════════════════════════════════════════
                MODE 2: CANVA-STYLE SCENE CANVAS EDITOR (studioMode === "editor")
               ══════════════════════════════════════════════════════════════════ */}
            {isEditor && (
              <div className="relative flex min-h-0 flex-1 flex-col bg-[#e6e9e6]">
                {/* Sub-header */}
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-hair-3/70 bg-white/60 px-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2.5 text-label font-bold text-ink">
                    <span className="rounded-glyph bg-card border border-hair-2 px-2 py-0.5 shadow-2xs font-extrabold">
                      Scene {selectedScene.number} of {sceneList.length}
                    </span>
                    <span>{selectedScene.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-label">
                    <span className="rounded-glyph bg-card border border-hair-2 px-2 py-0.5 text-caption font-bold text-[#64726b] shadow-2xs">
                      Fit 16:9
                    </span>
                    <Button variant="ghost" size="icon" className="size-7" aria-label="Full screen">
                      <Expand className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* ── Canva-style Interactive Scene Workspace ── */}
                <div
                  className="flex min-h-0 flex-1 items-center justify-center p-4 lg:p-6 overflow-hidden"
                >
                 <div className="flex w-full max-w-[840px] flex-col items-start gap-3">
                  <div
                    /**
                     * Only a click on the stage ITSELF deselects. It used to
                     * deselect on any click inside it, so every element that
                     * does not stopPropagation — the subtitle, the image, the
                     * video — selected itself on pointerdown and was cleared by
                     * its own click a frame later. The headline only worked
                     * because it stops propagation explicitly.
                     */
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setSelectedCanvasElementId(null);
                    }}
                    data-canvas-stage
                    className="relative aspect-video w-full rounded-panel bg-[#173d31] shadow-float ring-1 ring-black/20 overflow-hidden select-none"
                  >
                    {/* Layer 1: Background Gradient Graphic */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCanvasElement("background");
                      }}
                      onMouseEnter={() => setHoveredCanvasElementId("bg")}
                      onMouseLeave={() => setHoveredCanvasElementId(null)}
                      className={cn(
                        "absolute inset-0 transition-all",
                        selectedCanvasElementId === "background" && "ring-2 ring-ok"
                      )}
                    >
                      <div className="absolute inset-0 bg-radial from-[#1e4d3f] via-[#173d31] to-[#0f2820]" />
                    </div>

                    {/* Layer 2: 3D Kinetic Anatomy / MoA Model */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCanvasElement("moa");
                      }}
                      onMouseEnter={() => setHoveredCanvasElementId("visual-3d")}
                      onMouseLeave={() => setHoveredCanvasElementId(null)}
                      className={cn(
                        "absolute right-4 top-4 size-56 sm:size-72 rounded-full transition-all cursor-pointer",
                        selectedCanvasElementId === "moa"
                          ? "border-2 border-dashed border-brand ring-4 ring-brand/20"
                          : hoveredCanvasElementId === "visual-3d"
                          ? "border border-dashed border-white/50"
                          : ""
                      )}
                    >
                      <div className="size-full rounded-full border border-white/15 animate-spin duration-15000 flex items-center justify-center">
                        <div className="size-3/4 rounded-full border border-lime-line/30 flex items-center justify-center">
                          <div className="size-6 rounded-full bg-lime-bg shadow-soft" />
                        </div>
                      </div>
                    </div>

                    {/* Structured Canvas Content Overlay */}
                    <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 text-white pointer-events-none">
                      {/* Top Narrative Pillar Tag */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCanvasElement("tag");
                        }}
                        onMouseEnter={() => setHoveredCanvasElementId("tag")}
                        onMouseLeave={() => setHoveredCanvasElementId(null)}
                        className={cn(
                          "pointer-events-auto inline-flex items-center gap-2 text-label font-extrabold uppercase tracking-[0.16em] text-white/80 p-1.5 rounded-chip transition-all cursor-pointer w-fit",
                          selectedCanvasElementId === "tag"
                            ? "border-2 border-dashed border-brand bg-black/40 ring-2 ring-brand/15"
                            : hoveredCanvasElementId === "tag"
                            ? "border border-dashed border-white/60 bg-black/20"
                            : ""
                        )}
                      >
                        <span className="size-2 rounded-full bg-lime-bg" />
                        <span>{selectedScene.narrativeTag || "PIVOTAL EVIDENCE"}</span>
                        <span className="text-micro font-bold text-white/50 lowercase ml-1 tabular-nums">
                          ({(timingFor(selectedScene, "narration")?.inAt ?? 0).toFixed(1)}s–
                          {(timingFor(selectedScene, "narration")?.outAt ?? selectedScene.duration).toFixed(1)}s)
                        </span>
                      </div>

                      {/* Right-Side Media Showcase (Draggable real Image and Video Clip Elements for ~60% of scenes) */}
                      {selectedScene.mediaType && selectedScene.mediaType !== "none" && (
                        <div className="absolute right-5 top-11 bottom-14 w-[40%] flex flex-col gap-3 z-20 pointer-events-none">
                          {/* Until phase 2, the media slots hold placeholders that
                              already know their box, their seconds and their
                              transition — so the layout is settled and the arriving
                              asset only changes what is inside it. */}
                          {selectedScenePhase < 2 && (
                            <>
                              {(selectedScene.mediaType === "image" || selectedScene.mediaType === "both") && (
                                <MediaPlaceholder
                                  kind="image"
                                  label={selectedScene.mediaLabel || "Clinical still"}
                                  timing={timingFor(selectedScene, "image")}
                                  currentTime={sceneCurrentTime}
                                  selected={selectedCanvasElementId === "image"}
                                  onSelect={() => handleSelectCanvasElement("image")}
                                  className="flex-1"
                                />
                              )}
                              {(selectedScene.mediaType === "video" || selectedScene.mediaType === "both") && (
                                <MediaPlaceholder
                                  kind="video"
                                  label={selectedScene.visual || "Motion asset"}
                                  timing={timingFor(selectedScene, "video-clip")}
                                  currentTime={sceneCurrentTime}
                                  selected={selectedCanvasElementId === "video-clip"}
                                  onSelect={() => handleSelectCanvasElement("video-clip")}
                                  className="flex-1"
                                />
                              )}
                            </>
                          )}

                          {/* Draggable Element 1: Real Anatomical Heart Image */}
                          {selectedScenePhase >= 2 && (selectedScene.mediaType === "image" || selectedScene.mediaType === "both") && (
                            <div
                              onPointerDown={(e) => handlePointerDownElement(e, "image")}
                              onPointerMove={(e) => handlePointerMoveElement(e, "image")}
                              onPointerUp={(e) => handlePointerUpElement(e, "image")}
                              onMouseEnter={() => setHoveredCanvasElementId("image")}
                              onMouseLeave={() => setHoveredCanvasElementId(null)}
                              style={{
                                /**
                                 * The drag offset composed with the element's
                                 * timing motion. Both write transform, so they
                                 * have to be composed rather than one winning —
                                 * and the timing has to be here at all, or the
                                 * asset ignores the window its own placeholder
                                 * just advertised and sits in frame start to end.
                                 */
                                transform: [
                                  `translate(${elementOffsets["image"]?.x || 0}px, ${elementOffsets["image"]?.y || 0}px)`,
                                  motionImage.transform,
                                ].filter(Boolean).join(" "),
                                opacity: motionImage.opacity,
                                pointerEvents: motionImage.onScreen ? undefined : "none",
                                ...motionTransition(motionImage.durationMs),
                              }}
                              className={cn(
                                "pointer-events-auto relative flex-1 rounded-panel p-3 bg-black/70 backdrop-blur-md border transition-shadow cursor-grab active:cursor-grabbing shadow-xl select-none flex items-center gap-3",
                                selectedCanvasElementId === "image"
                                  ? "border-2 border-dashed border-brand ring-4 ring-brand/20 bg-black/85 shadow-2xl"
                                  : hoveredCanvasElementId === "image"
                                  ? "border border-dashed border-white/60 bg-black/75"
                                  : "border-white/20 hover:border-white/40"
                              )}
                            >
                              {/* Real Anatomical Heart Graphic */}
                              <div className="w-[72px] h-[82px] flex items-center justify-center shrink-0">
                                <img
                                  src={selectedScene.mediaImageSrc || "/anatomical-heart.png"}
                                  alt="Cardiac Anatomy"
                                  className="max-h-full max-w-full object-contain drop-shadow-on-dark pointer-events-none"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="font-extrabold text-lime-ink text-micro uppercase tracking-wider bg-lime-bg/15 px-1.5 py-0.5 rounded-glyph border border-lime-line/30">
                                    🫀 Image Asset
                                  </span>
                                  <span className="text-white/60 text-micro font-semibold flex items-center gap-0.5">
                                    <Move className="size-2.5" /> Draggable
                                  </span>
                                </div>
                                <div className="text-label font-bold text-white leading-tight">
                                  {selectedScene.mediaLabel || "Cardiac & Vascular Structure"}
                                </div>
                                <div className="text-micro text-white/50 mt-1">
                                  FDA Prescribing Brief §4.2
                                </div>
                              </div>

                              {/* Floating Formatting Pill when selected */}
                              {selectedCanvasElementId === "image" && (
                                <div className="absolute -top-8 right-0 z-30 flex items-center gap-1.5 rounded-chip bg-ink border border-white/20 px-2.5 py-1 text-caption font-bold text-white shadow-xl whitespace-nowrap">
                                  <ImageIcon className="size-3 text-brand" />
                                  <span>Image Layer</span>
                                  <span className="text-white/40">|</span>
                                  {elementOffsets["image"] && (
                                    <>
                                      <span className="text-warn-on-dark font-mono text-micro">
                                        X:{elementOffsets["image"].x > 0 ? `+${elementOffsets["image"].x}` : elementOffsets["image"].x} Y:{elementOffsets["image"].y > 0 ? `+${elementOffsets["image"].y}` : elementOffsets["image"].y}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleResetElementPosition("image");
                                        }}
                                        className="text-white/70 hover:text-white flex items-center gap-0.5 cursor-pointer ml-0.5"
                                      >
                                        <RotateCcw className="size-2.5" /> Reset
                                      </button>
                                      <span className="text-white/40">|</span>
                                    </>
                                  )}
                                  <span className="text-ok-on-dark">⏱ 0:02 – 0:12</span>
                                  <span className="text-white/40">|</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setToMessage("Replaced with anatomical vascular model");
                                      setTimeout(() => setToMessage(null), 2000);
                                    }}
                                    className="text-brand hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
 Replace
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Draggable Element 2: Real Kinematic Video Clip */}
                          {selectedScenePhase >= 2 && (selectedScene.mediaType === "video" || selectedScene.mediaType === "both") && (
                            <div
                              onPointerDown={(e) => handlePointerDownElement(e, "video-clip")}
                              onPointerMove={(e) => handlePointerMoveElement(e, "video-clip")}
                              onPointerUp={(e) => handlePointerUpElement(e, "video-clip")}
                              onMouseEnter={() => setHoveredCanvasElementId("video-clip")}
                              onMouseLeave={() => setHoveredCanvasElementId(null)}
                              style={{
                                /**
                                 * The drag offset composed with the element's
                                 * timing motion. Both write transform, so they
                                 * have to be composed rather than one winning —
                                 * and the timing has to be here at all, or the
                                 * asset ignores the window its own placeholder
                                 * just advertised and sits in frame start to end.
                                 */
                                transform: [
                                  `translate(${elementOffsets["video-clip"]?.x || 0}px, ${elementOffsets["video-clip"]?.y || 0}px)`,
                                  motionVideoClip.transform,
                                ].filter(Boolean).join(" "),
                                opacity: motionVideoClip.opacity,
                                pointerEvents: motionVideoClip.onScreen ? undefined : "none",
                                ...motionTransition(motionVideoClip.durationMs),
                              }}
                              className={cn(
                                "pointer-events-auto relative flex-1 rounded-panel bg-black/70 backdrop-blur-md border transition-shadow cursor-grab active:cursor-grabbing shadow-xl select-none overflow-hidden",
                                selectedCanvasElementId === "video-clip"
                                  ? "border-2 border-dashed border-brand ring-4 ring-brand/20 shadow-2xl"
                                  : hoveredCanvasElementId === "video-clip"
                                  ? "border border-dashed border-white/60"
                                  : "border-white/20 hover:border-white/40"
                              )}
                            >
                              {/* Real Looping Video Player (Synced with scene play/pause) */}
                              <video
                                ref={canvasVideoRef}
                                src={selectedScene.mediaVideoSrc || "/reel-moa.mp4"}
                                loop
                                muted
                                playsInline
                                className="size-full object-cover pointer-events-none opacity-90"
                              />

                              <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                                <span className="text-micro font-extrabold text-info-on-dark uppercase tracking-wide bg-black/70 px-1.5 py-0.5 rounded-glyph border border-sky-400/40">
                                  🎬 Video Clip
                                </span>
                                <span className="text-micro text-white/80 bg-black/60 px-1 py-0.5 rounded-glyph flex items-center gap-0.5">
                                  <Move className="size-2" /> Draggable
                                </span>
                              </div>

                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-4">
                                <div className="text-caption font-bold text-white truncate">
                                  {selectedScene.mediaLabel || "3D Mechanism Kinematics"}
                                </div>
                              </div>

                              {/* Floating Formatting Pill when selected */}
                              {selectedCanvasElementId === "video-clip" && (
                                <div className="absolute -top-8 right-0 z-30 flex items-center gap-1.5 rounded-chip bg-ink border border-white/20 px-2.5 py-1 text-caption font-bold text-white shadow-xl whitespace-nowrap">
                                  <Film className="size-3 text-brand" />
                                  <span>Video Clip</span>
                                  <span className="text-white/40">|</span>
                                  {elementOffsets["video-clip"] && (
                                    <>
                                      <span className="text-warn-on-dark font-mono text-micro">
                                        X:{elementOffsets["video-clip"].x > 0 ? `+${elementOffsets["video-clip"].x}` : elementOffsets["video-clip"].x} Y:{elementOffsets["video-clip"].y > 0 ? `+${elementOffsets["video-clip"].y}` : elementOffsets["video-clip"].y}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleResetElementPosition("video-clip");
                                        }}
                                        className="text-white/70 hover:text-white flex items-center gap-0.5 cursor-pointer ml-0.5"
                                      >
                                        <RotateCcw className="size-2.5" /> Reset
                                      </button>
                                      <span className="text-white/40">|</span>
                                    </>
                                  )}
                                  <span className="text-ok-on-dark">⏱ 0:04 – 0:14</span>
                                  <span className="text-white/40">|</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setToMessage("Swapped to receptor binding 3D animation");
                                      setTimeout(() => setToMessage(null), 2000);
                                    }}
                                    className="text-brand hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
 Swap Clip
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Core Headline Overlay (Draggable) */}
                      <div
                        onClick={(e) => {
                          // Without this the click reached the stage's
                          // click-to-deselect and cleared the selection, so the
                          // title was the one element you could not select.
                          e.stopPropagation();
                          handleSelectCanvasElement("headline");
                        }}
                        onPointerDown={(e) => handlePointerDownElement(e, "headline")}
                        onPointerMove={(e) => handlePointerMoveElement(e, "headline")}
                        onPointerUp={(e) => handlePointerUpElement(e, "headline")}
                        onMouseEnter={() => setHoveredCanvasElementId("headline")}
                        onMouseLeave={() => setHoveredCanvasElementId(null)}
                        style={{
                          /* Drag offset composed with the element's timing
                             motion — both write transform, so they are joined
                             rather than one overwriting the other. */
                          transform: [
                            `translate(${elementOffsets["headline"]?.x || 0}px, ${elementOffsets["headline"]?.y || 0}px)`,
                            motionHeadline.transform,
                          ].filter(Boolean).join(" "),
                          opacity: motionHeadline.opacity,
                          pointerEvents: motionHeadline.onScreen ? undefined : "none",
                          ...motionTransition(motionHeadline.durationMs),
                        }}
                        className={cn(
                          "pointer-events-auto relative p-2.5 rounded-control transition-shadow cursor-grab active:cursor-grabbing",
                          selectedScene.mediaType && selectedScene.mediaType !== "none" ? "max-w-[54%]" : "max-w-[80%]",
                          selectedCanvasElementId === "headline"
                            ? "border-2 border-dashed border-brand bg-black/40 ring-4 ring-brand/20"
                            : hoveredCanvasElementId === "headline"
                            ? "border border-dashed border-white/60 bg-black/20"
                            : ""
                        )}
                      >
                        <h3 className="text-display sm:text-display-lg font-[850] tracking-tight leading-tight text-white drop-shadow-md select-none">
                          {selectedScene.title}
                        </h3>

                        {/* Floating Inline Formatting Pill */}
                        {selectedCanvasElementId === "headline" && (
                          <div className="absolute -top-9 left-0 z-30 flex items-center gap-1.5 rounded-chip bg-ink border border-white/20 px-2.5 py-1 text-caption font-bold text-white shadow-xl whitespace-nowrap">
                            <Type className="size-3 text-brand" />
                            <span>Title Layer</span>
                            <span className="text-white/40">|</span>
                            {elementOffsets["headline"] && (
                              <>
                                <span className="text-warn-on-dark font-mono text-micro">
                                  X:{elementOffsets["headline"].x > 0 ? `+${elementOffsets["headline"].x}` : elementOffsets["headline"].x} Y:{elementOffsets["headline"].y > 0 ? `+${elementOffsets["headline"].y}` : elementOffsets["headline"].y}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetElementPosition("headline");
                                  }}
                                  className="text-white/70 hover:text-white flex items-center gap-0.5 cursor-pointer ml-0.5"
                                >
                                  <RotateCcw className="size-2.5" /> Reset
                                </button>
                                <span className="text-white/40">|</span>
                              </>
                            )}
                            {(() => {
                              const timing = timingFor(selectedScene, "headline");
                              return timing ? (
                                <>
                                  <span className="text-ok-on-dark tabular-nums">
                                    ⏱ {timing.inAt.toFixed(1)}s – {timing.outAt.toFixed(1)}s
                                  </span>
                                  <span className="text-white/40">|</span>
                                  <span className="text-white/70">{timing.transitionIn}</span>
                                </>
                              ) : null;
                            })()}
                            <span className="text-white/40">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                setToMessage("Rephrased headline with clinical clarity");
                                setTimeout(() => setToMessage(null), 2000);
                              }}
                              className="text-brand hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
 Rephrase
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Subtitle / Narration Script Overlay (Word-by-Word Voiceover Sync) */}
                      <div
                        onPointerDown={(e) => handlePointerDownElement(e, "narration")}
                        onPointerMove={(e) => handlePointerMoveElement(e, "narration")}
                        onPointerUp={(e) => handlePointerUpElement(e, "narration")}
                        onMouseEnter={() => setHoveredCanvasElementId("narration")}
                        onMouseLeave={() => setHoveredCanvasElementId(null)}
                        style={{
                          /* Drag offset composed with the element's timing
                             motion — both write transform, so they are joined
                             rather than one overwriting the other. */
                          transform: [
                            `translate(${elementOffsets["narration"]?.x || 0}px, ${elementOffsets["narration"]?.y || 0}px)`,
                            motionNarration.transform,
                          ].filter(Boolean).join(" "),
                          opacity: motionNarration.opacity,
                          pointerEvents: motionNarration.onScreen ? undefined : "none",
                          ...motionTransition(motionNarration.durationMs),
                        }}
                        className={cn(
                          "pointer-events-auto relative p-2.5 rounded-panel transition-all cursor-grab active:cursor-grabbing select-none backdrop-blur-md",
                          selectedScene.mediaType && selectedScene.mediaType !== "none" ? "max-w-[56%]" : "max-w-[80%]",
                          selectedCanvasElementId === "narration"
                            ? "border-2 border-dashed border-brand bg-black/60 ring-4 ring-brand/20 shadow-2xl"
                            : hoveredCanvasElementId === "narration"
                            ? "border border-dashed border-white/60 bg-black/40"
                            : "border border-white/15 bg-black/30 hover:border-white/30"
                        )}
                      >
                        {/* Subtitle Sync Indicator Header */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-glyph bg-brand/25 border border-brand/20 text-micro font-extrabold uppercase tracking-wider text-brand-light">
                            <Mic2 className="size-2.5" /> Subtitle · Voiceover Sync
                          </span>
                          {scenePlaying && (
                            <span className="flex items-center gap-1 text-micro font-mono text-ok-on-dark">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Live Track
                            </span>
                          )}
                        </div>

                        {/* Text-by-Text Word Karaoke Subtitle Display */}
                        <p className="text-body-lg sm:text-body-lg font-normal leading-relaxed text-white drop-shadow-sm">
                          {(() => {
                            const words = (selectedScene.narration || "").trim().split(/\s+/);
                            const totalWords = words.length;
                            const dur = selectedScene.duration || 10;
                            // Scale active progress from 0.2s to dur - 0.6s
                            const activeProgress = Math.max(0, Math.min(1, (sceneCurrentTime - 0.2) / Math.max(0.1, dur - 0.8)));
                            const currentWordIndex = Math.min(
                              totalWords - 1,
                              Math.floor(activeProgress * totalWords)
                            );

                            return words.map((word, idx) => {
                              const isPast = idx < currentWordIndex;
                              const isCurrent = idx === currentWordIndex;

                              return (
                                <span
                                  key={`${word}-${idx}`}
                                  className={cn(
                                    "inline-block mr-1 transition-all duration-150 rounded-glyph px-0.5",
                                    isCurrent
                                      ? "text-brand-light font-bold scale-105 bg-brand/20 shadow-xs ring-2 ring-brand/15 -translate-y-0.5"
                                      : isPast
                                      ? "text-white font-medium opacity-100"
                                      : "text-white/35 font-normal"
                                  )}
                                >
                                  {word}
                                </span>
                              );
                            });
                          })()}
                        </p>

                        {selectedCanvasElementId === "narration" && (
                          <div className="absolute -top-8 left-0 z-30 flex items-center gap-1.5 rounded-chip bg-ink border border-white/20 px-2.5 py-1 text-caption font-bold text-white shadow-xl whitespace-nowrap">
                            <Mic2 className="size-3 text-brand" />
                            <span>Voiceover Sync</span>
                            <span className="text-white/40">|</span>
                            {elementOffsets["narration"] && (
                              <>
                                <span className="text-warn-on-dark font-mono text-micro">
                                  X:{elementOffsets["narration"].x > 0 ? `+${elementOffsets["narration"].x}` : elementOffsets["narration"].x} Y:{elementOffsets["narration"].y > 0 ? `+${elementOffsets["narration"].y}` : elementOffsets["narration"].y}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetElementPosition("narration");
                                  }}
                                  className="text-white/70 hover:text-white flex items-center gap-0.5 cursor-pointer ml-0.5"
                                >
                                  <RotateCcw className="size-2.5" /> Reset
                                </button>
                                <span className="text-white/40">|</span>
                              </>
                            )}
                            <span className="text-ok-on-dark">⏱ 0:01 – 0:13</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Grounding Badge */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCanvasElement("claim");
                        }}
                        className={cn(
                          "pointer-events-auto flex items-center justify-between pt-2 border-t border-white/10 text-caption text-white/60 cursor-pointer p-1 rounded-glyph transition-colors",
                          selectedCanvasElementId === "claim" && "ring-1 ring-ok bg-black/20"
                        )}
                      >
                        <span>{dossierNames[sourcePayload?.dossierId || "velmora"] || "DERMORA"}® · HCP Prescribing Brief</span>
                        <span className="rounded-glyph bg-emerald-950/80 border border-emerald-400/40 text-ok-on-dark px-2 py-0.5 font-bold">
                          🛡 {selectedScene.claim}
                        </span>
                      </div>
                    </div>

                    {/* ── Mini Scene Playback Controls & Scrubber (Scoped strictly to this scene) ── */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6 z-20">
                      <div className="flex items-center gap-3 text-white">
                        {/* Play/Pause Button */}
                        <button
                          type="button"
                          onClick={() => setScenePlaying(!scenePlaying)}
                          className="size-8 rounded-full bg-brand hover:bg-brand-deep flex items-center justify-center text-white shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          {scenePlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current ml-0.5" />}
                        </button>

                        {/* Scene Timecode Display */}
                        <span className="text-label font-mono font-bold text-white/90 shrink-0">
                          0:{Math.floor(sceneCurrentTime).toString().padStart(2, "0")} / 0:{selectedScene.duration}s
                        </span>

                        {/**
                         * The scrubber, grouped by shot rather than one
                         * continuous track. Shots are not a step of their own —
                         * they are the structure OF this scene, so they belong
                         * in the scene's own timeline, where the gaps say where
                         * one beat ends and the next begins.
                         */}
                        <div className="flex flex-1 items-center gap-1">
                          {(selectedScene.shots ?? []).length === 0 ? (
                            <div
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const pct = (e.clientX - rect.left) / rect.width;
                                setSceneCurrentTime(+(pct * (selectedScene.duration || 10)).toFixed(1));
                              }}
                              className="relative flex h-3 flex-1 cursor-pointer items-center overflow-hidden rounded-full bg-white/20"
                            >
                              <div
                                style={{ width: `${(sceneCurrentTime / (selectedScene.duration || 10)) * 100}%` }}
                                className="h-full rounded-full bg-brand transition-all duration-75"
                              />
                            </div>
                          ) : (
                            (selectedScene.shots ?? []).map((shot) => {
                              const span = Math.max(0.1, shot.endAt - shot.startAt);
                              // How far the playhead has moved through THIS shot.
                              const filled = Math.min(1, Math.max(0, (sceneCurrentTime - shot.startAt) / span));
                              const active = sceneCurrentTime >= shot.startAt && sceneCurrentTime < shot.endAt;
                              return (
                                <div
                                  key={shot.id}
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = (e.clientX - rect.left) / rect.width;
                                    setSceneCurrentTime(+(shot.startAt + pct * span).toFixed(1));
                                  }}
                                  title={`Shot ${shot.index} · ${shot.label} · ${shot.startAt.toFixed(1)}s–${shot.endAt.toFixed(1)}s`}
                                  style={{ flexGrow: span, flexBasis: 0 }}
                                  className={cn(
                                    "relative flex h-3 cursor-pointer items-center overflow-hidden rounded-full transition-colors",
                                    active ? "bg-white/30 ring-1 ring-white/40" : "bg-white/20 hover:bg-white/25"
                                  )}
                                >
                                  <div
                                    style={{ width: `${filled * 100}%` }}
                                    className="h-full rounded-full bg-brand transition-all duration-75"
                                  />
                                </div>
                              );
                            })
                          )}
                        </div>

                        <span className="text-caption text-white/60 font-bold hidden sm:inline shrink-0">
                          Scene {selectedScene.number} Scope
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Audio renders after the visuals, so it is still in flight
                      when the frame is already workable. Gone once the take
                      lands — a finished asset needs no label. */}
                  {selectedScenePhase < 2 && (
                    <div className="flex flex-col items-start gap-2">
                      {(["voiceover", "sfx"] as const).map((elementId) => {
                        const timing = timingFor(selectedScene, elementId);
                        if (!timing) return null;
                        return (
                          <AudioGeneratingPill
                            key={elementId}
                            label={ELEMENT_LABELS[elementId] ?? elementId}
                            timing={timing}
                          />
                        );
                      })}
                    </div>
                  )}
                 </div>
                </div>

                {/* ── Multi-Layer Production Timeline Bar (Collapsible) ── */}
                <div className="border-t border-hair bg-canvas text-ink shrink-0">
                  <div className="flex h-9 items-center justify-between px-4 border-b border-hair bg-card">
                    <div className="flex items-center gap-2.5 text-label font-bold text-ink">
                      <Layers className="size-3.5 text-brand" />
                      <span>Production Layers</span>
                      <span className="rounded-glyph bg-ok-bg px-2 py-0.5 text-micro font-semibold text-[#5a6660]">
                        Scene {selectedScene.number} · {selectedScene.duration}s
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTimelineOpen(!timelineOpen)}
                      className="flex items-center gap-1.5 text-label font-bold text-brand hover:text-brand-deep transition-colors cursor-pointer"
                    >
                      <span>{timelineOpen ? "Hide Layers" : "Show Layers"}</span>
                      {timelineOpen ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
                    </button>
                  </div>

                  {timelineOpen && (
                    <div className="max-h-[200px] overflow-y-auto bg-card select-none flex flex-col text-label border-b border-hair">
                      <div className="h-6 shrink-0 flex items-center border-b border-hair bg-subtle text-micro text-ink-3 font-bold sticky top-0 z-10 px-3">
                        <div className="w-[160px] shrink-0 border-r border-hair pr-2 uppercase">Scene {selectedScene.number} Tracks</div>
                        <div className="flex-1 flex justify-between px-3">
                          <span>0:00</span>
                          <span>0:03</span>
                          <span>0:06</span>
                          <span>0:09</span>
                          <span>0:12</span>
                          <span>0:{selectedScene.duration}</span>
                        </div>
                      </div>

                      <div className="flex flex-col divide-y divide-hair">
                        {/* Track 1: Background */}
                        <div
                          onClick={() => handleSelectCanvasElement("moa")}
                          className={cn(
                            "h-8 flex items-center transition-colors cursor-pointer",
                            selectedCanvasElementId === "moa" ? "bg-tint/40" : "bg-canvas hover:bg-card"
                          )}
                        >
                          <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-hair bg-card text-caption font-bold">
                            <ImageIcon className="size-3.5 text-ok" />
                            <span className="truncate">1. Bg Canvas</span>
                          </div>
                          <div className="flex-1 h-full p-1">
                            <div className="h-full rounded-glyph bg-ok-bg border border-ok-line flex items-center px-2 text-micro font-bold text-ok">
                              Bg_Emerald_Gradient.png [0:00 – 0:{selectedScene.duration}]
                            </div>
                          </div>
                        </div>

                        {/* Track 2: 3D MoA Model */}
                        <div
                          onClick={() => handleSelectCanvasElement("moa")}
                          className={cn(
                            "h-8 flex items-center transition-colors cursor-pointer",
                            selectedCanvasElementId === "moa" ? "bg-tint/40" : "bg-canvas hover:bg-card"
                          )}
                        >
                          <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-hair bg-card text-caption font-bold">
                            <Film className="size-3.5 text-brand" />
                            <span className="truncate">2. 3D MoA Target</span>
                          </div>
                          <div className="flex-1 h-full p-1">
                            <div className="h-full rounded-glyph bg-tint border border-brand/20 flex items-center px-2 text-micro font-bold text-brand-deep">
                              3D_CLEARSKIN_Anatomy.mp4 [0:00 – 0:{selectedScene.duration}]
                            </div>
                          </div>
                        </div>

                        {/* Track 3: Clinical Chart Image Layer */}
                        <div
                          onClick={() => handleSelectCanvasElement("image")}
                          className={cn(
                            "h-8 flex items-center transition-colors cursor-pointer",
                            selectedCanvasElementId === "image" ? "bg-tint/40" : "bg-canvas hover:bg-card"
                          )}
                        >
                          <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-hair bg-card text-caption font-bold">
                            <ImageIcon className="size-3.5 text-lime-ink" />
                            <span className="truncate">3. Chart Image</span>
                          </div>
                          <div className="flex-1 h-full p-1">
                            <div className="h-full w-[85%] rounded-glyph bg-lime-bg border border-lime-line flex items-center px-2 text-micro font-bold text-lime-ink truncate">
                              CLEARSKIN_Phase_III_ForestPlot.png [0:02 – 0:12]
                            </div>
                          </div>
                        </div>

                        {/* Track 4: 3D Video Clip Layer */}
                        <div
                          onClick={() => handleSelectCanvasElement("video-clip")}
                          className={cn(
                            "h-8 flex items-center transition-colors cursor-pointer",
                            selectedCanvasElementId === "video-clip" ? "bg-tint/40" : "bg-canvas hover:bg-card"
                          )}
                        >
                          <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-hair bg-card text-caption font-bold">
                            <Film className="size-3.5 text-info-on-dark" />
                            <span className="truncate">4. B-Roll Video</span>
                          </div>
                          <div className="flex-1 h-full p-1">
                            <div className="h-full w-[75%] rounded-glyph bg-info-bg border border-info-line flex items-center px-2 text-micro font-bold text-info-on-dark truncate">
                              Cellular_Receptor_Binding_4K.mp4 [0:04 – 0:{selectedScene.duration}]
                            </div>
                          </div>
                        </div>

                        {/* Track 5: Headline Copy */}
                        <div
                          onClick={() => handleSelectCanvasElement("headline")}
                          className={cn(
                            "h-8 flex items-center transition-colors cursor-pointer",
                            selectedCanvasElementId === "headline" ? "bg-tint/40" : "bg-canvas hover:bg-card"
                          )}
                        >
                          <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-hair bg-card text-caption font-bold">
                            <Type className="size-3.5 text-info-on-dark" />
                            <span className="truncate">5. Text Headline</span>
                          </div>
                          <div className="flex-1 h-full p-1">
                            <div className="h-full w-3/4 rounded-glyph bg-info-bg border border-info-line flex items-center px-2 text-micro font-bold text-info-on-dark truncate">
                              &quot;{selectedScene.title}&quot; [0:01 – 0:09]
                            </div>
                          </div>
                        </div>

                        {/* Track 6: Voiceover */}
                        <div
                          onClick={() => handleSelectCanvasElement("narration")}
                          className={cn(
                            "h-8 flex items-center transition-colors cursor-pointer",
                            selectedCanvasElementId === "narration" ? "bg-tint/40" : "bg-canvas hover:bg-card"
                          )}
                        >
                          <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-hair bg-card text-caption font-bold">
                            <Mic2 className="size-3.5 text-warn" />
                            <span className="truncate">6. Voiceover</span>
                          </div>
                          <div className="flex-1 h-full p-1">
                            <div className="h-full w-4/5 rounded-glyph bg-warn-bg border border-warn-line flex items-center px-2 text-micro font-bold text-warn truncate">
                              Eleanor VO · Clinical narration [0:01 – 0:13]
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════════
                MODE 3: FINAL SHARED REVIEW VIEW (Master Player with YouTube-Style Segmented Scrubber)
               ══════════════════════════════════════════════════════════════════════════════════ */}
            {isReview && (
              <div className="relative flex min-h-0 flex-1 flex-col bg-[#0d1411]">
                {/* Master Video Container */}
                <div className="flex min-h-0 flex-1 items-center justify-center p-4 lg:p-8">
                  <div className="relative aspect-video w-full max-w-[920px] rounded-card bg-black shadow-on-dark ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">
                    {/* Master Video Canvas */}
                    <div className="absolute inset-0">
                      <MasterVideoSequenceComposition
                        sceneList={sceneList}
                        activeScene={activeMasterChapter}
                        brandName={dossierNames[sourcePayload?.dossierId || "velmora"] || "DERMORA"}
                        isPlaying={masterPlaying}
                      />
                    </div>

                    {/* Top Bar Pill in Player */}
                    <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white text-label">
                      <div className="flex items-center gap-2 font-extrabold">
                        <span className="rounded-chip bg-ok/20 border border-emerald-400/30 px-2.5 py-0.5 text-ok-on-dark">
                          HD Master Render
                        </span>
                        <span>{dossierNames[sourcePayload?.dossierId || "velmora"] || "Velmora"} HCP Master Video</span>
                      </div>
                      <div className="text-white/70 font-semibold">
                        Chapter {activeMasterChapter?.number} of {chapters.length}
                      </div>
                    </div>

                    {/* ── Bottom Master Video Controls with YouTube-Style Segmented Chapter Scrubber ── */}
                    <div className="relative z-10 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-4 pt-8 text-white space-y-3">
                      {/* YouTube-style Segmented Chapter Seek Bar */}
                      <div className="relative w-full">
                        {/* Floating Chapter Tooltip on Hover */}
                        {hoveredChapter && (
                          <div
                            style={{
                              left: `${((hoveredScrubTime || hoveredChapter.start) / totalDurationSeconds) * 100}%`,
                            }}
                            className="absolute -top-10 -translate-x-1/2 rounded-chip bg-[#1a2620] border border-white/20 px-3 py-1 text-caption font-bold text-white shadow-xl pointer-events-none whitespace-nowrap z-30"
                          >
                            <span>{hoveredScrubTime ? `0:${Math.floor(hoveredScrubTime).toString().padStart(2, "0")}` : ""}</span>
                            <span className="text-white/40 mx-1">·</span>
                            <span className="text-ok-on-dark">{hoveredChapter.title}</span>
                          </div>
                        )}

                        {/* Segmented Timeline Track */}
                        <div className="flex items-center gap-1.5 w-full h-4 py-1 cursor-pointer">
                          {chapters.map((ch) => {
                            const segWidthPct = (ch.duration / totalDurationSeconds) * 100;
                            const progressInChapter = Math.max(
                              0,
                              Math.min(1, (masterCurrentTime - ch.start) / ch.duration)
                            );

                            return (
                              <div
                                key={ch.id}
                                style={{ width: `${segWidthPct}%` }}
                                onMouseEnter={(e) => {
                                  setHoveredChapter(ch);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const pct = (e.clientX - rect.left) / rect.width;
                                  setHoveredScrubTime(+(ch.start + pct * ch.duration).toFixed(1));
                                }}
                                onMouseMove={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const pct = (e.clientX - rect.left) / rect.width;
                                  setHoveredScrubTime(+(ch.start + pct * ch.duration).toFixed(1));
                                }}
                                onMouseLeave={() => {
                                  setHoveredChapter(null);
                                  setHoveredScrubTime(null);
                                }}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const pct = (e.clientX - rect.left) / rect.width;
                                  setMasterCurrentTime(+(ch.start + pct * ch.duration).toFixed(1));
                                }}
                                className="group relative h-2 rounded-full bg-white/25 hover:h-2.5 transition-all overflow-hidden"
                              >
                                <div
                                  style={{ width: `${progressInChapter * 100}%` }}
                                  className="h-full bg-brand transition-all duration-75"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Master Playback Controls Row */}
                      <div className="flex items-center justify-between text-white text-body">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setMasterPlaying(!masterPlaying)}
                            className="size-9 rounded-full bg-brand hover:bg-brand-deep flex items-center justify-center text-white shadow-md cursor-pointer transition-transform active:scale-95"
                          >
                            {masterPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current ml-0.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-white/80 hover:text-white cursor-pointer"
                          >
                            {isMuted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
                          </button>

                          <span className="font-mono font-bold text-body text-white">
                            0:{Math.floor(masterCurrentTime).toString().padStart(2, "0")} / 0:{totalDurationSeconds}s
                          </span>

                          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-chip bg-white/10 px-3 py-0.5 text-label font-bold text-white/90">
                            <span className="size-1.5 rounded-full bg-brand" />
                            <span>
                              Chapter {activeMasterChapter?.number}: {activeMasterChapter?.title}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-caption font-extrabold uppercase bg-white/10 px-2 py-0.5 rounded-glyph text-white/80">
                            CC
                          </span>
                          <span className="text-caption font-extrabold text-brand bg-brand/15 px-2 py-0.5 rounded-glyph">
                            HD 1080p
                          </span>
                          <Button variant="ghost" size="icon" className="size-8 text-white hover:bg-white/10">
                            <Maximize2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
      }
      panel={
        <>
          <div className="p-2.5 border-b border-hair bg-subtle">
            {studioMode === "scenes" ? (
              /* ── SCRIPT STAGE: Only Chat & Claims Tabs (No Edit Tab) ── */
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#e6ebe6] rounded-panel border border-hair shadow-inner-xs">
                <InspectorTabButton
                  tab="assistant"
                  current={activeTab}
                  onClick={setActiveTab}
                  badge={<span className="size-1.5 rounded-full bg-ok animate-pulse shrink-0 mr-1" />}
                >
                  Chat
                </InspectorTabButton>
                <InspectorTabButton
                  tab="evidence"
                  current={activeTab}
                  onClick={setActiveTab}
                  count={APPROVED_CLAIMS.length}
                >
                  Claims
                </InspectorTabButton>
              </div>
            ) : (
              /* ── CANVAS EDITOR / REVIEW STAGES: Chat, Edit / Comments, Claims ── */
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#e6ebe6] rounded-panel border border-hair shadow-inner-xs">
                <InspectorTabButton
                  tab="assistant"
                  current={activeTab}
                  onClick={setActiveTab}
                  badge={<span className="size-1.5 rounded-full bg-ok animate-pulse shrink-0 mr-1" />}
                >
                  Chat
                </InspectorTabButton>
                {isReview ? (
                  <InspectorTabButton
                    tab="comments"
                    current={activeTab}
                    onClick={setActiveTab}
                    count={openComments.length}
                  >
                    Comments
                  </InspectorTabButton>
                ) : (
                  <InspectorTabButton
                    tab="edit"
                    current={activeTab}
                    onClick={setActiveTab}
                  >
                    Edit
                  </InspectorTabButton>
                )}
                <InspectorTabButton
                  tab="evidence"
                  current={activeTab}
                  onClick={setActiveTab}
                  count={APPROVED_CLAIMS.length}
                >
                  Claims
                </InspectorTabButton>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {/* ── TAB 1: PERSISTENT SWISHX CHAT ── */}
            {activeTab === "assistant" && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 border-b border-hair bg-canvas flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-ok animate-pulse" />
                    <span className="text-label font-extrabold text-ink">Direct with SwishX · Online</span>
                  </div>
                  <span className="text-caption text-ink-3 font-semibold">Pharma-Compliant Copilot</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col max-w-[88%] text-body-lg leading-relaxed transition-all",
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      {msg.role === "swishx" && (
                        <div className="flex items-center gap-1.5 mb-1 text-label font-bold text-brand-deep">
                          <span className="flex size-4.5 items-center justify-center rounded-full bg-brand text-micro font-black text-white">
                            SX
                          </span>
                          <span>SwishX</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-panel px-3.5 py-2.5 text-body shadow-xs",
                          msg.role === "user"
                            ? "bg-brand text-white font-medium rounded-br-xs"
                            : "bg-card text-ink border border-hair rounded-bl-xs font-normal"
                        )}
                      >
                        <FormattedMessageText text={msg.text} />
                        {msg.chips && msg.chips.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-hair flex flex-wrap gap-1.5">
                            {msg.chips.map((chip, chipIdx) => (
                              <button
                                key={chipIdx}
                                type="button"
                                onClick={() => handleSendChatMessage(chip)}
                                className="text-label font-bold text-brand-deep bg-tint hover:bg-tint-strong border border-brand/20 px-2.5 py-1 rounded-chip transition cursor-pointer shadow-2xs hover:-translate-y-0.5"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={studioChatEndRef} />
                </div>

                {/* Chat Input Box with Attached Primary Action Bar */}
                <div className="p-3 border-t border-hair bg-canvas space-y-2">
                  {/* Attached Primary Action Bar in Script Mode */}
                  {isScenes && (
                    <div className="rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2 shadow-2xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded-full bg-brand/15 text-brand grid place-items-center shrink-0">
                          <LogoMark size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-label font-bold text-ink truncate">
                            {isScriptComplete ? "Script approved & claims grounded" : "Script in progress"}
                          </div>
                          <div className="text-micro text-ink-3 truncate">
                            {sceneList.length} scenes structured · ready for canvas
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleStartSceneEditor}
                        disabled={!isScriptComplete}
                        size="sm"
                        className={cn(
                          "h-7.5 px-3 rounded-chip text-label font-bold shadow-xs transition-all shrink-0 cursor-pointer",
                          isScriptComplete
                            ? "bg-brand hover:bg-brand-deep text-white hover:scale-[1.02]"
                            : "bg-black/10 text-black/40 cursor-not-allowed"
                        )}
                      >
                        <LogoMark size={12} className="mr-1" />
                        <span>Generate Scenes</span>
                      </Button>
                    </div>
                  )}

                  {/* Attached Primary Action Bar in Scene Editor Mode */}
                  {isEditor && (
                    <div className="rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2 shadow-2xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded-full bg-brand/15 text-brand grid place-items-center shrink-0">
                          <Film className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-label font-bold text-ink truncate">
                            Ready for production
                          </div>
                          <div className="text-micro text-ink-3 truncate">
                            {sceneList.length} scenes customized
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleOpenGenerateVideoModal}
                        size="sm"
                        className="h-7.5 px-3 rounded-chip text-label font-bold shadow-xs transition-all shrink-0 cursor-pointer bg-brand hover:bg-brand-deep text-white hover:scale-[1.02]"
                      >
                        <Zap className="size-3 mr-1 fill-current" />
                        <span>Generate and Publish</span>
                      </Button>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="flex flex-col gap-2 rounded-panel border border-hair bg-card p-2.5 shadow-xs focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15"
                  >
                    {/* Attached Context Chips */}
                    {attachedContexts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-1.5 bg-subtle rounded-control border border-hair">
                        {attachedContexts.map((ctx) => (
                          <span
                            key={ctx.id}
                            className="inline-flex items-center gap-1.5 rounded-chip bg-card border border-brand/20 px-2 py-0.5 text-label font-bold text-brand-deep shadow-2xs"
                          >
                            {ctx.type === "element" ? (
                              <LogoMark size={12} className="text-brand shrink-0" />
                            ) : ctx.type === "scene" ? (
                              <Film className="size-3 text-brand shrink-0" />
                            ) : ctx.type === "file" ? (
                              <Paperclip className="size-3 text-brand shrink-0" />
                            ) : (
                              <FileCheck2 className="size-3 text-brand shrink-0" />
                            )}
                            <span className="truncate max-w-[200px]">
                              <strong>{ctx.label}:</strong> {ctx.detail}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAttachedContexts((prev) => prev.filter((c) => c.id !== ctx.id))}
                              className="size-3.5 rounded-full hover:bg-black/10 flex items-center justify-center text-ink-4 hover:text-black cursor-pointer"
                            >
                              <X className="size-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <textarea
                      value={directorInput}
                      onChange={(e) => setDirectorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      /**
                       * Held shut until every scene has its structure. There is
                       * nothing to direct before that — an instruction about
                       * copy or timing has no copy or timing to land on, and it
                       * would be silently dropped by the generation that
                       * overwrites it a second later. It opens the moment pass 1
                       * finishes, while the media is still rendering.
                       */
                      disabled={isEditor && !structureReady}
                      placeholder={
                        isEditor && !structureReady
                          ? "Generating your scenes..."
                          : isReview
                          ? "Ask SwishX or type 'Add comment at 0:24 that...'..."
                          : "Direct SwishX to modify scenes, copy, or timing..."
                      }
                      rows={2}
                      className="w-full resize-none text-body text-ink placeholder:text-ink-3 focus:outline-none disabled:cursor-not-allowed"
                    />

                    <div className="flex items-center justify-between pt-1 border-t border-hair">
                      <div className="flex items-center gap-2">
                        {/* Plus Context Menu Button */}
                        <div className="relative">
                          <input
                            type="file"
                            ref={chatFileInputRef}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setAttachedContexts((prev) => [
                                  ...prev,
                                  {
                                    id: `file-${Date.now()}`,
                                    type: "file",
                                    label: "File",
                                    detail: file.name,
                                  },
                                ]);
                                setToMessage(`Attached: ${file.name}`);
                                setTimeout(() => setToMessage(null), 2500);
                              }
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => setChatContextMenuOpen(!chatContextMenuOpen)}
                            className="size-7 rounded-chip text-ink-3 hover:text-ink hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer border border-hair-2 bg-card shadow-2xs"
                            title="Add context (Scenes, Files, Citations)"
                          >
                            <Plus className="size-3.5 text-brand" />
                          </button>

                          {chatContextMenuOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 rounded-panel border border-hair-2 bg-card p-1.5 shadow-xl z-50 space-y-1">
                              <div className="px-2 py-1 text-micro font-extrabold uppercase tracking-wider text-ink-4">
                                Attach Context to Chat
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  chatFileInputRef.current?.click();
                                  setChatContextMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-body font-medium text-ink hover:bg-tint hover:text-brand-deep rounded-control transition text-left cursor-pointer"
                              >
                                <Paperclip className="size-3.5 text-brand" />
                                <span>Upload file from computer</span>
                              </button>

                              <div className="border-t border-hair my-1" />
                              <div className="px-2 py-0.5 text-micro font-extrabold uppercase tracking-wider text-ink-4">
                                Attach Scene Scope
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-0.5">
                                {sceneList.map((sc) => {
                                  const inScope = scopedSceneIds.includes(sc.id);
                                  return (
                                    <button
                                      key={sc.id}
                                      type="button"
                                      /* Toggles the same list the canvas ticks write to, and
                                         stays open so several scenes can be picked in one go. */
                                      onClick={() => toggleSceneScope(sc)}
                                      aria-pressed={inScope}
                                      className={cn(
                                        "w-full flex items-center gap-1.5 px-2.5 py-1 text-label font-medium rounded-chip transition text-left cursor-pointer",
                                        inScope ? "bg-tint text-brand-deep font-bold" : "text-ink-2 hover:bg-subtle"
                                      )}
                                    >
                                      <span className={cn(
                                        "grid size-3.5 shrink-0 place-items-center rounded-full border transition-colors",
                                        inScope ? "border-brand bg-brand text-white" : "border-hair-3 text-transparent"
                                      )}>
                                        <Check className="size-2 stroke-[3]" />
                                      </span>
                                      <span className="truncate flex-1">Scene {sc.number}: {sc.title}</span>
                                      <span className="text-micro text-ink-4 font-bold shrink-0">({sc.narrativeTag || "Evidence"})</span>
                                    </button>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setAttachedContexts((prev) => [
                                    ...prev,
                                    {
                                      id: `all-scenes-${Date.now()}`,
                                      type: "scene",
                                      label: "All Scenes",
                                      detail: `All ${sceneList.length} storyboard scenes`,
                                    },
                                  ]);
                                  setChatContextMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-label font-bold text-brand-deep bg-tint/70 hover:bg-tint rounded-control transition text-left cursor-pointer"
                              >
                                <Layers className="size-3 text-brand" />
                                <span>Attach All Scenes Scope</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-caption text-ink-3">
                          {isReview ? "💡 Ask questions or add comments via AI" : "💡 Grounded against FDA Dossier"}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="sm"
                        disabled={!directorInput.trim() && attachedContexts.length === 0}
                        className="size-7 rounded-full bg-brand hover:bg-brand-deep text-white p-0 flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-30"
                      >
                        <Send className="size-3.5" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── TAB 2: COMMENTS (what a reviewer sees on the shared link) ── */}
            {activeTab === "comments" && (
              <ReviewComments
                comments={comments}
                currentTimeLabel={`${Math.floor(masterCurrentTime / 60)}:${Math.floor(masterCurrentTime % 60).toString().padStart(2, "0")}`}
                medicalReviewDone={mlrCheckResolved}
                regulatoryReviewDone={qaCheckResolved}
                onPost={(text) => {
                  /* A reviewer's comment enters the SAME list the owner works
                     in the editor. Two lists would mean the owner resolving
                     one record and the reviewer reading another. */
                  setComments((prev) => [
                    {
                      id: `cm-${(commentSeq.current += 1)}`,
                      sceneId: selectedScene.id,
                      sceneNumber: selectedScene.number,
                      elementId: "narration",
                      elementLabel: ELEMENT_LABELS.narration,
                      text,
                      author: "Sarah Lin · Medical",
                      source: "team",
                      at: "Just now",
                      status: "open",
                      sentToChat: false,
                    },
                    ...prev,
                  ]);
                  setToMessage("Comment posted to the project owner");
                  setTimeout(() => setToMessage(null), 2500);
                }}
              />
            )}
            {activeTab === "edit" && !isReview && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="border-b border-hair pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-micro font-extrabold uppercase tracking-wider text-ink-3">
                      Scene Inspector
                    </div>
                    <h3 className="text-subhead font-[850] text-ink mt-0.5">
                      Scene {selectedScene.number}: {selectedScene.title}
                    </h3>
                  </div>
                  <span className="rounded-chip bg-tint border border-brand/20 px-2.5 py-0.5 text-caption font-extrabold text-brand-deep">
                    ({selectedScene.narrativeTag || "Evidence"})
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/**
                   * Read-only, both of them. This tab stopped being a form: the
                   * scene's copy is shown so you can see what is there, and
                   * changing it goes through the chat like every other edit, so
                   * there is one route to a change rather than a form and a
                   * conversation that can disagree about which won.
                   */}
                  {([
                    { id: "headline", title: "Headline Text (Chapter Title)", meta: "On-screen header", body: selectedScene.title },
                    {
                      id: "narration",
                      title: "Narration Script",
                      meta: `${selectedScene.narration.split(" ").filter(Boolean).length} words`,
                      body: selectedScene.narration,
                    },
                  ] as const).map((field) => (
                    <div key={field.id}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-label font-bold text-ink-2">{field.title}</span>
                        <span className="text-caption font-normal text-ink-4">{field.meta}</span>
                      </div>
                      <div className="rounded-control border border-hair-2 bg-canvas p-2.5">
                        <p className="text-body font-medium leading-relaxed text-ink">{field.body}</p>
                        <div className="mt-2 flex justify-end border-t border-hair pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("assistant");
                              attachElementToChat(field.id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-glyph px-2 py-1 text-caption font-bold text-brand transition-colors hover:bg-tint cursor-pointer"
                          >
                            <MessageSquarePlus className="size-3" />
                            <span>Add to chat</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Shots, between the scene's own copy above and the
                      scene-wide prompts below — a shot is smaller than the
                      scene and larger than one field. */}
                  <ShotCards
                    scene={selectedScene}
                    currentTime={sceneCurrentTime}
                    onScrub={(seconds) => {
                      setSceneCurrentTime(seconds);
                      setScenePlaying(false);
                    }}
                    onAddToChat={(shot) => {
                      setActiveTab("assistant");
                      setAttachedContexts((prev) => [
                        ...prev.filter((c) => c.type !== "element"),
                        {
                          id: `shot-${shot.id}`,
                          type: "element" as const,
                          label: `Scene ${selectedScene.number} · Shot ${shot.index}`,
                          detail: `${shot.startAt.toFixed(1)}s–${shot.endAt.toFixed(1)}s · ${shot.label}`,
                        },
                      ]);
                      setDirectorInput(`In shot ${shot.index} of scene ${selectedScene.number}, `);
                    }}
                    onReplaceMedia={(shot, elementId, kind) => {
                      setActiveTab("assistant");
                      setAttachedContexts((prev) => [
                        ...prev.filter((c) => c.type !== "element"),
                        {
                          id: `shot-media-${shot.id}-${elementId}`,
                          type: "element" as const,
                          label: `Scene ${selectedScene.number} · Shot ${shot.index} · ${kind === "video" ? "Video Clip" : "Image Asset"}`,
                          detail: selectedScene.mediaLabel || "Scene media",
                        },
                      ]);
                      setDirectorInput(
                        kind === "video"
                          ? `Swap the video clip in shot ${shot.index} for `
                          : `Replace the image in shot ${shot.index} with `
                      );
                    }}
                  />

                </div>
              </div>
            )}

            {/* ── TAB 3: CLAIMS & EVIDENCE LIBRARY ── */}
            {activeTab === "evidence" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-hair pb-2.5">
                  <div>
                    <div className="text-micro font-extrabold uppercase tracking-[0.12em] text-ink-3">
                      Compliance Grounding
                    </div>
                    <h2 className="mt-0.5 text-body-lg font-[800] text-ink">{APPROVED_CLAIMS.length} Approved Claims</h2>
                  </div>
                  <span className="rounded-chip bg-ok-bg text-ok border border-ok-line px-2.5 py-0.5 text-micro font-bold">
                    ✓ PromoMats Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {APPROVED_CLAIMS.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "rounded-control border p-3 text-left transition-all duration-300",
                        highlightedClaimId === c.id
                          ? "border-brand bg-tint ring-2 ring-brand/25 shadow-sm"
                          : "border-hair bg-canvas hover:border-brand/20"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-micro font-bold text-brand-deep bg-tint px-2 py-0.5 rounded-glyph">
                          {c.tag}
                        </span>
                        <span className="text-caption font-bold text-ok">✓ {c.status}</span>
                      </div>
                      <h4 className="text-body font-bold text-ink">{c.title}</h4>
                      <p className="text-caption text-ink-3 leading-relaxed mt-1">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      }
      overlay={
        <>
        {selectedCanvasElementId && elementMenuAt && !commentsOpen && (
          <ElementActionBar
            at={elementMenuAt}
            elementLabel={ELEMENT_LABELS[selectedCanvasElementId] ?? "Element"}
            onAddToChat={() => {
              attachElementToChat(selectedCanvasElementId);
              setElementMenuAt(null);
            }}
            onComment={(text, alsoSendToChat) => addComment(selectedCanvasElementId, text, alsoSendToChat)}
            onDismiss={() => setElementMenuAt(null)}
          />
        )}

        {commentsOpen && (
          <CommentsModal
            comments={comments}
            teamUnlocked={teamCommentsUnlocked}
            onResolve={(id, reason) => closeComment(id, "resolved", reason)}
            onReject={(id, reason) => closeComment(id, "rejected", reason)}
            onSendToChat={(id) => {
              const comment = comments.find((c) => c.id === id);
              if (comment) sendCommentToAgent(comment);
            }}
            onJump={jumpToComment}
            onClose={() => setCommentsOpen(false)}
          />
        )}

        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-control bg-ink text-white px-4 py-2 text-body font-bold shadow-lg">{toastMessage}</div>
        )}

        {generateVideoModalOpen && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Video Generation"
          >
            <div className="rise-in w-full max-w-[560px] overflow-hidden rounded-card border border-white/50 bg-card shadow-float">
              <div className="flex items-center justify-between border-b border-hair px-6 py-4.5 bg-canvas">
                <div>
                  <div className="flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-[0.14em] text-brand">
                    <LogoMark size={14} /> Generation Engine
                  </div>
                  <h2 className="mt-0.5 text-display font-[850] tracking-tight text-ink">
                    Confirm Video Generation
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGenerateVideoModalOpen(false)}
                  className="size-8 rounded-full hover:bg-black/5 cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-6 space-y-5">
                {/* Cost & Spec Card */}
                <div className="rounded-panel bg-[#121614] border border-white/10 p-5 text-white shadow-md">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      {/* What has ALREADY gone, which is the number the old
                          card was missing entirely. */}
                      <div className="text-label font-extrabold uppercase tracking-wider text-white/60">
                        Used so far
                      </div>
                      <div className="mt-0.5 text-display font-[900] text-white tabular-nums">
                        ⚡ {creditsUsed.toLocaleString()} Credits
                      </div>
                      <div className="mt-1 text-caption text-white/55">
                        Partial generation and edits
                      </div>
                    </div>
                    <span className="shrink-0 rounded-chip bg-brand/20 border border-brand px-3 py-1 text-label font-bold text-brand">
                      {selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"}
                    </span>
                  </div>

                  {/* What confirming costs comes FIRST, because it is the
                      decision; the adjusted total follows as the consequence
                      of the two figures above it. */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 py-3 text-label">
                    <span className="text-white/55">Final generation needs</span>
                    <strong className="text-white tabular-nums">
                      + {finalRenderCost.toLocaleString()} Credits
                    </strong>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3">
                    <span className="text-label text-white/55">
                      Adjusted budget
                      {/* The arithmetic is shown rather than left implied: this
                          figure is the sum of the two rows above it, and a
                          total nobody can reconcile is the defect this card
                          had in the first place. */}
                      <span className="ml-2 text-caption tabular-nums text-white/40">
                        {creditsUsed.toLocaleString()} used + {finalRenderCost.toLocaleString()} to render
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <strong className="text-body-lg font-[850] text-white tabular-nums">
                        {creditsTotal.toLocaleString()} Credits
                      </strong>
                      {creditsTotal > creditBudget ? (
                        <span className="rounded-glyph border border-warn-line/40 bg-warn-bg/15 px-2 py-0.5 text-caption font-bold tabular-nums text-warn-on-dark">
                          {(creditsTotal - creditBudget).toLocaleString()} over the {creditBudget.toLocaleString()} agreed
                        </span>
                      ) : (
                        <span className="rounded-glyph border border-ok/30 bg-ok/15 px-2 py-0.5 text-caption font-bold tabular-nums text-ok-on-dark">
                          within the {creditBudget.toLocaleString()} agreed
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-label text-white/75">
                    <div>
                      <span className="block text-caption font-bold uppercase text-white/50">Duration &amp; Scenes</span>
                      <strong className="text-white">{totalDurationSeconds}s · {sceneList.length} Scenes</strong>
                    </div>
                    <div>
                      <span className="block text-caption font-bold uppercase text-white/50">Estimated Render Time</span>
                      <strong className="text-white">~{selectedQuality === "cinematic" ? "12–14 min" : "7–9 min"}</strong>
                    </div>
                    <div>
                      <span className="block text-caption font-bold uppercase text-white/50">Balance after</span>
                      <strong className="text-ok-on-dark tabular-nums">
                        {(teamBalance - creditsTotal).toLocaleString()} of {teamBalance.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Automated Quality & MLR Pre-Flight Verification */}
                <PreflightPanel
                  onFixAll={handleAutoFixBoth}
                  checks={[
                    mlrCheckResolved
                      ? {
                          id: "mlr",
                          source: "MLR",
                          title: "24 verified claims cited",
                          detail: "EMBRACE-3 §2.4 grounded (p < 0.001)",
                        }
                      : {
                          id: "mlr",
                          source: "MLR",
                          severity: "blocker" as const,
                          title: "Unverified comparative claim",
                          detail: "Scene 3 claims superiority without citing a head-to-head trial comparator.",
                          onFix: handleFixMlrBlocker,
                        },
                    qaCheckResolved
                      ? {
                          id: "qa",
                          source: "Quality",
                          title: "Script pacing and audio sync",
                          detail: "Optimal 135 wpm speech cadence",
                        }
                      : {
                          id: "qa",
                          source: "Quality",
                          severity: "warning" as const,
                          title: "Narration density over 150 wpm",
                          detail: "Scene 3 voiceover exceeds speech pacing limits with redundant words.",
                          onFix: handleFixQaBlocker,
                        },
                    { id: "isi", source: "MLR", title: "Fair balance and ISI present", detail: "Contraindication footnotes verified" },
                    { id: "terms", source: "Quality", title: "Medical terminology clear", detail: "Generic name and dosing accurate" },
                    { id: "refs", source: "MLR", title: "Reference list complete", detail: "All citations resolve to approved sources" },
                    { id: "sync", source: "Quality", title: "Scene timing within budget", detail: "5 scenes fit the 60 second runtime" },
                  ]}
                />

                {/* Informational Notice */}
                <p className="text-body text-ink-3 leading-relaxed">
                  Generation renders in the background using neural motion models. You will receive an email notification when processing completes, and can continue working in SwishX.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-hair">
                  {hasBlockers ? (
                    <span className="text-label text-danger font-semibold flex items-center gap-1">
                      <AlertTriangle className="size-3 shrink-0" />
                      Fix {blockerCount} {blockerCount === 1 ? "blocker" : "blockers"} to enable generation
                    </span>
                  ) : (
                    <span className="text-label text-ok font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5 text-ok shrink-0" />
                      All Quality &amp; MLR checks verified
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setGenerateVideoModalOpen(false)}
                      className="font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={hasBlockers}
                      onClick={handleConfirmVideoGeneration}
                      className={cn(
                        "font-bold px-5 gap-1.5 transition-all",
                        hasBlockers
                          ? "bg-black/10 text-black/35 cursor-not-allowed border-none shadow-none"
                          : "bg-brand hover:bg-brand-deep text-white cursor-pointer shadow-xs"
                      )}
                    >
                      <LogoMark size={14} />
                      <span className="flex flex-col items-start leading-tight">
                        <span>Confirm &amp; Generate Video</span>
                        <span className="text-caption font-bold text-white/80 tabular-nums">
                          {finalRenderCost.toLocaleString()} Credits
                        </span>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share & Distribute Modal */}
        <ShareReviewModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          assetType="video"
          assetTitle={projectTitle}
          brandName={brandName}
          durationSeconds={totalDurationSeconds}
          onExportDirect={() => {
            setToMessage("Preparing high-res 1080p MP4 master download...");
            setTimeout(() => setToMessage(null), 2500);
          }}
          onShowToast={(msg) => {
            setToMessage(msg);
            setTimeout(() => setToMessage(null), 3000);
          }}
        />
        </>
      }
    />
  );
}

function InspectorTabButton({
  tab,
  current,
  onClick,
  badge,
  count,
  children,
}: {
  tab: string;
  current: string;
  onClick: (tab: any) => void;
  badge?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  const active = tab === current;
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={cn(
        "group relative flex items-center justify-center gap-1 h-8.5 px-2 rounded-control text-body transition-all duration-150 cursor-pointer font-[800] select-none whitespace-nowrap",
        active
          ? "bg-card text-ink shadow-xs border border-hair"
          : "text-ink-3 hover:text-ink hover:bg-white/50 border border-transparent"
      )}
    >
      {badge}
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            "text-caption font-extrabold px-1.5 py-0.2 rounded-chip transition-colors ml-0.5",
            active
              ? "bg-tint-strong text-brand-deep border border-brand/20"
              : "bg-black/5 text-ink-3"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function AddSceneModal({ sceneCount, onClose, onAdd }: any) {
  const [category, setCategory] = useState<"normal" | "intro" | "outro" | "product">("normal");
  const [title, setTitle] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-[500px] bg-card rounded-card p-6 space-y-4">
        <h2 className="text-title font-extrabold">Add New Scene</h2>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Scene Title" className="w-full rounded-control border p-2 text-body-lg" />
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onAdd({ title, category })} className="bg-brand text-white">Add</Button></div>
      </div>
    </div>
  );
}
