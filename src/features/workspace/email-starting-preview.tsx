"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays, Check, FileText, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { HEADER_ART } from "@/features/workspace/email-canvas";

/**
 * A starting point's example, drawn as the email itself.
 *
 * A marketer picking a starting point is picking what lands in a doctor's
 * inbox, so the tile shows that: who it's from, the subject, the brand bar,
 * the body each kind of email leads with, its button, and the safety
 * information under it. It is drawn once at email width and scaled to the
 * tile or the preview, so both are the same picture.
 */
export type ThumbBlock =
  | { kind: "photo"; src: string; alt: string; play?: boolean }
  | { kind: "stat"; title: string; value: string; label: string }
  | { kind: "bars"; title: string; rows: Array<[string, number]> }
  | { kind: "note"; text: string }
  | { kind: "text"; text: string }
  | { kind: "doc"; title: string; meta: string }
  | { kind: "checks"; items: string[] }
  | { kind: "steps"; items: string[] }
  | { kind: "date"; day: string; date: string; month: string; title: string; place: string }
  | { kind: "sessions"; items: Array<[string, string]> }
  | { kind: "quote"; cite: string; text: string };

export interface EmailThumbSpec {
  from: "rep" | "hq" | "msl";
  to: "hcp" | "pt";
  subject: string;
  blocks: ThumbBlock[];
  cta?: string;
  /** A line under the brand bar, e.g. that the email is non-promotional. */
  tag?: string;
}

/** The width the email is drawn at, before it is scaled to fit. */
const DESIGN_W = 560;
const DESIGN_H = (DESIGN_W * 9) / 16;
const FONT = "Arial, Helvetica, sans-serif";

const SENDER = {
  rep: { name: "Priya Menon", meta: "Velmora · Specialty Representative" },
  hq: { name: "Velmora Medical Team", meta: "medical@velmora-hcp.com" },
  msl: { name: "Dr. Anita Rao", meta: "Medical Science Liaison" },
};

const px = (n: number) => ({ fontSize: n });

function Avatar({ from }: { from: EmailThumbSpec["from"] }) {
  if (from === "rep") {
    // eslint-disable-next-line @next/next/no-img-element -- a sender photo in the drawn email
    return <img src="/email/rep-portrait.jpg" alt="" className="size-7 shrink-0 rounded-full object-cover" />;
  }
  if (from === "hq") return <span aria-hidden className="size-7 shrink-0 rounded-full" style={{ background: HEADER_ART }} />;
  return (
    <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-blue font-bold text-white" style={px(10)}>
      AR
    </span>
  );
}

function Block({ b }: { b: ThumbBlock }) {
  switch (b.kind) {
    case "photo":
      return (
        <div className="relative -mx-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- a hosted email image */}
          <img src={b.src} alt={b.alt} className="block aspect-[5/2] w-full object-cover" />
          {b.play && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-11 place-items-center rounded-full bg-card/95 shadow-soft">
                <Play className="ml-0.5 size-5 fill-accent-violet text-accent-violet" />
              </span>
            </span>
          )}
        </div>
      );
    case "stat":
      return (
        <div className="border-t border-hair pt-2.5">
          <div className="font-bold uppercase tracking-wider text-accent-violet" style={px(9)}>{b.title}</div>
          <div className="font-black leading-none text-accent-violet" style={px(34)}>{b.value}</div>
          <div className="mt-1 text-ink-2" style={px(12)}>
            {b.label}
            <sup className="font-bold text-accent-violet">1</sup>
          </div>
        </div>
      );
    case "bars":
      return (
        <div className="border-t border-hair pt-2.5">
          <div className="mb-1.5 font-bold uppercase tracking-wider text-accent-violet" style={px(9)}>{b.title}</div>
          <div className="flex flex-col gap-1.5">
            {b.rows.map(([label, value], i) => (
              <div key={label} className="flex items-center gap-2" style={px(10)}>
                <span className="w-20 shrink-0 text-ink-2">{label}</span>
                <span className={cn("h-3 rounded-r-sm", i === 0 ? "bg-accent-violet" : "bg-hair-3")} style={{ width: `${value * 0.75}%` }} />
                <b className={i === 0 ? "text-accent-violet" : "text-ink-3"}>{value}%</b>
              </div>
            ))}
          </div>
        </div>
      );
    case "note":
      return (
        <p className="border-l-[3px] border-accent-violet bg-subtle px-2.5 py-1.5 italic leading-snug text-ink-2" style={px(12)}>
          {b.text}
        </p>
      );
    case "text":
      return <p className="leading-snug text-ink-2" style={px(12)}>{b.text}</p>;
    case "doc":
      return (
        <div className="flex items-center gap-2.5 rounded-sm border border-hair-2 p-2">
          <span className="grid h-9 w-7 shrink-0 place-items-center rounded-sm text-white" style={{ background: HEADER_ART }}>
            <FileText className="size-3.5" />
          </span>
          <span className="min-w-0">
            <b className="block truncate text-ink" style={px(12)}>{b.title}</b>
            <span className="block truncate text-ink-3" style={px(10)}>{b.meta}</span>
          </span>
          <span className="ml-auto shrink-0 font-bold text-accent-violet underline" style={px(10)}>Open ›</span>
        </div>
      );
    case "checks":
      return (
        <ul className="flex flex-col gap-1">
          {b.items.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-ink-2" style={px(11)}>
              <Check className="size-3 shrink-0 text-accent-violet" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {b.items.map((item, i) => (
            <div key={item} className="rounded-sm bg-subtle p-2">
              <b className="block text-accent-violet" style={px(16)}>{i + 1}</b>
              <span className="leading-tight text-ink-2" style={px(10)}>{item}</span>
            </div>
          ))}
        </div>
      );
    case "date":
      return (
        <div className="flex items-center gap-3 rounded-sm border border-hair-2 p-2.5">
          <span className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-sm border border-hair-2 text-center">
            <span className="w-full py-0.5 font-bold uppercase text-white" style={{ ...px(8), background: HEADER_ART }}>{b.month}</span>
            <b className="leading-none text-ink" style={px(20)}>{b.date}</b>
            <span className="pb-0.5 font-bold uppercase text-ink-3" style={px(8)}>{b.day}</span>
          </span>
          <span className="min-w-0">
            <b className="block leading-tight text-ink" style={px(13)}>{b.title}</b>
            <span className="mt-0.5 flex items-center gap-1 text-ink-3" style={px(10)}>
              <CalendarDays className="size-3 shrink-0" />
              {b.place}
            </span>
          </span>
        </div>
      );
    case "sessions":
      return (
        <div className="flex flex-col divide-y divide-hair rounded-sm border border-hair-2">
          {b.items.map(([time, title]) => (
            <div key={title} className="flex gap-2.5 px-2.5 py-1.5" style={px(11)}>
              <b className="w-14 shrink-0 text-accent-violet">{time}</b>
              <span className="text-ink-2">{title}</span>
            </div>
          ))}
        </div>
      );
    case "quote":
      return (
        <div className="rounded-sm bg-subtle p-2.5">
          <div className="font-bold uppercase tracking-wider text-ink-3" style={px(9)}>{b.cite}</div>
          <p className="mt-1 leading-snug text-ink-2" style={px(11)}>&ldquo;{b.text}&rdquo;</p>
        </div>
      );
  }
}

/** The email, at email width. */
function EmailDraw({ spec, large }: { spec: EmailThumbSpec; large?: boolean }) {
  const sender = SENDER[spec.from];
  return (
    <div className="bg-card text-ink" style={{ fontFamily: FONT }}>
      {/* The reading pane: subject, then who it's from. */}
      <div className="border-b border-hair bg-canvas px-4 py-2">
        <div className="truncate font-bold text-ink" style={px(14)}>{spec.subject}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <Avatar from={spec.from} />
          <span className="min-w-0 flex-1 leading-tight">
            <b className="block truncate text-ink" style={px(11)}>{sender.name}</b>
            <span className="block truncate text-ink-3" style={px(10)}>
              {sender.meta} · to {spec.to === "pt" ? "P&T Committee" : "Dr. Daniel Okafor"}
            </span>
          </span>
          <span className="shrink-0 text-ink-3" style={px(10)}>9:41 AM</span>
        </div>
      </div>

      <div className="px-5">
        {large && <div className="pt-2 text-ink-3" style={px(8)}>For US healthcare professionals only</div>}
        <div className="flex items-center justify-between border-b border-hair py-1.5">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-4 rounded-sm" style={{ background: HEADER_ART }} />
            <b className="tracking-tight text-ink" style={px(16)}>
              Velmora<sup style={px(8)}>®</sup>
            </b>
          </span>
          <span className="flex gap-2 font-bold text-accent-violet underline" style={px(8)}>
            <span>Prescribing Information</span>
            <span>Important Safety Information</span>
          </span>
        </div>
        {spec.tag && (
          <div className="pt-2 font-bold uppercase tracking-wider text-accent-blue" style={px(8)}>{spec.tag}</div>
        )}

        <div className="flex flex-col gap-2 py-2.5">
          {spec.blocks[0]?.kind === "photo" && <Block b={spec.blocks[0]} />}
          <p className="text-ink-2" style={px(12)}>{spec.to === "pt" ? "Dear P&T Committee members," : "Dear Dr. Okafor,"}</p>
          {spec.blocks.slice(spec.blocks[0]?.kind === "photo" ? 1 : 0).map((b, i) => (
            <Block key={i} b={b} />
          ))}
          {spec.cta && (
            <div className="pt-1 text-center">
              <span className="inline-block rounded-sm bg-accent-violet px-5 py-2 font-bold text-white" style={px(12)}>{spec.cta}</span>
            </div>
          )}
          <p className="border-t border-hair pt-2 leading-snug text-ink-2" style={px(11)}>
            {sender.name}
            <br />
            <span className="text-ink-3">{sender.meta}</span>
          </p>
        </div>
      </div>

      {/* The safety information every branded email carries, and the footer. */}
      <div className="border-t-[3px] border-accent-violet bg-subtle px-5 py-3 leading-snug text-ink-2" style={px(9)}>
        <b className="block text-ink" style={px(10)}>IMPORTANT SAFETY INFORMATION</b>
        Serious infections that may lead to hospitalization or death have been reported. Check blood counts before starting
        and during treatment. Please see full <u className="text-accent-violet">Prescribing Information</u>, including Boxed Warning.
      </div>
      <div className={cn("bg-ink px-5 py-2.5 leading-snug text-white/70", large ? "pb-4" : "")} style={px(8)}>
        Velmora is a registered trademark of Corvane Pharma US. © 2026 Corvane Pharma US. <u>Unsubscribe</u>
      </div>
    </div>
  );
}

/**
 * The email in a window on the starting point's colour. At tile size it
 * shows the top of the email and, while pointed at, scrolls down to the
 * safety information; in the preview it can be scrolled by hand.
 */
export function EmailThumb({ spec, large, hovered }: { spec: EmailThumbSpec; large?: boolean; hovered?: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / DESIGN_W));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  /* How far the email runs below the window, so hovering lands on its footer.
     Measured again once its photos load, since they set its height. */
  const measure = () => {
    const pane = paneRef.current;
    const content = contentRef.current;
    if (pane && content) setShift(Math.max(0, content.offsetHeight - pane.clientHeight));
  };
  useEffect(measure, [spec, scale]);

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden">
      <div
        className={cn("absolute left-0 top-0 origin-top-left transition-opacity", scale ? "opacity-100" : "opacity-0")}
        style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
      >
        <div
          ref={paneRef}
          className={cn(
            "absolute inset-x-12 top-4 bottom-0 overflow-hidden rounded-t-[10px] shadow-float",
            large ? "pointer-events-auto overflow-y-auto" : "pointer-events-none"
          )}
        >
          <div
            ref={contentRef}
            onLoadCapture={measure}
            className="motion-safe:transition-transform motion-safe:duration-[3200ms] motion-safe:ease-in-out"
            style={{ transform: !large && hovered ? `translateY(-${shift}px)` : undefined }}
          >
            <EmailDraw spec={spec} large={large} />
          </div>
        </div>
      </div>
    </div>
  );
}
