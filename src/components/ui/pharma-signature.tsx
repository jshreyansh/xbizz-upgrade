/**
 * Signature brand visual — a restrained, editorial line-art piece evoking
 * pharma/health without leaning on medical clip-art: a molecular lattice
 * (atoms + bonds) crossed by a single clinical pulse trace, set against a
 * warm brand-to-transparent glow. Pure inline SVG, no external assets, so
 * it scales cleanly wherever it's dropped in — dark hero bands, the auth
 * flow, onboarding. Renders in currentColor + var(--brand) so it reads
 * correctly on both dark and light grounds.
 */
export function PharmaSignature({
  className,
  id = "pharma-sig",
}: {
  className?: string;
  id?: string;
}) {
  const glowId = `${id}-glow`;
  const lineId = `${id}-line`;

  return (
    <svg
      viewBox="0 0 640 640"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glowId} cx="62%" cy="38%" r="60%">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
          <stop offset="55%" stopColor="var(--brand-deep)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={lineId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0" />
          <stop offset="18%" stopColor="var(--brand)" stopOpacity="0.9" />
          <stop offset="82%" stopColor="var(--brand-2)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--brand-2)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="400" cy="240" r="280" fill={`url(#${glowId})`} />

      {/* Faint orbit rings — the "molecule" structure */}
      <circle cx="360" cy="260" r="150" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
      <circle cx="360" cy="260" r="94" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />

      {/* Bonds */}
      <g stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.3">
        <line x1="360" y1="260" x2="242" y2="176" />
        <line x1="360" y1="260" x2="474" y2="150" />
        <line x1="360" y1="260" x2="500" y2="300" />
        <line x1="360" y1="260" x2="410" y2="400" />
        <line x1="360" y1="260" x2="248" y2="360" />
        <line x1="242" y1="176" x2="474" y2="150" strokeOpacity="0.12" />
      </g>

      {/* Atoms */}
      <circle cx="360" cy="260" r="7" fill="var(--brand)" />
      <circle cx="242" cy="176" r="4.5" fill="currentColor" fillOpacity="0.55" />
      <circle cx="474" cy="150" r="5.5" fill="var(--brand-2)" fillOpacity="0.85" />
      <circle cx="500" cy="300" r="4" fill="currentColor" fillOpacity="0.4" />
      <circle cx="410" cy="400" r="5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="248" cy="360" r="4" fill="currentColor" fillOpacity="0.35" />

      {/* Clinical pulse trace, crossing the whole piece */}
      <path
        d="M0 470 H210 L240 470 L260 400 L285 520 L310 340 L335 470 L360 430 L385 470 H640"
        stroke={`url(#${lineId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Fine scatter — a light dust of dots suggesting data / precision */}
      <g fill="currentColor" fillOpacity="0.18">
        <circle cx="140" cy="120" r="1.6" />
        <circle cx="180" cy="90" r="1.2" />
        <circle cx="520" cy="440" r="1.6" />
        <circle cx="560" cy="480" r="1.2" />
        <circle cx="120" cy="480" r="1.4" />
        <circle cx="580" cy="200" r="1.4" />
      </g>
    </svg>
  );
}
