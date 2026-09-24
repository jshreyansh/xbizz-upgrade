"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/logo-mark";
import type { Character } from "@/features/content-library/characters-data";

type Outcome = "replace" | "fork";

/**
 * Changing how a character looks, with the consequence stated first.
 *
 * Re-rendering an identity is destructive: every asset already cast with this
 * character was shot against the views being replaced. So the choice is not
 * buried in a checkbox — it is the second half of the form, and the button
 * changes its name to match what it is about to do.
 */
export function CharacterRefineModal({
  character,
  onCancel,
  onReplace,
  onFork,
}: {
  character: Character;
  onCancel: () => void;
  onReplace: (instruction: string) => void;
  onFork: (instruction: string, newName: string) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [forkName, setForkName] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !running) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, running]);

  const ready =
    instruction.trim().length > 0 &&
    (outcome === "replace" || (outcome === "fork" && forkName.trim().length > 0));

  const run = () => {
    if (!ready) return;
    setRunning(true);
    window.setTimeout(() => {
      if (outcome === "fork") onFork(instruction.trim(), forkName.trim());
      else onReplace(instruction.trim());
    }, 2400);
  };

  const OUTCOMES: Array<{ id: Outcome; title: string; detail: string }> = [
    {
      id: "replace",
      title: "New version",
      detail: "Regenerate and replace all four views. This character keeps its place.",
    },
    {
      id: "fork",
      title: "New character",
      detail: "Keep this version and add the refined one alongside it.",
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Refine ${character.name}`}
    >
      <div className="flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
          <div>
            <h2 className="text-subhead font-[850] tracking-tight text-ink">
              Refine {character.name}
            </h2>
            <p className="mt-0.5 text-label text-ink-3">
              Say what should change, then say what to do with the result.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={running}
            aria-label="Cancel"
            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        </div>

        {running ? (
          <div className="grid min-h-[260px] place-items-center gap-3 p-8 text-center">
            <LogoMark size={28} className="animate-spin text-brand" />
            <p className="text-body-lg font-extrabold text-ink">
              {outcome === "fork" ? `Building ${forkName.trim()}` : `Re-rendering ${character.name}`}
            </p>
            <p className="max-w-[40ch] text-body text-ink-3">
              Applying the change across all four views and checking them against each other.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            <div className="space-y-1.5">
              <label className="block text-label font-bold text-ink-2">What should change?</label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
                autoFocus
                placeholder="e.g. lose the white coat, put him in a navy suit, same face, same build."
                className="w-full resize-none rounded-control border border-hair-2 bg-canvas p-3 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-label font-bold text-ink-2">
                What happens to this character?
              </label>
              <div className="grid gap-2">
                {OUTCOMES.map((option) => {
                  const active = outcome === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setOutcome(option.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-control border p-3 text-left transition",
                        active
                          ? "border-brand bg-tint shadow-2xs ring-2 ring-brand/15"
                          : "border-hair-2 bg-card hover:border-hair-3"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition",
                          active ? "border-brand bg-brand" : "border-hair-3 bg-card"
                        )}
                      >
                        {active && <Check className="size-2.5 stroke-[3] text-white" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body font-extrabold text-ink">{option.title}</span>
                        <span className="block text-caption leading-snug text-ink-3">
                          {option.detail}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {outcome === "fork" && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="block text-label font-bold text-ink-2">New character name</label>
                <input
                  value={forkName}
                  onChange={(e) => setForkName(e.target.value)}
                  autoFocus
                  placeholder={`e.g. ${character.name} in a suit`}
                  className="w-full rounded-control border border-hair-2 bg-canvas px-3 py-2.5 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
                />
              </div>
            )}
          </div>
        )}

        {!running && (
          <div className="flex items-center justify-end gap-2 border-t border-hair bg-canvas px-5 py-3">
            <Button size="sm" variant="secondary" onClick={onCancel} className="cursor-pointer text-label font-bold">
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!ready}
              onClick={run}
              className="cursor-pointer gap-1.5 text-label font-bold disabled:opacity-40"
            >
              <LogoMark size={13} />
              {outcome === "fork" ? "Generate new version" : "Regenerate character"}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
