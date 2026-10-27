"use client";

import { useState } from "react";
import { FileText, Pause, Play, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { playOriginal, playVoicePreview, stopVoicePreview } from "@/features/content-library/voices-store";
import { voiceLanguage, type Voice, type VoiceGender, type VoiceStyle } from "@/features/content-library/voices-data";
import { FieldLabel, FormSection, GenderSwitch, LanguageSelect, StyleSelect } from "@/features/content-library/voice-form-parts";

/**
 * Editing a voice's details: what it's called and how it's tagged.
 *
 * The recording and the consent are not editable here. A different recording
 * is a different voice — clone it again — and the consent is a record of what
 * was confirmed when it was made, shown so it can be checked, never rewritten.
 */
export function VoiceEditModal({ voice, onCancel, onSave }: { voice: Voice; onCancel: () => void; onSave: (patch: Partial<Voice>) => void }) {
  const [name, setName] = useState(voice.name);
  const [languageId, setLanguageId] = useState(voice.languageId);
  const [gender, setGender] = useState<VoiceGender>(voice.gender);
  const [accent, setAccent] = useState(voice.accent);
  const [style, setStyle] = useState<VoiceStyle>(voice.style);
  const [description, setDescription] = useState(voice.description ?? "");
  const consent = voice.consent;
  const [playing, setPlaying] = useState<"source" | "clone" | null>(null);
  const play = (which: "source" | "clone") => {
    if (playing === which) {
      stopVoicePreview();
      setPlaying(null);
      return;
    }
    setPlaying(which);
    const done = () => setPlaying((p) => (p === which ? null : p));
    if (which === "source") playOriginal(voice, done);
    else playVoicePreview(voice, done);
  };
  const close = () => {
    stopVoicePreview();
    onCancel();
  };

  return (
    <Modal
      open
      onClose={close}
      title="Edit voice"
      description="Change how it's named and tagged. To change the recording, clone it again."
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim(), languageId, gender, accent: accent.trim() || voiceLanguage(languageId).accent, style, description: description.trim() || undefined })}
            className="px-5 font-bold"
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* The recording it came from and what it became, to compare at any time. */}
        {voice.source === "team" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              { id: "source" as const, title: "Original recording", sub: voice.sampleUrl ? `${voice.seconds ?? "—"} sec · ${voice.method}` : `${voice.seconds ?? "—"} sec · kept with the voice`, disabled: !voice.sampleUrl },
              { id: "clone" as const, title: "Cloned voice", sub: voice.similarity ? `Sounds ${voice.similarity}% like the recording` : "Reads its preview line", disabled: false },
            ]).map((card) => (
              <div key={card.id} className={cn("flex items-center gap-3 rounded-control border p-3", card.id === "clone" ? "border-brand/30 bg-tint" : "border-hair-2")}>
                <button
                  type="button"
                  onClick={() => play(card.id)}
                  disabled={card.disabled}
                  aria-label={playing === card.id ? `Stop ${card.title.toLowerCase()}` : `Play ${card.title.toLowerCase()}`}
                  className={cn("grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-white transition hover:scale-105 disabled:cursor-default disabled:opacity-40", card.id === "clone" ? "bg-brand" : "bg-ok")}
                >
                  {playing === card.id ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
                </button>
                <span className="min-w-0">
                  <span className="block text-body font-bold text-ink">{card.title}</span>
                  <span className="block truncate text-caption text-ink-3">{card.sub}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        <FormSection title="Name and description">
          <div>
            <FieldLabel label="Name" />
            <Field value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <FieldLabel label="Description" optional />
            <Field multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </FormSection>
        <FormSection title="How it's tagged" hint="Projects filter voices by these">
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <div>
              <FieldLabel label="Language" />
              <LanguageSelect value={languageId} onChange={setLanguageId} />
            </div>
            <div>
              <FieldLabel label="Voice" />
              <GenderSwitch value={gender} onChange={setGender} />
            </div>
            <div>
              <FieldLabel label="Accent" />
              <Field value={accent} onChange={(e) => setAccent(e.target.value)} />
            </div>
            <div>
              <FieldLabel label="Style" />
              <StyleSelect value={style} onChange={setStyle} />
            </div>
          </div>
        </FormSection>

        {consent && (
          <div className="space-y-1.5 rounded-control border border-ok-line bg-ok-bg px-3.5 py-3">
            <div className="flex items-center gap-1.5 text-label font-bold text-ok">
              <ShieldCheck className="size-3.5" />
              {consent.whose === "own" ? `${consent.confirmedBy}'s own voice` : `${consent.person}'s voice, with signed consent`}
            </div>
            <p className="text-caption text-ink-2">
              Confirmed by {consent.confirmedBy} · {consent.confirmedOn}
              {voice.seconds ? ` · cloned from ${voice.seconds} seconds ${voice.method === "recorded" ? "recorded" : "uploaded"}` : ""}
            </p>
            {consent.file && (
              <span className="inline-flex items-center gap-1.5 rounded-chip border border-ok-line bg-card px-2 py-0.5 text-caption font-semibold text-ink-2">
                <FileText className="size-3" />
                {consent.file}
              </span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
