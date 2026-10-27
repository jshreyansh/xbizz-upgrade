"use client";

import { useState } from "react";
import { Eye, FileText, Pause, Play, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { playOriginal, playVoicePreview, stopVoicePreview } from "@/features/content-library/voices-store";
import { voiceLanguage, type Voice, type VoiceGender, type VoiceStyle } from "@/features/content-library/voices-data";
import { DocPreviewModal, FieldLabel, GenderSwitch, LanguageSelect, StyleSelect } from "@/features/content-library/voice-form-parts";

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
  const [previewingDoc, setPreviewingDoc] = useState(false);
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
              { id: "source" as const, title: "Original recording", sub: `${voice.seconds ?? "—"} sec · ${voice.method ?? "recorded"}`, disabled: false },
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
        <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <FieldLabel label="Name" />
            <Field size="sm" className="h-9" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="sm:col-span-6">
            <FieldLabel label="Description" optional />
            <Field size="sm" className="h-9" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <FieldLabel label="Language" />
            <LanguageSelect value={languageId} onChange={setLanguageId} />
          </div>
          <div className="sm:col-span-3">
            <FieldLabel label="Voice" />
            <GenderSwitch value={gender} onChange={setGender} />
          </div>
          <div className="sm:col-span-3">
            <FieldLabel label="Accent" />
            <Field size="sm" className="h-9" value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <FieldLabel label="Style" />
            <StyleSelect value={style} onChange={setStyle} />
          </div>
        </div>

        {consent && (
          <div className="space-y-1.5 rounded-control border border-ok-line bg-ok-bg px-3.5 py-3">
            <div className="flex items-center gap-1.5 text-label font-bold text-ok">
              <ShieldCheck className="size-3.5" />
              {consent.whose === "own" ? `${consent.confirmedBy}'s own voice` : `${consent.person}'s voice, ${consent.file ? "with a signed consent form" : "consent confirmed"}`}
            </div>
            <p className="text-caption text-ink-2">
              Confirmed by {consent.confirmedBy} · {consent.confirmedOn}
              {voice.seconds ? ` · cloned from ${voice.seconds} seconds ${voice.method === "recorded" ? "recorded" : "uploaded"}` : ""}
            </p>
            {consent.file &&
              (consent.fileUrl ? (
                <button
                  type="button"
                  onClick={() => setPreviewingDoc(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-chip border border-ok-line bg-card px-2 py-0.5 text-caption font-semibold text-ink-2 transition hover:border-ok"
                >
                  <FileText className="size-3" />
                  {consent.file}
                  <Eye className="size-3 text-ok" />
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-chip border border-ok-line bg-card px-2 py-0.5 text-caption font-semibold text-ink-2">
                  <FileText className="size-3" />
                  {consent.file}
                </span>
              ))}
            {consent.whose === "other" && !consent.file && <p className="text-caption text-ink-4">No signed form attached.</p>}
          </div>
        )}
      </div>
      {previewingDoc && consent?.file && consent.fileUrl && (
        <DocPreviewModal doc={{ name: consent.file, url: consent.fileUrl, type: consent.fileType ?? "" }} onClose={() => setPreviewingDoc(false)} />
      )}
    </Modal>
  );
}
