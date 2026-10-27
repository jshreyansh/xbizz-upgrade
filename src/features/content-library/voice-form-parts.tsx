"use client";

import { Check } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import { SelectMenu } from "@/components/ui/select-menu";
import { Modal } from "@/components/ui/modal";
import { VOICE_GENDERS, VOICE_LANGUAGES, VOICE_STYLES, type VoiceGender, type VoiceStyle } from "@/features/content-library/voices-data";

/**
 * The pieces of a voice's form, shared by cloning and editing so the two
 * read as the same compact form: one small label row per field (with where
 * its value came from, when SwishX filled it in), the app's own dropdown
 * rather than the browser's, and every control one height (h-9).
 */

/** A field's label, with an optional note on where its value came from. */
export function FieldLabel({ label, optional, source }: { label: string; optional?: boolean; source?: { text: string; guessed?: boolean } }) {
  return (
    <div className="mb-1 flex min-h-4 items-center justify-between gap-2">
      <span className="text-caption font-semibold text-ink-2">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-4">optional</span>}
      </span>
      {source && (
        <span className={cn("inline-flex shrink-0 items-center gap-0.5 text-micro font-bold", source.guessed ? "text-brand-deep" : "text-ok")}>
          {source.guessed ? <LogoMark size={10} title="Filled in by SwishX" /> : <Check className="size-2.5" strokeWidth={3} />}
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
      triggerClassName="h-9 text-body"
      ariaLabel="Language"
      value={value}
      onChange={onChange}
      options={VOICE_LANGUAGES.map((l) => ({ value: l.id, label: l.label, hint: l.accent }))}
    />
  );
}

export function StyleSelect({ value, onChange }: { value: VoiceStyle; onChange: (style: VoiceStyle) => void }) {
  return <SelectMenu size="md" triggerClassName="h-9 text-body" ariaLabel="Style" value={value} onChange={(v) => onChange(v as VoiceStyle)} options={[...VOICE_STYLES]} />;
}

/** Female / Male / Neutral, the height of the fields beside it. */
export function GenderSwitch({ value, onChange }: { value: VoiceGender; onChange: (g: VoiceGender) => void }) {
  return (
    /* Concentric: the tab's radius is the shell's minus its padding and border
       (3px + 1px), so the selected tab's outline follows the shell's curve. */
    <div className="grid h-9 grid-cols-3 gap-0.5 border border-hair-2 bg-subtle p-[3px]" style={{ borderRadius: "var(--radius-control)" }} role="radiogroup" aria-label="Voice">
      {VOICE_GENDERS.map((g) => (
        <button
          key={g}
          type="button"
          role="radio"
          aria-checked={value === g}
          onClick={() => onChange(g)}
          title={g}
          style={{ borderRadius: "calc(var(--radius-control) - 4px)" }}
          className={cn("h-full cursor-pointer truncate px-1 text-caption font-bold transition", value === g ? "bg-card text-ink shadow-2xs" : "text-ink-3 hover:text-ink")}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

/** An attached document — a signed consent form — as the session holds it. */
export interface AttachedDoc {
  name: string;
  url: string;
  type: string;
}

/** The document itself, in place: an image shown, a PDF embedded, anything else named. */
export function DocPreviewModal({ doc, onClose }: { doc: AttachedDoc; onClose: () => void }) {
  const image = doc.type.startsWith("image/");
  const pdf = doc.type === "application/pdf" || doc.name.toLowerCase().endsWith(".pdf");
  return (
    <Modal open onClose={onClose} title={doc.name} description="Signed consent form, kept with the voice." size="lg">
      <div className="grid min-h-[320px] place-items-center overflow-hidden rounded-control border border-hair bg-subtle">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.url} alt={doc.name} className="max-h-[60vh] w-auto object-contain" />
        ) : pdf ? (
          <iframe src={doc.url} title={doc.name} className="h-[60vh] w-full bg-card" />
        ) : (
          <p className="p-8 text-center text-body text-ink-3">There&apos;s no preview for this kind of file. It&apos;s kept with the voice as uploaded.</p>
        )}
      </div>
    </Modal>
  );
}
