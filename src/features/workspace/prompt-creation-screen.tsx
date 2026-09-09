"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  Building2,
  Check,
  ChevronDown,
  Film,
  FlaskConical,
  Layers,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BRAND_REGISTRY } from "@/features/dossiers/mock-dossiers";
import type { Audience } from "@/types/content";

/* ─── Data ───────────────────────────────────────────────────────────────────── */
/** The audience segmented control shows three groups; "Other" opens a small
 *  menu of the less-common audiences rather than crowding the control. */
const AUDIENCE_SEGMENTS = ["HCP", "Patient", "Other"] as const;
type AudienceSegment = (typeof AUDIENCE_SEGMENTS)[number];
const OTHER_AUDIENCES: Audience[] = ["Hospital", "Distributor", "Field team"];

const TOPIC_LIBRARY = [
  "Product Overview",
  "Market Opportunity",
  "Mechanism of Action",
  "Safety Profile",
  "Patient Journey",
  "Access & Reimbursement",
];

interface ExamplePrompt {
  tag: string;
  text: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    tag: "HCP Launch Video",
    text: "Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for DERMORA.",
  },
  {
    tag: "Mechanism & Efficacy",
    text: "Produce a 45-second clinical education video highlighting the Phase III efficacy endpoints and dosing safety for Velmora.",
  },
  {
    tag: "Clinical Briefing",
    text: "Generate a presenter-led clinical briefing explaining the dual mechanism of action and fair balance safety profile for Velmora.",
  },
];

const MORE_EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    tag: "Patient Journey",
    text: "Walk through a typical patient's first 90 days on Nirvexa, from diagnosis to dosing routine, in a warm and reassuring tone.",
  },
  {
    tag: "Payer Value Story",
    text: "Summarize the health-economic case for Onkavia for a payer committee, leading with the QALY and budget-impact findings.",
  },
];

/* ─── Small pill chip shell — a quieter, glass-on-glass style meant to sit
   inside the composer itself rather than float free below it. ────────────── */
function Chip({
  active,
  tone = "neutral",
  onClick,
  children,
}: {
  active?: boolean;
  tone?: "neutral" | "brand";
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const toneStyles = {
    neutral: { bg: "var(--surface-subtle)", border: "transparent", color: "var(--ink-2)" },
    brand: { bg: "var(--tint)", border: "var(--tint-line)", color: "var(--brand-deep)" },
  }[active ? tone : "neutral"];

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-chip px-3 py-[7px] text-body font-bold transition-all duration-150 hover:-translate-y-px"
      style={{ background: toneStyles.bg, border: `1px solid ${toneStyles.border}`, color: toneStyles.color }}
    >
      {children}
    </button>
  );
}

/** Three-way segmented control for the audience — a sliding highlight behind
 *  the active label rather than a row of separately-bordered chips. */
function AudienceSegmented({
  value,
  onChange,
}: {
  value: AudienceSegment;
  onChange: (segment: AudienceSegment) => void;
}) {
  const activeIndex = AUDIENCE_SEGMENTS.indexOf(value);
  return (
    <div className="relative inline-flex rounded-chip bg-subtle p-[3px]">
      <span
        aria-hidden
        className="absolute inset-y-[3px] rounded-chip bg-card shadow-hair transition-transform duration-250"
        style={{ width: `calc(${100 / AUDIENCE_SEGMENTS.length}% - 3px)`, transform: `translateX(${activeIndex * 100}%)` }}
      />
      {AUDIENCE_SEGMENTS.map((segment) => (
        <button
          key={segment}
          type="button"
          onClick={() => onChange(segment)}
          className="relative z-10 whitespace-nowrap rounded-chip px-3.5 py-[7px] text-body font-bold transition-colors duration-200"
          style={{ color: value === segment ? "var(--brand-deep)" : "var(--ink-3)" }}
        >
          {segment}
        </button>
      ))}
    </div>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────────────────── */
export function PromptCreationScreen() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);
  const [audienceSegment, setAudienceSegment] = useState<AudienceSegment>("HCP");
  const [otherAudience, setOtherAudience] = useState<Audience>("Hospital");
  const [otherAudiencePickerOpen, setOtherAudiencePickerOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Product Overview", "Market Opportunity"]);
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [showMorePrompts, setShowMorePrompts] = useState(false);

  const brand = useMemo(() => BRAND_REGISTRY.find((b) => b.id === brandId) ?? null, [brandId]);
  const audience: Audience = audienceSegment === "Other" ? otherAudience : audienceSegment;

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  function selectAudienceSegment(segment: AudienceSegment) {
    if (segment === "Other") {
      setOtherAudiencePickerOpen((v) => (audienceSegment === "Other" ? !v : true));
    } else {
      setOtherAudiencePickerOpen(false);
    }
    setAudienceSegment(segment);
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
    <div className="fixed inset-0 flex flex-col overflow-y-auto bg-canvas">
      {/* Minimal, distraction-free header — no sidebar, no search bar. This
          is a focused compose moment, not a dashboard page, matching the
          same "zen" framing as the wizard's own project workspace. */}
      <header className="flex shrink-0 items-center justify-between border-b border-hair px-6 py-3.5">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-control px-2 py-1.5 text-body font-bold text-ink-2 transition-colors hover:text-brand-deep"
        >
          <ArrowLeft size={15} /> Home
        </button>
        <div className="flex items-center gap-2 text-title font-[800] tracking-tight text-ink">
          <LogoMark size={20} className="text-brand" />
          <span>
            swish<span className="text-brand">X</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-label font-bold text-ink-3">
          <FlaskConical size={13} className="text-brand-deep" /> Sample Briefs
        </span>
      </header>

      <div className="relative mx-auto flex w-full max-w-[860px] flex-1 flex-col justify-center px-6 py-10">
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
          <span className="text-label font-extrabold uppercase tracking-[.12em] text-brand-deep">Turn ideas into impact</span>
          <h1 className="mx-auto mt-3 max-w-[16ch] text-hero-lg font-extrabold leading-[1.08] tracking-tight text-ink">
            What video would you like to create today?
          </h1>
          <p className="mx-auto mt-2.5 text-body-lg text-ink-3">Describe your idea and we&apos;ll handle the rest.</p>
        </div>

        {/* The composer — one elevated surface. Everything that shapes the
            brief (brand grounding, audience, topics) now lives inside it,
            stacked as quiet internal bands rather than floating below as a
            separate row of chips. */}
        <div
          className="relative mt-8 overflow-visible rounded-card border bg-card transition-all duration-300"
          style={{
            borderColor: isFocused ? "var(--tint-line)" : "var(--color-hair)",
            boxShadow: isFocused
              ? "0 24px 48px -20px rgba(255,90,31,.16), 0 2px 8px rgba(16,24,40,.05), inset 0 1px 0 rgba(255,255,255,.8)"
              : "0 12px 32px -18px rgba(16,24,40,.12), 0 1px 2px rgba(16,24,40,.04), inset 0 1px 0 rgba(255,255,255,.7)",
          }}
        >
          {/* Glass sheen along the top edge, echoing the sidebar's own premium finish. */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-card bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Create a concise HCP launch video for dermatologists that explains the clinical need, mechanism, and pivotal evidence for DERMORA."
            rows={3}
            className="w-full resize-none border-none bg-transparent px-5 pt-5 pb-2 text-body-lg leading-relaxed text-ink outline-none placeholder:text-ink-4"
          />

          {/* Brief bands — grounding, audience, topics — each a labeled row. */}
          <div className="space-y-3 border-t border-hair px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-20 shrink-0 text-label font-bold uppercase tracking-[.08em] text-ink-4">Grounded in</span>
              <div className="relative">
                <Chip active={!!brand} tone="brand" onClick={() => setBrandPickerOpen((v) => !v)}>
                  <Building2 size={12} />
                  {brand ? brand.name : "Choose a brand"}
                  {brand && (
                    <span
                      className="ml-0.5 grid size-3.5 place-items-center rounded-full"
                      style={{ background: "var(--ok)" }}
                      title="Grounding locked to this dossier"
                    >
                      <ShieldCheck size={9} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                  <ChevronDown size={12} />
                </Chip>
                {brandPickerOpen && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-72 overflow-hidden rounded-panel border border-hair bg-card shadow-float">
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
              <span className="text-label text-ink-4">
                {brand ? "Claims will cite this dossier only" : "Optional — leave open for a general script"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="w-20 shrink-0 text-label font-bold uppercase tracking-[.08em] text-ink-4">Audience</span>
              <AudienceSegmented value={audienceSegment} onChange={selectAudienceSegment} />
              {audienceSegment === "Other" && (
                <div className="relative">
                  <Chip active tone="neutral" onClick={() => setOtherAudiencePickerOpen((v) => !v)}>
                    {otherAudience} <ChevronDown size={12} />
                  </Chip>
                  {otherAudiencePickerOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-44 overflow-hidden rounded-panel border border-hair bg-card p-1 shadow-float">
                      {OTHER_AUDIENCES.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            setOtherAudience(a);
                            setOtherAudiencePickerOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-control px-2.5 py-2 text-left text-body-lg font-semibold text-ink-2 hover:bg-subtle"
                        >
                          {a}
                          {otherAudience === a && <Check size={13} className="text-brand-deep" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="w-20 shrink-0 text-label font-bold uppercase tracking-[.08em] text-ink-4">Topics</span>
              <div className="relative">
                <Chip active tone="neutral" onClick={() => setTopicPickerOpen((v) => !v)}>
                  <Layers size={12} />
                  {selectedTopics.length} selected <ChevronDown size={12} />
                </Chip>
                {topicPickerOpen && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-64 overflow-hidden rounded-panel border border-hair bg-card p-1.5 shadow-float">
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
                            className="grid size-[15px] shrink-0 place-items-center rounded-glyph border"
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
              <div className="flex flex-wrap gap-1.5">
                {selectedTopics.map((topic) => (
                  <span key={topic} className="rounded-chip bg-subtle px-2 py-1 text-label font-semibold text-ink-3">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer — attach, format, and send, all inside the same surface. */}
          <div className="flex items-center justify-between border-t border-hair px-5 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-control border border-hair-2 px-3 py-1.5 text-body font-bold text-ink-3 transition-colors hover:border-tint-line hover:text-brand-deep"
              >
                <Paperclip size={13} /> Attach
              </button>
              <span className="inline-flex items-center gap-1.5 text-label font-semibold text-ink-4">
                <Film size={12} /> Video
              </span>
            </div>
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
              return (
                <div
                  key={ex.tag}
                  className="group flex items-center gap-3 rounded-panel border border-hair bg-card px-4 py-3 transition-colors hover:border-tint-line"
                >
                  <span className="shrink-0 rounded-chip bg-tint px-2.5 py-1 text-label font-extrabold text-brand-deep">{ex.tag}</span>
                  <p className="m-0 min-w-0 flex-1 truncate text-body-lg text-ink-3">&ldquo;{ex.text}&rdquo;</p>
                  <button
                    type="button"
                    onClick={() => applyExamplePrompt(ex.text)}
                    className="shrink-0 text-body font-bold text-brand-deep opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
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
    </div>
  );
}
