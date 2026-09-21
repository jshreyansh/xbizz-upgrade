"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Layers, MessageSquareQuote, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  VIEW_LABEL,
  type Character,
  type CharacterView,
} from "@/features/content-library/characters-data";

/**
 * The identity gallery: what went in, and what came out.
 *
 * A generated view is only as trustworthy as the thing it was generated from,
 * so the source sits beside the output rather than a click away. A reviewer
 * asking "is this really the same person" gets both halves on one screen.
 */
export function CharacterGalleryModal({
  character,
  onClose,
}: {
  character: Character;
  onClose: () => void;
}) {
  const firstReady = character.views.find((v) => !v.missing) ?? character.views[0];
  const [active, setActive] = useState<{ view?: CharacterView; sourceIndex?: number }>({
    view: firstReady,
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const source =
    active.sourceIndex !== undefined ? character.sources[active.sourceIndex] : undefined;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-ink/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={`${character.name} identity gallery`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[920px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-hair px-5 py-3">
          <span className="truncate text-body-lg font-extrabold text-ink">
            {character.name} — identity gallery
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto bg-canvas p-4 lg:grid-cols-[1fr_300px]">
          {/* The frame being read. */}
          <div className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-panel bg-[#0d1411]">
            {source?.kind === "prompt" ? (
              <p className="max-w-[46ch] p-8 text-center text-body-lg leading-relaxed text-white/85">
                “{source.label}”
              </p>
            ) : source?.kind === "video" ? (
              <video src={source.url} controls className="max-h-[60vh] w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={source?.url ?? active.view?.url}
                alt=""
                style={!source && active.view?.transform ? { transform: active.view.transform } : undefined}
                className="max-h-[60vh] w-full object-contain"
              />
            )}

            <span className="absolute bottom-3 left-3 rounded-glyph bg-black/55 px-2 py-1 text-caption font-bold text-white backdrop-blur-sm">
              {source ? source.label : active.view ? VIEW_LABEL[active.view.id] : ""}
            </span>
          </div>

          <div className="space-y-4">
            <section>
              <div className="flex items-center gap-1.5">
                <Layers className="size-3.5 text-brand" />
                <span className="text-body font-extrabold text-ink">Generated views</span>
              </div>
              <p className="mt-0.5 text-caption text-ink-3">Identity-checked character pack</p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {character.views.map((view) => {
                  const isActive = !source && active.view?.id === view.id;
                  return (
                    <button
                      key={view.id}
                      type="button"
                      disabled={view.missing}
                      onClick={() => setActive({ view })}
                      className={cn(
                        "overflow-hidden rounded-control border bg-card text-left transition",
                        view.missing
                          ? "cursor-not-allowed border-dashed border-hair-2 opacity-60"
                          : isActive
                            ? "cursor-pointer border-brand ring-2 ring-brand/20"
                            : "cursor-pointer border-hair-2 hover:border-brand/40"
                      )}
                    >
                      <span className="block aspect-[4/3] overflow-hidden bg-subtle">
                        {view.missing ? (
                          <span className="grid h-full w-full place-items-center text-micro font-bold text-ink-4">
                            Not generated
                          </span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={view.url}
                            alt=""
                            style={view.transform ? { transform: view.transform } : undefined}
                            className="h-full w-full object-cover object-top"
                          />
                        )}
                      </span>
                      <span
                        className={cn(
                          "block px-2 py-1.5 text-caption font-bold",
                          isActive ? "text-brand-deep" : "text-ink-2"
                        )}
                      >
                        {VIEW_LABEL[view.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-1.5">
                {character.method === "prompt" ? (
                  <MessageSquareQuote className="size-3.5 text-brand" />
                ) : (
                  <Camera className="size-3.5 text-brand" />
                )}
                <span className="text-body font-extrabold text-ink">
                  {character.method === "prompt" ? "Source prompt" : "Source footage"}
                </span>
              </div>
              <p className="mt-0.5 text-caption text-ink-3">
                {character.method === "prompt"
                  ? "What the identity was written from"
                  : "Original references used for identity"}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {character.sources.map((item, index) => {
                  const isActive = active.sourceIndex === index;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActive({ sourceIndex: index })}
                      className={cn(
                        "overflow-hidden rounded-control border bg-card text-left transition",
                        isActive
                          ? "cursor-pointer border-brand ring-2 ring-brand/20"
                          : "cursor-pointer border-hair-2 hover:border-brand/40"
                      )}
                    >
                      <span className="grid aspect-[4/3] place-items-center overflow-hidden bg-subtle">
                        {item.kind === "prompt" ? (
                          <MessageSquareQuote className="size-5 text-ink-4" />
                        ) : item.kind === "video" ? (
                          <video src={item.url} muted className="h-full w-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt="" className="h-full w-full object-cover object-top" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "block truncate px-2 py-1.5 text-caption font-bold",
                          isActive ? "text-brand-deep" : "text-ink-2"
                        )}
                      >
                        {item.kind === "prompt" ? "Prompt" : `Source ${index + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
