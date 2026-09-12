"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Audience } from "@/types/content";
import {
  AUDIENCE_OPTIONS,
  INITIAL_BRANDS,
  SHAPE_OPTIONS,
  TOPICS_BY_AUDIENCE,
  type OutputShape,
} from "@/features/workspace/brand-modal-data";

/**
 * Changing what the prompt is grounded in, without leaving the prompt.
 *
 * The start modal asks these four questions once, on the way in. This asks the
 * same four again — but it opens on the one you clicked and its button says
 * Update, because you are amending a project rather than starting one. Sending
 * someone back through the whole intake to change an audience is how a
 * two-second correction becomes a five-step detour.
 *
 * It shares the start modal's option data rather than copying it: two lists of
 * audiences that can disagree is worse than either list.
 */

export type ContextField = "brand" | "audience" | "topics" | "frame";

const FIELD_TITLES: Record<ContextField, { title: string; hint: string }> = {
  brand: { title: "Brand", hint: "What the asset is grounded in. Claims are checked against this dossier." },
  audience: { title: "Audience", hint: "Who this is for. It decides the language, the claims and the topics offered." },
  topics: { title: "Focus topics", hint: "The story pillars. One to three — more than that and none of them land." },
  frame: { title: "Frame size", hint: "The shape the asset is composed for." },
};

export interface ProjectContext {
  brandId: string;
  audience: Audience;
  topics: string[];
  shape: OutputShape;
}

export function ProjectContextModal({
  open,
  context,
  onSave,
  onClose,
}: {
  /** Which field to expand on arrival — the one that was clicked. */
  open: ContextField;
  context: ProjectContext;
  onSave: (next: ProjectContext) => void;
  onClose: () => void;
}) {
  const [field, setField] = useState<ContextField>(open);
  const [draft, setDraft] = useState<ProjectContext>(context);
  const [brandQuery, setBrandQuery] = useState("");

  const topicOptions = TOPICS_BY_AUDIENCE[draft.audience] ?? TOPICS_BY_AUDIENCE.HCP;
  const brand = INITIAL_BRANDS.find((b) => b.id === draft.brandId) ?? INITIAL_BRANDS[0];

  /* Search-only, like the start modal: the catalogue is thousands of brands,
     so a list shown before a query is a list nobody reads. */
  const brandResults = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return [];
    return INITIAL_BRANDS.filter(
      (b) => b.name.toLowerCase().includes(q) || b.genericName.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [brandQuery]);

  const summary: Record<ContextField, string> = {
    brand: brand.name,
    audience: AUDIENCE_OPTIONS.find((a) => a.id === draft.audience)?.title ?? draft.audience,
    topics: `${draft.topics.length} ${draft.topics.length === 1 ? "topic" : "topics"}`,
    frame: SHAPE_OPTIONS.find((s) => s.id === draft.shape)?.label ?? "Landscape",
  };

  const toggleTopic = (id: string) =>
    setDraft((prev) => ({
      ...prev,
      topics: prev.topics.includes(id)
        ? prev.topics.filter((t) => t !== id)
        : prev.topics.length >= 3
          ? prev.topics
          : [...prev.topics, id],
    }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Update project context"
      className="fixed inset-0 z-[9999] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
    >
      <div className="rise-in flex max-h-[86vh] w-full max-w-[640px] flex-col overflow-hidden rounded-card border border-hair-2 bg-card shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-hair-2 bg-canvas px-5 py-3.5">
          <div className="min-w-0">
            <div className="text-caption font-extrabold uppercase tracking-[0.14em] text-brand">
              Project context
            </div>
            <h2 className="mt-0.5 text-display font-[850] tracking-tight text-ink">
              {FIELD_TITLES[field].title}
            </h2>
            <p className="mt-0.5 text-label text-ink-3">{FIELD_TITLES[field].hint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition-colors hover:bg-black/5 hover:text-ink"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* The other three stay reachable: having opened this to change one
            thing, changing a second should not mean opening it again. */}
        <div className="flex flex-wrap gap-1.5 border-b border-hair px-5 py-2.5">
          {(Object.keys(FIELD_TITLES) as ContextField[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setField(id)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-chip border px-2.5 py-1 text-label font-bold transition",
                field === id
                  ? "border-brand bg-tint text-brand-deep"
                  : "border-hair-2 bg-card text-ink-3 hover:border-hair-3 hover:text-ink"
              )}
            >
              {FIELD_TITLES[id].title}
              <span className="font-semibold text-ink-4">{summary[id]}</span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {field === "audience" && (
            <div className="grid gap-2 sm:grid-cols-2">
              {AUDIENCE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = draft.audience === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        audience: option.id,
                        // Topics belong to an audience: keeping the old ones
                        // would offer an HCP's mechanism pillars to a patient.
                        topics: prev.audience === option.id ? prev.topics : [],
                      }))
                    }
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-control border p-3 text-left transition",
                      active
                        ? "border-brand bg-tint shadow-2xs ring-2 ring-brand/15"
                        : "border-hair-2 bg-card hover:border-hair-3"
                    )}
                  >
                    <Icon className={cn("mt-0.5 size-4 shrink-0", active ? "text-brand" : "text-ink-3")} />
                    <span className="min-w-0">
                      <span className="block text-body font-bold text-ink">{option.title}</span>
                      <span className="mt-0.5 block text-label text-ink-3">{option.subtitle}</span>
                    </span>
                    {active && <Check className="ml-auto size-4 shrink-0 text-brand" />}
                  </button>
                );
              })}
            </div>
          )}

          {field === "topics" && (
            <div className="space-y-2">
              <p className="text-label font-bold text-ink-2">
                {draft.topics.length} of 3 selected
                {draft.topics.length >= 3 && (
                  <span className="ml-1.5 font-semibold text-ink-4">— deselect one to choose another</span>
                )}
              </p>
              <div className="grid gap-2">
                {topicOptions.map((option) => {
                  const Icon = option.icon;
                  const active = draft.topics.includes(option.id);
                  const full = !active && draft.topics.length >= 3;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleTopic(option.id)}
                      disabled={full}
                      className={cn(
                        "flex items-start gap-2.5 rounded-control border p-3 text-left transition",
                        active
                          ? "cursor-pointer border-brand bg-tint shadow-2xs ring-2 ring-brand/15"
                          : full
                            ? "cursor-not-allowed border-hair-2 bg-canvas opacity-50"
                            : "cursor-pointer border-hair-2 bg-card hover:border-hair-3"
                      )}
                    >
                      <Icon className={cn("mt-0.5 size-4 shrink-0", active ? "text-brand" : "text-ink-3")} />
                      <span className="min-w-0">
                        <span className="block text-body font-bold text-ink">{option.label}</span>
                        <span className="mt-0.5 block text-label leading-snug text-ink-3">{option.detail}</span>
                      </span>
                      {active && <Check className="ml-auto size-4 shrink-0 text-brand" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {field === "frame" && (
            <div className="grid gap-2 sm:grid-cols-2">
              {SHAPE_OPTIONS.map((option) => {
                const active = draft.shape === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, shape: option.id }))}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-control border p-3 text-left transition",
                      active
                        ? "border-brand bg-tint shadow-2xs ring-2 ring-brand/15"
                        : "border-hair-2 bg-card hover:border-hair-3"
                    )}
                  >
                    {option.renderIcon(active)}
                    <span className="text-body font-bold text-ink">{option.label}</span>
                    {active && <Check className="ml-auto size-4 shrink-0 text-brand" />}
                  </button>
                );
              })}
            </div>
          )}

          {field === "brand" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-control border border-hair-2 bg-canvas p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-control bg-tint text-body font-[850] text-brand-deep">
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block text-body font-bold text-ink">{brand.name}</span>
                  <span className="block truncate text-label text-ink-3">
                    {brand.genericName} · {brand.therapyAreas.join(", ")}
                  </span>
                </span>
                <span className="ml-auto shrink-0 rounded-glyph bg-ok-bg px-2 py-0.5 text-micro font-bold text-ok">
                  Grounded
                </span>
              </div>

              <label className="relative flex items-center">
                <Search className="absolute left-2.5 size-3.5 text-ink-4" />
                <input
                  type="search"
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder="Search brand name or molecule…"
                  className="w-full rounded-control border border-hair-2 bg-card py-2 pl-8 pr-2.5 text-body text-ink outline-none focus:border-brand"
                />
              </label>

              {brandQuery.trim() === "" ? (
                <p className="text-label text-ink-3">
                  Start typing to find a product. The catalogue is thousands of brands, so nothing is
                  listed until you ask for it.
                </p>
              ) : brandResults.length === 0 ? (
                <p className="text-label text-ink-3">Nothing matches that.</p>
              ) : (
                <div className="grid gap-1.5">
                  {brandResults.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, brandId: option.id }));
                        setBrandQuery("");
                      }}
                      className="flex cursor-pointer items-center gap-2.5 rounded-control border border-hair-2 bg-card p-2.5 text-left transition hover:border-brand"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-chip bg-tint text-caption font-[850] text-brand-deep">
                        {option.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body font-bold text-ink">{option.name}</span>
                        <span className="block truncate text-label text-ink-3">
                          {option.genericName} · {option.therapyAreas.join(", ")}
                        </span>
                      </span>
                      <ChevronDown className="ml-auto size-3.5 -rotate-90 text-ink-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-hair bg-canvas px-5 py-3">
          <span className="min-w-0 truncate text-label text-ink-3">
            {summary.brand} · {summary.audience} · {summary.topics} · {summary.frame}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-control px-3 py-1.5 text-body font-bold text-ink-3 transition hover:text-ink"
            >
              Cancel
            </button>
            <Button
              onClick={() => onSave(draft)}
              className="h-9 cursor-pointer rounded-control bg-brand px-5 text-body font-bold text-white hover:bg-brand-deep"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
