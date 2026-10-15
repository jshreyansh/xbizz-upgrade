"use client";

import { useEffect } from "react";
import { Clapperboard, FolderOpen, Mail, MonitorPlay } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import type { PendingRender } from "@/features/workspace/workspace-store";

/**
 * Said once, the moment Publish is pressed: the video is being put together,
 * and nobody has to watch it happen.
 *
 * The final render takes minutes in the product, and the progress screen
 * behind this made it look like something to sit through. So the choice is
 * offered up front — watch it here, or get on with something else in the
 * Content Library — and either way the email arrives when it is done.
 */
export function RenderStartedModal({
  render,
  onStay,
  onLibrary,
}: {
  render: PendingRender;
  /** Close the pop-up and watch the render on this page. */
  onStay: () => void;
  /** Leave for the Content Library, where the render is announced. */
  onLibrary: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onStay();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStay]);

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your video is being assembled"
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      >
        <div className="rise-in w-full max-w-[460px] overflow-hidden rounded-card border border-hair bg-card text-left shadow-modal">
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-control border border-tint-line bg-tint">
                <LogoMark size={22} className="animate-pulse text-brand" />
              </span>
              <div className="min-w-0">
                <div className="text-caption font-extrabold uppercase tracking-[.12em] text-brand">
                  Publishing · {render.version}
                </div>
                <h2 className="mt-0.5 text-title font-[850] tracking-tight text-ink">Your video is being assembled</h2>
              </div>
            </div>

            <p className="text-body-lg leading-relaxed text-ink-2">
              SwishX is stitching the scenes together, syncing the voice-over and running the final fair balance check.
              This takes a few minutes.
            </p>

            {/* What is rendering, so it can be found again. */}
            <div className="space-y-2.5 rounded-control border border-hair bg-subtle p-3.5">
              <div className="flex items-start gap-2.5">
                <Clapperboard className="mt-0.5 size-4 shrink-0 text-ink-3" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body font-bold text-ink">{render.title}</div>
                  <div className="mt-0.5 text-caption text-ink-3">
                    <span className="font-mono font-semibold text-ink-2">{render.id}</span> · {render.detail}
                  </div>
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-hair">
                <div className="h-full w-1/3 animate-[shimmer-sweep_1.4s_ease-in-out_infinite] rounded-full bg-brand" />
              </div>
            </div>

            <p className="flex items-start gap-2 text-body text-ink-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                <span className="font-semibold text-ink">We&rsquo;ll email you when it&rsquo;s ready.</span> You can close this
                tab; the render carries on without it.
              </span>
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-hair bg-subtle px-6 py-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onStay} className="gap-1.5">
              <MonitorPlay className="size-4" />
              Stay here
            </Button>
            <Button onClick={onLibrary} className="gap-1.5 font-bold">
              <FolderOpen className="size-4" />
              Go to Content Library
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
