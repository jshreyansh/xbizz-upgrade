"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, FileUp, Mic, Pause, Play, RotateCcw, ShieldCheck, Sparkles, Square, Upload, UserRound, Users } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { Toggle } from "@/features/settings/settings-parts";
import { useSettingsStore } from "@/features/settings/settings-store";
import { speakAs, stopVoicePreview } from "@/features/content-library/voices-store";
import { FieldLabel, FormSection, GenderSwitch, LanguageSelect, StyleSelect } from "@/features/content-library/voice-form-parts";
import {
  VOICE_LANGUAGES,
  voiceLanguage,
  type Voice,
  type VoiceGender,
  type VoiceStyle,
} from "@/features/content-library/voices-data";

/**
 * Cloning a voice: record it or upload it, check what SwishX heard, say whose
 * it is, save.
 *
 * Built after the instant clones in ElevenLabs and Cartesia — about ten to
 * thirty seconds of clean speech is the sweet spot; more doesn't make a better
 * clone. Recording opens a teleprompter in the language you pick, so the
 * speaker reads natural sentences at an even pace instead of improvising. An
 * upload is listened to for its language. Either way the voice arrives at the
 * save step already tagged — language from the recording, a gender guess from
 * the voice — and both are there to correct, not to trust blindly.
 *
 * Then it clones, and shows the result beside the source: the recording and
 * the cloned voice side by side, a line to type and hear the clone say, and
 * only then a save. A voice you haven't heard isn't one you should put in a
 * library.
 *
 * Consent is not a footnote here. Pharma narrators are usually real doctors
 * and presenters, so the record says whose voice it is, and a voice that is
 * someone else's carries their signed consent form.
 */

const MIN_SECONDS = 10;
const MAX_SECONDS = 60;
/* How long a teleprompter line stays current: an even reading pace. */
const SECONDS_PER_LINE = 5;

type Step = "start" | "recording" | "checking" | "details" | "cloning" | "result";

interface Take {
  method: "recorded" | "uploaded";
  url?: string;
  seconds: number;
  /** Loudness over time, for the waveform. */
  levels: number[];
  languageId: string;
  /** How the language was found: chosen before recording, or heard in the file. */
  languageFrom: "chosen" | "detected";
  confidence?: number;
  gender: VoiceGender;
  fileName?: string;
}

/* A deterministic stand-in for a real detector: same clip, same answer. */
function guessGender(seed: number): VoiceGender {
  return seed % 2 === 0 ? "Female" : "Male";
}

function detectLanguage(fileName: string): { id: string; confidence: number } {
  const name = fileName.toLowerCase();
  const hit = VOICE_LANGUAGES.find((l) => name.includes(l.label.toLowerCase().split(" ")[0]) || new RegExp(`[_\\-. ]${l.id.split("-")[0]}[_\\-. ]`).test(` ${name} `));
  return hit ? { id: hit.id, confidence: 97 } : { id: "en-IN", confidence: 91 };
}

const clock = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

export function VoiceCloneModal({
  onCancel,
  onSave,
  saveLabel = "Save to library",
}: {
  onCancel: () => void;
  onSave: (voice: Voice) => void;
  /** "Save and use" from a project's picker. */
  saveLabel?: string;
}) {
  const members = useSettingsStore((s) => s.members);
  const meId = useSettingsStore((s) => s.currentUserId);
  const myName = members.find((m) => m.id === meId)?.name ?? "You";

  const [step, setStep] = useState<Step>("start");
  const [method, setMethod] = useState<"record" | "upload">("record");
  const [recordLanguage, setRecordLanguage] = useState("en-IN");
  const [micError, setMicError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [take, setTake] = useState<Take | null>(null);

  /* ── Recording ── */
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const levelsRef = useRef<number[]>([]);
  const elapsedRef = useRef(0);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  const release = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  };
  /* Leaving mid-recording must let go of the microphone. */
  const cloneTimerRef = useRef<number | null>(null);
  useEffect(() => () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    release();
    stopVoicePreview();
    if (cloneTimerRef.current) window.clearInterval(cloneTimerRef.current);
  }, []);

  const finishTake = (next: Take) => {
    setTake(next);
    setStep("details");
  };

  const startRecording = async () => {
    setMicError(false);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError(true);
      return;
    }
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const seconds = elapsedRef.current;
      release();
      finishTake({
        method: "recorded",
        url: URL.createObjectURL(blob),
        seconds,
        levels: levelsRef.current,
        languageId: recordLanguage,
        languageFrom: "chosen",
        gender: guessGender(Math.round(seconds * 10)),
      });
    };

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);

    levelsRef.current = [];
    elapsedRef.current = 0;
    setElapsed(0);
    setStep("recording");
    recorder.start();
    const startedAt = performance.now();
    let lastSample = 0;
    const tick = (now: number) => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const v of samples) sum += ((v - 128) / 128) ** 2;
      const rms = Math.min(1, Math.sqrt(sum / samples.length) * 4);
      const seconds = (now - startedAt) / 1000;
      elapsedRef.current = seconds;
      setLevel(rms);
      setElapsed(seconds);
      if (now - lastSample > 120) {
        levelsRef.current.push(rms);
        lastSample = now;
      }
      if (seconds >= MAX_SECONDS) {
        recorder.stop();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const stopRecording = () => recorderRef.current?.stop();
  const cancelRecording = () => {
    if (recorderRef.current) recorderRef.current.onstop = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    release();
    setStep("start");
  };

  /* No microphone (blocked, or none in this browser): a stand-in take, so the flow can still be walked. */
  const useSampleTake = () =>
    finishTake({
      method: "recorded",
      seconds: 18,
      levels: Array.from({ length: 150 }, (_, i) => 0.25 + 0.6 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11))),
      languageId: recordLanguage,
      languageFrom: "chosen",
      gender: guessGender(180),
    });

  /* ── Uploading ── */
  const fileRef = useRef<HTMLInputElement>(null);
  const onFile = (file: File) => {
    setUploadError(null);
    const url = URL.createObjectURL(file);
    const probe = new Audio();
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      const seconds = Number.isFinite(probe.duration) ? probe.duration : 0;
      if (seconds > 0 && seconds < MIN_SECONDS) {
        URL.revokeObjectURL(url);
        setUploadError(`This clip is ${Math.round(seconds)} seconds. A clone needs at least ${MIN_SECONDS} seconds of one person speaking.`);
        return;
      }
      setStep("checking");
      /* Listening for the language and the voice. */
      window.setTimeout(() => {
        const found = detectLanguage(file.name);
        finishTake({
          method: "uploaded",
          url,
          seconds: Math.min(seconds || 30, MAX_SECONDS),
          levels: Array.from({ length: 150 }, (_, i) => 0.2 + 0.65 * Math.abs(Math.sin(i * 0.29 + file.size) * Math.cos(i * 0.13))),
          languageId: found.id,
          languageFrom: "detected",
          confidence: found.confidence,
          gender: guessGender(file.size),
          fileName: file.name,
        });
      }, 1400);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setUploadError("That file couldn't be read as audio. Try an MP3, WAV, M4A or OGG.");
    };
    probe.src = url;
  };

  /* ── The details ── */
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [languageId, setLanguageId] = useState<string | null>(null);
  const [gender, setGender] = useState<VoiceGender | null>(null);
  const [accent, setAccent] = useState<string | null>(null);
  const [style, setStyle] = useState<VoiceStyle>("Calm");
  const [description, setDescription] = useState("");
  const [cleanup, setCleanup] = useState(false);
  const [whose, setWhose] = useState<"own" | "other">("own");
  const [person, setPerson] = useState("");
  const [consentFile, setConsentFile] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const consentRef = useRef<HTMLInputElement>(null);

  const lang = voiceLanguage(languageId ?? take?.languageId ?? recordLanguage);
  const voiceGender = gender ?? take?.gender ?? "Female";
  const voiceAccent = accent ?? lang.accent;
  /* Named for the speaker until the user names it themselves. */
  const suggestedName = `${whose === "other" ? person.trim() || "New voice" : myName} · ${lang.label}`;
  const voiceName = nameTouched ? name : suggestedName;
  const consentOk = agreed && (whose === "own" || (person.trim().length > 0 && !!consentFile));
  const ready = !!take && voiceName.trim().length > 0 && consentOk;

  /* ── Playback of the take ── */
  const [playingTake, setPlayingTake] = useState(false);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const toggleTake = () => {
    if (!take?.url) return;
    if (playingTake) {
      playerRef.current?.pause();
      setPlayingTake(false);
      return;
    }
    const audio = playerRef.current ?? new Audio();
    playerRef.current = audio;
    audio.src = take.url;
    audio.onended = () => setPlayingTake(false);
    void audio.play().then(() => setPlayingTake(true)).catch(() => setPlayingTake(false));
  };

  const redo = () => {
    playerRef.current?.pause();
    setPlayingTake(false);
    setTake(null);
    setLanguageId(null);
    setGender(null);
    setStep("start");
  };

  /* ── Cloning: a few seconds of visible work, then the result ── */
  const [cloneProgress, setCloneProgress] = useState(0);
  const cloneSteps = [
    ...(cleanup ? ["Removing background noise"] : ["Checking the recording"]),
    `Learning ${whose === "other" ? (person.trim() || "their") + "'s" : "your"} voice`,
    `Matching the ${voiceAccent} accent`,
    "Writing a sample line",
  ];
  const clone = () => {
    if (!ready) return;
    playerRef.current?.pause();
    setPlayingTake(false);
    setCloneProgress(0);
    setStep("cloning");
    const started = Date.now();
    cloneTimerRef.current = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / 4200) * 100);
      setCloneProgress(pct);
      if (pct >= 100) {
        if (cloneTimerRef.current) window.clearInterval(cloneTimerRef.current);
        cloneTimerRef.current = null;
        setStep("result");
      }
    }, 120);
  };
  /* A stand-in score: same take, same answer. Cleaning a clean clip costs a little. */
  const similarity = take ? Math.min(97, 86 + (Math.round(take.seconds) % 9) + (take.method === "recorded" ? 2 : 0) - (cleanup ? 3 : 0)) : 0;

  /* ── The result: the recording and the clone, side by side ── */
  const [tryLine, setTryLine] = useState<string | null>(null);
  const line = tryLine ?? lang.script[1] ?? lang.script[0];
  const [playingClone, setPlayingClone] = useState(false);
  const playClone = () => {
    if (playingClone) {
      stopVoicePreview();
      setPlayingClone(false);
      return;
    }
    playerRef.current?.pause();
    setPlayingTake(false);
    setPlayingClone(true);
    speakAs({ languageId: lang.id, gender: voiceGender }, line, () => setPlayingClone(false));
  };
  const playSource = () => {
    stopVoicePreview();
    setPlayingClone(false);
    toggleTake();
  };

  const save = () => {
    if (!take || !ready) return;
    playerRef.current?.pause();
    stopVoicePreview();
    onSave({
      /* Named for the voice and the take, so the same take saved twice is the same id. */
      id: `voice-${voiceName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.round(take.seconds * 1000)}`,
      name: voiceName.trim(),
      source: "team",
      languageId: lang.id,
      gender: voiceGender,
      accent: voiceAccent,
      style,
      description: description.trim() || undefined,
      method: take.method,
      seconds: Math.round(take.seconds),
      sampleUrl: take.url,
      sampleLine: line,
      similarity,
      cleaned: cleanup,
      consent: {
        whose,
        person: whose === "other" ? person.trim() : undefined,
        file: whose === "other" ? consentFile ?? undefined : undefined,
        confirmedBy: myName,
        confirmedOn: "Just now",
      },
      createdBy: myName,
      createdOn: "Just now",
      updatedOn: "Just now",
      usedIn: 0,
    });
  };

  const lineIndex = Math.min(Math.floor(elapsed / SECONDS_PER_LINE), voiceLanguage(recordLanguage).script.length - 1);
  /* Keep the line being read in view, like a teleprompter's scroll. */
  useEffect(() => {
    lineRefs.current[lineIndex]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [lineIndex]);

  const footer =
    step === "details" ? (
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={redo} className="gap-1.5">
          <RotateCcw className="size-3.5" />
          {take?.method === "uploaded" ? "Use another clip" : "Record again"}
        </Button>
        <Button onClick={clone} disabled={!ready} title={ready ? undefined : "Name the voice and confirm whose it is first"} className="gap-1.5 px-5 font-bold">
          <Sparkles className="size-4" />
          Clone voice
        </Button>
      </div>
    ) : step === "result" ? (
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            stopVoicePreview();
            setPlayingClone(false);
            setStep("details");
          }}
          className="gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Change details and re-clone
        </Button>
        <Button onClick={save} className="gap-1.5 px-5 font-bold">
          <Check className="size-4" />
          {saveLabel}
        </Button>
      </div>
    ) : step === "recording" ? (
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={cancelRecording}>
          Cancel
        </Button>
        <Button onClick={stopRecording} disabled={elapsed < MIN_SECONDS} className="gap-1.5 px-5 font-bold">
          <Square className="size-3.5 fill-current" />
          {elapsed < MIN_SECONDS ? `Keep going · ${Math.ceil(MIN_SECONDS - elapsed)}s` : "Stop and use this take"}
        </Button>
      </div>
    ) : step === "start" && method === "record" ? (
      <div className="flex items-center justify-end gap-3">
        <Button onClick={startRecording} className="gap-1.5 px-5 font-bold">
          <Mic className="size-4" />
          Start recording
        </Button>
      </div>
    ) : undefined;

  return (
    <Modal open onClose={onCancel} title="Clone a voice" description={
        step === "details"
          ? "Check what SwishX heard and say whose voice it is. Then clone it and listen before saving."
          : step === "cloning"
            ? "Building the voice from your recording."
            : step === "result"
              ? "Listen to the recording and the clone side by side, and try a line of your own."
              : "About 10 to 30 seconds of one person speaking, in a quiet room."
      } size="lg" footer={footer}>
      {/* ── Record or upload ── */}
      {step === "start" && (
        <div className="space-y-4">
          <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="How to clone">
            {([
              { id: "record" as const, icon: Mic, title: "Record now", blurb: "Read a short script from the teleprompter, in the language you'll use." },
              { id: "upload" as const, icon: Upload, title: "Upload a clip", blurb: "An existing recording. SwishX listens for the language." },
            ]).map((m) => {
              const on = method === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-control border p-3.5 text-left transition",
                    on ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-brand/50"
                  )}
                >
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-control", on ? "bg-brand text-white" : "bg-tint text-brand")}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-body font-[850] text-ink">
                      {m.title}
                      {on && <Check className="size-3.5 text-brand" />}
                    </span>
                    <span className="mt-0.5 block text-label leading-snug text-ink-3">{m.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {method === "record" ? (
            <div className="space-y-2.5">
              <div className="text-label font-bold text-ink-2">Which language will you record in?</div>
              <div className="flex flex-wrap gap-1.5">
                {VOICE_LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setRecordLanguage(l.id)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 rounded-chip border px-2.5 py-1 text-label font-semibold transition",
                      recordLanguage === l.id ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-2 hover:border-brand/50"
                    )}
                  >
                    {recordLanguage === l.id && <Check className="size-3" />}
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="text-caption text-ink-4">The teleprompter shows a script in this language, and the voice is tagged with it.</p>
              {micError && (
                <div className="flex flex-wrap items-center gap-2 rounded-control border border-warn-line bg-warn-bg px-3 py-2.5 text-label text-warn">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1">The microphone isn&apos;t available. Allow it in the browser&apos;s address bar, then try again.</span>
                  <Button size="sm" variant="secondary" onClick={useSampleTake}>
                    Use a sample take
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-control border border-dashed border-hair-3 bg-canvas px-4 py-7 text-center transition hover:border-brand hover:bg-tint"
              >
                <FileUp className="size-5 text-brand" />
                <span className="text-body font-bold text-ink">Choose an audio file</span>
                <span className="text-caption text-ink-4">MP3 · WAV · M4A · OGG · at least 10 seconds of one voice, no music</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) onFile(file);
                }}
              />
              {uploadError && (
                <p className="flex items-start gap-1.5 text-label font-semibold text-danger">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {uploadError}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── The teleprompter ── */}
      {step === "recording" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-danger text-white">
              <span className="absolute inset-0 animate-ping rounded-full bg-danger/40" />
              <Mic className="relative size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-body font-bold text-ink">Recording · {voiceLanguage(recordLanguage).label}</div>
              <div className="text-caption text-ink-3">Read at your normal pace. Pauses are fine.</div>
            </div>
            <span className="font-mono text-title font-bold tabular-nums text-ink">{clock(elapsed)}</span>
          </div>

          {/* Live level, so a too-quiet or clipping microphone shows before it's a bad clone. */}
          <div className="flex h-10 items-center gap-[3px] rounded-control bg-subtle px-3" aria-hidden>
            {Array.from({ length: 48 }, (_, i) => {
              const shape = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.8 + elapsed * 6));
              return <span key={i} className="w-1 flex-1 rounded-full bg-brand transition-[height] duration-75" style={{ height: `${Math.max(8, level * shape * 100)}%`, opacity: level > 0.05 ? 1 : 0.35 }} />;
            })}
          </div>

          <div className="h-48 overflow-y-auto rounded-card bg-ink px-6 py-8 text-white [scrollbar-width:none]">
            {voiceLanguage(recordLanguage).script.map((line, i) => (
              <p
                key={i}
                ref={(node) => {
                  lineRefs.current[i] = node;
                }}
                className={cn("mb-4 text-title font-bold leading-snug transition-opacity duration-300", i === lineIndex ? "opacity-100" : i < lineIndex ? "opacity-30" : "opacity-55")}
              >
                {line}
              </p>
            ))}
          </div>

          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
              <div className={cn("h-full rounded-full transition-[width]", elapsed < MIN_SECONDS ? "bg-warn" : "bg-ok")} style={{ width: `${Math.min(100, (elapsed / 30) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-caption text-ink-4">
              <span>{elapsed < MIN_SECONDS ? `At least ${MIN_SECONDS} seconds` : "Enough for a clone. 10 to 30 seconds is best."}</span>
              <span>Stops at {MAX_SECONDS}s</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Listening to an upload ── */}
      {step === "checking" && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="size-8 animate-spin rounded-full border-2 border-hair-2 border-t-brand" />
          <div className="text-body font-bold text-ink">Listening to the clip</div>
          <div className="text-label text-ink-3">Detecting the language, checking for background noise and more than one speaker.</div>
        </div>
      )}

      {/* ── What SwishX heard, and whose voice it is ── */}
      {step === "details" && take && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-control border border-ok-line bg-ok-bg px-3.5 py-3">
            <button
              type="button"
              onClick={toggleTake}
              disabled={!take.url}
              aria-label={playingTake ? "Pause the recording" : "Play the recording"}
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-ok text-white transition hover:opacity-90 disabled:cursor-default disabled:opacity-50"
            >
              {playingTake ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
            </button>
            <div className="flex h-8 min-w-0 flex-1 items-center gap-[2px]" aria-hidden>
              {Array.from({ length: 60 }, (_, i) => {
                const src = take.levels.length ? take.levels[Math.floor((i / 60) * take.levels.length)] ?? 0 : 0.3;
                return <span key={i} className="flex-1 rounded-full bg-ok/70" style={{ height: `${Math.max(10, src * 100)}%` }} />;
              })}
            </div>
            <div className="shrink-0 text-right">
              <div className="text-label font-bold text-ok">{clock(take.seconds)} · {take.method === "recorded" ? "Recorded" : "Uploaded"}</div>
              <div className="text-caption text-ok/80">{take.fileName ?? "Clear enough to clone"}</div>
            </div>
          </div>

          <FormSection title="Name and description">
            <div>
              <FieldLabel label="Name" source={nameTouched ? undefined : { text: "Suggested", guessed: true }} />
              <Field
                value={voiceName}
                onChange={(e) => {
                  setNameTouched(true);
                  setName(e.target.value);
                }}
                placeholder="e.g. Dr. Maya Kapoor · English"
              />
            </div>
            <div>
              <FieldLabel label="Description" optional />
              <Field multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Who it is, and what it's for: e.g. Our dermatology KOL, for patient explainers." />
            </div>
          </FormSection>

          {/* The tags, each saying where its value came from. */}
          <FormSection title="How it's tagged" hint="Projects filter voices by these">
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <div>
                <FieldLabel
                  label="Language"
                  source={languageId ? undefined : take.languageFrom === "chosen" ? { text: "You recorded in it" } : { text: `Detected · ${take.confidence}% sure`, guessed: true }}
                />
                <LanguageSelect
                  value={lang.id}
                  onChange={(id) => {
                    setLanguageId(id);
                    setAccent(null);
                  }}
                />
              </div>
              <div>
                <FieldLabel label="Voice" source={gender ? undefined : { text: "SwishX's guess", guessed: true }} />
                <GenderSwitch value={voiceGender} onChange={setGender} />
              </div>
              <div>
                <FieldLabel label="Accent" source={accent === null ? { text: `From ${lang.label}`, guessed: true } : undefined} />
                <Field value={voiceAccent} onChange={(e) => setAccent(e.target.value)} />
              </div>
              <div>
                <FieldLabel label="Style" />
                <StyleSelect value={style} onChange={setStyle} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Recording">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-control border border-hair-2 bg-card px-3.5 py-3">
              <span className="min-w-0">
                <span className="block text-body font-bold text-ink">Clean up background noise</span>
                <span className="block text-caption text-ink-3">Only if the room was noisy. Cleaning a clean clip makes the clone sound less like the speaker.</span>
              </span>
              <Toggle checked={cleanup} onChange={setCleanup} label="Clean up background noise" />
            </label>
          </FormSection>

          {/* ── Consent ── */}
          <FormSection title="Whose voice is this?" hint="Kept with the voice for audits">
          <div className="space-y-3 rounded-card border border-hair-2 bg-canvas p-4">
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Whose voice">
              {([
                { id: "own" as const, icon: UserRound, title: "My own voice", blurb: `${myName}, speaking` },
                { id: "other" as const, icon: Users, title: "Someone else's", blurb: "A doctor, presenter or actor, with their signed consent" },
              ]).map((o) => {
                const on = whose === o.id;
                const Icon = o.icon;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setWhose(o.id);
                      setAgreed(false);
                    }}
                    className={cn("flex cursor-pointer items-start gap-2.5 rounded-control border bg-card p-3 text-left transition", on ? "border-brand ring-2 ring-brand/15" : "border-hair-2 hover:border-brand/50")}
                  >
                    <Icon className={cn("mt-0.5 size-4 shrink-0", on ? "text-brand" : "text-ink-3")} />
                    <span className="min-w-0">
                      <span className="block text-body font-bold text-ink">{o.title}</span>
                      <span className="block text-caption text-ink-3">{o.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {whose === "other" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Their name" value={person} onChange={(e) => setPerson(e.target.value)} placeholder="e.g. Dr. Maya Kapoor" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-label font-semibold text-ink-3">Signed consent form</span>
                  <button
                    type="button"
                    onClick={() => consentRef.current?.click()}
                    className={cn(
                      "flex h-10 cursor-pointer items-center gap-2 rounded-control border px-3 text-left text-body transition",
                      consentFile ? "border-ok-line bg-ok-bg text-ok" : "border-dashed border-hair-3 bg-card text-ink-3 hover:border-brand"
                    )}
                  >
                    {consentFile ? <Check className="size-4 shrink-0" /> : <FileUp className="size-4 shrink-0" />}
                    <span className="truncate">{consentFile ?? "Attach PDF or image"}</span>
                  </button>
                  <input
                    ref={consentRef}
                    type="file"
                    accept=".pdf,image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) setConsentFile(file.name);
                    }}
                  />
                </div>
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-2.5">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand" />
              <span className="text-label leading-snug text-ink-2">
                {whose === "own"
                  ? "This is my voice, and I agree to SwishX cloning it for this workspace's content."
                  : `I have ${person.trim() || "this person"}'s written consent to clone their voice and use it in this workspace's content. The form is attached.`}
              </span>
            </label>
            <p className="flex items-center gap-1.5 text-caption text-ink-4">
              <ShieldCheck className="size-3.5 text-ok" />
              Anyone using this voice can see whose it is and the consent behind it.
            </p>
          </div>
          </FormSection>
        </div>
      )}
      {/* ── Cloning ── */}
      {step === "cloning" && (
        <div className="space-y-5 py-4">
          <div className="flex h-16 items-center justify-center gap-[3px]" aria-hidden>
            {Array.from({ length: 56 }, (_, i) => {
              const src = take?.levels.length ? take.levels[Math.floor((i / 56) * take.levels.length)] ?? 0.3 : 0.3;
              const done = i / 56 < cloneProgress / 100;
              return <span key={i} className={cn("w-1.5 rounded-full transition-colors duration-300", done ? "bg-brand" : "bg-ok/50")} style={{ height: `${Math.max(12, src * 100)}%` }} />;
            })}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-body font-bold text-ink">Cloning {voiceName.trim() || "the voice"}</span>
              <span className="font-mono text-label font-bold tabular-nums text-brand-deep">{Math.round(cloneProgress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-subtle">
              <div className="h-full rounded-full bg-brand transition-[width] duration-150" style={{ width: `${cloneProgress}%` }} />
            </div>
          </div>
          <ul className="space-y-2">
            {cloneSteps.map((label, i) => {
              const at = ((i + 1) / cloneSteps.length) * 100;
              const done = cloneProgress >= at;
              const now = !done && cloneProgress >= (i / cloneSteps.length) * 100;
              return (
                <li key={label} className={cn("flex items-center gap-2.5 text-body", done ? "text-ink" : now ? "font-bold text-ink" : "text-ink-4")}>
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", done ? "bg-ok text-white" : now ? "border-2 border-brand border-t-transparent animate-spin" : "border border-hair-3")}>
                    {done && <Check className="size-3 stroke-[3]" />}
                  </span>
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── The result: recording beside clone ── */}
      {step === "result" && take && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-control border border-ok-line bg-ok-bg px-3.5 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ok text-white">
              <Check className="size-4 stroke-[3]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-body font-bold text-ok">{voiceName.trim()} is cloned</div>
              <div className="text-caption text-ink-2">
                {lang.label} · {voiceGender} · {style} · {voiceAccent}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-title font-[850] tabular-nums text-ok">{similarity}%</div>
              <div className="text-caption text-ink-3">sounds like the recording</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { id: "source", title: "Your recording", sub: `${clock(take.seconds)} · ${take.method === "recorded" ? "recorded" : "uploaded"}${cleanup ? " · noise removed" : ""}`, playing: playingTake, tone: "ok", disabled: !take.url },
              { id: "clone", title: "Cloned voice", sub: "Reading the line below", playing: playingClone, tone: "brand", disabled: false },
            ] as const).map((card) => (
              <div key={card.id} className={cn("space-y-3 rounded-card border p-4", card.tone === "brand" ? "border-brand/30 bg-tint" : "border-hair-2 bg-card")}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-body font-[850] text-ink">{card.title}</div>
                    <div className="text-caption text-ink-3">{card.sub}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => (card.id === "clone" ? playClone() : playSource())}
                    disabled={card.disabled}
                    aria-label={card.playing ? `Stop ${card.title.toLowerCase()}` : `Play ${card.title.toLowerCase()}`}
                    className={cn(
                      "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-white shadow-soft transition hover:scale-105 disabled:cursor-default disabled:opacity-40",
                      card.tone === "brand" ? "bg-brand" : "bg-ok"
                    )}
                  >
                    {card.playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
                  </button>
                </div>
                <div className="flex h-9 items-center gap-[2px]" aria-hidden>
                  {Array.from({ length: 44 }, (_, i) => {
                    const src = take.levels.length ? take.levels[Math.floor((i / 44) * take.levels.length)] ?? 0.3 : 0.3;
                    /* The clone's own shape: the same voice, saying something else. */
                    const h = card.tone === "brand" ? 0.25 + 0.6 * Math.abs(Math.sin(i * 0.53 + line.length)) : src;
                    return <span key={i} className={cn("flex-1 rounded-full", card.tone === "brand" ? "bg-brand" : "bg-ok", card.playing && "animate-pulse")} style={{ height: `${Math.max(10, h * 100)}%`, opacity: card.playing ? 0.95 : 0.55, animationDelay: `${i * 35}ms` }} />;
                  })}
                </div>
              </div>
            ))}
          </div>

          <Field
            label={`Try a line in ${lang.label}`}
            multiline
            rows={2}
            value={line}
            onChange={(e) => {
              setTryLine(e.target.value);
              if (playingClone) {
                stopVoicePreview();
                setPlayingClone(false);
              }
            }}
            hint="Type anything and press play on Cloned voice. This line becomes the voice's preview in the library."
          />

          <div className="flex flex-wrap items-center gap-1.5 text-caption text-ink-3">
            <ShieldCheck className="size-3.5 text-ok" />
            {whose === "own" ? `${myName}'s own voice` : `${person.trim()}'s voice · ${consentFile}`}
            <span className="text-ink-4">· consent kept with the voice</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
