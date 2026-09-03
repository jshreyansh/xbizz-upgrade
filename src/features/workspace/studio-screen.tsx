"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Expand,
  FileCheck2,
  FileText,
  Film,
  GripVertical,
  History,
  Image as ImageIcon,
  Layers,
  LayoutPanelTop,
  Maximize2,
  MessageSquare,
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
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Timer,
  Trash2,
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
import type { EvidenceState, InspectorTab } from "@/types/content";
import { ScreenHeader } from "@/components/patterns/screen-header";

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

const NARRATIVE_TAG_OPTIONS = [
  { id: "Intro", label: "Intro" },
  { id: "Clinical Need", label: "Clinical Need" },
  { id: "Mechanism", label: "Mechanism" },
  { id: "Evidence", label: "Evidence" },
  { id: "Dosing", label: "Dosing" },
  { id: "Safety", label: "Safety" },
  { id: "Outro", label: "Outro" },
];

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

  const [generatedSceneIds, setGeneratedSceneIds] = useState<string[]>([]);
  const [toastMessage, setToMessage] = useState<string | null>(null);

  const [sceneList, setSceneList] = useState(scenes);
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
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
  const [chatContextMenuOpen, setChatContextMenuOpen] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Edit draft states for Scene Inspector
  const [editDraftHeadline, setEditDraftHeadline] = useState(selectedScene.title);
  const [editDraftNarration, setEditDraftNarration] = useState(selectedScene.narration);
  const [editDraftVisual, setEditDraftVisual] = useState(selectedScene.visual || "");
  const [editDraftNegativeVisual, setEditDraftNegativeVisual] = useState(
    selectedScene.negativeVisual || "Overly stylized cartoons, text overlays, harsh shadows, low quality rendering."
  );
  const [editDraftDuration, setEditDraftDuration] = useState(selectedScene.duration || 10);

  useEffect(() => {
    setEditDraftHeadline(selectedScene.title);
    setEditDraftNarration(selectedScene.narration);
    setEditDraftVisual(selectedScene.visual || "");
    setEditDraftNegativeVisual(
      selectedScene.negativeVisual || "Overly stylized cartoons, text overlays, harsh shadows, low quality rendering."
    );
    setEditDraftDuration(selectedScene.duration || 10);
  }, [selectedScene]);

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

  const handleSelectCanvasElement = (elementId: string) => {
    setSelectedCanvasElementId(elementId);

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

    setAttachedContexts((prev) => {
      const filtered = prev.filter((c) => c.type !== "element");
      return [
        ...filtered,
        {
          id: `element-${elementId}-${Date.now()}`,
          type: "element",
          label,
          detail,
        },
      ];
    });
  };

  const handleSaveAndCentralizeToChat = () => {
    // 1. Update scene in sceneList
    setSceneList((prev) =>
      prev.map((s) =>
        s.id === selectedScene.id
          ? {
              ...s,
              title: editDraftHeadline,
              narration: editDraftNarration,
              visual: editDraftVisual,
              negativeVisual: editDraftNegativeVisual,
              duration: editDraftDuration,
            }
          : s
      )
    );

    // 2. Switch tab to Chat
    setActiveTab("assistant");

    // 3. Post user action message in chat
    const userMsgText = `Applied edits for **Scene ${selectedScene.number}: ${editDraftHeadline}**:\n• **Headline:** "${editDraftHeadline}"\n• **Narration:** "${editDraftNarration}"\n• **Visual Prompt:** "${editDraftVisual}"\n• **Negative Visual:** "${editDraftNegativeVisual}"\n• **Duration:** ${editDraftDuration}s`;

    addChatMessage({
      role: "user",
      text: userMsgText,
    });

    // 4. SwishX AI responds with confirmation and propagation options
    setTimeout(() => {
      addChatMessage({
        role: "swishx",
        text: `✓ Applied updates to **Scene ${selectedScene.number}: ${editDraftHeadline}**. The visual canvas, narration sync (${editDraftDuration}s), and kinematic rendering parameters have been updated.\n\nWould you like me to propagate this visual tone and pacing across the remaining scenes in the storyboard?`,
        chips: [
          `🪄 Update other scenes to match Scene ${selectedScene.number} style`,
          `✓ Keep remaining scenes as is`,
        ],
      });
    }, 450);

    setToMessage(`Saved Scene ${selectedScene.number} and sent to SwishX chat`);
    setTimeout(() => setToMessage(null), 3000);
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

  const [commentsList, setCommentsList] = useState([
    {
      id: "comment-1",
      author: "Sarah Lin (Medical Director)",
      role: "Medical Reviewer",
      avatar: "SL",
      timestampSec: 14,
      timeFormatted: "0:14",
      sceneNumber: 3,
      sceneTitle: "Pivotal evidence",
      text: "Ensure the CLEARSKIN p-value (p < 0.001) is displayed in the footnote overlay alongside Week 16 endpoint.",
      createdAt: "10m ago",
      isResolved: false,
      replies: [
        {
          id: "rep-1",
          author: "Maya Kapoor",
          role: "Content Lead",
          text: "Updated in Scene 3 footnote layer. Will reflect in final render.",
          createdAt: "4m ago",
        },
      ],
    },
    {
      id: "comment-2",
      author: "David Vance (Brand Lead)",
      role: "Marketing",
      avatar: "DV",
      timestampSec: 28,
      timeFormatted: "0:28",
      sceneNumber: 4,
      sceneTitle: "Designed for practice",
      text: "The dosing schedule animation feels clear and well paced for HCP meetings.",
      createdAt: "18m ago",
      isResolved: true,
      replies: [],
    },
  ]);

  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyDraftText, setReplyDraftText] = useState("");

  const handleStartSceneEditor = () => {
    setStudioMode("editor");
    setActiveTab("assistant");
    setGeneratedSceneIds([]);
    setToMessage(`Opening Scene Canvas Editor in ${selectedQuality === "hd" ? "HD" : "Cinematic"}...`);
    setTimeout(() => setToMessage(null), 2500);

    if (sceneList[0]) {
      setTimeout(() => {
        setGeneratedSceneIds((prev) => [...prev, sceneList[0].id]);
      }, 2000);
    }
    sceneList.slice(1).forEach((sc, idx) => {
      const delay = 2000 + (idx + 1) * 3500;
      setTimeout(() => {
        setGeneratedSceneIds((prev) => [...prev, sc.id]);
      }, delay);
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

  const handleMoveScene = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sceneList.length) return;
    const updated = [...sceneList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    const renumbered = updated.map((s, idx) => ({ ...s, number: idx + 1 }));
    setSceneList(renumbered);
  };

  const handleDeleteScene = (id: string) => {
    if (sceneList.length <= 1) {
      setToMessage("At least one scene is required in storyboard");
      setTimeout(() => setToMessage(null), 2000);
      return;
    }
    const updated = sceneList.filter((s) => s.id !== id).map((s, idx) => ({ ...s, number: idx + 1 }));
    setSceneList(updated);
    if (selectedSceneId === id && updated[0]) {
      setSelectedSceneId(updated[0].id);
    }
    setToMessage("Scene deleted");
    setTimeout(() => setToMessage(null), 2000);
  };

  const handleUpdateSceneTitle = (id: string, nextTitle: string) => {
    setSceneList((prev) => prev.map((s) => (s.id === id ? { ...s, title: nextTitle } : s)));
  };

  const handleUpdateSceneNarration = (id: string, nextNarration: string) => {
    setSceneList((prev) => prev.map((s) => (s.id === id ? { ...s, narration: nextNarration } : s)));
  };

  const handleUpdateSceneTag = (id: string, nextTag: string) => {
    setSceneList((prev) => prev.map((s) => (s.id === id ? { ...s, narrativeTag: nextTag } : s)));
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

  const handleDragStart = (id: string) => setDraggedSceneId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSceneId || draggedSceneId === targetId) return;
    const sourceIndex = sceneList.findIndex((s) => s.id === draggedSceneId);
    const targetIndex = sceneList.findIndex((s) => s.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const updated = [...sceneList];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    const renumbered = updated.map((s, idx) => ({ ...s, number: idx + 1 }));
    setSceneList(renumbered);
  };
  const handleDragEnd = () => setDraggedSceneId(null);

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    const timeSec = Math.floor(masterCurrentTime);
    const formatted = `0:${timeSec.toString().padStart(2, "0")}`;
    const newComment = {
      id: `comment-${Date.now()}`,
      author: "Maya Kapoor",
      role: "Content Lead",
      avatar: "MK",
      timestampSec: timeSec,
      timeFormatted: formatted,
      sceneNumber: activeMasterChapter?.number || 1,
      sceneTitle: activeMasterChapter?.title || "Scene",
      text: newCommentText.trim(),
      createdAt: "Just now",
      isResolved: false,
      replies: [],
    };
    setCommentsList((prev) => [newComment, ...prev]);
    setNewCommentText("");
    setToMessage(`Comment posted at ${formatted}`);
    setTimeout(() => setToMessage(null), 2500);
  };

  const handlePostReply = (commentId: string) => {
    if (!replyDraftText.trim()) return;
    setCommentsList((prev) => prev.map((c) => c.id === commentId ? { ...c, replies: [...c.replies, { id: `reply-${Date.now()}`, author: "Maya Kapoor", role: "Content Lead", text: replyDraftText.trim(), createdAt: "Just now" }] } : c));
    setReplyingToCommentId(null);
    setReplyDraftText("");
    setToMessage("Reply added");
    setTimeout(() => setToMessage(null), 2000);
  };

  const handleToggleResolveComment = (commentId: string) => setCommentsList((prev) => prev.map((c) => c.id === commentId ? { ...c, isResolved: !c.isResolved } : c));

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
        const createdComment = {
          id: `comment-${Date.now()}`,
          author: "SwishX Assistant (via Prompt)",
          role: "AI Copilot",
          avatar: "SX",
          timestampSec: extractedSec,
          timeFormatted: formatted,
          sceneNumber: activeMasterChapter?.number || 1,
          sceneTitle: activeMasterChapter?.title || "Pivotal evidence",
          text: rawInput.replace(/add\s+(a\s+)?comment(\s+at\s+\S+)?\s*(that|to|for|:)?\s*/i, "").trim() || rawInput,
          createdAt: "Just now",
          isResolved: false,
          replies: [],
        };
        setCommentsList((prev) => [createdComment, ...prev]);
        addChatMessage({ role: "swishx", text: `✓ I've added a timestamped reviewer comment at **${formatted}** (${activeMasterChapter?.title}): *" ${createdComment.text} "*` });
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
    <div className="flex h-screen flex-col overflow-hidden bg-[#edf0ed]">
      <ScreenHeader>
        <button onClick={() => setView("home")} className="focus-ring mr-2 grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-black/5" aria-label="Back home">
          <ArrowLeft className="size-4" />
        </button>
        <SwishXMark compact />
        <div className="mx-3 h-5 w-px bg-hair" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-[800] text-ink">{sourcePayload?.dossierId ? `${dossierNames[sourcePayload.dossierId] || "Velmora"} HCP launch` : "DERMORA HCP launch"}</span>
            <span className="hidden rounded-full bg-ok-bg px-2 py-0.5 text-micro font-bold text-ink-3 sm:inline">Draft v1</span>
          </div>
          <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">Saved just now · Maya Kapoor</div>
        </div>

        <div className="ml-6 hidden items-center gap-1 sm:flex">
          {studioMode === "scenes" && <span className="rounded-full bg-tint px-2.5 py-0.5 text-caption font-extrabold tracking-wide text-brand-deep border border-tint-line">Script View</span>}
          {studioMode === "editor" && (
            <div className="flex items-center gap-1.5">
              <button onClick={handleReturnToScript} className="focus-ring flex items-center gap-1.5 rounded-lg border border-hair bg-canvas px-2.5 py-1 text-label font-bold text-ink-2 transition hover:border-brand hover:bg-tint hover:text-brand shadow-xs cursor-pointer">
                <FileText className="size-3.5 text-brand" /> <span>Script View</span>
              </button>
              <span className="text-ink-3">/</span>
              <span className="rounded-full bg-tint px-2.5 py-0.5 text-caption font-extrabold text-brand-deep border border-tint-line">Canvas Editor</span>
            </div>
          )}
          {studioMode === "generating" && <span className="inline-flex items-center gap-1.5 rounded-full bg-tint border border-tint-line px-3 py-1 text-caption font-extrabold text-brand-deep animate-pulse"><Sparkles className="size-3 text-brand-deep animate-spin" /><span>Generating High-Res Video...</span></span>}
          {studioMode === "review" && (
            <div className="flex items-center gap-1.5">
              <button onClick={handleReturnToEditor} className="focus-ring flex items-center gap-1.5 rounded-lg border border-hair bg-canvas px-2.5 py-1 text-label font-bold text-ink-2 transition hover:border-brand hover:bg-tint hover:text-brand shadow-xs cursor-pointer"><Pencil className="size-3 text-brand" /> <span>Editor</span></button>
              <span className="text-ink-3">/</span>
              <span className="rounded-full bg-ok-bg px-3 py-0.5 text-caption font-extrabold text-ok border border-ok-line">Shared Review View · Final Master ({totalDurationSeconds}s)</span>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Toggle Right Sidebar Panel Button (Icon Only) */}
          <button
            type="button"
            onClick={toggleCopilotPanel}
            className={cn(
              "grid size-8 place-items-center rounded-lg border transition-colors cursor-pointer",
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
              <Button size="sm" onClick={handleOpenGenerateVideoModal} className="bg-brand hover:bg-brand-deep text-white font-bold px-4 cursor-pointer shadow-xs gap-1.5"><Sparkles className="size-3.5" /> <span>Generate and Publish</span></Button>
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

      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        <aside
          style={{
            width: isReview ? 240 : isEditor ? 220 : copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            minWidth: isReview ? 240 : isEditor ? 220 : copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            maxWidth: isReview ? 240 : isEditor ? 220 : copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn(
            "flex flex-col shrink-0 min-h-0 border-r border-hair overflow-hidden transition-colors duration-300",
            isGenerating ? "bg-[#eef1ed] p-4 sm:p-6 lg:p-7" : isReview ? "bg-canvas" : isEditor ? "bg-[#f8f9f7]" : "bg-[#eef1ed] p-4 sm:p-6 lg:p-7"
          )}
        >
          {isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 my-auto">
              <div className="size-20 rounded-3xl bg-tint border border-tint-line flex items-center justify-center mb-6 shadow-sm">
                <Sparkles className="size-10 text-brand animate-pulse" />
              </div>

              <h3 className="text-display font-extrabold text-ink tracking-tight">
                Generating High-Resolution Video Master...
              </h3>
              <p className="text-body-lg text-ink-3 mt-1.5 max-w-[460px]">
                Synthesizing kinematic 3D scene models, rendering voiceover audio sync, and verifying fair balance across all {sceneList.length} scenes.
              </p>

              <div className="mt-8 w-full max-w-[380px] space-y-2.5 text-left text-body">
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", videoGenStep >= 1 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                  <Check className={cn("size-4.5 shrink-0", videoGenStep >= 1 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Parsed {sceneList.length} storyboard scenes &amp; timing</span>
                </div>
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", videoGenStep >= 2 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                  <Check className={cn("size-4.5 shrink-0", videoGenStep >= 2 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Synthesized 3D visual kinematics &amp; lighting</span>
                </div>
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", videoGenStep >= 3 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                  <Check className={cn("size-4.5 shrink-0", videoGenStep >= 3 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Synced clinical voiceover narration</span>
                </div>
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", videoGenStep >= 4 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                  <Check className={cn("size-4.5 shrink-0", videoGenStep >= 4 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Linking citations to FDA label §5.1</span>
                </div>
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", videoGenStep >= 5 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40 bg-white/50 border-hair")}>
                  {videoGenStep >= 5 ? (
                    <Check className="size-4.5 shrink-0 text-ok" strokeWidth={2.5} />
                  ) : (
                    <Sparkles className="size-4.5 shrink-0 text-brand animate-spin" />
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
                            "group relative flex w-full flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer",
                            isCurrent
                              ? "border-brand bg-tint shadow-xs ring-1 ring-brand"
                              : "border-hair bg-card hover:border-hair-3 hover:bg-canvas"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-micro font-extrabold",
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
                      const isGenerated = generatedSceneIds.includes(sc.id);
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            setSelectedSceneId(sc.id);
                            setSelectedCanvasElementId("headline");
                            setSceneCurrentTime(0);
                            setScenePlaying(true);
                          }}
                          className={cn(
                            "group relative flex w-full flex-col rounded-xl border p-2 text-left transition-all cursor-pointer",
                            isSelected
                              ? "border-brand bg-card shadow-xs ring-1 ring-brand"
                              : "border-hair bg-card hover:border-hair-3"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-caption font-bold text-ink">
                              Scene {sc.number}
                            </span>
                            <div className="flex items-center gap-1">
                              {isGenerated ? (
                                <span className="size-1.5 rounded-full bg-ok" />
                              ) : (
                                <Sparkles className="size-2.5 text-brand animate-spin" />
                              )}
                              <span className="text-micro text-ink-3 font-medium">{sc.duration}s</span>
                            </div>
                          </div>

                          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-hair-2 bg-[#173d31]">
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
                      {sceneList.map((sc, idx) => {
                        const isDragging = draggedSceneId === sc.id;
                        return (
                          <div
                            key={sc.id}
                            draggable
                            onDragStart={() => handleDragStart(sc.id)}
                            onDragOver={(e) => handleDragOver(e, sc.id)}
                            onDrop={(e) => e.preventDefault()}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              "relative flex flex-col rounded-2xl border bg-card p-4 transition-all duration-200 shadow-2xs hover:shadow-xs",
                              isDragging ? "opacity-40 border-dashed border-brand" : "border-hair"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-hair">
                              <div className="flex items-center gap-2">
                                <div className="cursor-grab active:cursor-grabbing text-ink-4 hover:text-ink p-0.5 rounded transition-colors" title="Drag to reorder">
                                  <GripVertical className="size-4" />
                                </div>
                                <span className="flex size-6 items-center justify-center rounded-lg bg-ink text-label font-bold text-white shadow-2xs">
                                  {sc.number}
                                </span>
                                <input
                                  type="text"
                                  value={sc.title}
                                  onChange={(e) => handleUpdateSceneTitle(sc.id, e.target.value)}
                                  className="text-body-lg font-[850] text-ink bg-transparent border-b border-transparent hover:border-hair-3 focus:border-brand focus:outline-none px-1 py-0.5 rounded transition-all"
                                  placeholder="Scene Title"
                                />
                              </div>

                              <div className="flex items-center gap-1.5">
                                <div className="relative">
                                  <select
                                    value={sc.narrativeTag || "Evidence"}
                                    onChange={(e) => handleUpdateSceneTag(sc.id, e.target.value)}
                                    className="appearance-none bg-tint border border-brand/25 text-brand-deep text-caption font-bold rounded-lg px-2 py-0.5 pr-5 cursor-pointer hover:bg-tint-strong transition-colors focus:outline-none"
                                  >
                                    {NARRATIVE_TAG_OPTIONS.map((tagOpt) => (
                                      <option key={tagOpt.id} value={tagOpt.id}>
                                        ({tagOpt.label})
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="size-2.5 text-brand-deep absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                                </div>

                                <span className="flex items-center gap-1 rounded-md bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3 border border-hair">
                                  <Clock className="size-2.5" />
                                  {sc.duration || 10}s
                                </span>

                                <div className="flex items-center gap-0.5 ml-1 border-l border-hair-2 pl-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveScene(idx, "up")}
                                    disabled={idx === 0}
                                    title="Move Up"
                                    className="p-1 rounded text-ink-4 hover:text-ink hover:bg-black/5 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                                  >
                                    <ArrowUp className="size-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveScene(idx, "down")}
                                    disabled={idx === sceneList.length - 1}
                                    title="Move Down"
                                    className="p-1 rounded text-ink-4 hover:text-ink hover:bg-black/5 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                                  >
                                    <ArrowDown className="size-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteScene(sc.id)}
                                    title="Delete Scene"
                                    className="p-1 rounded text-ink-4 hover:text-danger hover:bg-danger-bg cursor-pointer ml-0.5"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-caption font-extrabold uppercase tracking-wider text-ink-3">
                                <span>Narration Script</span>
                                <span className="font-semibold lowercase">
                                  {sc.narration ? `${sc.narration.split(" ").filter(Boolean).length} words` : "0 words"}
                                </span>
                              </div>
                              <textarea
                                value={sc.narration}
                                onChange={(e) => handleUpdateSceneNarration(sc.id, e.target.value)}
                                placeholder="Enter clinical voiceover script for this scene..."
                                rows={2}
                                className="w-full rounded-xl border border-hair-2 bg-canvas p-2.5 text-body leading-relaxed text-ink focus:bg-card focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all resize-none shadow-2xs"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-hair text-caption">
                              <span className="inline-flex items-center gap-1.5 text-ok font-semibold bg-ok-bg px-2 py-0.5 rounded-md border border-ok-line/60">
                                <ShieldCheck className="size-3 text-ok" />
                                <span>{sc.claim}</span>
                              </span>
                              <span className="text-caption text-ink-4">
                                Tag: <strong>({sc.narrativeTag || "Evidence"})</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={handleAddDirectScriptScene}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-hair-2 p-4 text-body font-bold text-ink-2 hover:border-brand hover:bg-tint/50 hover:text-brand-deep transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="size-4 text-brand" />
                        <span>Add Script Scene</span>
                      </button>
                    </>
                  )}
              </div>

              {!isEditor && !isReview && !isGenerating && (
                <div className="sticky bottom-3 z-30 flex justify-center shrink-0 mt-auto pointer-events-none w-full">
                  <div className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-5 py-2.5 rounded-full bg-[#111613] border border-white/12 shadow-on-dark backdrop-blur-md max-w-[580px] w-auto">
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      {isScriptComplete ? (
                        <Sparkles className="size-4.5 text-brand shrink-0" />
                      ) : (
                        <AlertCircle className="size-4.5 text-warn-on-dark shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-body font-bold text-white tracking-tight truncate">
                          {isScriptComplete ? "Script approved & claims grounded" : "Script incomplete"}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleStartSceneEditor}
                      disabled={!isScriptComplete}
                      size="sm"
                      className={cn(
                        "h-9.5 px-5 rounded-full text-body-lg font-bold shadow-sm transition-all duration-200 shrink-0",
                        isScriptComplete
                          ? "bg-brand hover:bg-brand-deep text-white hover:-translate-y-0.5 cursor-pointer"
                          : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                      )}
                    >
                      <Sparkles className="size-3.5 mr-1.5" /> <span>Generate Scenes</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </aside>

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
              <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#cad1cd]/70 bg-white/60 px-4 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 text-label font-bold text-ink">
                  <span className="rounded-md bg-card border border-hair-2 px-2 py-0.5 shadow-2xs font-extrabold">
                    Scene {selectedScene.number} of {sceneList.length}
                  </span>
                  <span>{selectedScene.title}</span>
                </div>
                <div className="flex items-center gap-2 text-label">
                  <span className="rounded-md bg-card border border-hair-2 px-2 py-0.5 text-caption font-bold text-[#64726b] shadow-2xs">
                    Fit 16:9
                  </span>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Full screen">
                    <Expand className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* ── Canva-style Interactive Scene Workspace ── */}
              <div className="flex min-h-0 flex-1 items-center justify-center p-4 lg:p-6 overflow-hidden">
                <div
                  onClick={() => setSelectedCanvasElementId(null)}
                  className="relative aspect-video w-full max-w-[840px] rounded-panel bg-[#173d31] shadow-float ring-1 ring-black/20 overflow-hidden select-none"
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
                        "pointer-events-auto inline-flex items-center gap-2 text-label font-extrabold uppercase tracking-[0.16em] text-white/80 p-1.5 rounded-lg transition-all cursor-pointer w-fit",
                        selectedCanvasElementId === "tag"
                          ? "border-2 border-dashed border-brand bg-black/40 ring-2 ring-brand/30"
                          : hoveredCanvasElementId === "tag"
                          ? "border border-dashed border-white/60 bg-black/20"
                          : ""
                      )}
                    >
                      <span className="size-2 rounded-full bg-lime-bg" />
                      <span>{selectedScene.narrativeTag || "PIVOTAL EVIDENCE"}</span>
                      <span className="text-micro font-bold text-white/50 lowercase ml-1">(0:00–0:{selectedScene.duration})</span>
                    </div>

                    {/* Right-Side Media Showcase (Draggable real Image and Video Clip Elements for ~60% of scenes) */}
                    {selectedScene.mediaType && selectedScene.mediaType !== "none" && (
                      <div className="absolute right-5 top-11 bottom-14 w-[40%] flex flex-col gap-3 z-20 pointer-events-none">
                        {/* Draggable Element 1: Real Anatomical Heart Image */}
                        {(selectedScene.mediaType === "image" || selectedScene.mediaType === "both") && (
                          <div
                            onPointerDown={(e) => handlePointerDownElement(e, "image")}
                            onPointerMove={(e) => handlePointerMoveElement(e, "image")}
                            onPointerUp={(e) => handlePointerUpElement(e, "image")}
                            onMouseEnter={() => setHoveredCanvasElementId("image")}
                            onMouseLeave={() => setHoveredCanvasElementId(null)}
                            style={{
                              transform: `translate(${elementOffsets["image"]?.x || 0}px, ${elementOffsets["image"]?.y || 0}px)`,
                            }}
                            className={cn(
                              "pointer-events-auto relative flex-1 rounded-2xl p-3 bg-black/70 backdrop-blur-md border transition-shadow cursor-grab active:cursor-grabbing shadow-xl select-none flex items-center gap-3",
                              selectedCanvasElementId === "image"
                                ? "border-2 border-dashed border-brand ring-4 ring-brand/25 bg-black/85 shadow-2xl"
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
                                <span className="font-extrabold text-lime-ink text-micro uppercase tracking-wider bg-lime-bg/15 px-1.5 py-0.5 rounded border border-lime-line/30">
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
                              <div className="absolute -top-8 right-0 z-30 flex items-center gap-1.5 rounded-lg bg-ink border border-white/20 px-2.5 py-1 text-caption font-bold text-white shadow-xl whitespace-nowrap">
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
                                  <Sparkles className="size-2.5" /> Replace
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Draggable Element 2: Real Kinematic Video Clip */}
                        {(selectedScene.mediaType === "video" || selectedScene.mediaType === "both") && (
                          <div
                            onPointerDown={(e) => handlePointerDownElement(e, "video-clip")}
                            onPointerMove={(e) => handlePointerMoveElement(e, "video-clip")}
                            onPointerUp={(e) => handlePointerUpElement(e, "video-clip")}
                            onMouseEnter={() => setHoveredCanvasElementId("video-clip")}
                            onMouseLeave={() => setHoveredCanvasElementId(null)}
                            style={{
                              transform: `translate(${elementOffsets["video-clip"]?.x || 0}px, ${elementOffsets["video-clip"]?.y || 0}px)`,
                            }}
                            className={cn(
                              "pointer-events-auto relative flex-1 rounded-2xl bg-black/70 backdrop-blur-md border transition-shadow cursor-grab active:cursor-grabbing shadow-xl select-none overflow-hidden",
                              selectedCanvasElementId === "video-clip"
                                ? "border-2 border-dashed border-brand ring-4 ring-brand/25 shadow-2xl"
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
                              <span className="text-micro font-extrabold text-info-on-dark uppercase tracking-wide bg-black/70 px-1.5 py-0.5 rounded border border-sky-400/40">
                                🎬 Video Clip
                              </span>
                              <span className="text-micro text-white/80 bg-black/60 px-1 py-0.5 rounded flex items-center gap-0.5">
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
                              <div className="absolute -top-8 right-0 z-30 flex items-center gap-1.5 rounded-lg bg-ink border border-white/20 px-2.5 py-1 text-caption font-bold text-white shadow-xl whitespace-nowrap">
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
                                  <Sparkles className="size-2.5" /> Swap Clip
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Core Headline Overlay (Draggable) */}
                    <div
                      onPointerDown={(e) => handlePointerDownElement(e, "headline")}
                      onPointerMove={(e) => handlePointerMoveElement(e, "headline")}
                      onPointerUp={(e) => handlePointerUpElement(e, "headline")}
                      onMouseEnter={() => setHoveredCanvasElementId("headline")}
                      onMouseLeave={() => setHoveredCanvasElementId(null)}
                      style={{
                        transform: `translate(${elementOffsets["headline"]?.x || 0}px, ${elementOffsets["headline"]?.y || 0}px)`,
                      }}
                      className={cn(
                        "pointer-events-auto relative p-2.5 rounded-xl transition-shadow cursor-grab active:cursor-grabbing",
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
                        <div className="absolute -top-9 left-0 z-30 flex items-center gap-1.5 rounded-lg bg-ink border border-white/20 px-2.5 py-1 text-caption font-bold text-white shadow-xl whitespace-nowrap">
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
                          <span className="text-ok-on-dark">⏱ 0:01 – 0:09</span>
                          <span className="text-white/40">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setToMessage("Rephrased headline with clinical clarity");
                              setTimeout(() => setToMessage(null), 2000);
                            }}
                            className="text-brand hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Sparkles className="size-2.5" /> Rephrase
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
                        transform: `translate(${elementOffsets["narration"]?.x || 0}px, ${elementOffsets["narration"]?.y || 0}px)`,
                      }}
                      className={cn(
                        "pointer-events-auto relative p-2.5 rounded-2xl transition-all cursor-grab active:cursor-grabbing select-none backdrop-blur-md",
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
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand/25 border border-brand/40 text-micro font-extrabold uppercase tracking-wider text-brand-light">
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
                                  "inline-block mr-1 transition-all duration-150 rounded px-0.5",
                                  isCurrent
                                    ? "text-brand-light font-bold scale-105 bg-brand/20 shadow-xs ring-1 ring-brand/35 -translate-y-0.5"
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
                        <div className="absolute -top-8 left-0 z-30 flex items-center gap-1.5 rounded-lg bg-ink border border-white/20 px-2.5 py-1 text-caption font-bold text-white shadow-xl whitespace-nowrap">
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
                        "pointer-events-auto flex items-center justify-between pt-2 border-t border-white/10 text-caption text-white/60 cursor-pointer p-1 rounded transition-colors",
                        selectedCanvasElementId === "claim" && "ring-1 ring-ok bg-black/20"
                      )}
                    >
                      <span>{dossierNames[sourcePayload?.dossierId || "velmora"] || "DERMORA"}® · HCP Prescribing Brief</span>
                      <span className="rounded bg-emerald-950/80 border border-emerald-400/40 text-ok-on-dark px-2 py-0.5 font-bold">
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

                      {/* Single Scene Scrubber Bar */}
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pct = (e.clientX - rect.left) / rect.width;
                          setSceneCurrentTime(+(pct * (selectedScene.duration || 10)).toFixed(1));
                        }}
                        className="relative flex-1 h-3 bg-white/20 rounded-full cursor-pointer overflow-hidden flex items-center"
                      >
                        <div
                          style={{
                            width: `${(sceneCurrentTime / (selectedScene.duration || 10)) * 100}%`,
                          }}
                          className="h-full bg-brand rounded-full transition-all duration-75"
                        />
                      </div>

                      <span className="text-caption text-white/60 font-bold hidden sm:inline shrink-0">
                        Scene {selectedScene.number} Scope
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Multi-Layer Production Timeline Bar (Collapsible) ── */}
              <div className="border-t border-hair bg-canvas text-ink shrink-0">
                <div className="flex h-9 items-center justify-between px-4 border-b border-hair bg-card">
                  <div className="flex items-center gap-2.5 text-label font-bold text-ink">
                    <Layers className="size-3.5 text-brand" />
                    <span>Production Layers</span>
                    <span className="rounded-md bg-ok-bg px-2 py-0.5 text-micro font-semibold text-[#5a6660]">
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
                          <div className="h-full rounded bg-ok-bg border border-ok-line flex items-center px-2 text-micro font-bold text-ok">
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
                          <div className="h-full rounded bg-tint border border-brand/30 flex items-center px-2 text-micro font-bold text-brand-deep">
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
                          <div className="h-full w-[85%] rounded bg-lime-bg border border-lime-line flex items-center px-2 text-micro font-bold text-lime-ink truncate">
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
                          <div className="h-full w-[75%] rounded bg-info-bg border border-info-line flex items-center px-2 text-micro font-bold text-info-on-dark truncate">
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
                          <div className="h-full w-3/4 rounded bg-info-bg border border-info-line flex items-center px-2 text-micro font-bold text-info-on-dark truncate">
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
                          <div className="h-full w-4/5 rounded bg-warn-bg border border-warn-line flex items-center px-2 text-micro font-bold text-warn truncate">
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
                <div className="relative aspect-video w-full max-w-[920px] rounded-[20px] bg-black shadow-on-dark ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">
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
                      <span className="rounded-full bg-ok/20 border border-emerald-400/30 px-2.5 py-0.5 text-ok-on-dark">
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
                          className="absolute -top-10 -translate-x-1/2 rounded-lg bg-[#1a2620] border border-white/20 px-3 py-1 text-caption font-bold text-white shadow-xl pointer-events-none whitespace-nowrap z-30"
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

                        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-label font-bold text-white/90">
                          <span className="size-1.5 rounded-full bg-brand" />
                          <span>
                            Chapter {activeMasterChapter?.number}: {activeMasterChapter?.title}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-caption font-extrabold uppercase bg-white/10 px-2 py-0.5 rounded text-white/80">
                          CC
                        </span>
                        <span className="text-caption font-extrabold text-brand bg-brand/15 px-2 py-0.5 rounded">
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

        <aside
          style={{
            width: copilotPanelOpen ? 410 : 0,
            minWidth: copilotPanelOpen ? 410 : 0,
            maxWidth: copilotPanelOpen ? 410 : 0,
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn(
            "shrink-0 border-l border-hair bg-card flex flex-col min-h-0 shadow-panel-left z-10 overflow-hidden",
            !copilotPanelOpen && "border-none pointer-events-none"
          )}
        >
          <div className="p-2.5 border-b border-hair bg-subtle">
            {studioMode === "scenes" ? (
              /* ── SCRIPT STAGE: Only Chat & Claims Tabs (No Edit Tab) ── */
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#e6ebe6] rounded-2xl border border-hair shadow-inner-xs">
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
                  count={24}
                >
                  Claims
                </InspectorTabButton>
              </div>
            ) : (
              /* ── CANVAS EDITOR / REVIEW STAGES: Chat, Edit / Comments, Claims ── */
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#e6ebe6] rounded-2xl border border-hair shadow-inner-xs">
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
                    count={commentsList.length}
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
                  count={24}
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
                          "rounded-[16px] px-3.5 py-2.5 text-body shadow-xs",
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
                                className="text-label font-bold text-brand-deep bg-tint hover:bg-tint-strong border border-brand/30 px-2.5 py-1 rounded-full transition cursor-pointer shadow-2xs hover:-translate-y-0.5"
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
                    <div className="rounded-xl border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2.5 shadow-2xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded-full bg-brand/15 text-brand grid place-items-center shrink-0">
                          <Sparkles className="size-3.5" />
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
                          "h-7.5 px-3 rounded-lg text-label font-bold shadow-xs transition-all shrink-0 cursor-pointer",
                          isScriptComplete
                            ? "bg-brand hover:bg-brand-deep text-white hover:scale-[1.02]"
                            : "bg-black/10 text-black/40 cursor-not-allowed"
                        )}
                      >
                        <Sparkles className="size-3 mr-1" />
                        <span>Generate Scenes</span>
                      </Button>
                    </div>
                  )}

                  {/* Attached Primary Action Bar in Scene Editor Mode */}
                  {isEditor && (
                    <div className="rounded-xl border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2.5 shadow-2xs flex items-center justify-between gap-2">
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
                        className="h-7.5 px-3 rounded-lg text-label font-bold shadow-xs transition-all shrink-0 cursor-pointer bg-brand hover:bg-brand-deep text-white hover:scale-[1.02]"
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
                    className="flex flex-col gap-2 rounded-2xl border border-hair bg-card p-2.5 shadow-xs focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15"
                  >
                    {/* Attached Context Chips */}
                    {attachedContexts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-1.5 bg-subtle rounded-xl border border-hair">
                        {attachedContexts.map((ctx) => (
                          <span
                            key={ctx.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-brand/30 px-2 py-0.5 text-label font-bold text-brand-deep shadow-2xs"
                          >
                            {ctx.type === "element" ? (
                              <Sparkles className="size-3 text-brand shrink-0" />
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
                      placeholder={
                        isReview
                          ? "Ask SwishX or type 'Add comment at 0:24 that...'..."
                          : "Direct SwishX to modify scenes, copy, or timing..."
                      }
                      rows={2}
                      className="w-full resize-none text-body text-ink placeholder:text-ink-3 focus:outline-none"
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
                            className="size-7 rounded-lg text-ink-3 hover:text-ink hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer border border-hair-2 bg-card shadow-2xs"
                            title="Add context (Scenes, Files, Citations)"
                          >
                            <Plus className="size-3.5 text-brand" />
                          </button>

                          {chatContextMenuOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl border border-hair-2 bg-card p-1.5 shadow-xl z-50 space-y-1">
                              <div className="px-2 py-1 text-micro font-extrabold uppercase tracking-wider text-ink-4">
                                Attach Context to Chat
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  chatFileInputRef.current?.click();
                                  setChatContextMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-body font-medium text-ink hover:bg-tint hover:text-brand-deep rounded-xl transition text-left cursor-pointer"
                              >
                                <Paperclip className="size-3.5 text-brand" />
                                <span>Upload file from computer</span>
                              </button>

                              <div className="border-t border-hair my-1" />
                              <div className="px-2 py-0.5 text-micro font-extrabold uppercase tracking-wider text-ink-4">
                                Attach Scene Scope
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-0.5">
                                {sceneList.map((sc) => (
                                  <button
                                    key={sc.id}
                                    type="button"
                                    onClick={() => {
                                      setAttachedContexts((prev) => {
                                        if (prev.some((c) => c.id === `scene-${sc.id}`)) return prev;
                                        return [
                                          ...prev,
                                          {
                                            id: `scene-${sc.id}`,
                                            type: "scene",
                                            label: `Scene ${sc.number}`,
                                            detail: sc.title,
                                          },
                                        ];
                                      });
                                      setChatContextMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-2.5 py-1 text-label font-medium text-ink-2 hover:bg-subtle rounded-lg transition text-left cursor-pointer"
                                  >
                                    <span className="truncate">Scene {sc.number}: {sc.title}</span>
                                    <span className="text-micro text-ink-4 font-bold shrink-0 ml-1">({sc.narrativeTag || "Evidence"})</span>
                                  </button>
                                ))}
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
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-label font-bold text-brand-deep bg-tint/70 hover:bg-tint rounded-xl transition text-left cursor-pointer"
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

            {/* ── TAB 2: COMMENTS THREAD (In Review Mode) ── */}
            {activeTab === "comments" && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Add New Comment Box */}
                <div className="p-3.5 border-b border-hair bg-canvas space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-label font-extrabold text-ink">Add Reviewer Comment</span>
                    <span className="rounded-md bg-tint border border-brand/30 px-2 py-0.5 text-caption font-extrabold text-brand-deep">
                      ⏱ 0:{Math.floor(masterCurrentTime).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Provide compliance or marketing feedback at current timestamp..."
                    rows={2}
                    className="w-full rounded-xl border border-hair-2 bg-card p-2.5 text-body text-ink resize-none focus:outline-none focus:border-brand shadow-2xs"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePostComment}
                      disabled={!newCommentText.trim()}
                      size="sm"
                      className="bg-brand hover:bg-brand-deep text-white font-bold text-label h-8 px-4 cursor-pointer"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                  {commentsList.map((comment) => (
                    <div
                      key={comment.id}
                      className={cn(
                        "rounded-xl border p-3 transition-all space-y-2",
                        comment.isResolved
                          ? "bg-canvas border-hair opacity-60"
                          : "bg-card border-hair shadow-2xs hover:border-brand/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="size-6 rounded-full bg-brand/15 text-brand-deep font-extrabold text-caption grid place-items-center">
                            {comment.avatar}
                          </span>
                          <div>
                            <div className="text-label font-bold text-ink">{comment.author}</div>
                            <div className="text-micro text-ink-3">{comment.createdAt}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMasterCurrentTime(comment.timestampSec);
                            setMasterPlaying(true);
                          }}
                          className="rounded-md bg-ok-bg border border-ok-line px-2 py-0.5 text-caption font-extrabold text-ok hover:bg-ok-bg transition-colors cursor-pointer"
                        >
                          ⏱ {comment.timeFormatted}
                        </button>
                      </div>

                      <p className="text-body text-ink leading-relaxed">{comment.text}</p>

                      {comment.replies.length > 0 && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-hair-2 mt-2">
                          {comment.replies.map((rep) => (
                            <div key={rep.id} className="text-label">
                              <span className="font-bold text-ink">{rep.author}: </span>
                              <span className="text-ink-2">{rep.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-hair text-caption">
                        <button
                          type="button"
                          onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                          className="text-brand font-bold hover:underline cursor-pointer"
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleResolveComment(comment.id)}
                          className="text-ink-3 hover:text-ok font-semibold cursor-pointer"
                        >
                          {comment.isResolved ? "✓ Resolved" : "Mark as resolved"}
                        </button>
                      </div>

                      {replyingToCommentId === comment.id && (
                        <div className="pt-2 flex gap-1.5">
                          <input
                            type="text"
                            value={replyDraftText}
                            onChange={(e) => setReplyDraftText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 rounded-lg border border-hair-2 px-2.5 py-1 text-label focus:outline-none focus:border-brand"
                          />
                          <Button
                            size="sm"
                            onClick={() => handlePostReply(comment.id)}
                            className="bg-brand text-white text-caption h-7 px-2.5 font-bold"
                          >
                            Reply
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 2 (In Editor Mode): EDIT PROPERTIES & CENTRALIZED FLOW ── */}
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
                  <span className="rounded-full bg-tint border border-brand/30 px-2.5 py-0.5 text-caption font-extrabold text-brand-deep">
                    ({selectedScene.narrativeTag || "Evidence"})
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* 1. Headline Text (Chapter Title) */}
                  <div>
                    <label className="text-label font-bold text-ink-2 flex items-center justify-between mb-1">
                      <span>Headline Text (Chapter Title)</span>
                      <span className="text-caption text-ink-4 font-normal">On-screen header</span>
                    </label>
                    <input
                      type="text"
                      value={editDraftHeadline}
                      onChange={(e) => setEditDraftHeadline(e.target.value)}
                      placeholder="Scene headline..."
                      className="w-full rounded-xl border border-hair-2 bg-[#fbfcfb] focus:bg-card p-2.5 text-body font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 shadow-2xs transition-all"
                    />
                  </div>

                  {/* 2. Narration Script */}
                  <div>
                    <label className="text-label font-bold text-ink-2 flex items-center justify-between mb-1">
                      <span>Narration Script</span>
                      <span className="text-caption text-ink-4 font-normal">
                        {editDraftNarration ? `${editDraftNarration.split(" ").filter(Boolean).length} words` : "Empty"}
                      </span>
                    </label>
                    <textarea
                      value={editDraftNarration}
                      onChange={(e) => setEditDraftNarration(e.target.value)}
                      rows={3}
                      placeholder="Voiceover narration script..."
                      className="w-full rounded-xl border border-hair-2 bg-[#fbfcfb] focus:bg-card p-2.5 text-body font-medium resize-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 shadow-2xs transition-all"
                    />
                  </div>

                  {/* 3. Visual Prompt */}
                  <div>
                    <label className="text-label font-bold text-ink-2 flex items-center justify-between mb-1">
                      <span>Visual Prompt</span>
                      <span className="text-caption text-ink-4 font-normal">Kinematic direction</span>
                    </label>
                    <textarea
                      value={editDraftVisual}
                      onChange={(e) => setEditDraftVisual(e.target.value)}
                      rows={3}
                      placeholder="Visual rendering prompt for scene..."
                      className="w-full rounded-xl border border-hair-2 bg-[#fbfcfb] focus:bg-card p-2.5 text-body font-medium resize-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 shadow-2xs transition-all"
                    />
                  </div>

                  {/* 4. Negative Visual Prompt */}
                  <div>
                    <label className="text-label font-bold text-ink-2 flex items-center justify-between mb-1">
                      <span>Negative Visual Prompt</span>
                      <span className="text-caption text-ink-4 font-normal">What to avoid</span>
                    </label>
                    <textarea
                      value={editDraftNegativeVisual}
                      onChange={(e) => setEditDraftNegativeVisual(e.target.value)}
                      rows={2}
                      placeholder="Elements to exclude (e.g. cartoons, blurry edges, harsh text)..."
                      className="w-full rounded-xl border border-hair-2 bg-[#fbfcfb] focus:bg-card p-2.5 text-body font-medium resize-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 shadow-2xs transition-all"
                    />
                  </div>

                  {/* 5. Attached Scene Media (Images & Video Clips) */}
                  <div className="rounded-xl border border-hair bg-canvas p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-label font-extrabold text-ink flex items-center gap-1.5">
                        <Layers className="size-3.5 text-brand" />
                        Attached Scene Media
                      </span>
                      {selectedScene.mediaType && selectedScene.mediaType !== "none" ? (
                        <span className="text-caption font-bold text-brand-deep bg-tint px-2 py-0.5 rounded-full border border-tint-line">
                          {selectedScene.mediaType === "both" ? "2 Media Layers" : "1 Media Layer"}
                        </span>
                      ) : (
                        <span className="text-caption font-bold text-ink-3 bg-black/5 px-2 py-0.5 rounded-full">
                          Typography Only
                        </span>
                      )}
                    </div>

                    {/* If scene has an image or both (e.g. Scene 3 Anatomical Heart) */}
                    {(selectedScene.mediaType === "image" || selectedScene.mediaType === "both") && (
                      <div className="rounded-lg border border-hair bg-card p-2 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-8 rounded-md bg-lime-bg border border-lime-line flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            <img
                              src={selectedScene.mediaImageSrc || "/anatomical-heart.png"}
                              alt="Heart"
                              className="size-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-label font-bold text-ink truncate">
                              {selectedScene.mediaLabel || "Anatomical Cardiac Structure"}
                            </div>
                            <div className="text-micro text-ink-3 flex items-center gap-1.5">
                              <span>Image Asset</span>
                              <span>·</span>
                              <span className="text-ok font-semibold">0:02 – 0:12s</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectCanvasElement("image");
                            setToMessage("Directing SwishX to replace chart image asset");
                            setTimeout(() => setToMessage(null), 2500);
                          }}
                          className="rounded-lg bg-ok-bg hover:bg-[#e0e5e1] text-caption font-bold text-ink-2 px-2 py-1 transition-colors cursor-pointer shrink-0"
                        >
                          Replace
                        </button>
                      </div>
                    )}

                    {/* If scene has a video or both (e.g. Scene 2, 3, 4) */}
                    {(selectedScene.mediaType === "video" || selectedScene.mediaType === "both") && (
                      <div className="rounded-lg border border-hair bg-card p-2 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-8 rounded-md bg-info-bg border border-info-line flex items-center justify-center text-info-on-dark shrink-0 overflow-hidden">
                            <video
                              src={selectedScene.mediaVideoSrc || "/reel-moa.mp4"}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-label font-bold text-ink truncate">
                              {selectedScene.mediaLabel || "3D Mechanism Kinematics"}
                            </div>
                            <div className="text-micro text-ink-3 flex items-center gap-1.5">
                              <span>Video Clip</span>
                              <span>·</span>
                              <span className="text-info-on-dark font-semibold">0:04 – 0:{selectedScene.duration}s (60fps)</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectCanvasElement("video-clip");
                            setToMessage("Directing SwishX to swap kinematic video clip");
                            setTimeout(() => setToMessage(null), 2500);
                          }}
                          className="rounded-lg bg-ok-bg hover:bg-[#e0e5e1] text-caption font-bold text-ink-2 px-2 py-1 transition-colors cursor-pointer shrink-0"
                        >
                          Swap
                        </button>
                      </div>
                    )}

                    {(!selectedScene.mediaType || selectedScene.mediaType === "none") && (
                      <div className="text-caption text-ink-3 py-1.5 px-2 bg-card rounded-lg border border-dashed border-hair-2 flex items-center justify-between">
                        <span>Clean text &amp; narrative intro layout</span>
                        <button
                          type="button"
                          onClick={() => {
                            setToMessage("SwishX added 3D anatomical heart media layer");
                            setTimeout(() => setToMessage(null), 2500);
                          }}
                          className="text-brand font-bold hover:underline cursor-pointer"
                        >
                          + Add Media
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 6. Duration */}
                  <div>
                    <label className="text-label font-bold text-ink-2 block mb-1">
                      Scene Duration
                    </label>
                    <div className="flex items-center gap-2">
                      {[8, 10, 14, 20].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setEditDraftDuration(dur)}
                          className={cn(
                            "flex-1 rounded-xl border py-1.5 text-label font-bold transition-all cursor-pointer",
                            editDraftDuration === dur
                              ? "bg-brand text-white border-brand shadow-xs"
                              : "bg-card border-hair-2 text-ink-2 hover:bg-canvas"
                          )}
                        >
                          {dur}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Centralized Save & Apply Action Button */}
                  <div className="pt-2 border-t border-hair">
                    <Button
                      type="button"
                      onClick={handleSaveAndCentralizeToChat}
                      className="w-full h-10 bg-brand hover:bg-brand-deep text-white font-extrabold text-body rounded-xl shadow-xs gap-2 cursor-pointer transition-transform active:scale-[0.98]"
                    >
                      <Sparkles className="size-4" />
                      <span>Save &amp; Apply with SwishX</span>
                    </Button>
                    <p className="text-caption text-ink-3 text-center mt-1.5">
                      Switches to Chat &amp; verifies clinical claims across storyboard
                    </p>
                  </div>
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
                    <h2 className="mt-0.5 text-body-lg font-[800] text-ink">24 Approved Claims</h2>
                  </div>
                  <span className="rounded-full bg-ok-bg text-ok border border-ok-line px-2.5 py-0.5 text-micro font-bold">
                    ✓ PromoMats Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: "c1", title: "Primary CLEARSKIN Endpoint", status: "Approved", tag: "FDA §5.1", detail: "Significant PASI 90 response rate vs placebo at Week 16." },
                    { id: "c2", title: "Selective Mechanism Inhibition", status: "Approved", tag: "EMBRACE-3", detail: "Targeted pathway binding sparing secondary cytokine cascades." },
                    { id: "c3", title: "Safety and Adverse Profiles", status: "Supported", tag: "PI §6.2", detail: "Low incidence of treatment-emergent adverse reactions." },
                    { id: "c4", title: "Renal Perfusion Preservation", status: "Approved", tag: "Lancet 2024", detail: "Maintained glomerular filtration rate during maintenance dosing." },
                  ].map((c) => (
                    <div key={c.id} className="rounded-xl border border-hair bg-canvas p-3 text-left hover:border-brand/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-micro font-bold text-brand-deep bg-tint px-2 py-0.5 rounded-md">
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
        </aside>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-ink text-white px-4 py-2 text-body font-bold shadow-lg">{toastMessage}</div>
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
                  <Sparkles className="size-3.5" /> Generation Engine
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
              <div className="rounded-2xl bg-[#121614] border border-white/10 p-5 text-white shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <div className="text-label font-extrabold uppercase tracking-wider text-white/60">
                      Credits Deducted
                    </div>
                    <div className="text-display font-[900] text-white mt-0.5">
                      ⚡ {selectedQuality === "cinematic" ? "7,500" : "2,500"} Credits
                    </div>
                  </div>
                  <span className="rounded-full bg-brand/20 border border-brand px-3 py-1 text-label font-bold text-brand">
                    {selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-label text-white/75">
                  <div>
                    <span className="text-white/50 block text-caption uppercase font-bold">Duration &amp; Scenes</span>
                    <strong className="text-white">{totalDurationSeconds}s · 5 Scenes</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-caption uppercase font-bold">Estimated Render Time</span>
                    <strong className="text-white">~{selectedQuality === "cinematic" ? "12–14 min" : "7–9 min"}</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-caption uppercase font-bold">Team Balance</span>
                    <strong className="text-ok-on-dark">50,000 Credits</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-caption uppercase font-bold">Balance Remaining</span>
                    <strong className="text-white">
                      {(50000 - (selectedQuality === "cinematic" ? 7500 : 2500)).toLocaleString()} Credits
                    </strong>
                  </div>
                </div>
              </div>

              {/* Automated Quality & MLR Pre-Flight Verification Card */}
              <div
                className={cn(
                  "rounded-2xl border p-4 space-y-2.5 text-body transition",
                  hasBlockers
                    ? "border-warn-line bg-warn-bg/60 text-warn"
                    : "border-ok-line bg-ok-bg/70 text-ok"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    {hasBlockers ? (
                      <AlertTriangle className="size-4 text-warn shrink-0" />
                    ) : (
                      <ShieldCheck className="size-4 text-ok shrink-0" />
                    )}
                    <span>Quality &amp; MLR Pre-Flight Verification</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-caption font-extrabold",
                      hasBlockers
                        ? "bg-danger-bg text-danger border-danger"
                        : "bg-ok-bg text-ok border-ok-line"
                    )}
                  >
                    {hasBlockers ? `${6 - blockerCount}/6 Passed · ${blockerCount} Blockers` : "6/6 Passed · 0 Blockers"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-label pt-1">
                  {/* 1. MLR Check Card (With Blocker & Fix Action) */}
                  {!mlrCheckResolved ? (
                    <div className="flex flex-col justify-between bg-danger-bg/90 rounded-lg p-2.5 border border-danger text-danger">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="size-3.5 text-danger shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-danger">MLR: Unverified Comparative Claim</span>
                          <span className="text-caption text-danger/80 leading-tight block mt-0.5">
                            Scene 3 claims superiority without citing head-to-head trial comparator.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleFixMlrBlocker}
                        className="mt-2 inline-flex items-center gap-1 self-start rounded-md bg-danger hover:bg-rose-700 text-white text-caption font-bold px-2 py-0.5 shadow-2xs cursor-pointer transition"
                      >
                        <Sparkles className="size-2.5" />
                        <span>Fix with SwishX →</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2.5 border border-ok-line text-ok">
                      <CheckCircle2 className="size-3.5 text-ok shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-ink">24 Verified Claims Cited</span>
                        <span className="text-caption text-ink-3">EMBRACE-3 §2.4 grounded (p &lt; 0.001)</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Quality Check Card (With Blocker & Fix Action) */}
                  {!qaCheckResolved ? (
                    <div className="flex flex-col justify-between bg-warn-bg/90 rounded-lg p-2.5 border border-warn-line text-warn">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="size-3.5 text-warn shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-warn">Quality: Narration Density &gt;150 wpm</span>
                          <span className="text-caption text-warn/80 leading-tight block mt-0.5">
                            Scene 3 voiceover exceeds speech pacing limits with redundant words.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleFixQaBlocker}
                        className="mt-2 inline-flex items-center gap-1 self-start rounded-md bg-warn hover:bg-amber-700 text-white text-caption font-bold px-2 py-0.5 shadow-2xs cursor-pointer transition"
                      >
                        <Sparkles className="size-2.5" />
                        <span>Fix with SwishX →</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2.5 border border-ok-line text-ok">
                      <CheckCircle2 className="size-3.5 text-ok shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-ink">Script Pacing &amp; Audio Sync</span>
                        <span className="text-caption text-ink-3">Optimal 135 wpm speech cadence</span>
                      </div>
                    </div>
                  )}

                  {/* 3. Fair Balance & ISI Present */}
                  <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2.5 border border-ok-line text-ok">
                    <CheckCircle2 className="size-3.5 text-ok shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-ink">Fair Balance &amp; ISI Present</span>
                      <span className="text-caption text-ink-3">Contraindication footnotes verified</span>
                    </div>
                  </div>

                  {/* 4. Medical Terminology */}
                  <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2.5 border border-ok-line text-ok">
                    <CheckCircle2 className="size-3.5 text-ok shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-ink">Medical Terminology Clear</span>
                      <span className="text-caption text-ink-3">Generic name &amp; dosing accurate</span>
                    </div>
                  </div>
                </div>

                {/* Optional Auto-Fix helper */}
                {hasBlockers && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/[0.04] text-label font-semibold text-ink-2 border border-hair mt-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3 text-brand" />
                      Want SwishX to auto-fix both blockers instantly?
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoFixBoth}
                      className="text-brand font-bold hover:underline cursor-pointer"
                    >
                      Auto-Fix Both ⚡
                    </button>
                  </div>
                )}
              </div>

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
                    <Sparkles className="size-3.5" />
                    <span>Confirm &amp; Generate Video</span>
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
    </div>
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
        "group relative flex items-center justify-center gap-1 h-8.5 px-2 rounded-xl text-body transition-all duration-150 cursor-pointer font-[800] select-none whitespace-nowrap",
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
            "text-caption font-extrabold px-1.5 py-0.2 rounded-full transition-colors ml-0.5",
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
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Scene Title" className="w-full rounded-xl border p-2 text-body-lg" />
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onAdd({ title, category })} className="bg-brand text-white">Add</Button></div>
      </div>
    </div>
  );
}
