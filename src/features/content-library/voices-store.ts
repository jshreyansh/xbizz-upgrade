"use client";

import { create } from "zustand";
import { EXAMPLE_TEAM_VOICES, STOCK_VOICES, voiceLanguage, type Voice } from "@/features/content-library/voices-data";

interface VoicesState {
  voices: Voice[];
  add: (voice: Voice) => void;
  update: (id: string, patch: Partial<Voice>) => void;
  setArchived: (id: string, archived: boolean) => void;
}

/**
 * The voices shelf, as a store rather than a seeded array — the same reason
 * Characters has one: a voice cloned from a project's picker has to be on
 * this page, and in the next project's picker, without a reload.
 *
 * Not persisted. A reload puts the workspace back to the examples, which is
 * what every other mock here does — and a recording's preview is a session
 * URL that would not survive one anyway.
 */
export const useVoicesStore = create<VoicesState>((set) => ({
  voices: [...EXAMPLE_TEAM_VOICES, ...STOCK_VOICES],
  /* Anything this workspace made goes in front of the examples. */
  add: (voice) => set((state) => ({ voices: [voice, ...state.voices] })),
  update: (id, patch) =>
    set((state) => ({
      voices: state.voices.map((v) => (v.id === id ? { ...v, ...patch, updatedOn: patch.updatedOn ?? "Just now" } : v)),
    })),
  setArchived: (id, archived) =>
    set((state) => ({ voices: state.voices.map((v) => (v.id === id ? { ...v, archived } : v)) })),
}));

/* ── Preview: one voice at a time, across the whole app ── */

let playing: HTMLAudioElement | null = null;

export function stopVoicePreview() {
  playing?.pause();
  playing = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * Say a line in a voice. The stand-in for the real engine: the browser's own
 * speech in the voice's language, pitched toward its gender.
 */
export function speakAs(voice: Pick<Voice, "languageId" | "gender">, text: string, onEnd: () => void) {
  stopVoicePreview();
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) {
    setTimeout(onEnd, 1500);
    return;
  }
  const language = voiceLanguage(voice.languageId);
  const line = new SpeechSynthesisUtterance(text);
  line.lang = language.bcp47;
  line.pitch = voice.gender === "Female" ? 1.15 : voice.gender === "Male" ? 0.85 : 1;
  const system = window.speechSynthesis.getVoices().find((v) => v.lang === language.bcp47) ?? window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(language.bcp47.slice(0, 2)));
  if (system) line.voice = system;
  line.onend = onEnd;
  line.onerror = onEnd;
  window.speechSynthesis.speak(line);
}

/** The recording a cloned voice was made from. */
export function playOriginal(voice: Voice, onEnd: () => void) {
  stopVoicePreview();
  if (!voice.sampleUrl) {
    setTimeout(onEnd, 300);
    return;
  }
  const audio = new Audio(voice.sampleUrl);
  playing = audio;
  audio.onended = onEnd;
  void audio.play().catch(onEnd);
}

/**
 * Play a voice: what it sounds like as a narrator. For a cloned voice that is
 * the clone reading a line, not the recording it was made from — the
 * recording is in the voice's details.
 */
export function playVoicePreview(voice: Voice, onEnd: () => void) {
  speakAs(voice, voice.sampleLine ?? voiceLanguage(voice.languageId).script[0], onEnd);
}
