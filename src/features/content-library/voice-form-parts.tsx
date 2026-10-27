"use client";

import type { ReactNode } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { SelectMenu } from "@/components/ui/select-menu";
import { VOICE_GENDERS, VOICE_LANGUAGES, VOICE_STYLES, type VoiceGender, type VoiceStyle } from "@/features/content-library/voices-data";

/**
 * The pieces of a voice's form, shared by cloning and editing so the two
 * read as the same form: grouped sections, one label row per field (with
 * where its value came from, when SwishX filled it in), the app's own
 * dropdown rather than the browser's, and controls all one height.
 */

export function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2 border-b border-hair pb-2">
        <h3 className="text-caption font-bold uppercase tracking-wider text-ink-3">{title}</h3>
        {hint && <span className="text-caption text-ink-4">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

/** A field's label, with an optional note on where its value came from. */
export function FieldLabel({ label, optional, source }: { label: string; optional?: boolean; source?: { text: string; guessed?: boolean } }) {
  return (
    <div className="mb-1.5 flex min-h-5 items-center justify-between gap-2">
      <span className="text-label font-semibold text-ink-2">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-4">optional</span>}
      </span>
      {source && (
        <span className={cn("inline-flex items-center gap-1 text-caption font-semibold", source.guessed ? "text-brand-deep" : "text-ok")}>
          {source.guessed ? <Sparkles className="size-3" /> : <Check className="size-3" strokeWidth={3} />}
          {source.text}
        </span>
      )}
    </div>
  );
}

export function LanguageSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <SelectMenu
      size="md"
      ariaLabel="Language"
      value={value}
      onChange={onChange}
      options={VOICE_LANGUAGES.map((l) => ({ value: l.id, label: l.label, hint: l.accent }))}
    />
  );
}

export function StyleSelect({ value, onChange }: { value: VoiceStyle; onChange: (style: VoiceStyle) => void }) {
  return <SelectMenu size="md" ariaLabel="Style" value={value} onChange={(v) => onChange(v as VoiceStyle)} options={[...VOICE_STYLES]} />;
}

/** Female / Male / Neutral, the height of the fields beside it. */
export function GenderSwitch({ value, onChange }: { value: VoiceGender; onChange: (g: VoiceGender) => void }) {
  return (
    <div className="grid h-10 grid-cols-3 gap-1 rounded-control border border-hair-2 bg-subtle p-1" role="radiogroup" aria-label="Voice">
      {VOICE_GENDERS.map((g) => (
        <button
          key={g}
          type="button"
          role="radio"
          aria-checked={value === g}
          onClick={() => onChange(g)}
          className={cn("cursor-pointer rounded-glyph text-label font-bold transition", value === g ? "bg-card text-ink shadow-2xs" : "text-ink-3 hover:text-ink")}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
