"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Clapperboard, Images, MessageSquareQuote, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/logo-mark";
import {
  CHARACTER_TYPES,
  CHARACTER_VIEWS,
  VIEW_LABEL,
  type Character,
  type CharacterType,
  type CharacterView,
  type CreationMethod,
} from "@/features/content-library/characters-data";

/**
 * What a usable reference looks like, shown rather than described.
 *
 * "Upload four images" produces four selfies. The shot list is the whole
 * requirement, so each row carries the example frame beside it — a person
 * matches a picture far faster than they parse a sentence about one.
 */
const IMAGE_GUIDE: Array<{ id: (typeof CHARACTER_VIEWS)[number]; hint: string; example: string }> = [
  { id: "front", hint: "Square to camera, eyes level, neutral expression.", example: "/characters/anaya-front.png" },
  { id: "threeQuarter", hint: "Turned about 45°, both eyes still visible.", example: "/characters/anaya-three-quarter.png" },
  { id: "profile", hint: "Full side-on, jaw and ear clear of hair.", example: "/characters/anaya-profile.png" },
  { id: "fullBody", hint: "Head to feet, arms relaxed, plain floor.", example: "/characters/anaya-full-body.png" },
];

const METHODS: Array<{ id: CreationMethod; title: string; detail: string; icon: typeof Images }> = [
  {
    id: "prompt",
    title: "Prompt led",
    detail: "Describe the person and we build the identity from the description.",
    icon: MessageSquareQuote,
  },
  {
    id: "reference",
    title: "Reference led",
    detail: "Upload footage or photographs of a real person and we build from those.",
    icon: Images,
  },
];

function SectionTitle({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-5.5 place-items-center rounded-full bg-tint text-caption font-extrabold text-brand-deep">
        {index}
      </span>
      <span className="text-body-lg font-extrabold text-ink">{children}</span>
    </div>
  );
}

export function CharacterCreateModal({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (character: Character) => void;
}) {
  const [method, setMethod] = useState<CreationMethod>("prompt");
  const [prompt, setPrompt] = useState("");
  const [videoAdded, setVideoAdded] = useState(false);
  const [imagesAdded, setImagesAdded] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<CharacterType>("Doctor");
  const [typeOther, setTypeOther] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !generating) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, generating]);

  const methodReady =
    method === "prompt" ? prompt.trim().length > 12 : videoAdded || imagesAdded.length > 0;
  const typeReady = type !== "Others" || typeOther.trim().length > 0;
  const ready = methodReady && name.trim().length > 0 && typeReady;

  const handleGenerate = () => {
    if (!ready) return;
    setGenerating(true);
    /* A render takes time, and a tile that appears the instant you click
       teaches people the generation is fake. Four views, a beat each. */
    window.setTimeout(() => {
      const views: CharacterView[] = CHARACTER_VIEWS.map((id) => ({
        id,
        url: IMAGE_GUIDE.find((g) => g.id === id)!.example,
      }));
      onCreate({
        id: `char-${Date.now()}`,
        name: name.trim(),
        type,
        typeOther: type === "Others" ? typeOther.trim() : undefined,
        description:
          method === "prompt"
            ? prompt.trim()
            : `Built from ${videoAdded ? "reference footage" : `${imagesAdded.length} reference photographs`}.`,
        method,
        views,
        sources:
          method === "prompt"
            ? [{ kind: "prompt", label: prompt.trim() }]
            : videoAdded
              ? [{ kind: "video", label: "reference_turntable.mp4", url: "/avatar-showcase.mp4" }]
              : imagesAdded.map((id) => ({
                  kind: "image" as const,
                  label: `${VIEW_LABEL[id as (typeof CHARACTER_VIEWS)[number]]} reference`,
                  url: IMAGE_GUIDE.find((g) => g.id === id)?.example,
                })),
        createdOn: "Just now",
        updatedOn: "Just now",
      });
    }, 2600);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Create a character"
    >
      <div className="flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-hair bg-canvas px-5 py-4">
          <div>
            <div className="flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-[0.14em] text-brand">
              <LogoMark size={13} /> Character studio
            </div>
            <h2 className="mt-0.5 text-display font-[850] tracking-tight text-ink">
              Create a character
            </h2>
            <p className="mt-0.5 text-label text-ink-3">
              One identity, rendered from four angles, reusable across every asset.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={generating}
            aria-label="Cancel"
            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        </div>

        {generating ? (
          <div className="grid min-h-[320px] place-items-center gap-3 p-8 text-center">
            <LogoMark size={28} className="animate-spin text-brand" />
            <p className="text-body-lg font-extrabold text-ink">Building {name.trim()}</p>
            <p className="max-w-[40ch] text-body text-ink-3">
              Rendering the four views and checking them against each other, so the same person
              looks like the same person from every angle.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <section className="space-y-2.5">
              <SectionTitle index={1}>Creation method</SectionTitle>
              <div className="grid gap-2 sm:grid-cols-2">
                {METHODS.map((option) => {
                  const active = method === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMethod(option.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex cursor-pointer flex-col gap-1 rounded-control border p-3 text-left transition",
                        active
                          ? "border-brand bg-tint shadow-2xs ring-2 ring-brand/15"
                          : "border-hair-2 bg-card hover:border-hair-3"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <option.icon className={cn("size-3.5", active ? "text-brand" : "text-ink-3")} />
                        <span className="text-body font-extrabold text-ink">{option.title}</span>
                        {active && <Check className="ml-auto size-3.5 stroke-[3] text-brand" />}
                      </span>
                      <span className="text-caption leading-snug text-ink-3">{option.detail}</span>
                    </button>
                  );
                })}
              </div>

              {method === "prompt" ? (
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  autoFocus
                  placeholder="e.g. Indian-born American physician in his late 30s, trimmed beard, white coat over a blue shirt, calm and approachable, plain studio backdrop."
                  className="w-full resize-none rounded-control border border-hair-2 bg-canvas p-3 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
                />
              ) : (
                <div className="space-y-3">
                  {/* Footage. */}
                  <div className="rounded-control border border-hair-2 bg-canvas p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-body font-extrabold text-ink">
                        <Clapperboard className="size-3.5 text-brand" /> Add video
                      </span>
                      <Button
                        size="sm"
                        variant={videoAdded ? "secondary" : "primary"}
                        onClick={() => setVideoAdded((v) => !v)}
                        className="cursor-pointer text-label font-bold"
                      >
                        {videoAdded ? (
                          <>
                            <Check className="size-3.5" /> reference_turntable.mp4
                          </>
                        ) : (
                          <>
                            <Upload className="size-3.5" /> Upload footage
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="mt-1.5 text-caption leading-snug text-ink-3">
                      The person in frame throughout, turning slowly so every angle is covered.
                      Forty-five seconds is the minimum; a full minute is better.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <video
                        src="/avatar-showcase.mp4"
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="h-20 w-32 shrink-0 rounded-glyph border border-hair-2 object-cover"
                      />
                      <span className="text-caption text-ink-4">
                        Example footage — this is the coverage a good take gives you.
                      </span>
                    </div>
                  </div>

                  {/* Stills. */}
                  <div className="rounded-control border border-hair-2 bg-canvas p-3">
                    <span className="flex items-center gap-1.5 text-body font-extrabold text-ink">
                      <Images className="size-3.5 text-brand" /> Add images
                    </span>
                    <p className="mt-1.5 text-caption leading-snug text-ink-3">
                      Four shots, one per angle. Match the examples and the identity holds.
                    </p>
                    <ul className="mt-2 space-y-2">
                      {IMAGE_GUIDE.map((guide) => {
                        const added = imagesAdded.includes(guide.id);
                        return (
                          <li key={guide.id} className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={guide.example}
                              alt=""
                              className="size-12 shrink-0 rounded-glyph border border-hair-2 object-cover object-top"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-body font-bold text-ink">{VIEW_LABEL[guide.id]}</div>
                              <span className="text-caption leading-snug text-ink-3">{guide.hint}</span>
                            </div>
                            <Button
                              size="sm"
                              variant={added ? "secondary" : "primary"}
                              onClick={() =>
                                setImagesAdded((prev) =>
                                  prev.includes(guide.id)
                                    ? prev.filter((id) => id !== guide.id)
                                    : [...prev, guide.id]
                                )
                              }
                              className="shrink-0 cursor-pointer text-label font-bold"
                            >
                              {added ? <Check className="size-3.5" /> : <Upload className="size-3.5" />}
                              {added ? "Added" : "Upload"}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-2">
              <SectionTitle index={2}>Name</SectionTitle>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Siva"
                className="w-full rounded-control border border-hair-2 bg-canvas px-3 py-2.5 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
              />
            </section>

            <section className="space-y-2">
              <SectionTitle index={3}>Character type</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {CHARACTER_TYPES.map((option) => {
                  const active = type === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setType(option)}
                      aria-pressed={active}
                      className={cn(
                        "cursor-pointer rounded-chip border px-3 py-1.5 text-label font-bold transition",
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-hair-2 bg-card text-ink-2 hover:border-brand hover:text-brand"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {type === "Others" && (
                <input
                  value={typeOther}
                  onChange={(e) => setTypeOther(e.target.value)}
                  autoFocus
                  placeholder="What kind of character is this?"
                  className="w-full rounded-control border border-hair-2 bg-canvas px-3 py-2.5 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
                />
              )}
            </section>
          </div>
        )}

        {!generating && (
          <div className="flex items-center justify-between gap-3 border-t border-hair bg-canvas px-5 py-3">
            <span className="text-label text-ink-4">
              {ready ? "Ready to generate" : "A method, a name and a type"}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={onCancel} className="cursor-pointer text-label font-bold">
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={!ready}
                onClick={handleGenerate}
                className="cursor-pointer gap-1.5 text-label font-bold disabled:opacity-40"
              >
                <LogoMark size={13} /> Generate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
