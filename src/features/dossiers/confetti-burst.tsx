"use client";

import { useState } from "react";

/* ─── Lightweight CSS confetti burst — no external deps ────────────────────────
   Renders N absolutely-positioned pieces that fall + spin + fade once on mount.
   Purely decorative, aria-hidden, and pointer-events: none. ─────────────────── */

const CONFETTI_COLORS = [
  "var(--brand)",
  "#ff9a5e",
  "#3d6bff",
  "#9b5bff",
  "#16b878",
  "#ffb020",
];

interface ConfettiPiece {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  size: number;
  color: string;
  round: boolean;
}

export function ConfettiBurst({ count = 60 }: { count?: number }) {
  // Piece layout is randomized exactly once, via a useState lazy initializer —
  // React guarantees this factory runs only on first mount, never on re-render,
  // so it's the sanctioned place for one-time impure setup (unlike useMemo,
  // which can re-run and would violate render purity).
  const [pieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 260,
      duration: 1100 + Math.random() * 900,
      drift: (Math.random() - 0.5) * 160,
      spin: 220 + Math.random() * 420,
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      round: Math.random() > 0.5,
    }))
  );

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.42),
            borderRadius: p.round ? "50%" : 2,
            background: p.color,
            opacity: 0,
            ["--confetti-drift" as string]: `${p.drift}px`,
            ["--confetti-spin" as string]: `${p.spin}deg`,
            animation: `confetti-fall ${p.duration}ms cubic-bezier(0.2, 0.6, 0.4, 1) ${p.delay}ms 1 both`,
          }}
        />
      ))}
    </div>
  );
}
