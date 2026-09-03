import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/logo-mark";

export function SwishXMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={26} className="text-brand" />
      {!compact && (
        <span className="text-title font-extrabold tracking-[-0.035em] text-ink">
          swish<span className="text-brand">X</span>
        </span>
      )}
    </div>
  );
}
