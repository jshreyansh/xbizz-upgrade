"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, Globe2, Mic, Mic2, Music2, Pause, Play, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { LibraryModalGoTo, LibraryModalHeader } from "@/components/patterns/library-modal";
import { cn } from "@/lib/cn";
import { PRESENTERS as presenters } from "@/features/workspace/presenters";
import { ChoiceGroup, DecisionRow } from "@/features/workspace/plan-decisions";
import { voiceLanguage, type Voice } from "@/features/content-library/voices-data";
import { playVoicePreview, stopVoicePreview, useVoicesStore } from "@/features/content-library/voices-store";
import { VoiceCloneModal } from "@/features/content-library/voice-clone-modal";

/**
 * Character, voice and sound: who appears, who narrates and what plays under it.
 *
 * Shared by the Video plan and the Ads plan (when the campaign makes video),
 * so both ask it the same way: two suggested characters and the Character
 * Library, then language, voice and background music, each previewable.
 */

export function AudioChoices({
  label,
  value,
  options,
  onChange,
  previewing,
  onPreview,
  onOpenLibrary,
  onUpload,
  uploadedName,
  music = false,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  previewing?: string | null;
  onPreview?: (option: string) => void;
  onOpenLibrary?: () => void;
  /** Music only: opens the file picker for a track the team owns. */
  onUpload?: () => void;
  /** Which row in the list is that track, so it can say where it came from. */
  uploadedName?: string;
  music?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-body-lg font-semibold text-ink-3">{label}</span>
        {onOpenLibrary && (
          <button
            type="button"
            onClick={onOpenLibrary}
            className="text-body font-bold text-brand hover:underline cursor-pointer"
          >
            Voice Library →
          </button>
        )}
      </div>
      <div className="mt-2.5 space-y-2">
        {options.map((option) => {
          const base = option.split("·")[0].trim();
          const active = value === option || value === base;
          const isPlaying = previewing === option || previewing === base;
          return (
            <div
              key={option}
              className={cn(
                "flex items-center justify-between rounded-control border p-2.5 transition",
                active ? "border-hair-3 bg-subtle" : "border-hair-2"
              )}
            >
              <button
                type="button"
                onClick={() => onChange(base)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-body-lg font-medium text-ink cursor-pointer"
              >
                <span className="truncate">{option}</span>
                {uploadedName === option && (
                  <span className="shrink-0 rounded-chip bg-tint px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wide text-brand-deep">
                    Your track
                  </span>
                )}
              </button>
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(base)}
                  className={cn("size-8 p-0 rounded-full", isPlaying && "text-brand")}
                  aria-label="Preview"
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                </Button>
              )}
            </div>
          );
        })}

        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-dashed border-hair-3 p-2.5 text-body font-bold text-ink-3 transition hover:border-brand hover:bg-tint hover:text-brand-deep"
          >
            <Upload className="size-3.5" />
            {uploadedName ? "Replace with another track" : "Use your own track"}
          </button>
        )}
      </div>
    </div>
  );
}


export function FacePhoto({ person, className }: { person: (typeof presenters)[number]; className: string }) {
  return <img src={person.image} alt={person.name} className={cn("object-cover", className)} />;
}

export function CharacterLibrary({
  selected,
  onSelect,
  onClose,
  onGoToLibrary,
  multiple = false,
  title = "Choose characters for your video",
}: {
  /** One name, or several when `multiple`. */
  selected: string | string[];
  /** Picks one (the caller closes), or toggles one when `multiple`. */
  onSelect: (name: string) => void;
  onClose: () => void;
  /** The full shelf lives on its own page — this modal is a shortlist. */
  onGoToLibrary: () => void;
  /** Characters in a story are several; the presenter is one. */
  multiple?: boolean;
  title?: string;
}) {
  const picked = Array.isArray(selected) ? selected : selected ? [selected] : [];
  return (
    <Portal>
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[680px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
        <LibraryModalHeader title={title} onClose={onClose} />
        <div className="max-h-[460px] overflow-y-auto grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
          {presenters.map((person) => {
            const active = picked.includes(person.name);
            return (
              <button
                key={person.name}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(person.name)}
                className={cn(
                  "flex items-center gap-3 rounded-panel border p-3 text-left transition hover:-translate-y-px hover:shadow-sm cursor-pointer",
                  active ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 hover:border-hair-3"
                )}
              >
                <FacePhoto person={person} className="size-14 rounded-control" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-lg font-bold text-ink">{person.name}</span>
                  <span className="mt-0.5 block text-body leading-4 text-ink-3">{person.role}</span>
                </span>
                {multiple ? (
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-glyph border", active ? "border-brand bg-brand text-white" : "border-hair-3 bg-card")}>
                    {active && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                ) : (
                  active && <Check className="size-4 text-brand shrink-0" strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
        {multiple ? (
          <div className="flex items-center justify-between gap-3 border-t border-hair px-4 py-3 sm:px-6">
            <LibraryModalGoTo label="Go to Character Library" onClick={onGoToLibrary} />
            <Button onClick={onClose} className="shrink-0 px-5 font-bold">
              Done{picked.length ? ` · ${picked.length} selected` : ""}
            </Button>
          </div>
        ) : (
          <LibraryModalGoTo label="Go to Character Library" onClick={onGoToLibrary} />
        )}
      </div>
    </div>
    </Portal>
  );
}

/* ── Who is on screen: a presenter, and the characters in the story ── */

export type CastTreatment = "narrated" | "presenter";

/** "Presenter: Dr. Maya Kapoor · 2 characters", or "No characters" — for a section's summary. */
export function castSummary(treatment: CastTreatment, presenter: string, characters: string[]) {
  const people = characters.length ? `${characters.length} ${characters.length === 1 ? "character" : "characters"}` : "No characters";
  if (treatment === "presenter") return `${presenter ? `Presenter: ${presenter}` : "Choose a presenter"}${characters.length ? ` · ${people}` : ""}`;
  return people;
}

/**
 * Two lanes. Characters are everyone who can appear in the story — a patient,
 * a physician, a caregiver — so they are several, and always optional: a
 * narrated story can be visuals and voice alone. A presenter-led video adds a
 * second lane above it: the one person who speaks to camera, required. The
 * presenter may also appear in the story as a character.
 */
export function CastLanes({
  treatment,
  presenter,
  onPresenter,
  characters,
  onCharacters,
  onGoTo,
}: {
  treatment: CastTreatment;
  presenter: string;
  onPresenter: (name: string) => void;
  characters: string[];
  onCharacters: (names: string[]) => void;
  onGoTo: (href: string, label: string) => void;
}) {
  const [library, setLibrary] = useState<"presenter" | "characters" | null>(null);
  const toggleCharacter = (name: string) => onCharacters(characters.includes(name) ? characters.filter((n) => n !== name) : [...characters, name]);
  const suggested = presenters.slice(0, 3);
  /* Picked from the library, beyond the suggestions shown as tiles. */
  const extra = characters.filter((n) => !suggested.some((p) => p.name === n));

  const tile = (person: (typeof presenters)[number], on: boolean, onClick: () => void, multi: boolean) => (
    <button
      key={person.name}
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "focus-ring flex min-h-[64px] cursor-pointer items-center gap-3 rounded-control border p-3 text-left transition-all duration-200 hover:-translate-y-0.5",
        on ? "border-brand bg-tint text-brand-deep shadow-xs ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
      )}
    >
      <FacePhoto person={person} className="size-10 shrink-0 rounded-full shadow-xs ring-2 ring-white" />
      <div className="min-w-0 flex-1">
        <span className="block truncate text-body-lg font-bold">{person.name}</span>
        <span className="block truncate text-label font-normal text-ink-3">{person.role}</span>
      </div>
      {multi ? (
        <span className={cn("grid size-5 shrink-0 place-items-center rounded-glyph border", on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card")}>
          {on && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      ) : (
        on && <Check className="size-4 shrink-0 text-brand" strokeWidth={3} />
      )}
    </button>
  );
  const libraryTile = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring flex min-h-[64px] cursor-pointer items-center gap-2.5 rounded-control border border-dashed border-hair-3 bg-card p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-canvas"
    >
      <span className="flex -space-x-2.5">
        {presenters.slice(3).map((person) => (
          <FacePhoto key={person.name} person={person} className="size-8 rounded-full border-2 border-white shadow-2xs" />
        ))}
      </span>
      <span className="ml-1 text-body-lg font-semibold text-ink-2">{label}</span>
      <ArrowRight className="ml-auto size-4 text-ink-3" />
    </button>
  );
  const laneHead = (title: string, tag: string, required: boolean, hint: string) => (
    <div className="mb-2.5">
      <div className="flex items-center gap-2">
        <span className="text-body-lg font-bold text-ink">{title}</span>
        <span className={cn("rounded-chip px-2 py-0.5 text-micro font-bold", required ? "bg-warn-bg text-warn" : "bg-subtle text-ink-3")}>{tag}</span>
      </div>
      <p className="mt-0.5 text-label text-ink-3">{hint}</p>
    </div>
  );

  return (
    <div className="mb-4 space-y-5">
      {treatment === "presenter" && (
        <div>
          {laneHead("Presenter", presenter ? "Required · chosen" : "Required", !presenter, "The one person who speaks to camera and delivers the story.")}
          <div className="grid gap-2.5 sm:grid-cols-3">
            {presenters.slice(0, 2).map((person) => tile(person, presenter === person.name, () => onPresenter(person.name), false))}
            {presenter && !presenters.slice(0, 2).some((p) => p.name === presenter)
              ? tile(presenters.find((p) => p.name === presenter) ?? presenters[0], true, () => setLibrary("presenter"), false)
              : libraryTile("Choose from library", () => setLibrary("presenter"))}
          </div>
        </div>
      )}

      <div>
        {laneHead(
          "Characters in the story",
          characters.length ? `Optional · ${characters.length} selected` : "Optional",
          false,
          treatment === "presenter" ? "Anyone else who appears in the scenes. Choose as many as you need." : "Everyone who can appear in the story. Choose as many as you need, or none."
        )}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {suggested.map((person) => tile(person, characters.includes(person.name), () => toggleCharacter(person.name), true))}
          {libraryTile(extra.length ? `Library · ${extra.length} more` : "Character Library", () => setLibrary("characters"))}
        </div>
        {extra.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {extra.map((name) => {
              const person = presenters.find((p) => p.name === name);
              return (
                <span key={name} className="inline-flex items-center gap-1.5 rounded-chip border border-brand/30 bg-tint py-0.5 pl-0.5 pr-1.5 text-label font-semibold text-brand-deep">
                  {person && <FacePhoto person={person} className="size-5 rounded-full" />}
                  {name}
                  <button type="button" aria-label={`Remove ${name}`} onClick={() => toggleCharacter(name)} className="cursor-pointer text-ink-3 hover:text-ink">
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {library === "presenter" && (
        <CharacterLibrary
          title="Choose a presenter"
          selected={presenter}
          onSelect={(name) => {
            onPresenter(name);
            setLibrary(null);
          }}
          onClose={() => setLibrary(null)}
          onGoToLibrary={() => onGoTo("/content-library/characters", "the Character Library")}
        />
      )}
      {library === "characters" && (
        <CharacterLibrary
          multiple
          title="Choose characters for the story"
          selected={characters}
          onSelect={toggleCharacter}
          onClose={() => setLibrary(null)}
          onGoToLibrary={() => onGoTo("/content-library/characters", "the Character Library")}
        />
      )}
    </div>
  );
}

/**
 * The narrator picker: the team's own voices first, then SwishX's, and a way
 * to clone a new one without leaving the project. A voice cloned here is
 * saved to the Voices library and selected for this project in one go.
 */
export function VoiceLibrary({
  selected,
  onSelect,
  onClose,
  onGoToLibrary,
}: {
  selected: string;
  onSelect: (name: string) => void;
  onClose: () => void;
  /** Kept for callers that preview through their own player; this modal plays voices itself. */
  previewing?: string | null;
  onPreview?: (name: string) => void;
  /** The full shelf lives on its own page — this modal is a shortlist. */
  onGoToLibrary: () => void;
}) {
  const voices = useVoicesStore((s) => s.voices);
  const addVoice = useVoicesStore((s) => s.add);
  const [playing, setPlaying] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);
  const team = voices.filter((v) => v.source === "team" && !v.archived);
  const stock = voices.filter((v) => v.source === "swishx");

  const play = (voice: Voice) => {
    if (playing === voice.id) {
      stopVoicePreview();
      setPlaying(null);
      return;
    }
    setPlaying(voice.id);
    playVoicePreview(voice, () => setPlaying((p) => (p === voice.id ? null : p)));
  };
  const close = () => {
    stopVoicePreview();
    onClose();
  };

  const row = (v: Voice) => {
    const active = selected === v.name || selected.split(" · ")[0] === v.name;
    const isPlaying = playing === v.id;
    return (
      <div key={v.id} className={cn("flex items-center justify-between gap-3 rounded-control border p-3 transition", active ? "border-brand bg-tint" : "border-hair-2")}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-body-lg font-bold text-ink">{v.name}</span>
            <span className="rounded-chip border border-tint-line bg-card px-2 py-0.5 text-caption font-bold text-brand-deep">{voiceLanguage(v.languageId).label}</span>
            <span className="rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">{v.gender}</span>
            {v.consent && <ShieldCheck className="size-3.5 text-ok" aria-label="Consent on file" />}
          </div>
          <span className="mt-0.5 block truncate text-body text-ink-3">
            {v.accent} · {v.style}
            {v.description ? ` · ${v.description}` : ""}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => play(v)} aria-label={isPlaying ? `Stop ${v.name}` : `Play ${v.name}`}>
            {isPlaying ? <Pause className="size-4 text-brand" /> : <Play className="size-4" />}
          </Button>
          <Button size="sm" variant={active ? "primary" : "secondary"} onClick={() => onSelect(v.name)}>
            {active ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Portal>
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[620px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
        <LibraryModalHeader title="Select narrator voice" onClose={close} />
        <div className="max-h-[480px] space-y-4 overflow-y-auto p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setCloning(true)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-control border border-dashed border-brand/40 bg-tint p-3 text-left transition hover:border-brand"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-white">
              <Mic className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-body-lg font-bold text-brand-deep">Clone a new voice</span>
              <span className="block text-body text-ink-3">Record with a teleprompter or upload a clip. Saved to Voices and used here.</span>
            </span>
          </button>
          {team.length > 0 && (
            <div className="space-y-2">
              <div className="text-caption font-bold uppercase tracking-wider text-ink-3">Your team&apos;s voices</div>
              {team.map(row)}
            </div>
          )}
          <div className="space-y-2">
            <div className="text-caption font-bold uppercase tracking-wider text-ink-3">SwishX voices</div>
            {stock.map(row)}
          </div>
        </div>
        <LibraryModalGoTo label="Go to Voice Library" onClick={onGoToLibrary} />
      </div>
    </div>
    {cloning && (
      <VoiceCloneModal
        saveLabel="Save and use"
        onCancel={() => setCloning(false)}
        onSave={(voice) => {
          addVoice(voice);
          setCloning(false);
          onSelect(voice.name);
        }}
      />
    )}
    </Portal>
  );
}


export function stopAudioPreview() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function playMusicTone(label: string) {
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
    // Ignore audio autoplay restrictions
  }
}


const MUSIC = ["No music", "Calm clinical", "Warm", "Uplifting"];
const VOICES = ["Rohan · clear and measured", "Riya · friendly and clear", "Dev · warm and conversational"];

/** The whole section's fields, holding their own previews and library pickers. */
export function CharacterVoiceSoundFields({
  treatment,
  onTreatment,
  presenter,
  onPresenter,
  characters,
  onCharacters,
  language,
  onLanguage,
  voice,
  onVoice,
  music,
  onMusic,
  brandName,
  onGoTo,
}: {
  treatment: CastTreatment;
  /** When given, the section asks how the video is told (the Ads plan has no treatment step). */
  onTreatment?: (next: CastTreatment) => void;
  presenter: string;
  onPresenter: (name: string) => void;
  characters: string[];
  onCharacters: (names: string[]) => void;
  language: string;
  onLanguage: (next: string) => void;
  voice: string;
  onVoice: (next: string) => void;
  music: string;
  onMusic: (next: string) => void;
  brandName: string;
  /** Leave for a library page, through the project's save-or-discard. */
  onGoTo: (href: string, label: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [voices, setVoices] = useState(false);
  const [customMusic, setCustomMusic] = useState<{ name: string; url: string } | null>(null);
  const musicRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLAudioElement | null>(null);
  const musicOptions = [...MUSIC, ...(customMusic ? [customMusic.name] : [])];

  const preview = (kind: "voice" | "music", label: string) => {
    stopAudioPreview();
    trackRef.current?.pause();
    if (previewing === label) {
      setPreviewing(null);
      return;
    }
    setPreviewing(label);
    if (kind === "music" && customMusic && label === customMusic.name) {
      const node = trackRef.current ?? new Audio();
      trackRef.current = node;
      node.src = customMusic.url;
      node.onended = () => setPreviewing(null);
      void node.play().catch(() => setPreviewing(null));
      return;
    }
    if (kind === "voice" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${brandName}: approved evidence, told clearly.`);
      utterance.onend = () => setPreviewing(null);
      window.speechSynthesis.speak(utterance);
    } else {
      playMusicTone(label);
      window.setTimeout(() => setPreviewing(null), 2200);
    }
  };

  return (
    <>
      {onTreatment && (
        <div className="mb-5">
          <div className="mb-2.5 text-body-lg font-bold text-ink">How is the video told?</div>
          <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="How the video is told">
            {([
              { id: "narrated" as const, title: "Narrated visual story", blurb: "A voiceover over branded scenes. Characters appear in the story." },
              { id: "presenter" as const, title: "Presenter-led", blurb: "A doctor or approved presenter speaks to camera, with characters in the scenes." },
            ]).map((t) => {
              const on = treatment === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onTreatment(t.id)}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-3 rounded-control border p-3.5 text-left transition",
                    on ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-brand/50"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-body-lg font-bold text-ink">{t.title}</span>
                    <span className="mt-0.5 block text-label leading-snug text-ink-3">{t.blurb}</span>
                  </span>
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card")}>
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <CastLanes treatment={treatment} presenter={presenter} onPresenter={onPresenter} characters={characters} onCharacters={onCharacters} onGoTo={onGoTo} />
      <div className="space-y-2">
        <DecisionRow label="Language" value={language} icon={<Globe2 className="size-4" />} editing={editing === "language"} onEdit={() => setEditing(editing === "language" ? null : "language")}>
          <ChoiceGroup
            label="Choose a language"
            value={language}
            onChange={(next) => {
              onLanguage(next);
              setEditing(null);
            }}
            options={["English", "Hindi", "Spanish", "French", "German"]}
            icon={() => <Globe2 className="size-4" />}
          />
        </DecisionRow>
        <DecisionRow
          label="Voice"
          value={voice}
          icon={<Mic2 className="size-4" />}
          editing={editing === "voice"}
          onEdit={() => setEditing(editing === "voice" ? null : "voice")}
          onPreview={() => preview("voice", voice)}
          playing={previewing === voice}
        >
          <AudioChoices
            label="Choose and preview a voice"
            value={voice}
            options={VOICES}
            onChange={(next) => {
              onVoice(next);
              setEditing(null);
            }}
            previewing={previewing}
            onPreview={(option) => preview("voice", option)}
            onOpenLibrary={() => setVoices(true)}
          />
        </DecisionRow>
        <DecisionRow
          label="Background music"
          value={music}
          icon={<Music2 className="size-4" />}
          editing={editing === "music"}
          onEdit={() => setEditing(editing === "music" ? null : "music")}
          onPreview={music === "No music" ? undefined : () => preview("music", music)}
          playing={previewing === music}
        >
          <AudioChoices
            label="Choose and preview music"
            value={music}
            options={musicOptions}
            onChange={(next) => {
              onMusic(next);
              setEditing(null);
            }}
            previewing={previewing}
            onPreview={(option) => preview("music", option)}
            onUpload={() => musicRef.current?.click()}
            uploadedName={customMusic?.name}
            music
          />
        </DecisionRow>
      </div>
      <input
        ref={musicRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (customMusic) URL.revokeObjectURL(customMusic.url);
          const track = { name: file.name, url: URL.createObjectURL(file) };
          setCustomMusic(track);
          onMusic(track.name);
          setEditing(null);
        }}
      />
      {voices && (
        <VoiceLibrary
          selected={voice}
          onSelect={(name) => {
            onVoice(name);
            setVoices(false);
          }}
          onClose={() => setVoices(false)}
          previewing={previewing}
          onPreview={(name) => preview("voice", name)}
          onGoToLibrary={() => onGoTo("/content-library/voices", "the Voice Library")}
        />
      )}
    </>
  );
}
