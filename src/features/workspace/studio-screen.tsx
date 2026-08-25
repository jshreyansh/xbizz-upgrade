"use client";

import { Player } from "@remotion/player";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Copy,
  Download,
  Expand,
  FileCheck2,
  FileText,
  Film,
  History,
  Image as ImageIcon,
  Layers,
  LayoutPanelTop,
  Link2,
  MessageSquare,
  Mic2,
  MoreHorizontal,
  Music2,
  Package,
  Pencil,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  ScanLine,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TextCursorInput,
  Trash2,
  Type,
  Undo2,
  Upload,
  Video,
  Volume2,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { scenes } from "@/features/workspace/mock-data";
import { DermoraComposition } from "@/features/workspace/video-composition";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";
import type { EvidenceState, InspectorTab } from "@/types/content";

const evidenceConfig: Record<EvidenceState, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-[#e5f1e9] text-[#2d6749]" },
  supported: { label: "Supported", className: "bg-[#e8eef6] text-[#45617e]" },
  changed: { label: "Changed", className: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  unsupported: { label: "Unsupported", className: "bg-[var(--danger-soft)] text-[var(--danger)]" },
};

export function StudioScreen() {
  const { selectedSceneId, setSelectedSceneId, inspectorTab, setInspectorTab, setView, creationMode } = useWorkspaceStore();
  
  // Single fluid layout mode: "scenes" (wide 2-column view) -> "editor" (3-column canvas view)
  const [studioMode, setStudioMode] = useState<"scenes" | "editor">("scenes");

  // Inspector tab: defaults to "assistant" (Chat) in scenes mode; "edit" in editor mode
  const [activeTab, setActiveTab] = useState<InspectorTab>("assistant");

  // Modals & Assistant
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [relatedOpen, setRelatedOpen] = useState(false);
  const [assistantValue, setAssistantValue] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Add Scene Modal State
  const [addSceneModalOpen, setAddSceneModalOpen] = useState(false);

  // Generate Now Quality Modal State (HD vs Cinematic)
  const [generateQualityModalOpen, setGenerateQualityModalOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<"hd" | "cinematic">("hd");

  // Simulated Asynchronous Scene Generation States
  // Tracks which scene IDs have finished rendering. All scenes not in this array show skeleton loader state.
  const [generatedSceneIds, setGeneratedSceneIds] = useState<string[]>([]);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);

  // In-place script editing state for scene tiles in Scenes mode
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingScriptText, setEditingScriptText] = useState<string>("");

  // Toast notification state
  const [toastMessage, setToMessage] = useState<string | null>(null);

  // Local scenes list allowing dynamic addition and reordering
  const [sceneList, setSceneList] = useState(scenes);
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);

  // Chat message thread (persists across both modes) - empty by default so suggested prompts show initially
  const [directorInput, setDirectorInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "swishx"; text: string }>>([]);

  // Editor mode multi-layer timeline accordion (Default to CLOSED)
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [activeTimelineLayer, setActiveTimelineLayer] = useState<string | null>(null);

  const selectedScene = useMemo(
    () => sceneList.find((scene) => scene.id === selectedSceneId) ?? sceneList[0] ?? scenes[0],
    [sceneList, selectedSceneId]
  );

  const isAvatar = creationMode === "magic-avatar";
  const isEditor = studioMode === "editor";

  // Trigger quality confirmation modal when clicking Generate Now
  const handleOpenGenerateModal = () => {
    setGenerateQualityModalOpen(true);
  };

  // Transition from Scenes Mode to Editor Mode upon confirming quality with simulated progressive rendering
  const handleConfirmGeneration = () => {
    setGenerateQualityModalOpen(false);
    setStudioMode("editor");
    setActiveTab("assistant");
    setGeneratedSceneIds([]); // Start with all scenes loading
    setGenerationStartTime(Date.now());

    setToMessage(`Generating ${sceneList.length} scenes in ${selectedQuality === "hd" ? "HD" : "Cinematic"}...`);
    setTimeout(() => setToMessage(null), 3000);

    // Progressive Generation Sequence:
    // Scene 1 completes in 3 seconds
    if (sceneList[0]) {
      setTimeout(() => {
        setGeneratedSceneIds((prev) => [...prev, sceneList[0].id]);
        setToMessage("Scene 1 rendered & ready");
        setTimeout(() => setToMessage(null), 2000);
      }, 3000);
    }

    // Subsequent scenes complete every 5 seconds (Scene 2 @ 8s, Scene 3 @ 13s, Scene 4 @ 18s...)
    sceneList.slice(1).forEach((sc, idx) => {
      const delay = 3000 + (idx + 1) * 5000;
      setTimeout(() => {
        setGeneratedSceneIds((prev) => [...prev, sc.id]);
        setToMessage(`Scene ${sc.number} rendered & ready`);
        setTimeout(() => setToMessage(null), 2000);
      }, delay);
    });
  };

  const handleReturnToScenes = () => {
    setStudioMode("scenes");
    setActiveTab("assistant");
  };

  const handleCreateSceneFromModal = (sceneData: {
    insertPosition: number;
    title: string;
    script: string;
    visualText: string;
    negativeVisual: string;
    category: "normal" | "intro" | "outro" | "product";
    outroDetails?: {
      bgType: string;
      bgColor: string;
      logoText: string;
      disclaimer: string;
      contact: string;
    };
    attachments?: string[];
  }) => {
    const targetPos = Math.max(1, Math.min(sceneData.insertPosition, sceneList.length + 1));
    const newScene = {
      id: `scene-${Date.now()}`,
      number: targetPos,
      title: sceneData.title || `Scene ${targetPos}: ${sceneData.category === "intro" ? "Brand Introduction" : sceneData.category === "outro" ? "Clinical Summary & Outro" : sceneData.category === "product" ? "Product Profile" : "Clinical Statement"}`,
      duration: 10,
      narration: sceneData.script || "A balanced clinical statement aligned with verified label claims and dosing protocols.",
      visual: sceneData.visualText || "High-clarity clinical anatomical visualization with verified safety parameters.",
      claim: "Dossier §5.1 verified",
      evidenceState: "approved" as const,
    };

    const updated = [...sceneList];
    updated.splice(targetPos - 1, 0, newScene);
    const renumbered = updated.map((s, idx) => ({ ...s, number: idx + 1 }));
    setSceneList(renumbered);
    setSelectedSceneId(newScene.id);
    setAddSceneModalOpen(false);

    // Toast feedback
    setToMessage(`Scene ${targetPos} added`);
    setTimeout(() => {
      setToMessage(null);
    }, 2800);
  };

  const handleDragStart = (id: string) => {
    setDraggedSceneId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSceneId || draggedSceneId === targetId) return;

    const sourceIndex = sceneList.findIndex((s) => s.id === draggedSceneId);
    const targetIndex = sceneList.findIndex((s) => s.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const updated = [...sceneList];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    
    // Update scene numbers to reflect new order
    const renumbered = updated.map((s, idx) => ({ ...s, number: idx + 1 }));
    setSceneList(renumbered);
  };

  const handleDragEnd = () => {
    setDraggedSceneId(null);
  };

  const handleSendChat = () => {
    if (!directorInput.trim()) return;
    const msg = directorInput;
    setDirectorInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "swishx",
          text: `Applied "${msg}" across target scenes and verified all 6 source claims. Ready to generate.`,
        },
      ]);
    }, 600);
  };

  const applyAssistant = () => {
    if (!assistantValue.trim()) return;
    setIsApplying(true);
    window.setTimeout(() => {
      setIsApplying(false);
      setAssistantValue("");
    }, 900);
  };

  return (
    <div className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#edf0ed]">
      {/* ─── Top Studio Header Bar ─── */}
      <header className="z-30 flex h-[60px] shrink-0 items-center border-b border-[var(--line)] bg-white px-3 sm:px-5">
        <button
          onClick={() => setView("home")}
          className="focus-ring mr-2 grid size-8 place-items-center rounded-lg text-[var(--ink-muted)] hover:bg-black/5"
          aria-label="Back home"
        >
          <ArrowLeft className="size-4" />
        </button>
        <SwishXMark compact />
        <div className="mx-3 h-5 w-px bg-[var(--line)]" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[12.5px] font-[800] text-[var(--ink)]">DERMORA HCP launch</span>
            <span className="hidden rounded-full bg-[#edf1ee] px-2 py-0.5 text-[9px] font-bold text-[#69736e] sm:inline">
              Draft v1
            </span>
          </div>
          <div className="mt-0.5 hidden text-[9.5px] text-[var(--ink-muted)] sm:block">
            Saved just now · Maya Kapoor
          </div>
        </div>

        {/* State Switcher in Header */}
        <div className="ml-6 hidden items-center gap-1 sm:flex">
          {isEditor ? (
            <button
              onClick={handleReturnToScenes}
              className="focus-ring flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[#fafbf9] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-2)] transition hover:border-[var(--brand)] hover:bg-[var(--tint)] hover:text-[var(--brand)] shadow-xs"
              title="Return to Scenes View"
            >
              <FileText className="size-3.5 text-[var(--brand)]" />
              <span>Script View</span>
            </button>
          ) : (
            <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wide text-[var(--brand-deep)] border border-[var(--tint-line)]">
              Scenes View
            </span>
          )}
        </div>

        <div className="ml-4 hidden items-center gap-0.5 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Redo" disabled>
            <Redo2 className="size-4" />
          </Button>
          <div className="mx-1 h-5 w-px bg-[var(--line)]" />
          <Button variant="ghost" size="sm">
            <History className="size-3.5" /> Versions
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!isEditor ? (
            /* Single Primary "Generate Now" Action in Top Header */
            <Button
              onClick={handleOpenGenerateModal}
              size="sm"
              className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold px-4 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="size-3.5 mr-1.5" />
              <span>Generate Now</span>
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setRelatedOpen(true)}
              >
                <Plus className="size-3.5" /> Related asset
              </Button>
              <Button size="sm" onClick={() => setPreflightOpen(true)}>
                <ShieldCheck className="size-3.5" /> Review &amp; export
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" aria-label="More">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </header>

      {/* ─── Fluid Unified Layout Workspace ─── */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* ── LEFT PANEL: Smoothly transitions between Wide Scene Cards and 216px PPT Filmstrip ── */}
        <aside
          style={{
            width: isEditor ? 220 : "calc(100% - 410px)",
            minWidth: isEditor ? 220 : "calc(100% - 410px)",
            maxWidth: isEditor ? 220 : "calc(100% - 410px)",
            transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn(
            "flex flex-col shrink-0 min-h-0 border-r border-[var(--line)] overflow-hidden transition-colors duration-300",
            isEditor ? "bg-[#f8f9f7]" : "bg-[#f8faf8] p-4 sm:p-6 lg:p-7"
          )}
        >
          {/* Header in Left Panel: Includes prominent '+ Add Scene' button in Scenes Mode */}
          {isEditor ? (
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--line)] px-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#77817c]">
                Scenes · {sceneList.length * 10} sec
              </span>
              <Button variant="ghost" size="icon" onClick={() => setAddSceneModalOpen(true)} className="size-7" aria-label="Add scene">
                <Plus className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-4 shrink-0">
              <div>
                <h2 className="text-[20px] font-[850] text-[var(--ink)] tracking-tight">
                  Script &amp; Storyboard Scenes
                </h2>
                <p className="text-[12.5px] text-[var(--ink-muted)] mt-0.5">
                  Review and shape the clinical narrative before generating the full visual canvas.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setAddSceneModalOpen(true)}
                size="sm"
                className="bg-white border border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)] hover:bg-[var(--tint)] hover:text-[var(--brand-deep)] font-bold shadow-2xs transition-all gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="size-3.5 text-[var(--brand)]" />
                <span>Add Scene</span>
              </Button>
            </div>
          )}

          {/* List of Scenes: Larger, breathable, with 6-dot drag reordering */}
          <div
            className={cn(
              "flex-1 min-h-0 overflow-y-auto space-y-3",
              isEditor ? "p-2.5" : "p-1 pr-2"
            )}
          >
            {sceneList.map((scene) => {
              const active = scene.id === selectedSceneId;
              const isDragging = scene.id === draggedSceneId;
              const isSceneReady = !isEditor || generatedSceneIds.includes(scene.id);

              return (
                <div
                  key={scene.id}
                  draggable={!isEditor}
                  onDragStart={() => handleDragStart(scene.id)}
                  onDragOver={(e) => handleDragOver(e, scene.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    setSelectedSceneId(scene.id);
                  }}
                  className={cn(
                    "group relative rounded-[16px] border transition-all duration-200 cursor-pointer overflow-hidden",
                    isDragging && "opacity-40 scale-[0.98] border-dashed border-[var(--brand)]",
                    active
                      ? "border-[var(--brand)] bg-white shadow-sm ring-1 ring-[rgb(37_79_63/14%)]"
                      : "border-black/[0.08] bg-white hover:border-[var(--brand)]/60 hover:shadow-xs",
                    isEditor ? "p-2" : "p-4 sm:p-4.5"
                  )}
                >
                  {/* SKELETON LOADER STATE in Editor Mode when scene is still generating (Matching YouTube/card reference) */}
                  {isEditor && !isSceneReady ? (
                    <div className="flex flex-col gap-2 animate-pulse">
                      {/* Gray Thumbnail Placeholder with Shimmer & Badge */}
                      <div className="relative aspect-video w-full rounded-[11px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 overflow-hidden flex flex-col justify-between p-2 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-black/40 text-white text-[8px] font-extrabold px-1.5 py-0.5">
                            Scene {scene.number}
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-orange-500/90 text-white text-[8px] font-black px-2 py-0.5 shadow-xs">
                            <span className="size-1.5 rounded-full bg-white animate-ping" />
                            Rendering...
                          </span>
                        </div>
                        <div className="w-16 h-2 rounded-full bg-black/20 self-start" />
                      </div>

                      {/* Skeleton Text Bars matching user image */}
                      <div className="space-y-1.5 pt-0.5">
                        <div className="h-3 w-3/4 rounded-full bg-gray-200" />
                        <div className="h-2 w-full rounded-full bg-gray-100" />
                        <div className="h-2 w-1/2 rounded-full bg-gray-100" />
                      </div>
                    </div>
                  ) : (
                    /* NORMAL RENDERED SCENE CARD */
                    <div
                      className={cn(
                        "flex items-start transition-all duration-300",
                        isEditor ? "flex-col gap-2" : "flex-row gap-3.5 sm:gap-4.5"
                      )}
                    >
                      {/* 6-Dots Drag Handle & Number Badge (In Scenes wide mode) */}
                      {!isEditor && (
                        <div className="flex items-center gap-2 shrink-0 pt-1">
                          <div
                            className="grid place-items-center text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity"
                            title="Drag to reorder"
                          >
                            <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor">
                              <circle cx="3" cy="3" r="1.5" />
                              <circle cx="9" cy="3" r="1.5" />
                              <circle cx="3" cy="9" r="1.5" />
                              <circle cx="9" cy="9" r="1.5" />
                              <circle cx="3" cy="15" r="1.5" />
                              <circle cx="9" cy="15" r="1.5" />
                            </svg>
                          </div>
                          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0f4f1] text-[12.5px] font-[800] text-[var(--ink)]">
                            {scene.number}
                          </div>
                        </div>
                      )}

                      {/* Shared Green Emerald Video Thumbnail: Bigger & More Prominent in Scenes mode */}
                      <div
                        className={cn(
                          "relative aspect-video shrink-0 overflow-hidden rounded-[11px] bg-[#1a4435] transition-all duration-300 shadow-inner",
                          isEditor ? "w-full" : "w-[175px] sm:w-[195px]"
                        )}
                      >
                        {/* Clinical Green Radial Ambient Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(216,240,93,.28),transparent_35%)]" />
                        
                        {/* Subtitle / Title on Video Thumbnail */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 text-white text-[10px] font-[800] tracking-tight leading-tight line-clamp-1 opacity-90 drop-shadow">
                          {scene.title}
                        </div>

                        {/* Number tag */}
                        <span className="absolute left-2 bottom-2 grid size-5 place-items-center rounded-md bg-black/40 text-[8.5px] font-bold text-white backdrop-blur-xs">
                          {scene.number}
                        </span>

                        {/* Duration tag */}
                        <span className="absolute bottom-2 right-2 rounded bg-black/45 px-1.5 py-0.5 text-[8px] font-bold text-white/95 backdrop-blur-xs">
                          {scene.duration}s
                        </span>

                        {/* Presenter avatar indicator */}
                        {isAvatar && (
                          <div className="absolute bottom-2 left-8.5 size-5 rounded-full border border-white/40 overflow-hidden bg-white/20">
                            <img
                              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=60&q=80"
                              alt="Presenter"
                              className="size-full object-cover"
                            />
                          </div>
                        )}

                        {/* Active Play Icon overlay in Editor mode */}
                        {isEditor && active && (
                          <span className="absolute inset-0 grid place-items-center bg-black/15">
                            <span className="grid size-7 place-items-center rounded-full bg-white/95 text-[var(--brand)] shadow">
                              <Play className="ml-0.5 size-3" fill="currentColor" />
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Meta & Content Area */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        {/* Title & Quick Actions */}
                        <div className="flex items-center justify-between">
                          <span className={cn("block truncate font-[800] text-[var(--ink)]", isEditor ? "text-[9.5px]" : "text-[15px]")}>
                            {scene.title}
                          </span>

                          {/* Actions in Wide Mode */}
                          {!isEditor ? (
                          <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editingSceneId === scene.id) {
                                  // Save script
                                  setSceneList((prev) =>
                                    prev.map((s) => (s.id === scene.id ? { ...s, narration: editingScriptText } : s))
                                  );
                                  setEditingSceneId(null);
                                  setToMessage(`Scene ${scene.number} script saved`);
                                  setTimeout(() => setToMessage(null), 2500);
                                } else {
                                  setEditingSceneId(scene.id);
                                  setEditingScriptText(scene.narration);
                                }
                              }}
                              className={cn(
                                "grid size-7 place-items-center rounded-lg transition-colors cursor-pointer",
                                editingSceneId === scene.id
                                  ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]"
                                  : "text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)]"
                              )}
                              title={editingSceneId === scene.id ? "Save script" : "Edit script text"}
                            >
                              {editingSceneId === scene.id ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editingSceneId === scene.id) {
                                  setEditingSceneId(null);
                                } else {
                                  setSceneList((prev) => prev.filter((s) => s.id !== scene.id));
                                }
                              }}
                              className="grid size-7 place-items-center rounded-lg text-[var(--ink-muted)] hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                              title={editingSceneId === scene.id ? "Cancel editing" : "Remove scene"}
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              scene.evidenceState === "approved"
                                ? "bg-[#4b9a68]"
                                : scene.evidenceState === "changed"
                                ? "bg-[#d29231]"
                                : "bg-[#6488ab]"
                            )}
                          />
                        )}
                      </div>

                      {/* Script Narration Text / In-place Textarea Editor */}
                      <div className="mt-1.5">
                        {!isEditor && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-muted)] block">
                              Script
                            </span>
                            {editingSceneId === scene.id && (
                              <span className="text-[9.5px] font-bold text-[var(--brand)]">
                                Editing in-place · Press Save or checkmark
                              </span>
                            )}
                          </div>
                        )}
                        {editingSceneId === scene.id && !isEditor ? (
                          <div className="mt-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              value={editingScriptText}
                              onChange={(e) => setEditingScriptText(e.target.value)}
                              rows={3}
                              className="focus-ring w-full rounded-xl border border-[var(--brand)] bg-[#fafbf9] p-3 text-[13px] leading-relaxed text-[var(--ink)] shadow-inner outline-none"
                              placeholder="Write or edit narration script..."
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSceneList((prev) =>
                                    prev.map((s) => (s.id === scene.id ? { ...s, narration: editingScriptText } : s))
                                  );
                                  setEditingSceneId(null);
                                  setToMessage(`Scene ${scene.number} script saved`);
                                  setTimeout(() => setToMessage(null), 2500);
                                }}
                                className="rounded-lg bg-[var(--brand)] text-white px-3 py-1 text-[11px] font-bold hover:bg-[var(--brand-deep)] transition cursor-pointer shadow-xs"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSceneId(null)}
                                className="rounded-lg border border-[var(--line)] bg-white text-[var(--ink-muted)] px-3 py-1 text-[11px] font-semibold hover:bg-black/5 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className={cn(
                              "text-[var(--ink-2)] leading-relaxed mt-0.5",
                              isEditor ? "text-[8px] line-clamp-1 text-[var(--ink-muted)]" : "text-[13px] line-clamp-2 font-normal"
                            )}
                          >
                            {scene.narration}
                          </p>
                        )}
                      </div>

                      {/* Source-backed claim pills (Wide mode only) */}
                      {!isEditor && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-3 py-0.5 text-[11px] font-semibold text-emerald-800">
                            <Check className="size-3 text-emerald-600" strokeWidth={3} />
                            <span>{scene.number * 2 + 2} source-backed</span>
                            <span className="opacity-50">·</span>
                            <span className="font-bold">{scene.claim}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

          {/* Bottom Footer Button in Editor View */}
          {isEditor && (
            <button
              onClick={() => setAddSceneModalOpen(true)}
              className="focus-ring m-2.5 flex shrink-0 items-center justify-center gap-2 rounded-[10px] border border-dashed border-[var(--line-strong)] py-2.5 text-[8px] font-bold text-[var(--ink-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] cursor-pointer"
            >
              <Plus className="size-3" /> Add scene
            </button>
          )}
        </aside>

        {/* ── CENTER CANVAS: Smoothly expands when in Editor mode, collapses on return ── */}
        <main
          style={{
            flex: isEditor ? 1 : "0 0 0px",
            width: isEditor ? "auto" : "0px",
            minWidth: 0,
            maxWidth: isEditor ? "100%" : "0px",
            opacity: isEditor ? 1 : 0,
            transform: isEditor ? "scale(1)" : "scale(0.96)",
            transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn(
            "flex flex-col min-h-0 overflow-hidden",
            !isEditor && "pointer-events-none"
          )}
        >
          {/* Top Video Sub-header */}
          <div className="relative flex min-h-0 flex-1 flex-col bg-[#e6e9e6]">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[rgb(202_209_205/70%)] bg-white/45 px-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[8px] font-bold text-[#717b76]">
                <span className="rounded-md bg-white px-2 py-1 shadow-sm">
                  Scene {selectedScene.number} of {scenes.length}
                </span>
                <span>{selectedScene.title}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#717b76]">
                <span className="rounded-md bg-white px-2 py-1 shadow-sm">Fit</span>
                <Button variant="ghost" size="icon" className="size-7" aria-label="Full screen preview">
                  <Expand className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* 16:9 Video Canvas Player / Rendering Loader */}
            <div className="flex min-h-0 flex-1 items-center justify-center p-4 lg:p-7">
              <div className="w-full max-w-[840px] overflow-hidden rounded-[8px] bg-[#173d31] shadow-[0_28px_80px_rgb(24_37_31/22%)] ring-1 ring-black/10 aspect-video flex flex-col justify-center items-center relative">
                {isEditor && !generatedSceneIds.includes(selectedScene.id) ? (
                  /* Live Asynchronous Rendering State Canvas */
                  <div className="size-full flex flex-col items-center justify-center p-8 text-center bg-radial from-[#1e4d3f] to-[#0f2820] text-white relative overflow-hidden animate-pulse">
                    {/* Ambient Glows */}
                    <div className="absolute -top-12 -left-12 size-48 rounded-full bg-[var(--brand)]/20 blur-3xl" />
                    <div className="absolute -bottom-12 -right-12 size-48 rounded-full bg-emerald-400/20 blur-3xl" />

                    <div className="relative z-10 space-y-4 max-w-[420px]">
                      <div className="grid size-14 place-items-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto shadow-lg">
                        <Sparkles className="size-7 text-[var(--brand)] animate-spin duration-3000" />
                      </div>
                      
                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 px-3 py-1 text-[11px] font-extrabold mb-2">
                          <span className="size-2 rounded-full bg-orange-400 animate-ping" />
                          <span>Generating Scene {selectedScene.number} ({selectedQuality.toUpperCase()})</span>
                        </div>
                        <h3 className="text-[17px] font-[850] text-white tracking-tight">
                          {selectedScene.title}
                        </h3>
                        <p className="text-[12px] text-white/70 mt-1 leading-relaxed line-clamp-2">
                          Synthesizing clinical motion, high-clarity anatomical layers &amp; voiceover sync...
                        </p>
                      </div>

                      {/* Simulated Progress Bar */}
                      <div className="w-full space-y-1.5">
                        <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--brand)] rounded-full animate-pulse w-3/5 transition-all duration-500" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-white/50 font-bold">
                          <span>Verified Label Anchors</span>
                          <span>Rendering frame by frame</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Completed Interactive Video Player */
                  <Player
                    component={DermoraComposition}
                    durationInFrames={300}
                    compositionWidth={960}
                    compositionHeight={540}
                    fps={30}
                    controls
                    loop
                    style={{ width: "100%", aspectRatio: "16 / 9" }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Multi-Layer Timeline: Light Clean SwishX Pharma/Office Theme ── */}
          <div className="border-t border-[var(--line)] bg-[#fafbf9] text-[var(--ink)] shrink-0">
            {/* Timeline Header Bar with Toggle */}
            <div className="flex h-9 items-center justify-between px-4 border-b border-[var(--line)] bg-white">
              <div className="flex items-center gap-2.5 text-[11px] font-bold text-[var(--ink)]">
                <Layers className="size-3.5 text-[var(--brand)]" />
                <span>Production Layers</span>
                <span className="rounded-md bg-[#edf1ee] px-2 py-0.5 text-[9.5px] font-semibold text-[#5a6660]">
                  Scene {selectedScene.number} · 14.0s
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

            {/* Collapsible Multi-Track Canvas: Light, Clean & On-Theme */}
            {timelineOpen && (
              <div className="max-h-[225px] overflow-y-auto bg-white select-none flex flex-col text-[11px] border-b border-[var(--line)]">
                {/* ── Ruler / Time Code Header ── */}
                <div className="h-6.5 shrink-0 flex items-center border-b border-[var(--line)] bg-[#f4f6f4] text-[9.5px] text-[var(--ink-muted)] font-medium sticky top-0 z-10">
                  <div className="w-[160px] shrink-0 border-r border-[var(--line)] px-3 font-extrabold uppercase tracking-wider text-[8.5px] text-[var(--ink-muted)]">
                    Scene {selectedScene.number} Layers (6)
                  </div>
                  <div className="flex-1 flex justify-between px-3">
                    <span>0:00</span>
                    <span>0:02</span>
                    <span>0:04</span>
                    <span>0:06</span>
                    <span>0:08</span>
                    <span>0:10</span>
                    <span>0:12</span>
                    <span>0:14</span>
                  </div>
                </div>

                {/* ── Track Rows: Contiguous zero-margin stacked tracks in clean theme ── */}
                <div className="flex flex-col divide-y divide-[var(--line)]">
                  {/* Track 1: Layer 1 - Background Image / Video Canvas (Full 0:00 - 0:14) */}
                  <div className="h-10 shrink-0 flex items-center bg-[#fafbf9]">
                    <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[var(--ink)] font-bold text-[10.5px]">
                      <ImageIcon className="size-3.5 text-emerald-700" />
                      <span className="truncate">1. Image / Video (Bg)</span>
                    </div>
                    <div className="flex-1 h-full relative p-1 bg-[#f4f6f4]/60">
                      <div className="h-full w-full rounded-lg bg-emerald-100/80 border border-emerald-300 flex items-center px-3 text-[10px] font-bold text-emerald-950 truncate shadow-2xs">
                        <span className="truncate">Bg_Clinical_Emerald_Canvas.png [0:00 - 0:14]</span>
                      </div>
                    </div>
                  </div>

                  {/* Track 2: Layer 2 - Overlay Video / 3D MoA Ring Animation (Full 0:00 - 0:14) */}
                  <div className="h-10 shrink-0 flex items-center bg-[#fafbf9]">
                    <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[var(--ink)] font-bold text-[10.5px]">
                      <Film className="size-3.5 text-[var(--brand)]" />
                      <span className="truncate">2. Image / Video (Ring)</span>
                    </div>
                    <div className="flex-1 h-full relative p-1 bg-[#f4f6f4]/60">
                      <div className="h-full w-full rounded-lg bg-[var(--tint)] border border-[var(--brand)]/30 flex items-center overflow-hidden relative shadow-2xs">
                        {/* Video Strip Thumbnails repeated */}
                        <div className="absolute inset-0 flex opacity-20">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="h-full w-16 border-r border-[var(--brand)]/20 bg-[var(--brand)]/10 shrink-0 flex items-center justify-center text-[7.5px] font-bold text-[var(--brand-deep)]">
                              3D Ring {n}
                            </div>
                          ))}
                        </div>
                        <span className="relative z-10 px-3 font-bold text-[10.5px] text-[var(--brand-deep)] truncate drop-shadow-2xs">
                          CLEARSKIN_3D_Orbital_Ring.mp4 [0:00 - 0:14]
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Track 3: Text / Lower Thirds Copy (Variable Span 0:01 - 0:09) */}
                  <div className="h-9 shrink-0 flex items-center bg-[#fafbf9]">
                    <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[var(--ink)] font-bold text-[10.5px]">
                      <TextCursorInput className="size-3.5 text-blue-600" />
                      <span className="truncate">3. Text Copy</span>
                    </div>
                    <div className="flex-1 h-full relative p-1 bg-[#f4f6f4]/60">
                      <div
                        style={{ marginLeft: "7%", width: "60%" }}
                        className="h-full rounded-lg bg-blue-50 border border-blue-200 flex items-center px-3 text-[10px] font-semibold text-blue-900 truncate shadow-2xs"
                      >
                        Title: "A clearer view of the clinical response" [0:01 - 0:09]
                      </div>
                    </div>
                  </div>

                  {/* Track 4: Voice Over Track (0:01 - 0:13) */}
                  <div className="h-9 shrink-0 flex items-center bg-[#fafbf9]">
                    <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[var(--ink)] font-bold text-[10.5px]">
                      <Mic2 className="size-3.5 text-amber-600" />
                      <span className="truncate">4. Voiceover</span>
                    </div>
                    <div className="flex-1 h-full relative p-1 bg-[#f4f6f4]/60">
                      <div
                        style={{ marginLeft: "7%", width: "86%" }}
                        className="h-full rounded-lg bg-amber-50 border border-amber-200 flex items-center px-3 text-[10px] font-semibold text-amber-900 truncate relative overflow-hidden shadow-2xs"
                      >
                        {/* Audio Waveform Effect */}
                        <div className="absolute inset-0 flex items-center justify-around opacity-30">
                          {Array.from({ length: 42 }).map((_, i) => (
                            <div
                              key={i}
                              style={{ height: `${20 + ((i * 17) % 65)}%` }}
                              className="w-0.5 bg-amber-600 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="relative z-10 truncate">
                          Rohan VO · "In the pivotal CLEARSKIN study..." [0:01 - 0:13]
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Track 5: Background Music Bed (Full 0:00 - 0:14) with Waveform */}
                  <div className="h-9 shrink-0 flex items-center bg-[#fafbf9]">
                    <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[var(--ink)] font-bold text-[10.5px]">
                      <Music2 className="size-3.5 text-purple-600" />
                      <span className="truncate">5. Music Bed</span>
                    </div>
                    <div className="flex-1 h-full relative p-1 bg-[#f4f6f4]/60">
                      <div className="h-full w-full rounded-lg bg-purple-50 border border-purple-200 flex items-center px-3 text-[10px] font-semibold text-purple-900 truncate relative overflow-hidden shadow-2xs">
                        {/* Continuous Music Waveform */}
                        <div className="absolute inset-0 flex items-center justify-around opacity-30">
                          {Array.from({ length: 56 }).map((_, i) => (
                            <div
                              key={i}
                              style={{ height: `${15 + ((i * 23) % 75)}%` }}
                              className="w-0.5 bg-purple-600 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="relative z-10 truncate">
                          Calm Clinical Acoustic Bed · -18dB [0:00 - 0:14]
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Track 6: Sound Effects (Sting at 0:04 - 0:06) */}
                  <div className="h-9 shrink-0 flex items-center bg-[#fafbf9]">
                    <div className="w-[160px] shrink-0 h-full flex items-center gap-2 px-3 border-r border-[var(--line)] bg-white text-[var(--ink)] font-bold text-[10.5px]">
                      <Volume2 className="size-3.5 text-emerald-600" />
                      <span className="truncate">6. Sound Effects</span>
                    </div>
                    <div className="flex-1 h-full relative p-1 bg-[#f4f6f4]/60">
                      <div
                        style={{ marginLeft: "28%", width: "15%" }}
                        className="h-full rounded-lg bg-emerald-50 border border-emerald-200 flex items-center px-2.5 text-[10px] font-semibold text-emerald-900 truncate relative overflow-hidden shadow-2xs"
                      >
                        {/* SFX Burst Waveform */}
                        <div className="absolute inset-0 flex items-center justify-around opacity-35">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div
                              key={i}
                              style={{ height: `${30 + ((i * 37) % 70)}%` }}
                              className="w-0.5 bg-emerald-600 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="relative z-10 truncate">Whoosh_SFX [0:04]</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT PANEL: Anchored strictly to the right boundary, only expanding/collapsing from its left edge ── */}
        <aside
          style={{
            width: isEditor ? 320 : 410,
            minWidth: isEditor ? 320 : 410,
            maxWidth: isEditor ? 320 : 410,
            transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="flex flex-col shrink-0 min-h-0 border-l border-[var(--line)] bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.02)] ml-auto"
        >
          {/* Tabs: Apple/Linear-style Segmented Chip Notch Switcher */}
          <div className="p-2.5 border-b border-[var(--line)] bg-[#fafbf9]">
            <div
              className={cn(
                "grid rounded-2xl bg-[#ebefe9] p-1 gap-1 border border-black/[0.03] shadow-inner",
                isEditor ? "grid-cols-3" : "grid-cols-2"
              )}
            >
              <InspectorTabButton
                tab="assistant"
                current={activeTab}
                onClick={setActiveTab}
              >
                Chat
              </InspectorTabButton>
              {isEditor && (
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
              >
                Claims (24)
              </InspectorTabButton>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* ── TAB 1: DIRECT / CHAT (Unified Component Across Both Modes - Always 1st) ── */}
            {activeTab === "assistant" && (
              <div className="flex min-h-full flex-col p-4 space-y-3.5">
                {/* Chat Top Banner */}
                <div className="rounded-xl border border-[var(--brand)]/15 bg-[var(--tint)] p-3">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--brand-deep)]">
                    <Sparkles className="size-3.5 text-[var(--brand)]" />
                    <span>Direct with SwishX</span>
                    <span className="ml-auto rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.2 text-[9px] font-bold">
                      Online
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--brand-deep)]/80">
                    Direct scene pacing, voice styling, or visual emphasis. All instructions remain anchored to verified label claims.
                  </p>
                </div>

                {/* Messages Feed: Clean natural chat bubbles with proper max-width */}
                <div className="flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[380px] pr-1">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex flex-col text-[12px] leading-relaxed transition-all",
                        msg.role === "user" ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-[16px] px-3.5 py-2.5 text-[12px] shadow-2xs",
                          msg.role === "user"
                            ? "bg-[var(--brand)] text-white font-medium max-w-[85%] rounded-br-xs text-left"
                            : "bg-[#f4f7f4] border border-black/[0.06] text-[var(--ink)] max-w-[92%] rounded-bl-xs"
                        )}
                      >
                        {msg.role === "swishx" && (
                          <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--brand)] mb-1">
                            <span className="size-1.5 rounded-full bg-[var(--brand)]" />
                            <span>SwishX Copilot</span>
                          </div>
                        )}
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestion Prompt Chips - ONLY shown when chat has not yet started */}
                {chatMessages.length === 0 && (
                  <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                        Suggested Prompts
                      </span>
                      <span className="text-[9px] text-[var(--ink-muted)]">Click to apply</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        "Add our company values",
                        "Include our clinical trial data",
                        "Make the welcome feel warmer",
                        "Apply brand compliance palette",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setDirectorInput("");
                            setChatMessages((prev) => [...prev, { role: "user", text: suggestion }]);
                            setTimeout(() => {
                              setChatMessages((prev) => [
                                ...prev,
                                {
                                  role: "swishx",
                                  text: `Applied "${suggestion}" across Scene ${selectedScene.number} and verified all 6 source claims.`,
                                },
                              ]);
                            }, 600);
                          }}
                          className="w-full flex items-center justify-between text-left rounded-xl border border-black/[0.06] bg-[#fafbf9] px-3.5 py-2.5 text-[11.5px] font-semibold text-[var(--ink-2)] hover:border-[var(--brand)] hover:bg-[var(--tint)] hover:text-[var(--brand-deep)] transition-all cursor-pointer group"
                        >
                          <span className="truncate">{suggestion}</span>
                          <ChevronRight className="size-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Field */}
                <div className="mt-auto pt-2">
                  <div className="flex items-center gap-2 rounded-2xl border border-black/[0.12] bg-white p-1.5 pl-3.5 focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand-soft)] shadow-xs">
                    <input
                      type="text"
                      value={directorInput}
                      onChange={(e) => setDirectorInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                      placeholder="Ask or direct changes..."
                      className="flex-1 bg-transparent text-[12.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendChat}
                      disabled={!directorInput.trim()}
                      className="grid size-8 place-items-center rounded-xl bg-[var(--brand)] text-white disabled:opacity-30 transition-all hover:bg-[var(--brand-deep)] shadow-xs cursor-pointer"
                    >
                      <Send className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: EDIT (Available in Editor Mode) ── */}
            {isEditor && activeTab === "edit" && (
              <div className="p-4 space-y-4">
                {/* Scene Header Card */}
                <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">
                      Scene {selectedScene.number} · {selectedScene.duration} sec
                    </div>
                    <h2 className="mt-0.5 text-[15px] font-[800] tracking-tight text-[var(--ink)]">
                      {selectedScene.title}
                    </h2>
                  </div>
                  <Button variant="ghost" size="icon" className="size-7">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>

                {/* Narration Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                    <span className="flex items-center gap-1.5">
                      <Mic2 className="size-3.5 text-[var(--brand)]" />
                      Narration &amp; Voiceover
                    </span>
                    <button
                      onClick={() => setActiveTab("assistant")}
                      className="font-bold text-[var(--brand)] hover:underline capitalize"
                    >
                      Rewrite with SwishX
                    </button>
                  </div>
                  <textarea
                    defaultValue={selectedScene.narration}
                    key={`${selectedScene.id}-narration`}
                    rows={4}
                    className="focus-ring w-full resize-none rounded-[12px] border border-[var(--line)] bg-[#fafbf9] p-3 text-[11.5px] leading-relaxed text-[var(--ink)] shadow-2xs"
                  />
                  <div className="flex items-center justify-between text-[9.5px] text-[var(--ink-muted)] px-1">
                    <span>32 words · ~{selectedScene.duration}s</span>
                    <span className="font-semibold text-emerald-700">✓ Grounded</span>
                  </div>
                </div>

                {/* Visual Treatment Section */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                    <LayoutPanelTop className="size-3.5 text-[var(--brand)]" />
                    Visual Direction
                  </div>
                  <textarea
                    defaultValue={selectedScene.visual}
                    key={`${selectedScene.id}-visual`}
                    rows={3}
                    className="focus-ring w-full resize-none rounded-[12px] border border-[var(--line)] bg-[#fafbf9] p-3 text-[11.5px] leading-relaxed text-[var(--ink)] shadow-2xs"
                  />
                  <div className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-white p-2.5 shadow-2xs">
                    <div>
                      <span className="block text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                        Style Preset
                      </span>
                      <span className="text-[11px] font-bold text-[var(--ink)]">
                        Scientific · Measured Clinical Pace
                      </span>
                    </div>
                    <button className="text-[11px] font-bold text-[var(--brand)] hover:underline">
                      Change
                    </button>
                  </div>
                </div>

                {/* On-Screen Text Section */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                    <TextCursorInput className="size-3.5 text-[var(--brand)]" />
                    On-Screen Copy / Overlay
                  </div>
                  <input
                    defaultValue={selectedScene.number === 3 ? "A clearer view of clinical response" : selectedScene.title}
                    key={`${selectedScene.id}-copy`}
                    className="focus-ring h-10 w-full rounded-[12px] border border-[var(--line)] bg-[#fafbf9] px-3 text-[12px] font-medium text-[var(--ink)] shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* ── TAB 3: CLAIMS & EVIDENCE (Unified Component) ── */}
            {activeTab === "evidence" && (
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                      Grounding Library
                    </div>
                    <h2 className="mt-0.5 text-[14px] font-[800] text-[var(--ink)]">24 Dossier Claims</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[9.5px] font-bold">
                    ✓ Verified
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
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
                      <h4 className="text-[12.5px] font-bold text-[var(--ink)]">{c.title}</h4>
                      <p className="text-[10.5px] text-[var(--ink-muted)] leading-relaxed mt-1">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Toast Notification for Added Scenes & Actions ── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[var(--ink)] text-white px-4 py-2 text-[12px] font-bold shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="size-2 rounded-full bg-[var(--brand)] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Modals ── */}
      {generateQualityModalOpen && (
        <GenerateQualityModal
          selectedQuality={selectedQuality}
          onSelectQuality={setSelectedQuality}
          onConfirm={handleConfirmGeneration}
          onClose={() => setGenerateQualityModalOpen(false)}
        />
      )}
      {addSceneModalOpen && (
        <AddSceneModal
          sceneCount={sceneList.length}
          sceneList={sceneList}
          onClose={() => setAddSceneModalOpen(false)}
          onAdd={handleCreateSceneFromModal}
          onDeleteScene={(id) => {
            setSceneList((prev) => prev.filter((s) => s.id !== id).map((s, idx) => ({ ...s, number: idx + 1 })));
            setToMessage("Scene removed");
            setTimeout(() => setToMessage(null), 2500);
          }}
        />
      )}
      {preflightOpen && <PreflightModal onClose={() => setPreflightOpen(false)} />}
      {relatedOpen && <RelatedAssetModal onClose={() => setRelatedOpen(false)} />}
    </div>
  );
}

function InspectorTabButton({
  tab,
  current,
  onClick,
  icon: Icon,
  children,
}: {
  tab: InspectorTab;
  current: InspectorTab;
  onClick: (tab: InspectorTab) => void;
  icon?: typeof Sparkles;
  children: React.ReactNode;
}) {
  const active = tab === current;
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={cn(
        "focus-ring flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[11px] text-[12.5px] transition-all duration-200 cursor-pointer select-none",
        active
          ? "bg-white text-[var(--ink)] font-[800] shadow-[0_2px_6px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]"
          : "text-[#65736c] hover:text-[var(--ink)] hover:bg-white/50 font-semibold"
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      <span>{children}</span>
    </button>
  );
}

function InspectorSection({ icon: Icon, label, children }: { icon: typeof Mic2; label: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-[var(--line)] pt-4">
      <div className="mb-2 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.1em] text-[#717b76]">
        <Icon className="size-3.5" />
        {label}
      </div>
      {children}
    </section>
  );
}

function PreflightModal({ onClose }: { onClose: () => void }) {
  const [addLogo, setAddLogo] = useState(true);
  const [logoPosition, setLogoPosition] = useState<"top-left" | "top-right" | "bottom-left" | "bottom-right">("top-right");
  const [logoOpacity, setLogoOpacity] = useState<number>(90);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/50 p-4 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" aria-label="Review and export">
      <div className="rise-in my-auto w-full max-w-[740px] overflow-hidden rounded-[24px] border border-white/40 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--line)] p-5 sm:p-6 bg-[#fafbf9]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
              <ShieldCheck className="size-3.5" /> Review &amp; Preflight Readiness
            </div>
            <h2 className="mt-1 text-[21px] font-[850] tracking-tight text-[var(--ink)]">
              Export Draft &amp; Compliance Review
            </h2>
            <p className="mt-0.5 text-[12px] text-[var(--ink-muted)]">
              Verify clinical claims, brand kit watermarking, and final video composition.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-full hover:bg-black/5">
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Preflight Stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <PreflightStat icon={BookOpenCheck} value="11/12" label="Evidence linked" tone="success" />
            <PreflightStat icon={CheckCircle2} value="Passed" label="Brand system" tone="success" />
            <PreflightStat icon={AlertTriangle} value="1 change" label="Needs review" tone="warning" />
          </div>

          {/* Dosing Note Warning */}
          <div className="rounded-[16px] border border-[#edd5aa] bg-[var(--warning-soft)] p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-white/80 text-[var(--warning)] shadow-2xs">
                <AlertTriangle className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-[var(--warning)]">Scene 4 dosing wording changed</div>
                <p className="mt-1 text-[11px] leading-relaxed text-[#7a5b28]">
                  The clinical meaning is consistent, but sentence phrasing varies from source §4.2. Restore approved wording or keep and flag for reviewer judgment.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" size="sm" className="bg-white text-[11px] font-bold shadow-2xs">
                    Restore approved wording
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[11px] text-[#7a5b28] hover:bg-black/5">
                    Keep and flag
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Company Logo / Watermark Overlay Configuration ── */}
          <div className="rounded-2xl border border-[var(--line)] bg-[#fafbf9] p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-[var(--brand)] text-white">
                  <Package className="size-4" />
                </span>
                <div>
                  <h4 className="text-[13.5px] font-[850] text-[var(--ink)]">Add Company Logo Overlay</h4>
                  <p className="text-[11px] text-[var(--ink-muted)]">
                    Embed approved high-res brand watermark across generated video scenes
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={addLogo}
                onClick={() => setAddLogo(!addLogo)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  addLogo ? "bg-[var(--brand)]" : "bg-gray-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    addLogo ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {addLogo && (
              <div className="pt-3 border-t border-black/[0.06] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Position Selector Quadrant (7 cols) */}
                  <div className="sm:col-span-7 space-y-2">
                    <label className="block text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                      Logo Placement Position
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "top-left", label: "Top Left" },
                        { id: "top-right", label: "Top Right" },
                        { id: "bottom-left", label: "Bottom Left" },
                        { id: "bottom-right", label: "Bottom Right" },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setLogoPosition(pos.id as any)}
                          className={cn(
                            "flex items-center justify-between rounded-xl border p-2.5 text-[12px] font-bold transition-all cursor-pointer",
                            logoPosition === pos.id
                              ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] ring-1 ring-[var(--brand)] shadow-xs"
                              : "border-[var(--line)] bg-white text-[var(--ink-2)] hover:bg-[#fafbf9]"
                          )}
                        >
                          <span>{pos.label}</span>
                          {logoPosition === pos.id && <Check className="size-3.5 text-[var(--brand)]" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Preview Canvas Mini Box (5 cols) */}
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div className="relative aspect-video w-full rounded-xl bg-[#173d31] border border-white/20 shadow-inner overflow-hidden p-2 flex flex-col justify-between">
                      {/* Interactive Visual Marker in Target Quadrant */}
                      <div className="flex justify-between items-start">
                        <div className={cn("size-6 rounded bg-white/20 border border-white/40 flex items-center justify-center text-[7.5px] font-extrabold text-white transition-opacity", logoPosition === "top-left" ? "opacity-100 bg-[var(--brand)] border-white ring-2 ring-[var(--brand)]" : "opacity-20")}>
                          LOGO
                        </div>
                        <div className={cn("size-6 rounded bg-white/20 border border-white/40 flex items-center justify-center text-[7.5px] font-extrabold text-white transition-opacity", logoPosition === "top-right" ? "opacity-100 bg-[var(--brand)] border-white ring-2 ring-[var(--brand)]" : "opacity-20")}>
                          LOGO
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className={cn("size-6 rounded bg-white/20 border border-white/40 flex items-center justify-center text-[7.5px] font-extrabold text-white transition-opacity", logoPosition === "bottom-left" ? "opacity-100 bg-[var(--brand)] border-white ring-2 ring-[var(--brand)]" : "opacity-20")}>
                          LOGO
                        </div>
                        <div className={cn("size-6 rounded bg-white/20 border border-white/40 flex items-center justify-center text-[7.5px] font-extrabold text-white transition-opacity", logoPosition === "bottom-right" ? "opacity-100 bg-[var(--brand)] border-white ring-2 ring-[var(--brand)]" : "opacity-20")}>
                          LOGO
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--ink-muted)] mt-1 font-semibold">
                      Preview: Anchored to {logoPosition.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--line)] bg-[#f8faf8] p-5 sm:flex sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
            <FileCheck2 className="size-4 text-[var(--brand)]" />
            <span>Review package includes storyboard timestamps, logo layer &amp; source anchors.</span>
          </div>
          <div className="mt-4 flex gap-2 sm:mt-0">
            <Button variant="secondary" onClick={onClose} className="font-bold">
              <Download className="size-3.5 mr-1" /> Export draft
            </Button>
            <Button className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold px-5">
              <Send className="size-3.5 mr-1" /> Send for review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreflightStat({ icon: Icon, value, label, tone }: { icon: typeof CheckCircle2; value: string; label: string; tone: "success" | "warning" }) {
  return (
    <div className="rounded-[13px] border border-[var(--line)] p-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", tone === "success" ? "text-[#3f815a]" : "text-[var(--warning)]")} />
        <span className="text-[12px] font-bold">{value}</span>
      </div>
      <div className="mt-1 text-[8px] font-semibold text-[var(--ink-muted)]">{label}</div>
    </div>
  );
}

function RelatedAssetModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState("carousel");
  const assets = [
    { id: "carousel", label: "6-page carousel", detail: "Reuse the evidence-led visual system", icon: LayoutPanelTop },
    { id: "cutdown", label: "15-second cutdown", detail: "Keep the pivotal evidence and close", icon: Film },
    { id: "visual", label: "Congress visual", detail: "Turn the evidence scene into a static", icon: ScanLine },
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Create related asset">
      <div className="rise-in w-full max-w-[610px] overflow-hidden rounded-[22px] bg-white shadow-[var(--shadow-lg)]">
        <div className="flex items-start justify-between border-b border-[var(--line)] p-5">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
              Reuse this content
            </div>
            <h2 className="mt-2 text-[21px] font-[750] tracking-[-0.035em]">Create a related asset</h2>
            <p className="mt-1 text-[9px] text-[var(--ink-muted)]">
              Brief, sources, evidence, and visual decisions stay connected.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="space-y-2 p-5">
          {assets.map(({ id, label, detail, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={cn(
                "focus-ring flex w-full items-center gap-3 rounded-[13px] border p-3 text-left",
                selected === id ? "border-[var(--brand)] bg-[var(--brand-soft)] ring-1 ring-[var(--brand)]" : "border-[var(--line)] hover:bg-[#fafbf9]"
              )}
            >
              <span className="grid size-10 place-items-center rounded-[11px] bg-white text-[var(--brand)] shadow-sm">
                <Icon className="size-4" />
              </span>
              <span className="flex-1">
                <span className="block text-[10px] font-bold">{label}</span>
                <span className="mt-1 block text-[8px] text-[var(--ink-muted)]">{detail}</span>
              </span>
              {selected === id && (
                <span className="grid size-5 place-items-center rounded-full bg-[var(--brand)] text-white">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="border-t border-[var(--line)] bg-[#f8faf8] p-5">
          <Button className="w-full">
            <Sparkles className="size-3.5" /> Create related draft
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddSceneModal({
  sceneCount,
  sceneList,
  onClose,
  onAdd,
  onDeleteScene,
}: {
  sceneCount: number;
  sceneList: Array<{ id: string; number: number; title: string; narration: string }>;
  onClose: () => void;
  onAdd: (data: {
    insertPosition: number;
    title: string;
    script: string;
    visualText: string;
    negativeVisual: string;
    category: "normal" | "intro" | "outro" | "product";
    outroDetails?: {
      bgType: string;
      bgColor: string;
      logoText: string;
      disclaimer: string;
      contact: string;
    };
    attachments?: string[];
  }) => void;
  onDeleteScene?: (id: string) => void;
}) {
  const [category, setCategory] = useState<"normal" | "intro" | "outro" | "product">("normal");
  const [position, setPosition] = useState<number>(sceneCount + 1);
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [visualText, setVisualText] = useState("");
  const [negativeVisual, setNegativeVisual] = useState("");

  // Detect existing Intro / Outro scenes
  const existingIntroScene = sceneList.find(
    (s) => s.number === 1 || s.title.toLowerCase().includes("intro") || s.title.toLowerCase().includes("opening")
  );
  const existingOutroScene = sceneList.find(
    (s) => s.number === sceneList.length || s.title.toLowerCase().includes("outro") || s.title.toLowerCase().includes("close")
  );

  // Outro & Intro specific controls (Matching reference image)
  const [outroBgType, setOutroBgType] = useState<"solid" | "image">("solid");
  const [outroBgColor, setOutroBgColor] = useState("#0b1928");
  const [outroLogoText, setOutroLogoText] = useState("Cipla");
  const [outroDisclaimer, setOutroDisclaimer] = useState(
    "This video is created using AI-powered technology by SwishX for informational and educational purposes only. It is not intended as medical advice, diagnosis, or treatment recommendation."
  );
  const [outroContact, setOutroContact] = useState("For queries, write to enterprise@swishx.com");
  const [clipMode, setClipMode] = useState<"clip" | "custom">("custom");

  // Product media attachments
  const [productAttachments, setProductAttachments] = useState<string[]>([
    "Dermora_Pen_Device_3D.png",
    "Clinical_Dosing_Card_v2.mp4",
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      insertPosition: position,
      title: title.trim(),
      script: script.trim(),
      visualText: visualText.trim(),
      negativeVisual: negativeVisual.trim(),
      category,
      outroDetails:
        category === "outro" || category === "intro"
          ? {
              bgType: outroBgType,
              bgColor: outroBgColor,
              logoText: outroLogoText,
              disclaimer: outroDisclaimer,
              contact: outroContact,
            }
          : undefined,
      attachments: category === "product" ? productAttachments : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/50 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Add Scene"
    >
      <div className="rise-in my-auto w-full max-w-[820px] overflow-hidden rounded-[24px] border border-white/50 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4.5 bg-[#fafbf9]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">
              <Plus className="size-3.5" /> Storyboard Pipeline
            </div>
            <h2 className="mt-0.5 text-[20px] font-[850] tracking-tight text-[var(--ink)]">Add New Scene</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-full hover:bg-black/5">
            <X className="size-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── Category Chips ── */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2.5">
              Scene Category
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "normal", label: "Normal Scene", desc: "Core clinical narration & visual" },
                { id: "intro", label: "Intro Hook", desc: "Opening title or branded clip" },
                { id: "outro", label: "Outro Card", desc: "Logo, disclaimer & fair balance" },
                { id: "product", label: "Product & MoA", desc: "Device, packaging & 3D assets" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as any)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-left transition-all cursor-pointer",
                    category === c.id
                      ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] ring-1 ring-[var(--brand)] font-bold"
                      : "border-[var(--line)] bg-white text-[var(--ink-2)] hover:bg-[#fafbf9] font-medium"
                  )}
                >
                  <span className={cn("size-2 rounded-full", category === c.id ? "bg-[var(--brand)]" : "bg-black/20")} />
                  <span className="text-[12px]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Position Selection with Explanation ── */}
          <div className="rounded-2xl border border-[var(--line)] bg-[#f8faf8] p-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[12px] font-bold text-[var(--ink)]">
                Insert Scene at Position
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-[var(--line)] rounded-xl p-1 shadow-2xs">
                {Array.from({ length: sceneCount + 1 }).map((_, idx) => {
                  const pos = idx + 1;
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPosition(pos)}
                      className={cn(
                        "grid size-8 place-items-center rounded-lg text-[12px] font-extrabold transition-all cursor-pointer",
                        position === pos
                          ? "bg-[var(--brand)] text-white shadow-xs"
                          : "text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)]"
                      )}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-[var(--ink-muted)] leading-relaxed">
              Inserting at <strong className="text-[var(--ink)]">Position {position}</strong> will place this new scene as Scene {position}, and smoothly shift the current Scene {position} and subsequent scenes down by one.
            </p>
          </div>

          {/* ── CATEGORY 1 & 2: INTRO / OUTRO SPECIAL CARD DESIGNER ── */}
          {(category === "outro" || category === "intro") && (
            <div className="space-y-4 rounded-2xl border border-[var(--brand)]/20 bg-[#fafbf9] p-4.5">
              {/* Duplicate Intro/Outro Warning & Delete Action */}
              {category === "intro" && existingIntroScene && (
                <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 p-3 text-[12px] text-amber-900 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                    <span>
                      An <strong>Intro scene</strong> already exists (<strong>Scene {existingIntroScene.number}: {existingIntroScene.title}</strong>).
                    </span>
                  </div>
                  {onDeleteScene && (
                    <button
                      type="button"
                      onClick={() => onDeleteScene(existingIntroScene.id)}
                      className="flex items-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs cursor-pointer transition shrink-0 ml-2"
                    >
                      <Trash2 className="size-3" /> Delete Current Intro
                    </button>
                  )}
                </div>
              )}

              {category === "outro" && existingOutroScene && (
                <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 p-3 text-[12px] text-amber-900 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                    <span>
                      An <strong>Outro scene</strong> already exists (<strong>Scene {existingOutroScene.number}: {existingOutroScene.title}</strong>).
                    </span>
                  </div>
                  {onDeleteScene && (
                    <button
                      type="button"
                      onClick={() => onDeleteScene(existingOutroScene.id)}
                      className="flex items-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs cursor-pointer transition shrink-0 ml-2"
                    >
                      <Trash2 className="size-3" /> Delete Current Outro
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-lg bg-[var(--brand)] text-white">
                    <Sparkles className="size-3.5" />
                  </span>
                  <span className="text-[13px] font-[800] text-[var(--ink)]">
                    {category === "outro" ? "OUTRO CARD STUDIO" : "INTRO HOOK STUDIO"}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white border border-[var(--line)] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setClipMode("custom")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10.5px] font-bold transition",
                      clipMode === "custom" ? "bg-[var(--brand)] text-white" : "text-[var(--ink-muted)]"
                    )}
                  >
                    Custom Layout
                  </button>
                  <button
                    type="button"
                    onClick={() => setClipMode("clip")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10.5px] font-bold transition",
                      clipMode === "clip" ? "bg-[var(--brand)] text-white" : "text-[var(--ink-muted)]"
                    )}
                  >
                    Direct Clip Upload
                  </button>
                </div>
              </div>

              {clipMode === "clip" ? (
                <div className="border-2 border-dashed border-[var(--brand)]/30 bg-white rounded-2xl p-6 text-center space-y-2">
                  <Upload className="size-8 text-[var(--brand)] mx-auto opacity-80" />
                  <div className="text-[13px] font-bold text-[var(--ink)]">
                    Upload pre-rendered {category === "intro" ? "Intro" : "Outro"} video clip
                  </div>
                  <p className="text-[11px] text-[var(--ink-muted)]">
                    MP4, MOV up to 4K 60fps · Automatically trimmed to storyboard tempo
                  </p>
                  <Button type="button" size="sm" variant="secondary" className="mt-2">
                    Browse File
                  </Button>
                </div>
              ) : (
                /* Interactive Outro Editor matching user screenshot */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                  {/* Outro Preview Canvas (4 cols) */}
                  <div className="md:col-span-5 flex justify-center">
                    <div
                      style={{ backgroundColor: outroBgColor }}
                      className="w-[200px] h-[310px] rounded-2xl p-4 text-white flex flex-col justify-between items-center text-center shadow-lg border border-white/20 relative overflow-hidden"
                    >
                      <div className="my-auto">
                        <div className="text-[20px] font-black tracking-tight text-blue-300 drop-shadow">
                          {outroLogoText || "Brand Logo"}
                        </div>
                      </div>
                      <div className="space-y-2 mt-auto">
                        <p className="text-[7.5px] text-white/70 leading-tight">
                          {outroDisclaimer}
                        </p>
                        <p className="text-[7.5px] font-bold text-orange-400">
                          {outroContact}
                        </p>
                        <span className="text-[6px] text-white/40 block">© SwishX</span>
                      </div>
                    </div>
                  </div>

                  {/* Outro Controls (7 cols) */}
                  <div className="md:col-span-7 space-y-3.5">
                    {/* Background matching clean reference image */}
                    <div>
                      <span className="block text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-muted)] mb-1.5">
                        Background
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOutroBgType("solid")}
                          className={cn(
                            "rounded-xl px-3 py-1.5 text-[11.5px] font-bold border transition",
                            outroBgType === "solid" ? "border-orange-500 text-orange-600 bg-orange-50/50" : "border-[var(--line)] bg-white"
                          )}
                        >
                          Solid
                        </button>
                        <div className="flex items-center gap-1.5 border border-[var(--line)] rounded-xl p-1 bg-white">
                          {["#0b1928", "#173d31", "#1e1e24", "#301934"].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setOutroBgType("solid");
                                setOutroBgColor(color);
                              }}
                              style={{ backgroundColor: color }}
                              className={cn(
                                "size-6 rounded-lg border-2 transition-all",
                                outroBgColor === color ? "border-[var(--brand)] scale-110" : "border-transparent"
                              )}
                            />
                          ))}
                        </div>
                        <label className="rounded-xl border border-[var(--line)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--ink-2)] hover:bg-[#fafbf9] cursor-pointer">
                          <span>Upload image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={() => setOutroBgType("image")}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Background Music for Intro/Outro */}
                    <div>
                      <span className="block text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-muted)] mb-1.5">
                        Background Music / Audio Hook
                      </span>
                      <div className="flex items-center gap-2">
                        <select className="focus-ring rounded-xl border border-[var(--line)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--ink)] flex-1 shadow-2xs">
                          <option value="calm">Calm Clinical Ambient</option>
                          <option value="warm">Warm Reassuring Strings</option>
                          <option value="uplifting">Modern Brand Chime</option>
                          <option value="none">No Audio / Silent</option>
                        </select>
                        <label className="rounded-xl border border-[var(--line)] bg-white px-3 py-1.5 text-[11.5px] font-bold text-[var(--brand)] hover:bg-[var(--tint)] transition cursor-pointer shrink-0">
                          <span>+ Upload Custom Audio</span>
                          <input type="file" accept="audio/*" className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Layers */}
                    <div>
                      <span className="block text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-muted)] mb-1.5">
                        Overlay Layers
                      </span>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-lg bg-white border border-[var(--line)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--ink)]">
                          + T Text
                        </span>
                        <span className="rounded-lg bg-white border border-[var(--line)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--ink)]">
                          + 📷 Logo
                        </span>
                        <span className="rounded-lg bg-white border border-[var(--line)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--ink)]">
                          + 🖼 Image
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={outroLogoText}
                          onChange={(e) => setOutroLogoText(e.target.value)}
                          placeholder="Logo / Brand Text"
                          className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white p-2 text-[11.5px] font-medium"
                        />
                        <input
                          type="text"
                          value={outroDisclaimer}
                          onChange={(e) => setOutroDisclaimer(e.target.value)}
                          placeholder="Disclaimer Statement"
                          className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white p-2 text-[11.5px] font-medium truncate"
                        />
                        <input
                          type="text"
                          value={outroContact}
                          onChange={(e) => setOutroContact(e.target.value)}
                          placeholder="Contact Info"
                          className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white p-2 text-[11.5px] font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CATEGORY 3: PRODUCT & MOA ATTACHMENTS ── */}
          {category === "product" && (
            <div className="rounded-2xl border border-[var(--brand)]/20 bg-[#fafbf9] p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-[800] text-[var(--ink)]">
                  Product Assets &amp; Video References
                </span>
                <span className="text-[10px] font-bold text-[var(--brand)] bg-[var(--tint)] px-2 py-0.5 rounded-md">
                  Multiple uploads allowed
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {productAttachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-white p-2.5 text-[11.5px] font-medium">
                    <span className="truncate flex items-center gap-1.5">
                      <Package className="size-3.5 text-[var(--brand)]" />
                      {att}
                    </span>
                    <button
                      type="button"
                      onClick={() => setProductAttachments((p) => p.filter((_, idx) => idx !== i))}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setProductAttachments((p) => [
                      ...p,
                      `Packaging_Asset_${p.length + 1}.png`,
                    ])
                  }
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--brand)] bg-white p-2.5 text-[11.5px] font-bold text-[var(--brand)] hover:bg-[var(--tint)] transition cursor-pointer"
                >
                  <Plus className="size-3.5" /> Add Product Asset
                </button>
              </div>
            </div>
          )}

          {/* ── Script & Visual Prompt Inputs: SHOWN FOR NORMAL & PRODUCT SCENES ── */}
          {(category === "normal" || category === "product") && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-1.5">
                  {category === "product" ? "Product Shot Title / Heading" : "Scene Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    category === "product"
                      ? "e.g. Autoinjector Ergonomics & Dose Delivery Close-up"
                      : "e.g. Mechanism of Action: Selective Inhibition"
                  }
                  className="focus-ring w-full rounded-xl border border-[var(--line)] bg-[#fafbf9] px-3.5 py-2.5 text-[13px] font-bold text-[var(--ink)] shadow-2xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                    Script Narration (Voiceover)
                  </label>
                  <span className="text-[10px] text-[var(--ink-muted)]">Target ~10-15 seconds</span>
                </div>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={3}
                  placeholder={
                    category === "product"
                      ? "Describe the narration accompanying this product shot (e.g. Engineered with ergonomic grip for seamless weekly administration...)"
                      : "Enter the exact narration text for this clinical scene..."
                  }
                  className="focus-ring w-full rounded-xl border border-[var(--line)] bg-[#fafbf9] p-3 text-[12.5px] leading-relaxed text-[var(--ink)] shadow-2xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-1.5">
                    Visual Direction / Visual Prompt
                  </label>
                  <textarea
                    value={visualText}
                    onChange={(e) => setVisualText(e.target.value)}
                    rows={2.5}
                    placeholder={
                      category === "product"
                        ? "Macro 3D camera pan around the pen needle safety cap, clinical lighting, focus on dosage window..."
                        : "3D rendering of skin epidermal layer, smooth transition to molecular pathway..."
                    }
                    className="focus-ring w-full rounded-xl border border-[var(--line)] bg-[#fafbf9] p-3 text-[12px] text-[var(--ink)] shadow-2xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-1.5">
                    Negative Visual Prompt
                  </label>
                  <textarea
                    value={negativeVisual}
                    onChange={(e) => setNegativeVisual(e.target.value)}
                    rows={2.5}
                    placeholder="No aggressive flashing, avoid unverified competitor comparisons, no low-res renders..."
                    className="focus-ring w-full rounded-xl border border-[var(--line)] bg-[#fafbf9] p-3 text-[12px] text-[var(--ink)] shadow-2xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold px-5">
              <Plus className="size-3.5 mr-1" />
              Add Scene to Position {position}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenerateQualityModal({
  selectedQuality,
  onSelectQuality,
  onConfirm,
  onClose,
}: {
  selectedQuality: "hd" | "cinematic";
  onSelectQuality: (q: "hd" | "cinematic") => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Select Video Generation Quality"
    >
      <div className="rise-in w-full max-w-[620px] overflow-hidden rounded-[24px] border border-white/50 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4.5 bg-[#fafbf9]">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">
              <Sparkles className="size-3.5" /> Generation Engine
            </div>
            <h2 className="mt-0.5 text-[20px] font-[850] tracking-tight text-[var(--ink)]">
              Select Output Quality
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-full hover:bg-black/5">
            <X className="size-4" />
          </Button>
        </div>

        {/* Quality Cards Grid matching user screenshot */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* HD Card */}
            <button
              type="button"
              onClick={() => onSelectQuality("hd")}
              className={cn(
                "flex flex-col items-center justify-between rounded-[20px] border-2 p-6 text-center transition-all cursor-pointer",
                selectedQuality === "hd"
                  ? "border-orange-500 bg-white ring-4 ring-orange-500/10 shadow-sm"
                  : "border-[var(--line)] bg-[#fafbf9] hover:border-black/20 hover:bg-white"
              )}
            >
              <div className="space-y-2">
                <h3 className="text-[22px] font-[850] text-[var(--ink)]">HD</h3>
                <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed px-2">
                  Lifelike motion that stops the scroll — for launches &amp; big moments.
                </p>
              </div>

              <div className="mt-6 space-y-2.5 w-full">
                <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11.5px] font-extrabold text-orange-600">
                  ⚡ 2,500 credits
                </span>
                <div className="text-[11.5px] text-[var(--ink-muted)] font-medium flex items-center justify-center gap-1">
                  <span>⏱</span> 7–9 min
                </div>
              </div>
            </button>

            {/* Cinematic Card */}
            <button
              type="button"
              onClick={() => onSelectQuality("cinematic")}
              className={cn(
                "flex flex-col items-center justify-between rounded-[20px] border-2 p-6 text-center transition-all cursor-pointer",
                selectedQuality === "cinematic"
                  ? "border-orange-500 bg-white ring-4 ring-orange-500/10 shadow-sm"
                  : "border-[var(--line)] bg-[#fafbf9] hover:border-black/20 hover:bg-white"
              )}
            >
              <div className="space-y-2">
                <h3 className="text-[22px] font-[850] text-[var(--ink)]">Cinematic</h3>
                <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed px-2">
                  Ultra-realistic, fully generated scenes — for flagship launches.
                </p>
              </div>

              <div className="mt-6 space-y-2.5 w-full">
                <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11.5px] font-extrabold text-orange-600">
                  ⚡ 7,500 credits
                </span>
                <div className="text-[11.5px] text-[var(--ink-muted)] font-medium flex items-center justify-center gap-1">
                  <span>⏱</span> 12–14 min
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
            <div className="text-[11px] text-[var(--ink-muted)]">
              Generation will render in the canvas editor.
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold px-5 cursor-pointer shadow-xs"
              >
                <Sparkles className="size-3.5 mr-1.5" />
                Generate ({selectedQuality === "hd" ? "2,500 credits" : "7,500 credits"})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


