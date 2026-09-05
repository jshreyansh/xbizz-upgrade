"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Building2,
  Check,
  ChevronDown,
  Film,
  Lock,
  Paperclip,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BRAND_REGISTRY } from "@/features/dossiers/mock-dossiers";
import type { Audience } from "@/types/content";

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const AUDIENCES: Audience[] = ["Hospital", "HCP", "Patient", "Distributor", "Field team"];

const TOPIC_LIBRARY = [
  "Product Overview",
  "Market Opportunity",
  "Mechanism of Action",
  "Safety Profile",
  "Patient Journey",
  "Access & Reimbursement",
];

interface ExamplePrompt {
  icon: typeof Play;
  title: string;
  text: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    icon: Play,
    title: "HCP Launch Video",
    text: "Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for DERMORA.",
  },
  {
    icon: Film,
    title: "Mechanism & Efficacy",
    text: "Produce a 45-second clinical education video highlighting the Phase III efficacy endpoints and dosing safety for Velmora.",
  },
  {
    icon: Users,
    title: "Clinical Briefing",
    text: "Generate a presenter-led clinical briefing explaining the dual mechanism of action and fair balance safety profile for Velmora.",
  },
];

const MORE_EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    icon: Sparkles,
    title: "Patient Journey Explainer",
    text: "Walk through a typical patient's first 90 days on Nirvexa, from diagnosis to dosing routine, in a warm and reassuring tone.",
  },
  {
    icon: Building2,
    title: "Payer Value Story",
    text: "Summarize the health-economic case for Onkavia for a payer committee, leading with the QALY and budget-impact findings.",
  },
];

/* ─── Small pill chip shell ──────────────────────────────────────────────────── */
function Chip({
  active,
  tone = "neutral",
  onClick,
  children,
}: {
  active?: boolean;
  tone?: "neutral" | "brand" | "ok";
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const toneStyles = {
    neutral: { bg: "#fff", border: "var(--hair-2)", color: "var(--ink-2)" },
    brand: { bg: "var(--tint)", border: "var(--tint-line)", color: "var(--brand-deep)" },
    ok: { bg: "var(--ok-bg)", border: "transparent", color: "var(--ok)" },
  }[active ? tone : "neutral"];

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-[7px] text-body font-bold transition-all duration-150 hover:-translate-y-px"
      style={{ background: toneStyles.bg, border: `1px solid ${toneStyles.border}`, color: toneStyles.color }}
    >
      {children}
    </button>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────────────────── */
export function PromptCreationScreen() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);
  const [audienceIndex, setAudienceIndex] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Product Overview", "Market Opportunity"]);
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [showMorePrompts, setShowMorePrompts] = useState(false);

  const brand = useMemo(() => BRAND_REGISTRY.find((b) => b.id === brandId) ?? null, [brandId]);
  const audience = AUDIENCES[audienceIndex];

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  function applyExamplePrompt(text: string) {
    setPrompt(text);
    textareaRef.current?.focus();
  }

  function handleSend() {
    if (!prompt.trim()) {
      textareaRef.current?.focus();
      return;
    }
    const store = useWorkspaceStore.getState();
    store.setAssetType("video");
    store.setCreationMode("magic-reel");
    store.setSourceType("text");
    store.setSourcePayload({ text: prompt.trim(), ...(brand ? { dossierId: brand.id } : {}) });
    store.setTopics(selectedTopics);
    store.setAudience(audience);
    store.setVideoSubStage("intake");
    store.setView("create");
    router.push("/create");
  }

  return (
    <AppShell pageTitle="Create">
      <div className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-[860px] flex-col justify-center py-10">
        {/* Soft ambient wash — calmer, single-hue version of the homepage hero's glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <span
            className="absolute rounded-full"
            style={{ left: "8%", top: "-10%", width: 420, height: 420, background: "rgba(255,122,61,.09)", filter: "blur(70px)" }}
          />
          <span
            className="absolute rounded-full"
            style={{ right: "4%", bottom: "-14%", width: 380, height: 380, background: "rgba(61,107,255,.07)", filter: "blur(70px)" }}
          />
        </div>

        {/* Heading */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-label font-extrabold uppercase tracking-[.12em] text-brand-deep">
            <Sparkles size={13} /> Turn ideas into impact
          </span>
          <h1 className="mx-auto mt-3 max-w-[16ch] text-hero-lg font-extrabold leading-[1.08] tracking-tight text-ink">
            What video would you like to create today?
          </h1>
          <p className="mx-auto mt-2.5 text-body-lg text-ink-3">Describe your idea and we&apos;ll handle the rest.</p>
        </div>

        {/* Prompt box */}
        <div
          className="relative mt-8 rounded-card border border-hair bg-card p-4 shadow-hair transition-shadow duration-200 focus-within:shadow-float"
          style={{ borderColor: prompt ? "var(--tint-line)" : undefined }}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for DERMORA."
            rows={3}
            className="w-full resize-none border-none bg-transparent text-body-lg leading-relaxed text-ink outline-none placeholder:text-ink-4"
          />
          <div className="mt-2 flex items-center justify-between border-t border-hair pt-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-control border border-hair-2 px-3 py-1.5 text-body font-bold text-ink-3 transition-colors hover:border-tint-line hover:text-brand-deep"
            >
              <Paperclip size={13} /> Attach
            </button>
            <div className="flex items-center gap-3">
              <span className="text-label text-ink-4">{prompt.length} chars</span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!prompt.trim()}
                className="grid size-9 place-items-center rounded-full text-white shadow-brand-soft transition-transform duration-150 enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "linear-gradient(145deg,var(--brand),var(--brand-deep))" }}
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Context chips */}
        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Chip active={!!brand} tone="brand" onClick={() => setBrandPickerOpen((v) => !v)}>
              {brand ? <Lock size={12} /> : <Building2 size={12} />}
              {brand ? `${brand.name} Dossier` : "Choose a brand"}
              <ChevronDown size={12} />
            </Chip>
            {brandPickerOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-64 overflow-hidden rounded-panel border border-hair bg-card shadow-float">
                {BRAND_REGISTRY.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBrandId(b.id);
                      setBrandPickerOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-body-lg hover:bg-subtle"
                  >
                    <span>
                      <b className="block font-bold text-ink">{b.name}</b>
                      <span className="text-label text-ink-3">{b.genericName} · {b.therapyArea}</span>
                    </span>
                    {brand?.id === b.id && <Check size={14} className="text-brand-deep" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Chip active tone="neutral" onClick={() => setAudienceIndex((i) => (i + 1) % AUDIENCES.length)}>
            <Users size={12} /> {audience}
          </Chip>

          <div className="relative">
            <Chip active tone="neutral" onClick={() => setTopicPickerOpen((v) => !v)}>
              {selectedTopics.length} topic{selectedTopics.length === 1 ? "" : "s"} <ChevronDown size={12} />
            </Chip>
            {topicPickerOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-64 overflow-hidden rounded-panel border border-hair bg-card p-1.5 shadow-float">
                {TOPIC_LIBRARY.map((topic) => {
                  const checked = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-body-lg font-semibold text-ink-2 hover:bg-subtle"
                    >
                      <span
                        className="grid size-[15px] shrink-0 place-items-center rounded-[5px] border"
                        style={{ background: checked ? "var(--brand)" : "transparent", borderColor: checked ? "var(--brand)" : "var(--hair-2)" }}
                      >
                        {checked && <Check size={11} className="text-white" />}
                      </span>
                      {topic}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Chip active tone="neutral">
            <Film size={12} /> Video
          </Chip>

          <Chip active={!!brand} tone={brand ? "ok" : "neutral"}>
            <span className="size-[6px] rounded-full" style={{ background: brand ? "var(--ok)" : "var(--ink-4)" }} />
            {brand ? "Grounding locked" : "Grounding optional"}
          </Chip>
        </div>

        {/* Example prompts */}
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-label font-extrabold uppercase tracking-[.1em] text-ink-4">Example prompts</span>
            <button
              type="button"
              onClick={() => setShowMorePrompts((v) => !v)}
              className="text-body font-bold text-brand-deep hover:underline"
            >
              {showMorePrompts ? "Show fewer" : "View all prompts"} →
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {[...EXAMPLE_PROMPTS, ...(showMorePrompts ? MORE_EXAMPLE_PROMPTS : [])].map((ex) => {
              const Icon = ex.icon;
              return (
                <div
                  key={ex.title}
                  className="group flex items-center gap-3 rounded-panel border border-hair bg-card px-4 py-3 transition-colors hover:border-tint-line"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-control bg-tint text-brand-deep">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="block text-body-lg font-bold text-ink">{ex.title}</b>
                    <p className="m-0 truncate text-body text-ink-3">&ldquo;{ex.text}&rdquo;</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyExamplePrompt(ex.text)}
                    className="shrink-0 text-body font-bold text-brand-deep opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Use prompt →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signature captions, matching the homepage hero's script-accent motif */}
        <div className="mt-10 flex items-end justify-between">
          <span className="font-script text-display leading-none text-ink-3" style={{ fontFamily: "var(--font-script)" }}>
            Better conversations. Brighter outcomes.
          </span>
          <span className="text-caption font-extrabold uppercase tracking-[.14em] text-ink-4">From science to impact</span>
        </div>
      </div>
    </AppShell>
  );
}
