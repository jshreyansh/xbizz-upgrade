"use client";

import { useEffect, useState } from "react";
import {
  Check, FileText, Image as ImageIcon, Loader2, Mail, Megaphone, Play, Send, Shapes, Type, Video, X, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/logo-mark";
import { TEAM, type TeamMember } from "@/features/workspace/mock-personas";
import { Mascot, mascotColour } from "@/features/workspace/mascot";
import { HEADER_ART } from "@/features/workspace/email-canvas";
import { GoogleAdsLogo, LinkedInLogo, MetaLogo, TikTokLogo, YouTubeLogo } from "@/features/workspace/platform-logos";

/**
 * The landing's product preview: SwishX making something, by itself, for
 * every kind of asset in turn.
 *
 * A small window with the product's own steps — sources, plan, make,
 * review — the whole team down the side, and each one working with their
 * own cursor. Sources become the format's plan, which changes when you ask
 * in chat; the asset is built while the MLR Reviewer checks its claims; it
 * comes back to you to approve. Then the next format.
 */

type FormatId = "video" | "infographic" | "ad" | "email" | "doc";
type Scene = "sources" | "plan" | "make";
type Who = "you" | TeamMember["key"];

interface Format {
  id: FormatId;
  label: string;
  /** In a sentence: "I'll plan the infographic", "Infographic plan ready". */
  noun: string;
  icon: LucideIcon;
  title: string;
  ask: string;
  plan: Array<{ title: string; cites: number; tone: string; platform?: Platform }>;
  planLine: string;
  makeLine: string;
  /** What asking in chat does to the plan: changes a row, or adds one. */
  change: { row: number; add?: boolean };
  updated: string;
  done: string;
}

const FORMATS: Format[] = [
  {
    id: "video", noun: "video", label: "Video", icon: Video, title: "MOA explainer · video",
    ask: "Lead with the primary endpoint",
    plan: [
      { title: "Why this matters", cites: 6, tone: "#181715" },
      { title: "Mechanism of action", cites: 5, tone: "#1e2b4a" },
      { title: "Clinical evidence", cites: 4, tone: "#e9e2d8" },
      { title: "Safety and next steps", cites: 2, tone: "#f3ddd6" },
    ],
    planLine: "Here's your video plan. Four scenes, every line source-backed.",
    makeLine: "Directing the scenes, voice and pacing.",
    change: { row: 0 },
    updated: "Now opens on 52% at Week 16",
    done: "Done. Scene 1 now opens on 52% at Week 16, still cited.",
  },
  {
    id: "infographic", noun: "infographic", label: "Image", icon: ImageIcon, title: "Primary endpoint · infographic",
    ask: "Make the chart the hero",
    plan: [
      { title: "Headline figure", cites: 2, tone: "#3b2370" },
      { title: "Velmora vs placebo chart", cites: 3, tone: "#c2410c" },
      { title: "Study design", cites: 2, tone: "#e9e2d8" },
      { title: "Safety information", cites: 4, tone: "#f3ddd6" },
    ],
    planLine: "Four panels for the infographic, each tied to a claim.",
    makeLine: "Charting 52% against placebo.",
    change: { row: 1 },
    updated: "Moved to the top, full width",
    done: "Done. The chart leads now, full width.",
  },
  {
    id: "doc", noun: "leave-behind", label: "Docs", icon: FileText, title: "Velmora leave-behind · 2 pages",
    ask: "Keep it to two pages",
    plan: [
      { title: "Cover and indication", cites: 2, tone: "#3b2370" },
      { title: "Efficacy at Week 16", cites: 4, tone: "#1e2b4a" },
      { title: "Dosing and access", cites: 3, tone: "#e9e2d8" },
      { title: "Important Safety Information", cites: 5, tone: "#f3ddd6" },
    ],
    planLine: "A leave-behind plan the sales team can use.",
    makeLine: "Laying out two pages.",
    change: { row: 2 },
    updated: "Tightened to fit two pages",
    done: "Done. Tightened the dosing page, so it fits on two.",
  },
  {
    id: "ad", noun: "ads", label: "Ads", icon: Megaphone, title: "Velmora launch · ads",
    ask: "Add LinkedIn for HCPs",
    plan: [
      { title: "Meta feed · 1080 × 1080", cites: 2, tone: "#e7f1ff", platform: "meta" },
      { title: "TikTok · 9:16, 15 sec", cites: 2, tone: "#f1f1f1", platform: "tiktok" },
      { title: "YouTube bumper · 6 sec", cites: 1, tone: "#ffecec", platform: "youtube" },
      { title: "LinkedIn · 1200 × 627", cites: 2, tone: "#e8f1fa", platform: "linkedin" },
    ],
    planLine: "Launch ads for every platform you run on, from approved copy.",
    makeLine: "One design, cut for Meta, TikTok, YouTube and LinkedIn.",
    change: { row: 3, add: true },
    updated: "Added from your ask",
    done: "Done. Added a LinkedIn post for HCPs from the same design.",
  },
  {
    id: "email", noun: "email", label: "Emails", icon: Mail, title: "Meeting follow-up · email",
    ask: "Let reps add a personal note",
    plan: [
      { title: "Three subject lines", cites: 0, tone: "#3b2370" },
      { title: "Rep's personal note", cites: 0, tone: "#e0f2fe" },
      { title: "Primary endpoint block", cites: 2, tone: "#5b3a9e" },
      { title: "Button: Book a follow-up", cites: 0, tone: "#f3ddd6" },
    ],
    planLine: "Your email plan, ready for Veeva Approved Email.",
    makeLine: "Building the email and its button.",
    change: { row: 1, add: true },
    updated: "Up to 255 characters, plain text",
    done: "Done. Reps can add a note, and no claim can go in it.",
  },
];

type Point = { at: [number, number]; click?: boolean };

interface Beat {
  scene: Scene;
  sub: number;
  /** Who is saying the line in the team rail. */
  who: Who;
  line: string;
  /** Everyone working in this beat, each with their own cursor (% of the stage). */
  cursors: Partial<Record<Who, Point>>;
  ms: number;
}

/* Where the plan's rows sit, so a cursor can land on one. */
const rowY = (row: number) => 24 + row * 17;

const beats = (f: Format): Beat[] => [
  { scene: "sources", sub: 0, who: "amber", line: `Point me to your sources. I'll plan the ${f.noun}.`, cursors: { amber: { at: [10, 40] } }, ms: 1500 },
  { scene: "sources", sub: 1, who: "amber", line: "Reading Study.pdf. Pulling out every claim and its source.", cursors: { amber: { at: [10, 40], click: true } }, ms: 1900 },
  { scene: "sources", sub: 2, who: "amber", line: `${planName(f)} ready, from 47 verified claims.`, cursors: { amber: { at: [52, 80], click: true } }, ms: 1600 },
  { scene: "plan", sub: 0, who: "brand", line: f.planLine, cursors: { brand: { at: [34, rowY(2)] }, amber: { at: [42, 9] } }, ms: 2000 },
  { scene: "plan", sub: 1, who: "you", line: `${f.ask}.`, cursors: { you: { at: [95, 91], click: true } }, ms: 1700 },
  { scene: "plan", sub: 2, who: "brand", line: f.done, cursors: { brand: { at: [32, rowY(f.change.row)], click: true }, green: { at: [58, rowY(f.change.row)] } }, ms: 2100 },
  { scene: "make", sub: 0, who: "blue", line: f.makeLine, cursors: { blue: { at: [30, 48] }, green: { at: [80, 34] } }, ms: 2000 },
  { scene: "make", sub: 1, who: "green", line: "Two claims cited. One has no approved source, so it's held back.", cursors: { green: { at: [80, 60], click: true }, blue: { at: [44, 70] } }, ms: 2200 },
  { scene: "make", sub: 2, who: "violet", line: "Ready for your review, with every claim cited.", cursors: { violet: { at: [93, 7], click: true } }, ms: 1900 },
  { scene: "make", sub: 3, who: "you", line: "Approved. Send it to MLR.", cursors: { you: { at: [93, 7], click: true } }, ms: 2200 },
];

const STEPS = ["Sources", "Plan", "Make", "Review"];
/* "Video plan", "Ad plan": what the sources step produces for this format. */
const planName = (f: Format) => `${f.noun === "ads" ? "Ad" : f.noun.charAt(0).toUpperCase() + f.noun.slice(1)} plan`;
const stepOf = (b: Beat) => (b.scene === "sources" ? 0 : b.scene === "plan" ? 1 : b.sub < 2 ? 2 : 3);

function useDemo(still: boolean) {
  const [pos, setPos] = useState({ f: 0, b: 0 });
  useEffect(() => {
    if (still) return;
    const list = beats(FORMATS[pos.f]);
    const t = setTimeout(() => {
      setPos((p) => (p.b + 1 < list.length ? { f: p.f, b: p.b + 1 } : { f: (p.f + 1) % FORMATS.length, b: 0 }));
    }, list[pos.b].ms);
    return () => clearTimeout(t);
  }, [pos, still]);
  return { ...(still ? { f: pos.f, b: 7 } : pos), jump: (f: number) => setPos({ f, b: 0 }) };
}

/* ── Ad platforms, with their own marks ─────────────────────────────── */

type Platform = "meta" | "tiktok" | "youtube" | "linkedin" | "google";
function PlatformMark({ id, size }: { id: Platform; size: number }) {
  if (id === "meta") return <MetaLogo size={size} />;
  if (id === "tiktok") return <TikTokLogo size={size} />;
  if (id === "youtube") return <YouTubeLogo size={size} />;
  if (id === "linkedin") return <LinkedInLogo size={size} />;
  return <GoogleAdsLogo size={size} />;
}

/* ── Who's who ─────────────────────────────────────────────────────────── */

const SHORT: Record<Who, string> = { you: "You", amber: "Strategist", brand: "Writer", green: "MLR", blue: "Producer", violet: "PM" };
const colourOf = (w: Who) => (w === "you" ? "#111827" : mascotColour(w));

function Face({ who, size }: { who: Who; size: number }) {
  if (who === "you") {
    // eslint-disable-next-line @next/next/no-img-element -- the user's photo in the demo
    return <img src="/auth/you.jpg" alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return <Mascot who={who} size={size} />;
}

/* ── Sources: a desktop of files becomes the plan ─────────────────────── */

/* The same file icons as the guided widget on the website. */
const FILES = [
  { name: "Study.pdf", tag: "PDF", icon: "/auth/files/study-pdf.png" },
  { name: "Deck.pptx", tag: "Slides", icon: "/auth/files/deck-pptx.png" },
  { name: "Claims.docx", tag: "Doc", icon: "/auth/files/claims-docx.png" },
  { name: "MOA.mp4", tag: "Video", icon: "/auth/files/moa-mp4.png" },
  { name: "Info.png", tag: "Image", icon: "/auth/files/info-png.png" },
  { name: "Website", tag: "Web", icon: "/auth/files/yoursite-com.png" },
];

function Sources({ f, sub }: { f: Format; sub: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "radial-gradient(120% 90% at 15% 10%, #f7b28a 0%, transparent 45%), radial-gradient(90% 80% at 90% 100%, #7c6cf0 0%, transparent 55%), linear-gradient(160deg,#2b4f7e,#5b86b8 55%,#a9c2de)" }}>
      <div className="flex h-5 items-center gap-3 bg-black/25 px-3 text-micro font-semibold text-white/85">
        <span>Finder</span>
        <span className="text-white/60">File</span>
        <span className="text-white/60">Edit</span>
        <span className="text-white/60">View</span>
        <span className="ml-auto tabular-nums">9:41</span>
      </div>
      <div className="absolute inset-x-0 top-[24%] flex justify-around px-2">
        {FILES.map((file, i) => (
          <div
            key={file.name}
            className={cn(
              "flex w-[15%] flex-col items-center gap-1 rounded-lg px-1 py-1.5 transition-colors duration-300",
              i === 0 && sub >= 1 && "bg-white/25 ring-1 ring-white/40"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a file icon on the drawn desktop */}
            <img src={file.icon} alt="" className="size-10 object-contain drop-shadow-md" />
            <span className={cn("max-w-full truncate rounded-sm px-1 text-micro font-semibold text-white", i === 0 && sub >= 1 && "bg-accent-blue")}>{file.name}</span>
            <span className="text-micro font-bold uppercase tracking-wider text-white/60">{file.tag}</span>
          </div>
        ))}
      </div>
      {sub >= 1 && (
        <div className="absolute left-1/2 top-[70%] -translate-x-1/2">
          <div
            key={sub}
            className={cn(
              "auth-pop flex items-center gap-2.5 rounded-panel bg-card px-3.5 py-2.5 shadow-float",
              sub === 2 && "ring-2 ring-ok/40"
            )}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tint text-brand">
              {sub === 1 ? <Loader2 className="size-4 animate-spin" /> : <LogoMark size={16} />}
            </span>
            <span className="min-w-0">
              <b className="block whitespace-nowrap text-label text-ink">{sub === 1 ? `Building your ${planName(f).toLowerCase()}…` : `${planName(f)} ready`}</b>
              <span className={cn("block whitespace-nowrap text-caption", sub === 1 ? "text-ink-3" : "font-bold text-ok")}>
                {sub === 1 ? "Extracting claims from Study.pdf" : "From 47 verified claims · every one sourced"}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Plan: the format's plan, changed when you ask ────────────────────── */

function Plan({ f, sub }: { f: Format; sub: number }) {
  return (
    <div className="absolute inset-0 grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] bg-canvas">
      <div className="flex min-w-0 flex-col gap-1.5 p-2.5">
        <div className="flex items-center gap-1.5 pb-0.5">
          <b className="truncate text-label text-ink">{f.title}</b>
          <span className="shrink-0 rounded-chip bg-danger-bg px-1.5 py-px text-micro font-bold text-danger">Study.pdf</span>
        </div>
        {f.plan.map((row, i) => {
          if (f.change.add && i === f.change.row && sub < 2) return null;
          const changed = i === f.change.row && sub >= 2;
          return (
            <div
              key={row.title}
              className={cn("auth-pop flex items-center gap-2 rounded-panel border bg-card p-1.5 transition-all duration-500", changed ? "border-brand shadow-soft ring-2 ring-brand/20" : "border-hair")}
              style={{ animationDelay: `${i * 110}ms` }}
            >
              <span className="grid size-4 shrink-0 place-items-center rounded-sm bg-subtle text-micro font-bold text-ink-2">{i + 1}</span>
              {row.platform ? (
                <span className="grid h-7 w-11 shrink-0 place-items-center rounded-sm" style={{ background: row.tone }}>
                  <PlatformMark id={row.platform} size={16} />
                </span>
              ) : (
              <span className="flex h-7 w-11 shrink-0 flex-col justify-between rounded-sm p-1" style={{ background: row.tone }}>
                <span className="h-0.5 w-3/4 rounded-full bg-white/70" />
                <span className="flex items-end gap-0.5">
                  <span className="h-1.5 w-1 rounded-px bg-white/60" />
                  <span className="h-2.5 w-1 rounded-px bg-white/80" />
                  <span className="ml-auto size-1.5 rounded-full bg-white/60" />
                </span>
              </span>
              )}
              <span className="min-w-0 flex-1">
                <b className="block truncate text-caption text-ink">{row.title}</b>
                <span className={cn("block truncate text-micro", changed ? "font-bold text-brand-deep" : "text-ink-3")}>
                  {changed ? f.updated : row.cites ? `${row.cites} source-backed` : "From your brief"}
                </span>
              </span>
              {row.cites > 0 && (
                <span className={cn("shrink-0 rounded-chip bg-ok-bg px-1 py-px text-micro font-bold text-ok", changed && "auth-pop")}>
                  <Check className="inline size-2.5 stroke-[3]" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-col border-l border-hair bg-card">
        <div className="flex items-center gap-1 border-b border-hair px-2 py-1.5 text-micro font-bold text-ink">
          <span className="size-1.5 rounded-full bg-brand" />
          Direct with SwishX
        </div>
        <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden p-2">
          <span className="max-w-[92%] rounded-panel bg-subtle px-2 py-1 text-micro leading-snug text-ink-2">Here&apos;s your plan. Ask for any change.</span>
          {sub >= 1 && (
            <span className="auth-pop max-w-[92%] self-end rounded-panel bg-ink px-2 py-1 text-micro font-semibold leading-snug text-white">{f.ask}</span>
          )}
          {sub >= 2 && (
            <span className="auth-pop max-w-[92%] rounded-panel bg-subtle px-2 py-1 text-micro leading-snug text-ink-2">
              {f.done}
            </span>
          )}
        </div>
        <div className="m-1.5 flex items-center gap-1 rounded-chip border border-hair-2 py-1 pl-2 pr-1">
          <span className="flex-1 truncate text-micro text-ink-4">{sub === 0 ? "Suggest a change…" : f.ask}</span>
          <span className="grid size-4 place-items-center rounded-full bg-ink text-white">
            <Send className="size-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Make: the format's editor, with its claims checked beside it ─────── */

function Canvas({ id }: { id: FormatId }) {
  if (id === "video") {
    return (
      <div className="auth-pop flex h-full flex-col justify-between rounded-md p-3 text-white" style={{ background: "#1e2b4a" }}>
        <div>
          <span className="block h-0.5 w-5 rounded-full bg-brand" />
          <b className="mt-1.5 block text-body font-extrabold">Mechanism of action.</b>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {["Product truth", "Clinical proof", "Claim status"].map((t) => (
            <span key={t} className="rounded-sm border border-white/15 bg-white/[.06] px-1 py-1 text-micro font-semibold">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={cn("grid size-4 place-items-center rounded-full text-micro font-bold", n === 2 ? "bg-brand" : "border border-white/30")}>{n}</span>
          ))}
        </div>
      </div>
    );
  }
  if (id === "infographic") {
    return (
      <div className="auth-pop flex h-full flex-col justify-between rounded-md border border-hair bg-card p-3">
        <div>
          <b className="block text-display font-black leading-none text-accent-violet">52%</b>
          <span className="text-micro text-ink-3">reached PASI 90 at Week 16</span>
        </div>
        <div className="flex h-[55%] items-end gap-3 px-2">
          {[
            { v: 100, l: "Velmora", c: "var(--color-accent-violet)" },
            { v: 35, l: "Placebo", c: "#d6d3d1" },
          ].map((b) => (
            <div key={b.l} className="flex h-full flex-1 flex-col justify-end gap-0.5 text-center">
              <span className="w-full rounded-t-sm" style={{ height: `${b.v}%`, background: b.c, animation: "auth-grow 900ms var(--ease-entrance) both", transformOrigin: "bottom" }} />
              <span className="text-micro text-ink-3">{b.l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (id === "ad") {
    /* The same design, as each platform shows it. */
    const head = (p: Platform, name: string) => (
      <span className="flex items-center gap-1 px-1.5 py-1">
        <PlatformMark id={p} size={10} />
        <b className="text-micro leading-none text-ink">{name}</b>
        <span className="ml-auto text-micro leading-none text-ink-4">Sponsored</span>
      </span>
    );
    const art = "linear-gradient(150deg,#3b2370,#7c2d12 70%,#c2410c)";
    return (
      <div className="grid h-full grid-cols-[1fr_0.72fr_1.15fr] gap-1.5">
        {/* Meta feed post */}
        <div className="auth-pop flex flex-col overflow-hidden rounded-md border border-hair bg-card shadow-soft">
          {head("meta", "velmora")}
          <div className="flex flex-1 flex-col justify-end p-1.5" style={{ background: art }}>
            <b className="text-caption leading-tight text-white">52% at Week 16</b>
            <span className="text-micro text-white/75">PASI 90 · EMBRACE-3</span>
          </div>
          <span className="flex items-center justify-between gap-1 px-1.5 py-1">
            <span className="truncate text-micro text-ink-3">velmora.com</span>
            <span className="shrink-0 rounded-sm bg-subtle px-1 text-micro font-bold text-ink">Learn more</span>
          </span>
        </div>

        {/* TikTok vertical */}
        <div className="auth-pop relative flex flex-col justify-end overflow-hidden rounded-md p-1.5 text-white shadow-soft" style={{ background: "linear-gradient(170deg,#111827,#3b2370 60%,#c2410c)", animationDelay: "140ms" }}>
          <span className="absolute left-1.5 top-1.5 rounded-sm bg-black/40 px-1 py-px">
            <TikTokLogo size={10} />
          </span>
          <span className="absolute right-1 top-1/3 flex flex-col gap-1.5">
            {[0, 1, 2].map((k) => <span key={k} className="size-2.5 rounded-full bg-white/70" />)}
          </span>
          <b className="text-micro leading-tight">One tablet, once a day</b>
          <span className="text-micro text-white/70">@velmora · Sponsored</span>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          {/* YouTube in-stream */}
          <div className="auth-pop relative flex-1 overflow-hidden rounded-md shadow-soft" style={{ background: art, animationDelay: "280ms" }}>
            <span className="absolute left-1.5 top-1.5"><YouTubeLogo size={12} /></span>
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-5 place-items-center rounded-full bg-white/90"><Play className="ml-px size-2.5 fill-ink text-ink" /></span>
            </span>
            <span className="absolute bottom-1 left-1.5 rounded-sm px-1 text-micro font-bold text-ink" style={{ background: "#fbbf24" }}>Ad · 0:06</span>
            <span className="absolute bottom-1 right-1.5 rounded-sm bg-black/60 px-1 text-micro font-semibold text-white">Skip ›</span>
          </div>
          {/* LinkedIn post */}
          <div className="auth-pop overflow-hidden rounded-md border border-hair bg-card shadow-soft" style={{ animationDelay: "420ms" }}>
            {head("linkedin", "Velmora HCP")}
            <span className="block px-1.5 pb-1 text-micro leading-tight text-ink-2">New 3-year data for dermatologists</span>
          </div>
        </div>
      </div>
    );
  }
  if (id === "email") {
    return (
      <div className="auth-pop flex h-full flex-col overflow-hidden rounded-md border border-hair bg-card">
        <div className="flex items-center gap-1 border-b border-hair px-2 py-1">
          <span className="size-2.5 rounded-sm" style={{ background: HEADER_ART }} />
          <b className="text-caption text-ink">Velmora</b>
          <span className="ml-auto text-micro font-bold text-accent-violet underline">PI · ISI</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 px-2.5 py-2">
          <b className="text-caption leading-tight text-ink">Following up on our conversation</b>
          <span className="text-micro text-ink-3">Dear Dr. Okafor,</span>
          <b className="text-display font-black leading-none text-accent-violet">52%</b>
          <span className="text-micro text-ink-2">reached PASI 90 at Week 16</span>
          <span className="mt-auto self-center rounded-sm bg-accent-violet px-2.5 py-0.5 text-micro font-bold text-white">Book a follow-up</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full gap-2">
      {[0, 1].map((p) => (
        <div key={p} className="auth-pop flex flex-1 flex-col gap-1 rounded-md border border-hair bg-card p-2" style={{ animationDelay: `${p * 160}ms` }}>
          <span className="h-2 w-3/4 rounded-full" style={{ background: HEADER_ART }} />
          {p === 0 ? <b className="text-display font-black leading-none text-accent-violet">52%</b> : <span className="h-6 rounded-sm bg-subtle" />}
          <span className="h-1 w-full rounded-full bg-hair-2" />
          <span className="h-1 w-5/6 rounded-full bg-hair-2" />
          <span className="h-1 w-2/3 rounded-full bg-hair-2" />
          <span className="mt-auto h-3 w-full rounded-sm bg-subtle" />
        </div>
      ))}
    </div>
  );
}

function BottomStrip({ f }: { f: Format }) {
  if (f.id === "video") {
    return (
      <>
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink text-white">
          <Play className="ml-px size-2.5 fill-current" />
        </span>
        <span className="shrink-0 text-micro font-semibold tabular-nums text-ink-3">0:14 / 1:00</span>
        {f.plan.map((row, i) => (
          <span key={row.title} className={cn("h-[60%] flex-1 rounded-sm", i === 1 && "ring-2 ring-brand")} style={{ background: row.tone }} />
        ))}
      </>
    );
  }
  if (f.id === "doc") {
    return (
      <>
        {["Page 1", "Page 2"].map((pg, i) => (
          <span key={pg} className={cn("flex h-[70%] items-center gap-1 rounded-sm border px-1.5", i === 0 ? "border-brand bg-tint" : "border-hair-2 bg-canvas")}>
            <span className="h-full w-3 rounded-px border border-hair-2 bg-card" />
            <span className="text-micro font-semibold text-ink-2">{pg}</span>
          </span>
        ))}
        <span className="ml-auto text-micro font-semibold text-ink-3">US Letter · print-ready PDF</span>
      </>
    );
  }
  if (f.id === "ad") {
    return (
      <>
        {f.plan.map((row, i) => (
          <span key={row.title} className={cn("inline-flex min-w-0 items-center gap-1 rounded-chip border px-1.5 py-0.5 text-micro font-semibold", i === 0 ? "border-brand bg-tint text-brand-deep" : "border-hair-2 text-ink-3")}>
            {row.platform && <PlatformMark id={row.platform} size={10} />}
            <span className="truncate">{row.title.split(" · ")[1]}</span>
          </span>
        ))}
      </>
    );
  }
  if (f.id === "email") {
    return (
      <>
        <span className="shrink-0 text-micro font-bold text-ink-3">Subject</span>
        <span className="min-w-0 flex-1 truncate rounded-sm bg-canvas px-1.5 py-0.5 text-micro text-ink">Following up on our conversation</span>
        <span className="flex shrink-0 overflow-hidden rounded-chip border border-hair-2 text-micro font-semibold">
          <span className="bg-ink px-1.5 py-0.5 text-white">Desktop</span>
          <span className="px-1.5 py-0.5 text-ink-3">Mobile</span>
        </span>
      </>
    );
  }
  return (
    <>
      <span className="text-micro font-bold text-ink-3">Export</span>
      {["1080 × 1350", "PNG", "PDF"].map((x, i) => (
        <span key={x} className={cn("rounded-chip border px-1.5 py-0.5 text-micro font-semibold", i === 0 ? "border-brand bg-tint text-brand-deep" : "border-hair-2 text-ink-3")}>{x}</span>
      ))}
      <span className="ml-auto text-micro font-semibold text-ink-3">4:5 · feed and print</span>
    </>
  );
}

const CLAIMS = [
  { text: "52% reached PASI 90", src: "EMBRACE-3", cited: true },
  { text: "One tablet, once a day", src: "PI §2.1", cited: true },
  { text: "Clearer skin in two days", src: "No source", cited: false },
];

function Make({ f, sub }: { f: Format; sub: number }) {
  const checked = sub >= 1;
  return (
    <div className="absolute inset-0 flex flex-col bg-canvas">
      <div className="flex h-[15%] items-center gap-2 border-b border-hair bg-card px-2.5">
        <b className="truncate text-caption text-ink">{f.title}</b>
        <span className="mx-auto flex gap-1">
          {[Type, ImageIcon, Shapes].map((Icon, i) => (
            <span key={i} className={cn("grid size-5 place-items-center rounded-sm", i === 1 ? "bg-tint text-brand" : "text-ink-3")}>
              <Icon className="size-3" />
            </span>
          ))}
        </span>
        <span className={cn("rounded-chip px-2 py-0.5 text-micro font-bold transition-colors duration-300", sub >= 2 ? "bg-brand text-white" : "border border-hair-2 text-ink")}>Share</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="relative min-w-0 p-2.5">
          <div key={f.id} className="h-full">
            <Canvas id={f.id} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-1 border-l border-hair bg-card p-2">
          <span className="text-micro font-extrabold uppercase tracking-wider text-ink-4">Claims</span>
          {CLAIMS.map((c, i) => (
            <div key={c.text} className="flex items-center gap-1.5 rounded-sm bg-canvas px-1.5 py-1">
              <span
                className={cn(
                  "grid size-3.5 shrink-0 place-items-center rounded-full transition-colors duration-500",
                  !checked && "bg-subtle text-ink-4",
                  checked && c.cited && "bg-ok-bg text-ok",
                  checked && !c.cited && "bg-warn-bg text-warn"
                )}
                style={{ transitionDelay: `${i * 260}ms` }}
              >
                {!checked ? <Loader2 className="size-2.5 animate-spin" /> : c.cited ? <Check className="size-2.5 stroke-[3.5]" /> : <X className="size-2.5 stroke-[3.5]" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-micro font-semibold", checked && !c.cited ? "text-ink-4 line-through" : "text-ink")}>{c.text}</span>
                <span className="block truncate text-micro text-ink-4">{checked ? c.src : "Checking…"}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What sits under each editor: video's timeline, a doc's pages, an ad's sizes… */}
      <div className="flex h-[16%] items-center gap-1.5 border-t border-hair bg-card px-2.5">
        <BottomStrip f={f} />
      </div>

      {sub >= 2 && (
        <div className="absolute inset-x-0 bottom-[3%] flex justify-center">
          <span key={sub} className="auth-pop inline-flex items-center gap-1.5 rounded-chip bg-ink py-1 pl-1 pr-3 text-caption font-bold text-white shadow-float">
            {sub === 2 ? (
              <span className="grid size-5 place-items-center rounded-full bg-ok-on-dark/20">
                <Check className="size-3 stroke-[3] text-ok-on-dark" />
              </span>
            ) : (
              <Face who="you" size={20} />
            )}
            {sub === 2 ? "Ready for your review · every claim cited" : "Approved by you · sent to MLR review"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── The window ────────────────────────────────────────────────────────── */

const PEOPLE: Who[] = ["you", ...TEAM.map((m) => m.key)];

export function StudioDemo() {
  const [still] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const { f: fi, b: bi, jump } = useDemo(still);
  const f = FORMATS[fi];
  const list = beats(f);
  const beat = list[bi];
  const step = stepOf(beat);
  const working = Object.keys(beat.cursors) as Who[];
  const worked = new Set(list.slice(0, bi).flatMap((b) => Object.keys(b.cursors) as Who[]));

  /* Each cursor stays where it last was while its owner rests, so the next move glides from there. */
  const lastAt = (w: Who): [number, number] => {
    for (let k = bi; k >= 0; k--) {
      const c = list[k].cursors[w];
      if (c) return c.at;
    }
    return [50, 110];
  };

  return (
    <div className="max-w-[720px]">
      {/* What it can make. Click one to watch it. */}
      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="What SwishX makes">
        {FORMATS.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={i === fi}
            onClick={() => jump(i)}
            className={cn(
              "focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-chip border px-3 py-1.5 text-label font-semibold transition-all duration-300",
              i === fi
                ? "border-transparent bg-card text-ink shadow-soft"
                : "border-white/15 bg-white/[.03] text-white/60 hover:border-white/30 hover:bg-white/[.08] hover:text-white"
            )}
          >
            <x.icon className="size-3.5" />
            {x.label}
            {i === fi && (
              <span className="relative ml-0.5 h-1 w-6 overflow-hidden rounded-full bg-hair-2">
                <span key={`${fi}-${bi}`} className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-500" style={{ width: `${((bi + 1) / list.length) * 100}%` }} />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-card bg-card shadow-on-dark ring-1 ring-white/10">
        {/* Window chrome: the product's steps, and who's in it right now. */}
        <div className="relative flex items-center gap-3 border-b border-hair px-3 py-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-hair-3" />
            <span className="size-2.5 rounded-full bg-hair-3" />
            <span className="size-2.5 rounded-full bg-hair-3" />
          </span>
          <span className="inline-flex items-center gap-1 text-caption font-extrabold tracking-tight text-ink">
            <LogoMark size={13} />
            swish<span className="text-brand">X</span>
          </span>
          <span className="mx-auto flex items-center gap-2">
            <span className="flex items-center gap-0.5 rounded-chip bg-subtle p-0.5">
              {STEPS.map((st, i) => (
                <span
                  key={st}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-caption font-semibold transition-all duration-300",
                    i === step ? "bg-card text-ink shadow-soft" : i < step ? "text-ink-2" : "text-ink-4"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-3.5 place-items-center rounded-full text-micro font-bold transition-colors",
                      i < step ? "bg-ok text-white" : i === step ? "bg-brand text-white" : "bg-hair-2 text-ink-4"
                    )}
                  >
                    {i < step ? <Check className="size-2 stroke-[4]" /> : i + 1}
                  </span>
                  {st}
                </span>
              ))}
            </span>
          </span>
          <span className="flex -space-x-1.5" aria-label="Working now">
            {working.map((w) => (
              <span key={w} className="auth-pop rounded-full ring-2 ring-card" style={{ background: "var(--card)" }}>
                <Face who={w} size={18} />
              </span>
            ))}
          </span>
        </div>

        <div className="grid grid-cols-[172px_minmax(0,1fr)]">
          {/* The team: always here, whoever's working lit up. */}
          <div className="flex flex-col gap-1 border-r border-hair bg-canvas p-2">
            {PEOPLE.map((w) => {
              const on = working.includes(w);
              const colour = colourOf(w);
              return (
                <div
                  key={w}
                  className={cn("flex items-center gap-2 rounded-panel px-1.5 py-1 transition-all duration-300", on ? "bg-card shadow-soft" : "opacity-70")}
                  style={on ? { boxShadow: `0 0 0 1.5px ${colour}55, 0 6px 16px -10px ${colour}` } : undefined}
                >
                  <span className={cn("relative shrink-0 transition-transform duration-300", on && "scale-110")}>
                    <Face who={w} size={24} />
                    {on && <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-card" style={{ background: colour, animation: "chat-pulse 1.2s ease-in-out infinite" }} />}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <b className="block truncate text-caption text-ink">{w === "you" ? "You" : TEAM.find((m) => m.key === w)!.name}</b>
                    <span className={cn("block truncate text-micro", on ? "font-bold" : "text-ink-4")} style={on ? { color: colour } : undefined}>
                      {on ? "Working…" : worked.has(w) ? "Done" : "Ready"}
                    </span>
                  </span>
                  {!on && worked.has(w) && <Check className="size-3 shrink-0 text-ok" />}
                </div>
              );
            })}

            {/* What the one talking is saying. */}
            <div key={`${fi}-${bi}`} className="rise-in mt-auto rounded-panel bg-card p-2 shadow-soft">
              <span className="flex items-center gap-1 text-micro font-extrabold uppercase tracking-wider" style={{ color: colourOf(beat.who) }}>
                <Face who={beat.who} size={14} />
                {SHORT[beat.who]}
              </span>
              <p className="mt-1 text-caption leading-snug text-ink-2">{beat.line}</p>
            </div>
          </div>

          {/* The stage, with everyone's cursors over it. */}
          <div className="relative h-[310px] overflow-hidden">
            {beat.scene === "sources" && <Sources f={f} sub={beat.sub} />}
            {beat.scene === "plan" && <Plan key={f.id} f={f} sub={beat.sub} />}
            {beat.scene === "make" && <Make f={f} sub={beat.sub} />}
            {PEOPLE.map((w) => (
              <AgentCursor key={w} who={w} at={lastAt(w)} show={w in beat.cursors} click={Boolean(beat.cursors[w]?.click)} tick={`${fi}-${bi}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A teammate's cursor, multiplayer-style: their colour, their face, their name. */
function AgentCursor({ who, at, show, click, tick }: { who: Who; at: [number, number]; show: boolean; click: boolean; tick: string }) {
  const colour = colourOf(who);
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute z-30"
      style={{
        left: `${at[0]}%`,
        top: `${at[1]}%`,
        opacity: show ? 1 : 0,
        transition: "left .8s cubic-bezier(.25,1,.5,1), top .8s cubic-bezier(.25,1,.5,1), opacity .35s ease",
      }}
    >
      {show && click && (
        <span key={tick} className="absolute -left-3 -top-3 size-6 rounded-full" style={{ background: colour, opacity: 0.35, animation: "auth-ripple .7s ease-out .65s both" }} />
      )}
      <svg key={`c-${tick}`} width="15" height="19" viewBox="0 0 16 20" style={{ animation: show && click ? "auth-click .4s ease .65s" : undefined, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}>
        <path d="M1 1v16l4.2-4 2.6 6 2.6-1.1-2.6-5.9H14z" fill={colour} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span className="absolute left-3 top-4 flex items-center gap-1 whitespace-nowrap rounded-chip py-0.5 pl-0.5 pr-2 text-micro font-bold text-white shadow-soft" style={{ background: colour }}>
        <span className="grid size-3.5 place-items-center overflow-hidden rounded-full bg-card">
          <Face who={who} size={who === "you" ? 14 : 12} />
        </span>
        {SHORT[who]}
      </span>
    </span>
  );
}
