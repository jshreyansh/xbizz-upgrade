"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, Globe2, Mic2, Music2, Pause, Play, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { LibraryModalGoTo, LibraryModalHeader } from "@/components/patterns/library-modal";
import { cn } from "@/lib/cn";
import { PRESENTERS as presenters } from "@/features/workspace/presenters";
import { ChoiceGroup, DecisionRow } from "@/features/workspace/plan-decisions";

/**
 * Character, voice and sound: who appears, who narrates and what plays under it.
 *
 * Shared by the Video plan and the Ads plan (when the campaign makes video),
 * so both ask it the same way: two suggested characters and the Character
 * Library, then language, voice and background music, each previewable.
 */

const voiceList = [
  { name: "Rohan", role: "clear and measured", accent: "Indian / US English", tag: "Authoritative" },
  { name: "Riya", role: "friendly and clear", accent: "Neutral English", tag: "Warm & Caring" },
  { name: "Dev", role: "warm and conversational", accent: "US English", tag: "Conversational" },
  { name: "Sarah", role: "clinical and precise", accent: "British English", tag: "Clinical Lead" },
  { name: "Marcus", role: "deep and trustworthy", accent: "North American", tag: "Physician" },
  { name: "Elena", role: "calm and scientific", accent: "International", tag: "Research" },
  { name: "Liam", role: "energetic and direct", accent: "Australian", tag: "Patient Briefing" },
  { name: "Priya", role: "empathetic and reassuring", accent: "Neutral English", tag: "Patient Care" },
];

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
}: {
  selected: string;
  onSelect: (name: string) => void;
  onClose: () => void;
  /** The full shelf lives on its own page — this modal is a shortlist. */
  onGoToLibrary: () => void;
}) {
  return (
    <Portal>
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[680px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
        <LibraryModalHeader title="Choose characters for your video" onClose={onClose} />
        <div className="max-h-[460px] overflow-y-auto grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
          {presenters.map((person) => {
            const active = selected === person.name;
            return (
              <button
                key={person.name}
                type="button"
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
                {active && <Check className="size-4 text-brand shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
        <LibraryModalGoTo label="Go to Character Library" onClick={onGoToLibrary} />
      </div>
    </div>
    </Portal>
  );
}

export function VoiceLibrary({
  selected,
  onSelect,
  onClose,
  previewing,
  onPreview,
  onGoToLibrary,
}: {
  selected: string;
  onSelect: (name: string) => void;
  onClose: () => void;
  previewing?: string | null;
  onPreview: (name: string) => void;
  /** The full shelf lives on its own page — this modal is a shortlist. */
  onGoToLibrary: () => void;
}) {
  return (
    <Portal>
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[620px] overflow-hidden rounded-card border border-white/60 bg-card shadow-2xl">
        <LibraryModalHeader title="Select narrator voice" onClose={onClose} />
        <div className="max-h-[460px] overflow-y-auto space-y-2 p-4 sm:p-6">
          {voiceList.map((v) => {
            const active = selected.includes(v.name);
            const isPlaying = previewing === v.name;
            return (
              <div
                key={v.name}
                className={cn(
                  "flex items-center justify-between rounded-control border p-3 transition",
                  active ? "border-brand bg-tint" : "border-hair-2"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-body-lg text-ink">{v.name}</span>
                    <span className="rounded-chip bg-card px-2 py-0.5 text-caption font-bold text-brand-deep border border-tint-line">
                      {v.tag}
                    </span>
                  </div>
                  <span className="text-body text-ink-3 block mt-0.5">{v.accent} · {v.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onPreview(v.name)}>
                    {isPlaying ? <Pause className="size-4 text-brand" /> : <Play className="size-4" />}
                  </Button>
                  <Button size="sm" variant={active ? "primary" : "secondary"} onClick={() => onSelect(v.name)}>
                    {active ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <LibraryModalGoTo label="Go to Voice Library" onClick={onGoToLibrary} />
      </div>
    </div>
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
  presenter,
  onPresenter,
  language,
  onLanguage,
  voice,
  onVoice,
  music,
  onMusic,
  brandName,
  onGoTo,
}: {
  presenter: string;
  onPresenter: (name: string) => void;
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
  const [characters, setCharacters] = useState(false);
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
      <div className="mb-4">
        <div className="mb-2.5 text-body-lg font-semibold text-ink-3">Add characters for the video</div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {presenters.slice(0, 2).map((person) => (
            <button
              key={person.name}
              type="button"
              onClick={() => onPresenter(presenter === person.name ? "" : person.name)}
              className={cn(
                "focus-ring flex min-h-[64px] cursor-pointer items-center gap-3 rounded-control border p-3 text-left text-body-lg font-semibold transition-all duration-200 hover:-translate-y-0.5",
                presenter === person.name ? "border-brand bg-tint text-brand-deep shadow-xs ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
              )}
            >
              <FacePhoto person={person} className="size-10 shrink-0 rounded-full shadow-xs ring-2 ring-white" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-body-lg font-bold">{person.name}</span>
                <span className="block text-label font-normal text-ink-3">{person.role}</span>
              </div>
              {presenter === person.name && <Check className="size-4 shrink-0 text-brand" strokeWidth={3} />}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCharacters(true)}
            className="focus-ring flex min-h-[64px] cursor-pointer items-center gap-2.5 rounded-control border border-hair-2 bg-card p-3 text-left text-body-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-hair-3 hover:bg-canvas"
          >
            <span className="flex -space-x-2.5">
              {presenters.slice(2).map((person) => (
                <FacePhoto key={person.name} person={person} className="size-8 rounded-full border-2 border-white shadow-2xs" />
              ))}
            </span>
            <span className="ml-1 text-body-lg text-ink-2">Character Library</span>
            <ArrowRight className="ml-auto size-4 text-ink-3" />
          </button>
        </div>
      </div>
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
      {characters && (
        <CharacterLibrary
          selected={presenter}
          onSelect={(name) => {
            onPresenter(name);
            setCharacters(false);
          }}
          onClose={() => setCharacters(false)}
          onGoToLibrary={() => onGoTo("/content-library/characters", "the Character Library")}
        />
      )}
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
