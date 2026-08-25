import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/logo-mark";

/**
 * SwishX-branded loading indicator — the knot mark spins in place inside a
 * soft brand-gradient tile. Use anywhere the app needs a generic "working…"
 * state (generation pipeline, async fetches, page transitions).
 */
export function BrandLoader({
  size = 68,
  label,
  className,
}: {
  /** Outer tile size in px. The mark scales proportionally inside it. */
  size?: number;
  /** Optional caption rendered below the spinner. */
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)",
          boxShadow: "0 14px 34px -10px rgba(253,72,22,.8)",
        }}
        className="grid place-items-center"
      >
        <LogoMark size={size * 0.5} className="animate-brand-spin text-white" />
      </div>
      {label && (
        <span className="text-[13px] font-semibold text-[var(--ink-3)]">{label}</span>
      )}
    </div>
  );
}
