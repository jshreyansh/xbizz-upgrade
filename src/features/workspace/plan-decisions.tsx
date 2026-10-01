"use client";

import { useRef, useState } from "react";
import { Check, Minus, Pause, Plus, Stamp, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LOGO_CORNERS } from "@/features/workspace/logo-watermark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { INITIAL_HCP_SPECIALITIES } from "@/features/workspace/brand-modal-data";
import type { Audience } from "@/types/content";

/**
 * The pieces every "Need your input" section is built from, in the video
 * plan and the document plan alike.
 *
 * The shape is progressive: a decision shows as one quiet row — what it is,
 * what it is set to, Change — and opens to its choices only when asked.
 * The two plans used to diverge here, the video plan in rows and the
 * document plan with every option card open at once, so the same question
 * looked like two different products depending on what you were making.
 */

/** Who an asset can be for. One list for every plan, and the brief modal's order. */
export const AUDIENCE_OPTIONS: Audience[] = ["HCP", "Patient", "Field team", "Hospital", "Distributor", "Consumer"];

/** The specialities an HCP asset can narrow to — the same list the brief modal offers. */
export const HCP_SPECIALITIES = INITIAL_HCP_SPECIALITIES;

/** "Any specialty", one, or "Dermatologist +2". */
export function specialityLabel(picked: string[]) {
  if (picked.length === 0) return "Any specialty";
  return picked.length === 1 ? picked[0] : `${picked[0]} +${picked.length - 1}`;
}

/** One decision: a quiet row until Change opens its choices. */
export function DecisionRow({
  label,
  value,
  icon,
  editing,
  onEdit,
  onPreview,
  playing = false,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  editing: boolean;
  onEdit: () => void;
  onPreview?: () => void;
  playing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "squircle-panel overflow-hidden border transition-[opacity,border-color,box-shadow,background-color] duration-300 ease-entrance rounded-control",
        editing
          ? "border-hair-3 bg-[#fbfdfc] opacity-100 shadow-soft"
          : "border-hair bg-card opacity-75 hover:opacity-100"
      )}
    >
      <div className="flex min-h-[58px] items-center gap-3 px-3.5">
        <span className="squircle-control grid size-8 shrink-0 place-items-center rounded-chip bg-[#edf3ef] text-brand">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-label font-medium text-ink-3">{label}</span>
          <span className="mt-0.5 block truncate text-body-lg font-medium">{value}</span>
        </span>
        <div className="flex items-center gap-1.5">
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreview}
              className={cn("size-8 p-0 rounded-full", playing && "text-brand")}
              aria-label="Preview sound"
            >
              {playing ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit} className="text-body font-semibold text-brand">
            {editing ? "Close" : "Change"}
          </Button>
        </div>
      </div>
      {editing && <div className="border-t border-hair bg-card p-3.5">{children}</div>}
    </div>
  );
}

/** Pick one, from a two-column list with a glyph each. */
export function ChoiceGroup({
  label,
  value,
  options,
  onChange,
  icon,
  hint,
  className,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  icon: (value: string) => React.ReactNode;
  /** A line under an option, where its name alone does not say enough. */
  hint?: (value: string) => string | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-body-lg font-semibold text-ink-3">{label}</div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option;
          const sub = hint?.(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "focus-ring flex min-h-[50px] items-center gap-2.5 rounded-control border p-2.5 text-left text-body-lg font-medium transition cursor-pointer",
                active ? "border-hair-3 bg-subtle text-brand font-semibold shadow-2xs" : "border-hair-2 hover:border-hair-3"
              )}
            >
              <span className="grid size-6 place-items-center text-current">{icon(option)}</span>
              <span className="min-w-0 flex-1">
                <span className="block">{option}</span>
                {sub && <span className="block text-label font-normal text-ink-3">{sub}</span>}
              </span>
              {active && <Check className="size-3.5 text-brand shrink-0" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Pick any number, as chips, closed with Done. */
export function ChipChoices({
  label,
  options,
  values,
  onToggle,
  onDone,
  footnote,
}: {
  label: string;
  options: readonly string[];
  values: string[];
  onToggle: (value: string) => void;
  onDone: () => void;
  footnote?: string;
}) {
  return (
    <div>
      <div className="text-body-lg font-semibold text-ink-3">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              aria-pressed={active}
              className={cn(
                "focus-ring min-h-10 rounded-control border px-3 text-body-lg font-medium transition cursor-pointer",
                active ? "border-hair-3 bg-subtle text-brand" : "border-hair-2 hover:border-hair-3"
              )}
            >
              {active && <Check className="mr-1.5 inline size-3.5" />}
              {option}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-label text-ink-3">{footnote}</span>
        <Button size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

/** A document's budget per page — what the plan quotes and the editor charges against. */
export const DOC_CREDITS_PER_PAGE = 300;

/** "One page", "4 pages". */
export function pageCountLabel(count: number) {
  return count === 1 ? "One page" : `${count} pages`;
}

/** What a page count gets you, in the words a marketer plans a piece in. */
function pageCountHint(count: number) {
  if (count === 1) return "A single concise surface";
  if (count === 2) return "A front summary and a back evidence spread";
  if (count <= 4) return "A short detail aid: summary, evidence, safety";
  if (count <= 8) return "A full detail aid, a page per message";
  return "A long-form piece, closer to a brochure";
}

/**
 * A count, stepped: − the number +.
 *
 * The familiar control for a quantity — the one a print dialog uses — and
 * one row however high the ceiling goes.
 */
export function CountChoices({
  label,
  value,
  min = 1,
  max,
  onChange,
  costPerUnit,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  /** Credits each one costs, so the total is in view as you step. */
  costPerUnit?: number;
}) {
  const step = (by: number) => onChange(Math.min(max, Math.max(min, value + by)));
  const stepButton =
    "focus-ring grid size-10 cursor-pointer place-items-center text-ink-2 transition hover:bg-subtle hover:text-brand disabled:cursor-not-allowed disabled:text-ink-4 disabled:hover:bg-transparent";
  return (
    <div>
      <div className="text-body-lg font-semibold text-ink-3">{label}</div>
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center overflow-hidden rounded-control border border-hair-2 bg-card shadow-2xs">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={value <= min}
            aria-label="One fewer"
            className={stepButton}
          >
            <Minus className="size-4" />
          </button>
          <span
            aria-live="polite"
            className="grid h-10 min-w-12 place-items-center border-x border-hair-2 px-2 text-subhead font-bold tabular-nums text-ink"
          >
            {value}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={value >= max}
            aria-label="One more"
            className={stepButton}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <span className="min-w-0 text-body text-ink-2">
          <span className="font-semibold text-ink">{pageCountLabel(value)}</span> · {pageCountHint(value)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-label tabular-nums text-ink-3">
        <span>
          {min} to {max} pages
        </span>
        {costPerUnit !== undefined && (
          <span>
            {costPerUnit} credits a page · {(value * costPerUnit).toLocaleString()} total
          </span>
        )}
      </div>
    </div>
  );
}

/** The shape of an output, drawn — landscape, portrait, square, a page. */
export function FrameGlyph({ value }: { value: string }) {
  if (value.includes("9:16") || value.includes("Vertical")) return <span className="inline-block h-5 w-3 rounded-[2px] border-2 border-current" />;
  if (value.includes("1:1") || value.includes("Square")) return <span className="inline-block size-4 rounded-[2px] border-2 border-current" />;
  if (value.includes("3:4") || value.includes("Portrait")) return <span className="inline-block h-5 w-[15px] rounded-[2px] border-2 border-current" />;
  if (value.includes("A4")) return <span className="inline-block h-5 w-3.5 rounded-[2px] border-2 border-current" />;
  return <span className="inline-block h-3.5 w-5 rounded-[2px] border-2 border-current" />;
}

/** Pick one shape, each drawn above its name. */
export function FormatChoices({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  hint?: (value: string) => string | undefined;
}) {
  return (
    <div>
      <div className="text-body-lg font-semibold text-ink-3">{label}</div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const active = value === option;
          const sub = hint?.(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "focus-ring flex flex-col items-center justify-center gap-1.5 rounded-control border py-3 px-2 text-center text-body-lg font-medium transition cursor-pointer",
                active ? "border-hair-3 bg-subtle text-brand font-bold shadow-2xs" : "border-hair-2 hover:border-hair-3"
              )}
            >
              <FrameGlyph value={option} />
              <span>{option}</span>
              {sub && <span className="text-label font-normal text-ink-3">{sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The brand mark, as both plans ask about it: the artwork, and its corner.
 * The corner is a decision row like every other, closed until changed.
 */
export function BrandMarkContent({ unit }: { unit: "scene" | "page" }) {
  const logoMark = useWorkspaceStore((s) => s.logoMark);
  const setLogoMark = useWorkspaceStore((s) => s.setLogoMark);
  const [editing, setEditing] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const corner = LOGO_CORNERS.find((c) => c.id === logoMark.position) ?? LOGO_CORNERS[0];

  return (
    <div className="space-y-2">
      {/* The artwork, and the one thing you can do to it */}
      <div className="flex flex-wrap items-center gap-3 rounded-control border border-hair bg-card p-3">
        <span className="grid h-11 w-[112px] shrink-0 place-items-center rounded-control border border-hair-2 bg-card">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-4 rounded-[3px] bg-[linear-gradient(135deg,#fd4816_0%,#b82f0c_100%)]" />
            <span className="text-body font-[850] tracking-tight text-ink">Meridian</span>
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-body font-bold text-ink">{logoMark.name}</div>
          <p className="mt-0.5 text-label text-ink-3">
            {logoMark.source === "brand-kit"
              ? "Pulled from your brand kit. Size and clear space follow the kit's rule, shown, not set."
              : "Uploaded for this project. Check it against the brand kit before publishing."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="focus-ring shrink-0 cursor-pointer rounded-chip border border-hair-2 bg-card px-3 py-1.5 text-label font-bold text-ink-2 transition hover:border-brand hover:text-brand"
        >
          Replace
        </button>
        {logoMark.source === "custom" && (
          <button
            type="button"
            onClick={() => setLogoMark({ source: "brand-kit", name: "Meridian Therapeutics · primary mark" })}
            className="shrink-0 cursor-pointer text-label font-bold text-brand hover:underline"
          >
            Use brand kit
          </button>
        )}
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setLogoMark({ source: "custom", name: file.name });
            e.target.value = "";
          }}
        />
      </div>

      <DecisionRow
        label="Placement"
        value={corner.label}
        icon={<Stamp className="size-4" />}
        editing={editing}
        onEdit={() => setEditing((v) => !v)}
      >
        <div className="text-body-lg font-semibold text-ink-3">Where the mark sits</div>
        <p className="mt-0.5 text-label text-ink-3">
          Every {unit} keeps this corner clear, so the logo never lands on a claim or its citation.
        </p>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {LOGO_CORNERS.map((option) => {
            const active = logoMark.position === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setLogoMark({ position: option.id });
                  setEditing(false);
                }}
                className={cn(
                  "focus-ring flex min-h-[50px] cursor-pointer items-center gap-2.5 rounded-control border p-2.5 text-left transition",
                  active ? "border-hair-3 bg-subtle shadow-2xs" : "border-hair-2 hover:border-hair-3"
                )}
              >
                {/* A frame with the mark in the corner it means */}
                <span className="relative h-7 w-11 shrink-0 overflow-hidden rounded-[4px] border border-hair-2 bg-[#101826]">
                  {option.id !== "none" && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute h-1.5 w-3.5 rounded-[2px] bg-white/85",
                        option.id === "top-left" && "left-1 top-1",
                        option.id === "top-right" && "right-1 top-1",
                        option.id === "bottom-left" && "bottom-1 left-1",
                        option.id === "bottom-right" && "bottom-1 right-1"
                      )}
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-body-lg font-medium", active && "font-semibold text-brand")}>
                    {option.label}
                  </span>
                  <span className="block text-label text-ink-3">{option.hint}</span>
                </span>
                {active && <Check className="size-3.5 shrink-0 text-brand" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </DecisionRow>
    </div>
  );
}
