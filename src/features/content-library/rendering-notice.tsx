"use client";

import { useEffect } from "react";
import { Mail, X } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * The video that was sent to render on the way here.
 *
 * Someone who chose "Go to Content Library" over watching the render should
 * not land on a library that has no sign of it. This says which video, its
 * ID, and that an email is coming — then gets out of the way.
 */
export function RenderingNotice() {
  const render = useWorkspaceStore((s) => s.pendingRender);
  const setPendingRender = useWorkspaceStore((s) => s.setPendingRender);

  /* A notice, not a fixture: it goes by itself after a while. */
  useEffect(() => {
    if (!render) return;
    const t = window.setTimeout(() => setPendingRender(null), 14000);
    return () => window.clearTimeout(t);
  }, [render, setPendingRender]);

  if (!render) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rise-in fixed bottom-5 right-5 z-[60] w-[min(380px,calc(100vw-2.5rem))] overflow-hidden rounded-panel border border-hair bg-card shadow-float"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-control border border-tint-line bg-tint">
          <LogoMark size={18} className="animate-pulse text-brand" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body-lg font-[850] text-ink">Your video is being rendered</p>
          <p className="mt-0.5 truncate text-body font-semibold text-ink-2">{render.title}</p>
          <p className="mt-0.5 text-caption text-ink-3">
            <span className="font-mono font-semibold text-ink-2">{render.id}</span> · {render.version} · {render.detail}
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-label leading-snug text-ink-3">
            <Mail className="mt-px size-3.5 shrink-0 text-brand" />
            <span>We&rsquo;ll email you when it&rsquo;s ready. It will appear here under Published.</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPendingRender(null)}
          aria-label="Dismiss"
          className="focus-ring grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-4 transition hover:bg-black/5 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="h-1 overflow-hidden bg-hair">
        <div className="h-full w-1/3 animate-[shimmer-sweep_1.4s_ease-in-out_infinite] bg-brand" />
      </div>
    </div>
  );
}
