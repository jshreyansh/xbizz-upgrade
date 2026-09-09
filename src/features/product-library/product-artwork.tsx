import type { ReactElement } from "react";

/**
 * Vector "packshot" illustrations standing in for real product photography.
 * Each renders as a soft, glassy render in white/translucent tones so it
 * reads cleanly on top of any of the library's per-product gradients,
 * rather than needing a literal photo asset per product.
 */
export type ArtworkKind = "Tablet" | "Device" | "Syrup" | "Injection" | "Capsule" | "Molecule" | "Lifestyle";

function Ground({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.16} fill="rgba(0,0,0,.16)" style={{ filter: "blur(4px)" }} />;
}

function TabletArt() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="tab-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.55)" />
        </linearGradient>
        <radialGradient id="tab-dome" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="rgba(255,255,255,.98)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.65)" />
        </radialGradient>
      </defs>
      <Ground cx={100} cy={112} rx={58} />
      <rect x={42} y={30} width={116} height={70} rx={12} fill="url(#tab-foil)" opacity={0.22} />
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => (
          <ellipse key={`${col}-${row}`} cx={62 + col * 38} cy={49 + row * 32} rx={14} ry={12} fill="url(#tab-dome)" />
        ))
      )}
    </svg>
  );
}

function CapsuleArt() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="cap-a" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,.98)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.55)" />
        </linearGradient>
        <linearGradient id="cap-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.85)" />
        </linearGradient>
      </defs>
      <Ground cx={100} cy={104} rx={54} />
      <g transform="rotate(-24 100 62)">
        <rect x={48} y={48} width={104} height={30} rx={15} fill="url(#cap-a)" />
        <path d="M100 48 h37 a15 15 0 0 1 15 15 a15 15 0 0 1 -15 15 h-37 Z" fill="url(#cap-b)" />
        <line x1={100} y1={49} x2={100} y2={77} stroke="rgba(0,0,0,.1)" strokeWidth={1} />
      </g>
      <g transform="translate(28 -8) rotate(18 100 62)" opacity={0.75}>
        <rect x={48} y={78} width={72} height={20} rx={10} fill="url(#cap-a)" />
        <path d="M100 78 h20 a10 10 0 0 1 0 20 h-20 Z" fill="url(#cap-b)" />
      </g>
    </svg>
  );
}

function SyrupArt() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="syr-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.35)" />
        </linearGradient>
        <linearGradient id="syr-cap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.95)" />
        </linearGradient>
      </defs>
      <Ground cx={100} cy={118} rx={34} />
      <rect x={82} y={20} width={36} height={12} rx={3} fill="url(#syr-cap)" />
      <rect x={86} y={30} width={28} height={10} fill="rgba(255,255,255,.5)" />
      <path d="M70 40 h60 v66 a10 10 0 0 1 -10 10 h-40 a10 10 0 0 1 -10 -10 Z" fill="url(#syr-glass)" />
      <rect x={78} y={70} width={44} height={38} rx={2} fill="rgba(255,255,255,.95)" opacity={0.9} />
      <line x1={86} y1={82} x2={114} y2={82} stroke="rgba(0,0,0,.14)" strokeWidth={2} />
      <line x1={86} y1={90} x2={108} y2={90} stroke="rgba(0,0,0,.1)" strokeWidth={2} />
      <rect x={72} y={42} width={8} height={60} rx={4} fill="rgba(255,255,255,.5)" />
    </svg>
  );
}

function InjectionArt() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="inj-barrel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.9)" />
        </linearGradient>
      </defs>
      <Ground cx={104} cy={116} rx={58} />
      <g transform="rotate(-30 100 70)">
        <line x1={40} y1={70} x2={58} y2={70} stroke="rgba(255,255,255,.9)" strokeWidth={2.5} />
        <rect x={58} y={62} width={70} height={16} rx={2} fill="url(#inj-barrel)" stroke="rgba(255,255,255,.7)" strokeWidth={1} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={70 + i * 12} y1={62} x2={70 + i * 12} y2={78} stroke="rgba(0,0,0,.14)" strokeWidth={1} />
        ))}
        <rect x={98} y={64} width={26} height={12} rx={1.5} fill="rgba(255,255,255,.55)" />
        <rect x={128} y={64} width={10} height={12} fill="rgba(255,255,255,.9)" />
        <rect x={138} y={67} width={22} height={6} fill="rgba(255,255,255,.95)" />
        <rect x={44} y={64} width={16} height={12} rx={2} fill="rgba(255,255,255,.75)" />
      </g>
      <g transform="translate(40 20)">
        <rect x={26} y={10} width={22} height={30} rx={3} fill="rgba(255,255,255,.55)" />
        <rect x={30} y={4} width={14} height={8} rx={2} fill="rgba(255,255,255,.85)" />
        <rect x={29} y={22} width={16} height={10} fill="rgba(255,255,255,.9)" opacity={0.8} />
      </g>
    </svg>
  );
}

function DeviceArt() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="dev-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.5)" />
        </linearGradient>
      </defs>
      <Ground cx={100} cy={118} rx={40} />
      <g transform="rotate(-14 100 70)">
        <rect x={84} y={24} width={32} height={92} rx={16} fill="url(#dev-body)" />
        <rect x={84} y={24} width={32} height={30} rx={16} fill="rgba(255,255,255,.5)" />
        <rect x={92} y={40} width={16} height={5} rx={2.5} fill="rgba(0,0,0,.12)" />
        <circle cx={100} cy={90} r={9} fill="rgba(255,255,255,.55)" stroke="rgba(0,0,0,.08)" />
        <circle cx={100} cy={90} r={4} fill="rgba(0,0,0,.14)" />
        <rect x={94} y={108} width={12} height={16} rx={4} fill="rgba(255,255,255,.85)" />
      </g>
    </svg>
  );
}

function MoleculeArt() {
  const atoms = [
    [60, 70],
    [95, 50],
    [130, 70],
    [130, 105],
    [95, 125],
    [60, 105],
    [40, 45],
    [150, 45],
  ];
  const bonds: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 0],
    [1, 6],
    [2, 7],
  ];
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
      {bonds.map(([a, b], i) => (
        <line key={i} x1={atoms[a][0]} y1={atoms[a][1]} x2={atoms[b][0]} y2={atoms[b][1]} stroke="rgba(255,255,255,.55)" strokeWidth={2} />
      ))}
      {atoms.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i < 6 ? 7 : 5} fill="rgba(255,255,255,.95)" opacity={i < 6 ? 1 : 0.75} />
      ))}
    </svg>
  );
}

function LifestyleArt() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="life-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx={100} cy={58} r={40} fill="url(#life-sun)" />
      <circle cx={100} cy={58} r={20} fill="rgba(255,255,255,.9)" />
      <path
        d="M30 118 Q70 78 100 100 Q130 122 170 90"
        fill="none"
        stroke="rgba(255,255,255,.6)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path d="M60 112 q8 -20 22 -10 q-4 16 -22 10Z" fill="rgba(255,255,255,.55)" />
      <path d="M120 100 q8 -18 22 -9 q-4 15 -22 9Z" fill="rgba(255,255,255,.45)" />
    </svg>
  );
}

const ARTWORK: Record<ArtworkKind, () => ReactElement> = {
  Tablet: TabletArt,
  Capsule: CapsuleArt,
  Syrup: SyrupArt,
  Injection: InjectionArt,
  Device: DeviceArt,
  Molecule: MoleculeArt,
  Lifestyle: LifestyleArt,
};

export function ProductArtwork({ kind, className }: { kind: ArtworkKind; className?: string }) {
  const Art = ARTWORK[kind];
  return (
    <div className={className}>
      <Art />
    </div>
  );
}
