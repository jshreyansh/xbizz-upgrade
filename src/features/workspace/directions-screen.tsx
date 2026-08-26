"use client";

import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Film,
  Globe2,
  Home,
  Info,
  Layers,
  Mic2,
  Music2,
  MonitorPlay,
  PackageCheck,
  Paperclip,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  Clock3,
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AudienceIcon } from "@/components/ui/select-icons";
import { deriveContentPlan } from "@/features/workspace/content-plan";
import { planningSources } from "@/features/workspace/mock-data";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";
import type { AssetType, Audience, PresentationMode } from "@/types/content";

type PlanSectionId = "audience-goal" | "topics" | "format" | "voice" | "presenter" | "product-assets" | "story";

const audienceOptions: Audience[] = ["HCP", "Patient", "Payer", "Field team", "Consumer"];
const topicOptions = [
  "Product Introduction",
  "Mechanism of Action",
  "Indications",
  "Dosage & Safety",
  "Drug Interactions",
  "Side Effects",
];

const presenters = [
  { name: "Dr. Maya Kapoor", role: "Dermatologist · warm, reassuring", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Rohan Mehta", role: "Physician · clear, authoritative", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Aisha Shah", role: "Medical presenter · calm, precise", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Daniel Lee", role: "Physician · conversational", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Elena Rostova", role: "Oncology specialist · measured", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Marcus Thorne", role: "Cardiology lead · authoritative", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=160&q=80" },
];

const voiceList = [
  { name: "Rohan", role: "clear and measured", accent: "Indian / US English", tag: "Authoritative" },
  { name: "Riya", role: "friendly and clear", accent: "Neutral English", tag: "Warm & Caring" },
  { name: "Dev", role: "warm and conversational", accent: "US English", tag: "Conversational" },
  { name: "Sarah", role: "clinical and precise", accent: "British English", tag: "Clinical Lead" },
  { name: "Marcus", role: "deep and trustworthy", accent: "North American", tag: "Physician" },
  { name: "Elena", role: "calm and scientific", accent: "International", tag: "Research" },
];

export function DirectionsScreen({ embedded = false }: { embedded?: boolean }) {
  const {
    assetType,
    brief,
    audience,
    market,
    intendedUse,
    format,
    duration,
    language,
    presentationMode,
    voice,
    music,
    selectedSourceIds,
    creationMode,
    sourceType,
    sourcePayload,
    setAudience,
    setMarket,
    setFormat,
    setDuration,
    setLanguage,
    setPresentationMode,
    setVoice,
    setMusic,
    toggleSource,
    setView,
    setVideoSubStage,
    goal: storeGoal,
    topics: storeTopics,
    setGoal: setStoreGoal,
    setTopics: setStoreTopics,
  } = useWorkspaceStore();

  const dossierNames: Record<string, string> = {
    velmora: "Velmora",
    onkavia: "Onkavia",
    nirvexa: "Nirvexa",
    cardioxa: "Cardioxa",
    pulmovax: "PulmoVax",
  };

  const brandName = dossierNames[sourcePayload.dossierId || "velmora"] || "Velmora";
  const projectName = `${brandName} HCP launch`;

  const derivedPlan = useMemo(
    () =>
      deriveContentPlan({
        assetType,
        brief,
        audience,
        market,
        intendedUse,
        selectedSourceIds,
        creationMode,
        sourceType,
        sourcePayload,
      }),
    [assetType, audience, brief, intendedUse, market, selectedSourceIds, creationMode, sourceType, sourcePayload]
  );

  const isMagicAvatar = creationMode === "magic-avatar";
  const [goal, setGoal] = useState<string>(storeGoal || derivedPlan.goal || "New Launch");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    storeTopics && storeTopics.length > 0 ? storeTopics : derivedPlan.topics.length > 0 ? derivedPlan.topics : ["Product Introduction", "Mechanism of Action"]
  );
  const [presenter, setPresenter] = useState(
    isMagicAvatar ? "Dr. Maya Kapoor" : (presentationMode === "presenter" ? "Dr. Maya Kapoor" : "")
  );

  // Dynamic Product Media Assets
  const [productMediaList, setProductMediaList] = useState<
    Array<{ id: string; name: string; type: "image" | "video"; preview: string; size: string }>
  >([]);

  // Accordion active open section
  const [openSection, setOpenSection] = useState<PlanSectionId | null>("audience-goal");
  const [presenterLibraryOpen, setPresenterLibraryOpen] = useState(false);
  const [voiceLibraryOpen, setVoiceLibraryOpen] = useState(false);
  const [previewingAudio, setPreviewingAudio] = useState<string | null>(null);

  // ── Generation Loading State on Right Panel ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // ── Chat State in Right Panel ──
  const [chatInput, setChatInput] = useState("");
  const [chatContextOpen, setChatContextOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "swishx"; text: string }>>(() => [
    {
      role: "user",
      text: brief || `Create a concise ${brandName} HCP launch video explaining clinical need, mechanism, and pivotal risk reduction.`,
    },
    {
      role: "swishx",
      text: `I've structured a 5-scene video plan grounded in the **${brandName}** dossier and approved claims. You can review the parameters on the left canvas, or chat with me to make any adjustments.`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isGenerating]);

  const toggleSection = (section: PlanSectionId) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((current) => {
      const next = current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic];
      setStoreTopics(next);
      return next;
    });
  };

  const previewAudio = (kind: "voice" | "music", label: string) => {
    stopAudioPreview();
    if (previewingAudio === label) {
      setPreviewingAudio(null);
      return;
    }
    setPreviewingAudio(label);
    if (kind === "voice" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${brandName} brings approved evidence into a clear clinical story.`);
      utterance.rate = label.includes("Riya") || label.includes("Maya") ? 0.95 : 0.9;
      utterance.pitch = label.includes("Riya") || label.includes("Maya") ? 1.05 : 0.95;
      utterance.onend = () => setPreviewingAudio(null);
      window.speechSynthesis.speak(utterance);
    } else {
      playMusicTone(label);
      window.setTimeout(() => setPreviewingAudio(null), 2200);
    }
  };

  const handleBackToBrief = () => {
    setVideoSubStage("intake");
    setView("create");
  };

  const handleGoHome = () => {
    setView("home");
  };

  // ── Trigger Plan Confirmation & Right Panel Loading Sequence ──
  const handleConfirmPlan = () => {
    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => {
      setGenerationStep(2);
    }, 600);

    setTimeout(() => {
      setGenerationStep(3);
    }, 1200);

    setTimeout(() => {
      // Transition smoothly into Studio Screen
      setVideoSubStage("studio");
      setView("studio");
    }, 1800);
  };

  // ── Handle Chat Interaction ──
  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInput.trim();
    if (!text) return;

    const newMessages = [...chatMessages, { role: "user" as const, text }];
    setChatMessages(newMessages);
    if (!textToSend) setChatInput("");

    // Simulate smart contextual assistant reply
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Understood. I have verified this against the ${brandName} dossier and adjusted the plan canvas accordingly.`;

      if (lower.includes("portrait") || lower.includes("9:16")) {
        setFormat("9:16");
        reply = `Updated the output frame to **9:16 Portrait**. Ideal for mobile HCP engagement and congress stories.`;
      } else if (lower.includes("landscape") || lower.includes("16:9")) {
        setFormat("16:9");
        reply = `Updated the output frame to **16:9 Landscape**. Standard for desktop presentations and Veeva detailing.`;
      } else if (lower.includes("presenter") || lower.includes("doctor") || lower.includes("avatar")) {
        setPresenter("Dr. Maya Kapoor");
        setPresentationMode("presenter");
        reply = `Assigned **Dr. Maya Kapoor** (Dermatology Specialist) as the clinical presenter on the plan canvas.`;
      } else if (lower.includes("45") || lower.includes("shorten")) {
        setDuration("45 sec");
        reply = `Adjusted target length to **45 seconds** (compact 4-scene narrative).`;
      } else if (lower.includes("moa") || lower.includes("mechanism")) {
        if (!selectedTopics.includes("Mechanism of Action")) {
          toggleTopic("Mechanism of Action");
        }
        reply = `Elevated **Mechanism of Action** with dual-inhibition 3D visual cues in Scene 2.`;
      }

      setChatMessages((prev) => [...prev, { role: "swishx", text: reply }]);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8f6] h-screen overflow-hidden">
      {/* ── Persistent Minimal Top Bar ── */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-black/[0.06] bg-white/80 backdrop-blur-sm shrink-0 z-10">
        <button
          type="button"
          onClick={handleBackToBrief}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer shrink-0"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
        <div className="w-px h-4 bg-black/10" />
        <button
          type="button"
          onClick={handleGoHome}
          className="grid size-6 place-items-center text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer shrink-0"
          title="Home"
        >
          <Home className="size-4" />
        </button>
        <div className="w-px h-4 bg-black/10" />
        <span className="text-[13px] font-semibold text-[var(--ink)] truncate">{projectName}</span>
        <span className="rounded-full bg-[var(--tint)] border border-[var(--tint-line)] px-2 py-0.5 text-[10px] font-bold text-[var(--brand-deep)]">
          Draft v1
        </span>
      </header>

      {/* ── Main Split View (Studio Style) ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── LEFT PANEL: Plan Canvas Accordion (440px) ── */}
        <aside className="w-full lg:w-[440px] shrink-0 border-r border-[var(--line)] bg-[#fafbf9] flex flex-col h-full overflow-hidden">
          {/* Left Panel Header */}
          <div className="border-b border-[var(--line)] bg-white px-5 py-3.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Available Context
              </span>
              <span className="rounded-full bg-[var(--ok-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--ok)]">
                Grounding active
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <h2 className="text-[16px] font-bold tracking-tight text-[var(--ink)]">
                {brandName} Dossier Plan
              </h2>
              <span className="text-[11.5px] font-semibold text-[var(--ok)]">
                ✓ 214 claims
              </span>
            </div>
          </div>

          {/* Accordion Plan Sections (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {/* 1. Audience & Goal */}
            <PlanSection
              icon={Users}
              title="Audience & Campaign Goal"
              summary={`${audience || "HCP"} · ${goal}`}
              open={openSection === "audience-goal"}
              onToggle={() => toggleSection("audience-goal")}
            >
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[12px] font-bold text-[var(--ink-2)] block mb-1.5">Target Audience</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {audienceOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAudience(opt)}
                        className={cn(
                          "py-1.5 px-2 rounded-[9px] text-[12px] font-semibold border transition text-center",
                          audience === opt
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-bold shadow-2xs"
                            : "border-black/[0.08] bg-white text-[var(--ink-2)] hover:border-black/20"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[var(--ink-2)] block mb-1.5">Campaign Goal</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["New Launch", "Awareness", "Retention"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setGoal(g);
                          setStoreGoal(g);
                        }}
                        className={cn(
                          "py-1.5 px-2 rounded-[9px] text-[12px] font-semibold border transition text-center",
                          goal === g
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-bold shadow-2xs"
                            : "border-black/[0.08] bg-white text-[var(--ink-2)] hover:border-black/20"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PlanSection>

            {/* 2. Focus Topics */}
            <PlanSection
              icon={Layers}
              title="Focus Topics"
              summary={`${selectedTopics.length} topics selected`}
              open={openSection === "topics"}
              onToggle={() => toggleSection("topics")}
            >
              <div className="space-y-1.5 pt-1">
                <p className="text-[11.5px] text-[var(--ink-muted)] mb-2">
                  Statements will be synthesized from verified dossier sections for these topics:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {topicOptions.map((topic) => {
                    const isChecked = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-[10px] text-[12px] font-semibold border text-left transition",
                          isChecked
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)]"
                            : "border-black/[0.08] bg-white text-[var(--ink-2)] hover:border-black/20"
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-4 place-items-center rounded border shrink-0",
                            isChecked ? "bg-[var(--brand)] border-[var(--brand)] text-white" : "border-black/20 bg-white"
                          )}
                        >
                          {isChecked && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        <span className="truncate">{topic}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </PlanSection>

            {/* 3. Format & Frame */}
            <PlanSection
              icon={MonitorPlay}
              title="Format & Duration"
              summary={`${format || "16:9"} Landscape · ${duration || "60 sec"}`}
              open={openSection === "format"}
              onToggle={() => toggleSection("format")}
            >
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[12px] font-bold text-[var(--ink-2)] block mb-1.5">Output Frame</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "16:9", label: "16:9", sub: "Landscape" },
                      { id: "9:16", label: "9:16", sub: "Portrait" },
                      { id: "1:1", label: "1:1", sub: "Square" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormat(f.id)}
                        className={cn(
                          "py-2 px-1.5 rounded-[10px] text-center border transition",
                          format === f.id
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-bold shadow-2xs"
                            : "border-black/[0.08] bg-white text-[var(--ink-2)] hover:border-black/20"
                        )}
                      >
                        <span className="block text-[12px] font-bold">{f.label}</span>
                        <span className="block text-[9.5px] text-[var(--ink-muted)]">{f.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[var(--ink-2)] block mb-1.5">Duration</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["30 sec", "45 sec", "60 sec", "90 sec"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={cn(
                          "py-1.5 text-[11.5px] rounded-[9px] text-center border transition font-semibold",
                          duration === d
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-bold"
                            : "border-black/[0.08] bg-white text-[var(--ink-2)] hover:border-black/20"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PlanSection>

            {/* 4. Language & Voiceover */}
            <PlanSection
              icon={Mic2}
              title="Voice & Language"
              summary={`${language || "English"} · ${voice || "Rohan"} (${music || "Calm clinical"})`}
              open={openSection === "voice"}
              onToggle={() => toggleSection("voice")}
            >
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[12px] font-bold text-[var(--ink-2)] block mb-1.5">Narrator Voice</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {voiceList.slice(0, 4).map((v) => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setVoice(v.name)}
                        className={cn(
                          "p-2 rounded-[10px] border text-left transition",
                          voice === v.name
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-bold"
                            : "border-black/[0.08] bg-white text-[var(--ink-2)] hover:border-black/20"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold">{v.name}</span>
                          <span className="text-[9.5px] text-[var(--ink-muted)]">{v.tag}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[var(--ink-2)] block mb-1.5">Background Sound</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["No music", "Calm clinical", "Warm"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMusic(m)}
                        className={cn(
                          "py-1.5 text-[11.5px] rounded-[9px] text-center border transition font-semibold",
                          music === m
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-bold"
                            : "border-black/[0.08] bg-white text-[var(--ink-2)] hover:border-black/20"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PlanSection>

            {/* 5. Presenter Avatar (if applicable) */}
            {(isMagicAvatar || presentationMode === "presenter") && (
              <PlanSection
                icon={Users}
                title="AI Presenter Avatar"
                summary={presenter || "Dr. Maya Kapoor"}
                open={openSection === "presenter"}
                onToggle={() => toggleSection("presenter")}
              >
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    {presenters.slice(0, 2).map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setPresenter(p.name)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-[11px] border text-left transition",
                          presenter === p.name
                            ? "border-[var(--brand)] bg-[var(--tint)] ring-1 ring-[var(--brand)]"
                            : "border-black/[0.08] bg-white hover:border-black/20"
                        )}
                      >
                        <img src={p.image} alt={p.name} className="size-8 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[12px] font-bold truncate text-[var(--ink)]">{p.name}</span>
                          <span className="block text-[10px] text-[var(--ink-muted)] truncate">Presenter</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </PlanSection>
            )}

            {/* 6. Product & Device Visual Assets */}
            <PlanSection
              icon={PackageCheck}
              title="Product Visual Assets"
              summary={productMediaList.length > 0 ? `${productMediaList.length} media attached` : "Add packshot / 3D renders"}
              open={openSection === "product-assets"}
              onToggle={() => toggleSection("product-assets")}
            >
              <div className="space-y-2 pt-1">
                <p className="text-[11.5px] text-[var(--ink-muted)]">
                  Ground high-resolution packaging, autoinjector pens, or anatomical models in 3D:
                </p>
                <div className="flex flex-wrap gap-2">
                  {productMediaList.map((m) => (
                    <div key={m.id} className="relative size-14 rounded-lg overflow-hidden border border-black/10">
                      <img src={m.preview} alt={m.name} className="size-full object-cover" />
                      <button
                        onClick={() => setProductMediaList((prev) => prev.filter((item) => item.id !== m.id))}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full size-4 grid place-items-center"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setProductMediaList((prev) => [
                        ...prev,
                        {
                          id: `p-${Date.now()}`,
                          name: `${brandName} Delivery Device.png`,
                          type: "image",
                          preview: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=240&q=80",
                          size: "1.4 MB",
                        },
                      ]);
                    }}
                    className="size-14 rounded-lg border border-dashed border-black/20 flex flex-col items-center justify-center text-[10px] text-[var(--ink-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition cursor-pointer"
                  >
                    <Plus className="size-4 mb-0.5" />
                    <span>Attach</span>
                  </button>
                </div>
              </div>
            </PlanSection>
          </div>

          {/* Left Panel Sticky Footer CTA */}
          <div className="p-4 border-t border-[var(--line)] bg-white shrink-0 space-y-2">
            <Button
              onClick={handleConfirmPlan}
              disabled={isGenerating}
              size="lg"
              className="h-12 w-full rounded-[13px] text-[14.5px] font-bold shadow-md bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
            >
              <span>Confirm Plan &amp; Build Scenes</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
              <ShieldCheck className="size-3.5 text-[var(--ok)]" />
              <span>Grounded in verified FDA/EMA label · Nothing created until confirmed</span>
            </div>
          </div>
        </aside>

        {/* ── RIGHT PANEL: Chat Canvas / Generation Loader (flex-1) ── */}
        <main className="flex-1 flex flex-col h-full bg-[#f7f8f6] overflow-hidden min-w-0">
          {isGenerating ? (
            /* ── Loading State upon confirming plan ── */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <div className="size-16 rounded-2xl bg-[var(--tint)] border border-[var(--tint-line)] flex items-center justify-center mb-5 shadow-sm">
                <Sparkles className="size-8 text-[var(--brand)] animate-pulse" />
              </div>
              <h3 className="text-[20px] font-extrabold text-[var(--ink)] tracking-tight">
                Generating Storyboard Scenes...
              </h3>
              <p className="text-[13px] text-[var(--ink-muted)] mt-1.5 max-w-[420px]">
                Structuring clinical narrative, scene narration, and multi-layer visual grounding against 214 approved claims.
              </p>

              {/* Step Checklist Indicator */}
              <div className="mt-6 w-full max-w-[340px] space-y-2 text-left text-[12.5px]">
                <div className={cn("flex items-center gap-2.5 p-2.5 rounded-[10px] border transition", generationStep >= 1 ? "bg-white border-black/10 text-[var(--ink)]" : "opacity-40")}>
                  <Check className={cn("size-4 shrink-0", generationStep >= 1 ? "text-[var(--ok)]" : "text-black/30")} />
                  <span className="font-semibold">Parsed campaign brief &amp; focus topics</span>
                </div>
                <div className={cn("flex items-center gap-2.5 p-2.5 rounded-[10px] border transition", generationStep >= 2 ? "bg-white border-black/10 text-[var(--ink)]" : "opacity-40")}>
                  <Check className={cn("size-4 shrink-0", generationStep >= 2 ? "text-[var(--ok)]" : "text-black/30")} />
                  <span className="font-semibold">Synthesized 5-scene clinical narrative</span>
                </div>
                <div className={cn("flex items-center gap-2.5 p-2.5 rounded-[10px] border transition", generationStep >= 3 ? "bg-white border-black/10 text-[var(--ink)]" : "opacity-40")}>
                  <Check className={cn("size-4 shrink-0", generationStep >= 3 ? "text-[var(--ok)]" : "text-black/30")} />
                  <span className="font-semibold">Linking citations to FDA label §5.1</span>
                </div>
              </div>
            </div>
          ) : (
            /* ── Normal Interactive Chat State ── */
            <>
              {/* Top Chat Mini Header */}
              <div className="h-11 px-5 border-b border-black/[0.06] bg-white/70 backdrop-blur-xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[var(--ok)]" />
                  <span className="text-[12.5px] font-bold text-[var(--ink)]">AI Planning Director</span>
                </div>
                <span className="text-[11.5px] font-medium text-[var(--ink-muted)]">
                  Live Canvas Synchronized
                </span>
              </div>

              {/* Chat Messages Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 max-w-[680px]",
                      msg.role === "user" ? "ml-auto justify-end" : "mr-auto"
                    )}
                  >
                    {msg.role === "swishx" && (
                      <div className="size-8 rounded-full bg-[var(--brand)] text-white grid place-items-center font-bold text-[11px] shrink-0 mt-0.5 shadow-2xs">
                        SX
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-[16px] px-4 py-3 text-[13.5px] leading-relaxed shadow-2xs",
                        msg.role === "user"
                          ? "bg-[var(--brand)] text-white font-medium"
                          : "bg-white border border-[var(--line)] text-[var(--ink)]"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.role === "swishx" && index === 1 && (
                        <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex flex-wrap gap-1.5">
                          {[
                            "Switch to 9:16 Portrait",
                            "Elevate MoA in Scene 2",
                            "Add Dr. Maya Presenter",
                            "Shorten to 45 seconds",
                          ].map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleSendChatMessage(chip)}
                              className="text-[11.5px] font-semibold text-[var(--brand-deep)] bg-[var(--tint)] hover:bg-[#ffe5dd] border border-[var(--tint-line)] px-2.5 py-1 rounded-full transition cursor-pointer"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Chat Input Bar (Studio Style) */}
              <div className="p-4 border-t border-black/[0.06] bg-white shrink-0">
                <div className="max-w-[760px] mx-auto relative">
                  <div className="flex items-center gap-2 rounded-[14px] border border-black/15 bg-[#f7f8f6] px-3 py-2 focus-within:border-[var(--brand)] focus-within:bg-white focus-within:shadow-xs transition">
                    {/* '+' Context Menu Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setChatContextOpen(!chatContextOpen)}
                        className="grid size-7 place-items-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-black/5 transition cursor-pointer"
                        title="Add context"
                      >
                        <Plus className="size-4" />
                      </button>

                      {chatContextOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-black/10 bg-white p-1.5 shadow-lg z-20 space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setChatContextOpen(false);
                              handleSendChatMessage("Attach trial citations from CLARITY-CV study.");
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] font-medium text-[var(--ink-2)] hover:bg-[#f4f5f3] rounded-lg transition text-left"
                          >
                            <FileCheck2 className="size-3.5 text-[var(--brand)]" />
                            Attach trial citations
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setChatContextOpen(false);
                              handleSendChatMessage("Adjust narrative tone to be more clinical and objective.");
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] font-medium text-[var(--ink-2)] hover:bg-[#f4f5f3] rounded-lg transition text-left"
                          >
                            <Target className="size-3.5 text-[var(--brand)]" />
                            Specify clinical tone
                          </button>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendChatMessage();
                      }}
                      placeholder="Ask about the plan or request changes..."
                      className="flex-1 bg-transparent text-[13.5px] outline-none text-[var(--ink)] placeholder:text-[var(--ink-4)]"
                    />

                    <button
                      type="button"
                      onClick={() => handleSendChatMessage()}
                      disabled={!chatInput.trim()}
                      className="grid size-7 place-items-center rounded-lg bg-[var(--brand)] text-white disabled:opacity-30 hover:bg-[var(--brand-deep)] transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Send className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Supporting PlanSection Component ──
function PlanSection({
  icon: Icon,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  icon: typeof Film;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[#fafbf9] transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="grid size-7 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)] shrink-0">
            <Icon className="size-3.5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[13px] font-bold text-[var(--ink)] truncate">{title}</span>
            <span className="block text-[11px] text-[var(--ink-muted)] truncate">{summary}</span>
          </div>
        </div>
        <div className="text-[var(--ink-muted)] shrink-0">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>
      {open && <div className="p-3.5 pt-1 border-t border-black/[0.04] bg-[#fafbf9]">{children}</div>}
    </div>
  );
}

function stopAudioPreview() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function playMusicTone(label: string) {
  if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = label.includes("Warm") ? "triangle" : "sine";
    osc.frequency.setValueAtTime(label.includes("Warm") ? 330 : 260, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.9);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}
