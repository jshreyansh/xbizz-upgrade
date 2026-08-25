import { cn } from "@/lib/cn";

export function SwishXMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-[10px] bg-[var(--brand)] text-white shadow-sm">
        <span className="absolute -right-2 -top-2 size-5 rounded-full bg-[var(--lime)] opacity-90" />
        <span className="relative text-[14px] font-black tracking-[-0.06em]">SX</span>
      </span>
      {!compact && (
        <span className="text-[17px] font-extrabold tracking-[-0.035em] text-[var(--ink)]">SwishX</span>
      )}
    </div>
  );
}
