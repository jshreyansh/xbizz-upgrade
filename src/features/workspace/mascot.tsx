"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TeamMember } from "@/features/workspace/mock-personas";

/**
 * The specialists as characters: one family, five bodies.
 *
 * Each specialist is a different shape and colour — a ball, a cloud, a peak,
 * a block, a tilted tile — so they are told apart at a glance, and they share
 * the same eyes, which is what makes them one family. The eyes do the acting:
 * they blink, glance about, follow the pointer when asked to, close into
 * smiles when happy and look up and away while thinking.
 *
 * Drawn in SVG from code rather than from images, so every size and every
 * state is the same character, with nothing to license.
 */

export type MascotMood = "idle" | "happy" | "thinking";
type EyeStyle = "capsule" | "dash" | "dome" | "slant";

interface Character {
  fill: string;
  body: (fill: string) => ReactNode;
  /** Where the eyes sit, how far apart, and what they look like at rest. */
  eyes: { x: number; y: number; gap: number; style: EyeStyle; tilt: number };
  /** Desynchronises the blinks and glances across the five. */
  delay: number;
}

const CHARACTERS: Record<TeamMember["key"], Character> = {
  /* Content Strategist: a thinking cloud. */
  amber: {
    fill: "#F4A43B",
    body: (f) => (
      <g fill={f}>
        <circle cx="32" cy="60" r="24" />
        <circle cx="66" cy="60" r="25" />
        <circle cx="47" cy="40" r="25" />
        <circle cx="72" cy="40" r="17" />
        <circle cx="27" cy="42" r="15" />
        <rect x="24" y="56" width="52" height="30" rx="14" />
      </g>
    ),
    eyes: { x: 50, y: 55, gap: 18, style: "dash", tilt: -8 },
    delay: 0,
  },
  /* Medical Writer: a round, eager ball. */
  brand: {
    fill: "#F0612B",
    body: (f) => <circle cx="50" cy="52" r="40" fill={f} />,
    eyes: { x: 54, y: 44, gap: 16, style: "capsule", tilt: -14 },
    delay: -1.3,
  },
  /* MLR Reviewer: a steady peak. */
  green: {
    fill: "#2FB47C",
    body: (f) => (
      <path
        fill={f}
        d="M50 9c5 0 9 3 12.5 9.5L90 70c5.5 10.5 0 21-12 21H22C10 91 4.5 80.5 10 70l27.5-51.5C41 12 45 9 50 9z"
      />
    ),
    eyes: { x: 50, y: 67, gap: 17, style: "dome", tilt: 0 },
    delay: -2.6,
  },
  /* Creative Producer: a tall block, like a stack of frames. */
  blue: {
    fill: "#3B7BF6",
    body: (f) => <rect x="21" y="8" width="58" height="84" rx="18" fill={f} transform="rotate(4 50 50)" />,
    eyes: { x: 55, y: 40, gap: 14, style: "capsule", tilt: 0 },
    delay: -3.4,
  },
  /* Project Manager: a tilted tile, always on the move. */
  violet: {
    fill: "#8A5CF5",
    body: (f) => <rect x="14" y="14" width="72" height="72" rx="24" fill={f} transform="rotate(-16 50 50)" />,
    eyes: { x: 50, y: 48, gap: 16, style: "slant", tilt: 34 },
    delay: -4.2,
  },
};

function Eye({ style, tilt, mood }: { style: EyeStyle; tilt: number; mood: MascotMood }) {
  if (mood === "happy") {
    /* Smiling eyes: closed into arcs. */
    return <path d="M-5.5 2.5Q0-5 5.5 2.5" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />;
  }
  const squint = mood === "thinking" ? 0.6 : 1;
  switch (style) {
    case "capsule":
      return <rect x="-3.6" y={-8 * squint} width="7.2" height={16 * squint} rx="3.6" fill="#fff" transform={`rotate(${tilt})`} />;
    case "dash":
      return <rect x="-5.5" y="-2.2" width="11" height="4.4" rx="2.2" fill="#fff" transform={`rotate(${tilt})`} />;
    case "dome":
      return <path d="M-6.5 3.2a6.5 6.5 0 0 1 13 0z" fill="#fff" transform={`scale(1 ${squint})`} />;
    case "slant":
      return <rect x="-6" y="-2.4" width="12" height="4.8" rx="2.4" fill="#fff" transform={`rotate(${tilt})`} />;
  }
}

export function Mascot({
  who,
  size = 72,
  mood = "idle",
  follow = false,
  className,
}: {
  who: TeamMember["key"];
  size?: number;
  mood?: MascotMood;
  /** Eyes follow the pointer around the page. */
  follow?: boolean;
  className?: string;
}) {
  const c = CHARACTERS[who];
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!follow) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        const dx = e.clientX - (box.left + box.width / 2);
        const dy = e.clientY - (box.top + box.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 240) * 4;
        setLook({ x: (dx / dist) * reach, y: (dy / dist) * reach * 0.8 });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [follow]);

  /* Thinking looks up and away; otherwise the pointer, if followed. */
  const offset = mood === "thinking" ? { x: 3.5, y: -3.5 } : look;
  const { x, y, gap, style, tilt } = c.eyes;

  return (
    <svg ref={ref} viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden overflow="visible">
      <g className="mascot-body" data-mood={mood} style={{ animationDelay: mood === "idle" ? `${c.delay}s` : undefined }}>
        {c.body(c.fill)}
        <g style={{ transform: `translate(${x + offset.x}px, ${y + offset.y}px)`, transition: "transform 180ms ease-out" }}>
          <g className={follow || mood !== "idle" ? undefined : "mascot-glance"} style={{ animationDelay: `${c.delay * 1.7}s` }}>
            {/* Big eyes carry the expression, as with any good mascot. */}
            <g className="mascot-blink" style={{ animationDelay: `${c.delay}s`, scale: "1.35" }}>
              <g transform={`translate(${-gap / 2} 0)`}>
                <Eye style={style} tilt={tilt} mood={mood} />
              </g>
              <g transform={`translate(${gap / 2} 0)`}>
                <Eye style={style} tilt={tilt} mood={mood} />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

/** The specialist's colour, for rings, dots and chips beside the mascot. */
export const mascotColour = (who: TeamMember["key"]) => CHARACTERS[who].fill;
