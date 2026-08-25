import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/logo-mark";

export function SwishXMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={26} className="text-[var(--brand)]" />
      {!compact && (
        <span className="text-[17px] font-extrabold tracking-[-0.035em] text-[var(--ink)]">
          swish<span className="text-[var(--brand)]">X</span>
        </span>
      )}
    </div>
  );
}
