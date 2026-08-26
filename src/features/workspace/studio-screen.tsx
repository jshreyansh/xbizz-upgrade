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
  Mic2,
  MoreHorizontal,
  Music2,
  Package,
  Paperclip,
  Pause,
  Pencil,
  Play,
  Plus,
  Redo2,
  ScanLine,
  Send,
  Share2,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Trash2,
  Type,
  Undo2,
  Volume2,
  VolumeX,
  X,
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
import { cn } from "@/lib/cn";
import type { EvidenceState, InspectorTab } from "@/types/content";

const evidenceConfig: Record<EvidenceState, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-[#e5f1e9] text-[#2d6749]" },
  supported: { label: "Supported", className: "bg-[#e8eef6] text-[#45617e]" },
  changed: { label: "Changed", className: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  unsupported: { label: "Unsupported", className: "bg-[#danger-soft] text-[var(--danger)]" },
};

const dossierNames: Record<string, string> = {
  velmora: "Velmora",
  onkavia: "Onkavia",
  nirvexa: "Nirvexa",
  cardioxa: "Cardioxa",
  pulmovax: "PulmoVax",
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
    creationMode,
    sourcePayload,
  } = useWorkspaceStore();

  const [studioMode, setStudioMode] = useState<"scenes" | "editor" | "generating" | "review">("scenes");
  const [activeTab, setActiveTab] = useState<"assistant" | "edit" | "comments" | "evidence">("assistant");

  const [generateVideoModalOpen, setGenerateVideoModalOpen] = useState(false);
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [relatedOpen, setRelatedOpen] = useState(false);
  const [addSceneModalOpen, setAddSceneModalOpen] = useState(false);
  const selectedQuality = useWorkspaceStore((s) => s.selectedQuality);

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

  const isEditor = studioMode === "editor";
  const isGenerating = studioMode === "generating";
  const isReview = studioMode === "review";

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
  const [selectedCanvasElementId, setSelectedCanvasElementId] = useState<string | null>("headline");
  const [hoveredCanvasElementId, setHoveredCanvasElementId] = useState<string | null>(null);

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

  const handleOpenGenerateVideoModal = () => setGenerateVideoModalOpen(true);

  const handleConfirmVideoGeneration = () => {
    setGenerateVideoModalOpen(false);
    setStudioMode("generating");
    setActiveTab("assistant");
    const creditsDeducted = selectedQuality === "cinematic" ? "7,500" : "2,500";
    addChatMessage({
      role: "swishx",
      text: `⚡ Video generation initiated in **${selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"}** (${creditsDeducted} credits deducted). Neural rendering is processing in the cloud. You will receive an email once your final video is ready. Feel free to continue chatting with me about your project.`,
    });
    setToMessage(`Video generation queued · ${creditsDeducted} credits deducted`);
    setTimeout(() => setToMessage(null), 3500);
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

  const handleCreateSceneFromModal = (sceneData: {
    insertPosition: number;
    title: string;
    script: string;
    visualText: string;
    negativeVisual: string;
    category: "normal" | "intro" | "outro" | "product";
  }) => {
    const targetPos = Math.max(1, Math.min(sceneData.insertPosition, sceneList.length + 1));
    const tag = sceneData.category === "intro" ? "Intro Hook" : sceneData.category === "outro" ? "CTA Outro" : sceneData.category === "product" ? "Mechanism (MoA)" : "Clinical Statement";
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

  const handleSendChatMessage = () => {
    if (!directorInput.trim()) return;
    const rawInput = directorInput.trim();
    setDirectorInput("");
    addChatMessage({ role: "user", text: rawInput });
    const isCommentIntent = rawInput.toLowerCase().includes("comment") || rawInput.toLowerCase().includes("note") || rawInput.toLowerCase().includes("feedback");
    setTimeout(() => {
      if (isReview && isCommentIntent) {
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
      } else if (isReview) {
        addChatMessage({ role: "swishx", text: `I've analyzed your question against the **${dossierNames[sourcePayload?.dossierId || "velmora"] || "Velmora"}** FDA prescribing information and PromoMats evidence library. All clinical claims are 100% grounded.` });
      } else {
        addChatMessage({ role: "swishx", text: `Applied instruction across Scene ${selectedScene.number} and verified all clinical claims against the prescribing information.` });
      }
    }, 600);
  };

  return (
    <div className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#edf0ed]">
      <header className="z-30 flex h-[60px] shrink-0 items-center border-b border-[var(--line)] bg-white px-3 sm:px-5">
        <button onClick={() => setView("home")} className="focus-ring mr-2 grid size-8 place-items-center rounded-lg text-[var(--ink-muted)] hover:bg-black/5" aria-label="Back home">
          <ArrowLeft className="size-4" />
        </button>
        <SwishXMark compact />
        <div className="mx-3 h-5 w-px bg-[var(--line)]" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[12.5px] font-[800] text-[var(--ink)]">{sourcePayload?.dossierId ? `${dossierNames[sourcePayload.dossierId] || "Velmora"} HCP launch` : "DERMORA HCP launch"}</span>
            <span className="hidden rounded-full bg-[#edf1ee] px-2 py-0.5 text-[9px] font-bold text-[#69736e] sm:inline">Draft v1</span>
          </div>
          <div className="mt-0.5 hidden text-[9.5px] text-[var(--ink-muted)] sm:block">Saved just now · Maya Kapoor</div>
        </div>

        <div className="ml-6 hidden items-center gap-1 sm:flex">
          {studioMode === "scenes" && <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wide text-[var(--brand-deep)] border border-[var(--tint-line)]">Script View</span>}
          {studioMode === "editor" && (
            <div className="flex items-center gap-1.5">
              <button onClick={handleReturnToScript} className="focus-ring flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[#fafbf9] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-2)] transition hover:border-[var(--brand)] hover:bg-[var(--tint)] hover:text-[var(--brand)] shadow-xs cursor-pointer">
                <FileText className="size-3.5 text-[var(--brand)]" /> <span>Script View</span>
              </button>
              <span className="text-[var(--ink-muted)]">/</span>
              <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-extrabold text-[var(--brand-deep)] border border-[var(--tint-line)]">Canvas Editor</span>
            </div>
          )}
          {studioMode === "generating" && <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-[10.5px] font-extrabold text-orange-800 animate-pulse"><Sparkles className="size-3 text-orange-600 animate-spin" /><span>Generating High-Res Video...</span></span>}
          {studioMode === "review" && (
            <div className="flex items-center gap-1.5">
              <button onClick={handleReturnToEditor} className="focus-ring flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[#fafbf9] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-2)] transition hover:border-[var(--brand)] hover:bg-[var(--tint)] hover:text-[var(--brand)] shadow-xs cursor-pointer"><Pencil className="size-3 text-[var(--brand)]" /> <span>Editor</span></button>
              <span className="text-[var(--ink-muted)]">/</span>
              <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-[10.5px] font-extrabold text-emerald-800 border border-emerald-200">Shared Review View · Final Master ({totalDurationSeconds}s)</span>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isEditor && (
            <>
              <Button size="sm" onClick={handleOpenGenerateVideoModal} className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold px-4 cursor-pointer shadow-xs gap-1.5"><Sparkles className="size-3.5" /> <span>Generate Video</span></Button>
            </>
          )}
          {isReview && (
            <>
              <Button size="sm" onClick={() => { setToMessage("Preparing high-res MP4 download..."); setTimeout(() => setToMessage(null), 2500); }} className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold px-4 cursor-pointer shadow-xs gap-1.5"><Download className="size-3.5" /> <span>Export MP4</span></Button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        <aside
          style={{
            width: isReview ? 240 : isEditor ? 220 : "calc(100% - 410px)",
            minWidth: isReview ? 240 : isEditor ? 220 : "calc(100% - 410px)",
            maxWidth: isReview ? 240 : isEditor ? 220 : "calc(100% - 410px)",
            transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn("flex flex-col shrink-0 min-h-0 border-r border-[var(--line)] overflow-hidden transition-colors duration-300", isReview ? "bg-[#fafbf9]" : isEditor ? "bg-[#f8f9f7]" : "bg-[#eef1ed] p-4 sm:p-6 lg:p-7")}
        >
          {isReview ? (
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--line)] px-3.5 bg-white">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#596660] flex items-center gap-1.5"><Film className="size-3.5 text-[var(--brand)]" /> <span>Video Chapters · {chapters.length}</span></span>
              <span className="text-[10px] font-bold text-[var(--ink-muted)]">{totalDurationSeconds}s</span>
            </div>
          ) : isEditor ? (
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--line)] px-3 bg-white">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#77817c]">Scenes · {totalDurationSeconds} sec</span>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-4 shrink-0">
              <div>
                <h2 className="text-[20px] font-[850] text-[var(--ink)] tracking-tight">Script</h2>
                <p className="text-[12.5px] text-[var(--ink-muted)] mt-0.5">Review and shape the clinical narrative before generating the full visual canvas.</p>
              </div>
              <Button type="button" onClick={() => setAddSceneModalOpen(true)} size="sm" className="bg-white border border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)] hover:bg-[var(--tint)] hover:text-[var(--brand-deep)] font-bold shadow-2xs transition-all gap-1.5 cursor-pointer shrink-0"><Plus className="size-3.5 text-[var(--brand)]" /> <span>Add Scene</span></Button>
            </div>
          )}

          <div className={cn("flex-1 min-h-0 overflow-y-auto space-y-2.5", isReview ? "p-2.5 space-y-2" : isEditor ? "p-2.5" : "p-1 pr-2 space-y-3")}>
            {isReview
              ? chapters.map((ch) => {
                  const isCurrent = activeMasterChapter?.id === ch.id;
                  return (
                    <button key={ch.id} type="button" onClick={() => { setMasterCurrentTime(ch.start); setMasterPlaying(true); }} className={cn("group relative flex w-full flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer", isCurrent ? "border-[var(--brand)] bg-[var(--tint)] shadow-xs ring-1 ring-[var(--brand)]" : "border-black/[0.06] bg-white hover:border-black/20 hover:bg-[#fafbf9]")}>
                      <div className="flex items-center justify-between gap-1 mb-1"><span className={cn("rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold", isCurrent ? "bg-[var(--brand)] text-white" : "bg-black/5 text-[var(--ink-muted)]")}>0:{ch.start.toString().padStart(2, "0")} – 0:{ch.end.toString().padStart(2, "0")}</span>{isCurrent && <span className="flex items-center gap-1 text-[9.5px] font-extrabold text-[var(--brand-deep)]"><Play className="size-2.5 fill-current" /> Playing</span>}</div>
                      <div className="text-[12px] font-bold text-[var(--ink)] line-clamp-1">{ch.number}. {ch.title}</div>
                      <p className="text-[10.5px] text-[var(--ink-muted)] line-clamp-2 mt-0.5 leading-snug">{ch.narration}</p>
                    </button>
                  );
                })
              : sceneList.map((scene) => {
                  const active = scene.id === selectedSceneId;
                  return (
                    <div key={scene.id} onClick={() => { setSelectedSceneId(scene.id); setSceneCurrentTime(0); }} className={cn("group relative rounded-[16px] border transition-all cursor-pointer", active ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm" : "border-black/[0.07] bg-white/90 hover:border-black/20 hover:bg-white", isEditor ? "p-2" : "p-4")}>
                      {isEditor ? (
                        <div className="space-y-1.5">
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#173d31] flex items-center justify-center"><DynamicSceneComposition scene={scene} brandName={dossierNames[sourcePayload?.dossierId || "velmora"] || "DERMORA"} /><div className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[8.5px] font-extrabold text-white">{scene.number}</div></div>
                          <div className="px-0.5"><div className="text-[11.5px] font-bold text-[var(--ink)] truncate">{scene.title}</div></div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded-lg bg-[var(--ink)] text-[11px] font-black text-white">{scene.number}</span><span className="text-[14px] font-extrabold text-[var(--ink)]">{scene.title}</span></div><span className="rounded-md bg-black/5 px-2 py-0.5 text-[10px] font-bold text-[var(--ink-muted)]">⏱ {scene.duration}s</span></div>
                          <div className="rounded-xl bg-[#f8faf8] border border-black/[0.05] p-3"><div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] mb-1">Narration Script</div><textarea value={scene.narration} onChange={(e) => setSceneList((prev) => prev.map((s) => (s.id === scene.id ? { ...s, narration: e.target.value } : s)))} className="w-full bg-transparent text-[12.5px] text-[var(--ink)] leading-relaxed resize-none focus:outline-none font-medium" rows={2} /></div>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>

          {!isEditor && !isReview && !isGenerating && (
            <div className="sticky bottom-3 z-30 flex justify-center shrink-0 mt-auto pointer-events-none w-full">
              <div className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-5 py-2.5 rounded-full bg-[#111613] border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.32)] backdrop-blur-md max-w-[580px] w-auto">
                <div className="flex items-center gap-2.5 min-w-0 pr-1">{isScriptComplete ? <Sparkles className="size-4.5 text-[var(--brand)] shrink-0" /> : <AlertCircle className="size-4.5 text-amber-400 shrink-0" />}<div className="min-w-0"><div className="text-[12.5px] font-bold text-white tracking-tight truncate">{isScriptComplete ? "Script approved & claims grounded" : "Script incomplete"}</div></div></div>
                <Button onClick={handleStartSceneEditor} disabled={!isScriptComplete} size="sm" className={cn("h-9.5 px-5 rounded-full text-[13px] font-bold shadow-sm transition-all duration-200 shrink-0", isScriptComplete ? "bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white hover:-translate-y-0.5 cursor-pointer" : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5")}><Sparkles className="size-3.5 mr-1.5" /> <span>Generate Scenes</span></Button>
              </div>
            </div>
          )}
        </aside>

        <main
          style={{
            flex: isEditor || isReview || isGenerating ? 1 : "0 0 0px",
            width: isEditor || isReview || isGenerating ? "auto" : "0px",
            minWidth: 0,
            opacity: isEditor || isReview || isGenerating ? 1 : 0,
            transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn(
            "flex flex-col min-h-0 overflow-hidden",
            !isEditor && !isReview && !isGenerating && "pointer-events-none"
          )}
        >
          {/* ══════════════════════════════════════════════════════════════════
              MODE 1: ASYNCHRONOUS NEURAL VIDEO GENERATION LOADER
             ══════════════════════════════════════════════════════════════════ */}
          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#101915] text-white relative overflow-hidden">
              <div className="absolute -top-24 -left-24 size-80 rounded-full bg-[var(--brand)]/15 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-emerald-500/15 blur-3xl" />

              <div className="relative z-10 w-full max-w-[560px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 shadow-2xl space-y-6 text-center">
                <div className="size-16 rounded-2xl bg-[var(--brand)]/20 border border-[var(--brand)]/40 grid place-items-center mx-auto shadow-lg">
                  <Sparkles className="size-8 text-[var(--brand)] animate-spin" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 px-3 py-1 text-[11px] font-extrabold mb-2">
                    <span className="size-2 rounded-full bg-orange-400 animate-ping" />
                    <span>Rendering Cloud Master · {selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"}</span>
                  </div>
                  <h2 className="text-[22px] font-[850] tracking-tight text-white">
                    Generating High-Resolution Clinical Video
                  </h2>
                  <p className="text-[12.5px] text-white/70 mt-1.5 leading-relaxed">
                    Synthesizing 5 clinical scenes ({totalDurationSeconds}s), 3D MoA orbital meshes, and verified PromoMats voiceover sync.
                  </p>
                </div>

                {/* Step Milestones */}
                <div className="rounded-2xl bg-black/30 border border-white/10 p-4 text-left space-y-2.5 text-[11.5px]">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-2">✓ Script &amp; Voiceover Synthesis</span>
                    <span>Done</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-2">✓ 3D Anatomical MoA Meshes</span>
                    <span>Done</span>
                  </div>
                  <div className="flex items-center justify-between text-orange-400 font-bold">
                    <span className="flex items-center gap-2">
                      <Sparkles className="size-3 animate-spin" /> Neural Frame Rendering
                    </span>
                    <span>84%</span>
                  </div>
                  <div className="flex items-center justify-between text-white/40 font-medium">
                    <span className="flex items-center gap-2">○ PromoMats Watermarking &amp; Export</span>
                    <span>Pending</span>
                  </div>
                </div>

                {/* Email Notice */}
                <div className="rounded-xl bg-white/10 border border-white/10 p-3.5 text-[11.5px] text-white/80 text-left">
                  <span>
                    An email notification will arrive once processing is complete. You can continue chatting with SwishX in the meantime.
                  </span>
                </div>

                {/* Jump to Review */}
                <Button
                  onClick={handleEnterReviewView}
                  className="w-full bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold h-11 rounded-xl shadow-md cursor-pointer gap-2"
                >
                  <span>View Master Video in Shared Review</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              MODE 2: CANVA-STYLE SCENE CANVAS EDITOR (studioMode === "editor")
             ══════════════════════════════════════════════════════════════════ */}
          {isEditor && (
            <div className="relative flex min-h-0 flex-1 flex-col bg-[#e6e9e6]">
              {/* Sub-header */}
              <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#cad1cd]/70 bg-white/60 px-4 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 text-[11px] font-bold text-[var(--ink)]">
                  <span className="rounded-md bg-white border border-black/10 px-2 py-0.5 shadow-2xs font-extrabold">
                    Scene {selectedScene.number} of {sceneList.length}
                  </span>
                  <span>{selectedScene.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="rounded-md bg-white border border-black/10 px-2 py-0.5 text-[10px] font-bold text-[#64726b] shadow-2xs">
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
                  className="relative aspect-video w-full max-w-[840px] rounded-[18px] bg-[#173d31] shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/20 overflow-hidden select-none"
                >
                  {/* Layer 1: Background Gradient Graphic */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCanvasElementId("bg");
                    }}
                    onMouseEnter={() => setHoveredCanvasElementId("bg")}
                    onMouseLeave={() => setHoveredCanvasElementId(null)}
                    className={cn(
                      "absolute inset-0 transition-all",
                      selectedCanvasElementId === "bg" && "ring-2 ring-emerald-400"
                    )}
                  >
                    <div className="absolute inset-0 bg-radial from-[#1e4d3f] via-[#173d31] to-[#0f2820]" />
                  </div>

                  {/* Layer 2: 3D Kinetic Anatomy / MoA Model */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCanvasElementId("visual-3d");
                    }}
                    onMouseEnter={() => setHoveredCanvasElementId("visual-3d")}
                    onMouseLeave={() => setHoveredCanvasElementId(null)}
                    className={cn(
                      "absolute right-4 top-4 size-56 sm:size-72 rounded-full transition-all cursor-pointer",
                      selectedCanvasElementId === "visual-3d"
                        ? "border-2 border-dashed border-[var(--brand)] ring-4 ring-[var(--brand)]/20"
                        : hoveredCanvasElementId === "visual-3d"
                        ? "border border-dashed border-white/50"
                        : ""
                    )}
                  >
                    <div className="size-full rounded-full border border-white/15 animate-spin duration-15000 flex items-center justify-center">
                      <div className="size-3/4 rounded-full border border-lime-300/30 flex items-center justify-center">
                        <div className="size-6 rounded-full bg-[#d8f05d] shadow-[0_0_30px_#d8f05d]" />
                      </div>
                    </div>
                  </div>

                  {/* Structured Canvas Content Overlay */}
                  <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 text-white pointer-events-none">
                    {/* Top Narrative Pillar Tag */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCanvasElementId("tag");
                      }}
                      onMouseEnter={() => setHoveredCanvasElementId("tag")}
                      onMouseLeave={() => setHoveredCanvasElementId(null)}
                      className={cn(
                        "pointer-events-auto inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/80 p-1.5 rounded-lg transition-all cursor-pointer w-fit",
                        selectedCanvasElementId === "tag"
                          ? "border-2 border-dashed border-[var(--brand)] bg-black/40 ring-2 ring-[var(--brand)]/30"
                          : hoveredCanvasElementId === "tag"
                          ? "border border-dashed border-white/60 bg-black/20"
                          : ""
                      )}
                    >
                      <span className="size-2 rounded-full bg-[#d8f05d]" />
                      <span>{selectedScene.narrativeTag || "PIVOTAL EVIDENCE"}</span>
                      <span className="text-[9px] font-bold text-white/50 lowercase ml-1">(0:00–0:{selectedScene.duration})</span>
                    </div>

                    {/* Core Headline Overlay */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCanvasElementId("headline");
                      }}
                      onMouseEnter={() => setHoveredCanvasElementId("headline")}
                      onMouseLeave={() => setHoveredCanvasElementId(null)}
                      className={cn(
                        "pointer-events-auto relative max-w-[70%] p-2.5 rounded-xl transition-all cursor-pointer",
                        selectedCanvasElementId === "headline"
                          ? "border-2 border-dashed border-[var(--brand)] bg-black/40 ring-4 ring-[var(--brand)]/20"
                          : hoveredCanvasElementId === "headline"
                          ? "border border-dashed border-white/60 bg-black/20"
                          : ""
                      )}
                    >
                      <h3 className="text-[24px] sm:text-[28px] font-[850] tracking-tight leading-tight text-white drop-shadow-md">
                        {selectedScene.title}
                      </h3>

                      {/* Floating Inline Formatting Pill */}
                      {selectedCanvasElementId === "headline" && (
                        <div className="absolute -top-9 left-0 z-30 flex items-center gap-1.5 rounded-lg bg-[#111614] border border-white/20 px-2.5 py-1 text-[10.5px] font-bold text-white shadow-xl">
                          <Type className="size-3 text-[var(--brand)]" />
                          <span>Title Layer</span>
                          <span className="text-white/40">|</span>
                          <span className="text-emerald-400">⏱ 0:01 – 0:09</span>
                          <span className="text-white/40">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setToMessage("Rephrased headline with clinical clarity");
                              setTimeout(() => setToMessage(null), 2000);
                            }}
                            className="text-[var(--brand)] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Sparkles className="size-2.5" /> Rephrase
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Subtitle / Narration Script Overlay */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCanvasElementId("narration");
                      }}
                      onMouseEnter={() => setHoveredCanvasElementId("narration")}
                      onMouseLeave={() => setHoveredCanvasElementId(null)}
                      className={cn(
                        "pointer-events-auto relative max-w-[75%] p-2 rounded-xl transition-all cursor-pointer",
                        selectedCanvasElementId === "narration"
                          ? "border-2 border-dashed border-[var(--brand)] bg-black/40 ring-4 ring-[var(--brand)]/20"
                          : hoveredCanvasElementId === "narration"
                          ? "border border-dashed border-white/60 bg-black/20"
                          : ""
                      )}
                    >
                      <p className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-white/85">
                        {selectedScene.narration}
                      </p>
                      {selectedCanvasElementId === "narration" && (
                        <div className="absolute -top-8 left-0 z-30 flex items-center gap-1.5 rounded-lg bg-[#111614] border border-white/20 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl">
                          <Mic2 className="size-3 text-[var(--brand)]" />
                          <span>Voiceover Sync</span>
                          <span className="text-emerald-400">⏱ 0:01 – 0:13</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Grounding Badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-white/60">
                      <span>{dossierNames[sourcePayload?.dossierId || "velmora"] || "DERMORA"}® · HCP Prescribing Brief</span>
                      <span className="rounded bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 font-bold">
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
                        className="size-8 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-deep)] flex items-center justify-center text-white shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
                      >
                        {scenePlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current ml-0.5" />}
                      </button>

                      {/* Scene Timecode Display */}
                      <span className="text-[11px] font-mono font-bold text-white/90 shrink-0">
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
                          className="h-full bg-[var(--brand)] rounded-full transition-all duration-75"
                        />
                      </div>

                      <span className="text-[10px] text-white/60 font-bold hidden sm:inline shrink-0">
                        Scene {selectedScene.number} Scope
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Multi-Layer Production Timeline Bar (Collapsible) ── */}
              <div className="border-t border-[var(--line)] bg-[#fafbf9] text-[var(--ink)] shrink-0">
                <div className="flex h-9 items-center justify-between px-4 border-b border-[var(--line)] bg-white">
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-[var(--ink)]">
                    <Layers className="size-3.5 text-[var(--brand)]" />
                    <span>Production Layers</span>
                    <span className="rounded-md bg-[#edf1ee] px-2 py-0.5 text-[9.5px] font-semibold text-[#5a6660]">
                      Scene {selectedScene.number} · {selectedScene.duration}s
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTimelineOpen(!timelineOpen)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand)] hover:text-[var(--brand-deep)] transition-colors cursor-pointer"
                  >
                    <span>{timelineOpen ? "Hide Layers" : "Show Layers"}</span>
                    {timelineOpen ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
                  </button>
                </div>

                {timelineOpen && (
                  <div className="max-h-[200px] overflow-y-auto bg-white select-none flex flex-col text-[11px] border-b border-[var(--line)]">
                    <div className="h-6 shrink-0 flex items-center border-b border-[var(--line)] bg-[#f4f6f4] text-[9.5px] text-[var(--ink-muted)] font-bold sticky top-0 z-10 px-3">
                      <div className="w-[160px] shrink-0 border-r border-[var(--line)] pr-2 uppercase">Scene {selectedScene.number} Tracks</div>
                      <div className="flex-1 flex justify-between px-3">
                        <span>0:00</span>
                        <span>0:03</span>
                        <span>0:06</span>
                        <span>0:09</span>
                        <span>0:12</span>
                        <span>0:{selectedScene.duration}</span>
                      </div>
                    </div>

                    <div className="flex flex-col divide-y divide-[var(--line)]">
                      {/* Track 1: Background */}
                      <div className="h-8 flex items-center bg-[#fafbf9]">
                        <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[10.5px] font-bold">
                          <ImageIcon className="size-3.5 text-emerald-600" />
                          <span className="truncate">1. Bg Canvas</span>
                        </div>
                        <div className="flex-1 h-full p-1">
                          <div className="h-full rounded bg-emerald-100 border border-emerald-300 flex items-center px-2 text-[9.5px] font-bold text-emerald-950">
                            Bg_Emerald_Gradient.png [0:00 – 0:{selectedScene.duration}]
                          </div>
                        </div>
                      </div>

                      {/* Track 2: 3D MoA Model */}
                      <div className="h-8 flex items-center bg-[#fafbf9]">
                        <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[10.5px] font-bold">
                          <Film className="size-3.5 text-[var(--brand)]" />
                          <span className="truncate">2. 3D MoA Target</span>
                        </div>
                        <div className="flex-1 h-full p-1">
                          <div className="h-full rounded bg-[var(--tint)] border border-[var(--brand)]/30 flex items-center px-2 text-[9.5px] font-bold text-[var(--brand-deep)]">
                            3D_CLEARSKIN_Anatomy.mp4 [0:00 – 0:{selectedScene.duration}]
                          </div>
                        </div>
                      </div>

                      {/* Track 3: Headline Copy */}
                      <div className="h-8 flex items-center bg-[#fafbf9]">
                        <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[10.5px] font-bold">
                          <Type className="size-3.5 text-blue-600" />
                          <span className="truncate">3. Text Headline</span>
                        </div>
                        <div className="flex-1 h-full p-1">
                          <div className="h-full w-3/4 rounded bg-blue-50 border border-blue-200 flex items-center px-2 text-[9.5px] font-bold text-blue-900 truncate">
                            &quot;{selectedScene.title}&quot; [0:01 – 0:09]
                          </div>
                        </div>
                      </div>

                      {/* Track 4: Voiceover */}
                      <div className="h-8 flex items-center bg-[#fafbf9]">
                        <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[10.5px] font-bold">
                          <Mic2 className="size-3.5 text-amber-600" />
                          <span className="truncate">4. Voiceover</span>
                        </div>
                        <div className="flex-1 h-full p-1">
                          <div className="h-full w-4/5 rounded bg-amber-50 border border-amber-200 flex items-center px-2 text-[9.5px] font-bold text-amber-900 truncate">
                            Rohan VO · Clinical narration [0:01 – 0:13]
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
                <div className="relative aspect-video w-full max-w-[920px] rounded-[20px] bg-black shadow-[0_24px_70px_rgba(0,0,0,0.5)] ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">
                  {/* Master Video Canvas */}
                  <div className="absolute inset-0">
                    <MasterVideoSequenceComposition
                      sceneList={sceneList}
                      activeScene={activeMasterChapter}
                      brandName={dossierNames[sourcePayload?.dossierId || "velmora"] || "DERMORA"}
                    />
                  </div>

                  {/* Top Bar Pill in Player */}
                  <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white text-[11px]">
                    <div className="flex items-center gap-2 font-extrabold">
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-emerald-300">
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
                          className="absolute -top-10 -translate-x-1/2 rounded-lg bg-[#1a2620] border border-white/20 px-3 py-1 text-[10.5px] font-bold text-white shadow-xl pointer-events-none whitespace-nowrap z-30"
                        >
                          <span>{hoveredScrubTime ? `0:${Math.floor(hoveredScrubTime).toString().padStart(2, "0")}` : ""}</span>
                          <span className="text-white/40 mx-1">·</span>
                          <span className="text-emerald-300">{hoveredChapter.title}</span>
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
                                className="h-full bg-[var(--brand)] transition-all duration-75"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Master Playback Controls Row */}
                    <div className="flex items-center justify-between text-white text-[12px]">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setMasterPlaying(!masterPlaying)}
                          className="size-9 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-deep)] flex items-center justify-center text-white shadow-md cursor-pointer transition-transform active:scale-95"
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

                        <span className="font-mono font-bold text-[12px] text-white">
                          0:{Math.floor(masterCurrentTime).toString().padStart(2, "0")} / 0:{totalDurationSeconds}s
                        </span>

                        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-[11px] font-bold text-white/90">
                          <span className="size-1.5 rounded-full bg-[var(--brand)]" />
                          <span>
                            Chapter {activeMasterChapter?.number}: {activeMasterChapter?.title}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-extrabold uppercase bg-white/10 px-2 py-0.5 rounded text-white/80">
                          CC
                        </span>
                        <span className="text-[10.5px] font-extrabold text-[var(--brand)] bg-[var(--brand)]/15 px-2 py-0.5 rounded">
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

        <aside className="w-[410px] shrink-0 border-l border-[var(--line)] bg-white flex flex-col min-h-0 shadow-[-4px_0_20px_rgba(0,0,0,0.04)] z-10">
          <div className="grid grid-cols-3 gap-1 p-2 border-b border-[var(--line)] bg-[#f4f6f4]">
            <InspectorTabButton tab="assistant" current={activeTab} onClick={setActiveTab} icon={Sparkles}>Chat</InspectorTabButton>
            {isReview ? (
              <InspectorTabButton tab="comments" current={activeTab} onClick={setActiveTab} icon={MessageSquare}>Comments ({commentsList.length})</InspectorTabButton>
            ) : (
              <InspectorTabButton tab="edit" current={activeTab} onClick={setActiveTab} icon={Sliders}>Edit</InspectorTabButton>
            )}
            <InspectorTabButton tab="evidence" current={activeTab} onClick={setActiveTab} icon={ShieldCheck}>Claims (24)</InspectorTabButton>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {/* ── TAB 1: PERSISTENT SWISHX CHAT ── */}
            {activeTab === "assistant" && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 border-b border-black/[0.06] bg-[#fafbf9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11.5px] font-extrabold text-[var(--ink)]">Direct with SwishX · Online</span>
                  </div>
                  <span className="text-[10px] text-[var(--ink-muted)] font-semibold">Pharma-Compliant Copilot</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col max-w-[88%] text-[13px] leading-relaxed transition-all",
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      {msg.role === "swishx" && (
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[var(--brand-deep)]">
                          <span className="flex size-4.5 items-center justify-center rounded-full bg-[var(--brand)] text-[8.5px] font-black text-white">
                            SX
                          </span>
                          <span>SwishX</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-[16px] px-3.5 py-2.5 text-[12.5px] shadow-xs",
                          msg.role === "user"
                            ? "bg-[var(--brand)] text-white font-medium rounded-br-xs"
                            : "bg-white text-[var(--ink)] border border-black/[0.08] rounded-bl-xs font-normal"
                        )}
                      >
                        <FormattedMessageText text={msg.text} />
                      </div>
                    </div>
                  ))}
                  <div ref={studioChatEndRef} />
                </div>

                {/* Chat Input Box */}
                <div className="p-3 border-t border-[var(--line)] bg-[#fafbf9]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="flex flex-col gap-2 rounded-2xl border border-black/[0.08] bg-white p-2.5 shadow-xs focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/15"
                  >
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
                      className="w-full resize-none text-[12.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none"
                    />
                    <div className="flex items-center justify-between pt-1 border-t border-black/[0.04]">
                      <div className="text-[10px] text-[var(--ink-muted)]">
                        {isReview ? "💡 Ask questions or add comments via AI" : "💡 Grounded against FDA Dossier"}
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!directorInput.trim()}
                        className="size-7 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white p-0 flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-30"
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
                <div className="p-3.5 border-b border-[var(--line)] bg-[#fafbf9] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-extrabold text-[var(--ink)]">Add Reviewer Comment</span>
                    <span className="rounded-md bg-[var(--tint)] border border-[var(--brand)]/30 px-2 py-0.5 text-[10px] font-extrabold text-[var(--brand-deep)]">
                      ⏱ 0:{Math.floor(masterCurrentTime).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Provide compliance or marketing feedback at current timestamp..."
                    rows={2}
                    className="w-full rounded-xl border border-black/10 bg-white p-2.5 text-[12px] text-[var(--ink)] resize-none focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePostComment}
                      disabled={!newCommentText.trim()}
                      size="sm"
                      className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold text-[11px] h-8 px-4 cursor-pointer"
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
                          ? "bg-[#fafbf9] border-black/[0.05] opacity-60"
                          : "bg-white border-black/[0.08] shadow-2xs hover:border-[var(--brand)]/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="size-6 rounded-full bg-[var(--brand)]/15 text-[var(--brand-deep)] font-extrabold text-[10px] grid place-items-center">
                            {comment.avatar}
                          </span>
                          <div>
                            <div className="text-[11.5px] font-bold text-[var(--ink)]">{comment.author}</div>
                            <div className="text-[9.5px] text-[var(--ink-muted)]">{comment.createdAt}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMasterCurrentTime(comment.timestampSec);
                            setMasterPlaying(true);
                          }}
                          className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          ⏱ {comment.timeFormatted}
                        </button>
                      </div>

                      <p className="text-[12px] text-[var(--ink)] leading-relaxed">{comment.text}</p>

                      {comment.replies.length > 0 && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-black/10 mt-2">
                          {comment.replies.map((rep) => (
                            <div key={rep.id} className="text-[11px]">
                              <span className="font-bold text-[var(--ink)]">{rep.author}: </span>
                              <span className="text-[var(--ink-2)]">{rep.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-black/[0.04] text-[10.5px]">
                        <button
                          type="button"
                          onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                          className="text-[var(--brand)] font-bold hover:underline cursor-pointer"
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleResolveComment(comment.id)}
                          className="text-[var(--ink-muted)] hover:text-emerald-700 font-semibold cursor-pointer"
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
                            className="flex-1 rounded-lg border border-black/10 px-2.5 py-1 text-[11px] focus:outline-none focus:border-[var(--brand)]"
                          />
                          <Button
                            size="sm"
                            onClick={() => handlePostReply(comment.id)}
                            className="bg-[var(--brand)] text-white text-[10px] h-7 px-2.5 font-bold"
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

            {/* ── TAB 2 (In Editor Mode): EDIT PROPERTIES ── */}
            {activeTab === "edit" && !isReview && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="border-b border-[var(--line)] pb-3">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                    Scene Inspector
                  </div>
                  <h3 className="text-[15px] font-[850] text-[var(--ink)] mt-0.5">
                    Scene {selectedScene.number}: {selectedScene.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11.5px] font-bold text-[var(--ink-2)] block mb-1">Headline Text</label>
                    <input
                      type="text"
                      value={selectedScene.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSceneList((prev) =>
                          prev.map((s) => (s.id === selectedScene.id ? { ...s, title: val } : s))
                        );
                      }}
                      className="w-full rounded-xl border border-black/10 p-2.5 text-[12px] font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-[var(--ink-2)] block mb-1">Narration Script</label>
                    <textarea
                      value={selectedScene.narration}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSceneList((prev) =>
                          prev.map((s) => (s.id === selectedScene.id ? { ...s, narration: val } : s))
                        );
                      }}
                      rows={3}
                      className="w-full rounded-xl border border-black/10 p-2.5 text-[12px] font-medium resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-[var(--ink-2)] block mb-1">Duration (Seconds)</label>
                    <div className="flex items-center gap-2">
                      {[8, 10, 14, 20].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => {
                            setSceneList((prev) =>
                              prev.map((s) => (s.id === selectedScene.id ? { ...s, duration: dur } : s))
                            );
                          }}
                          className={cn(
                            "rounded-lg border px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer",
                            selectedScene.duration === dur
                              ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                              : "bg-white border-black/10 text-[var(--ink-2)] hover:bg-[#fafbf9]"
                          )}
                        >
                          {dur}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: CLAIMS & EVIDENCE LIBRARY ── */}
            {activeTab === "evidence" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                      Compliance Grounding
                    </div>
                    <h2 className="mt-0.5 text-[14px] font-[800] text-[var(--ink)]">24 Approved Claims</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[9.5px] font-bold">
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
                    <div key={c.id} className="rounded-xl border border-black/[0.06] bg-[#fafbf9] p-3 text-left hover:border-[var(--brand)]/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-md">
                          {c.tag}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">✓ {c.status}</span>
                      </div>
                      <h4 className="text-[12px] font-bold text-[var(--ink)]">{c.title}</h4>
                      <p className="text-[10.5px] text-[var(--ink-muted)] leading-relaxed mt-1">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[var(--ink)] text-white px-4 py-2 text-[12px] font-bold shadow-lg">{toastMessage}</div>
      )}

      {generateVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Video Generation"
        >
          <div className="rise-in w-full max-w-[560px] overflow-hidden rounded-[24px] border border-white/50 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4.5 bg-[#fafbf9]">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">
                  <Sparkles className="size-3.5" /> Generation Engine
                </div>
                <h2 className="mt-0.5 text-[20px] font-[850] tracking-tight text-[var(--ink)]">
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
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">
                      Credits Deducted
                    </div>
                    <div className="text-[20px] font-[900] text-white mt-0.5">
                      ⚡ {selectedQuality === "cinematic" ? "7,500" : "2,500"} Credits
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--brand)]/20 border border-[var(--brand)] px-3 py-1 text-[11px] font-bold text-[var(--brand)]">
                    {selectedQuality === "cinematic" ? "Cinematic 4K" : "HD Motion"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-[11.5px] text-white/75">
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase font-bold">Duration &amp; Scenes</span>
                    <strong className="text-white">{totalDurationSeconds}s · 5 Scenes</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase font-bold">Estimated Render Time</span>
                    <strong className="text-white">~{selectedQuality === "cinematic" ? "12–14 min" : "7–9 min"}</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase font-bold">Team Balance</span>
                    <strong className="text-emerald-400">50,000 Credits</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase font-bold">Balance Remaining</span>
                    <strong className="text-white">
                      {(50000 - (selectedQuality === "cinematic" ? 7500 : 2500)).toLocaleString()} Credits
                    </strong>
                  </div>
                </div>
              </div>

              {/* Informational Notice */}
              <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed">
                Generation renders in the background using neural motion models. You will receive an email notification when processing completes, and can continue working in SwishX.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--line)]">
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
                  onClick={handleConfirmVideoGeneration}
                  className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold px-5 cursor-pointer shadow-xs gap-1.5"
                >
                  <Sparkles className="size-3.5" />
                  <span>Confirm &amp; Generate Video</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InspectorTabButton({ tab, current, onClick, icon: Icon, children }: any) {
  const active = tab === current;
  return (
    <button type="button" onClick={() => onClick(tab)} className={cn("flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[11px] text-[12px] transition-all cursor-pointer", active ? "bg-white shadow-xs" : "hover:bg-white/50")}>
      {Icon && <Icon className="size-3.5" />}
      {children}
    </button>
  );
}

function AddSceneModal({ sceneCount, onClose, onAdd }: any) {
  const [category, setCategory] = useState<"normal" | "intro" | "outro" | "product">("normal");
  const [title, setTitle] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-[500px] bg-white rounded-[24px] p-6 space-y-4">
        <h2 className="text-[18px] font-extrabold">Add New Scene</h2>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Scene Title" className="w-full rounded-xl border p-2 text-[13px]" />
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onAdd({ title, category })} className="bg-[var(--brand)] text-white">Add</Button></div>
      </div>
    </div>
  );
}
