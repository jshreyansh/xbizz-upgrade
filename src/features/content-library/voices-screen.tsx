"use client";

import { Mic2 } from "lucide-react";

/**
 * The Voices shelf. Not built yet — the sidebar already marks it "soon" and
 * refuses the click. This page exists so a real link (the Voice Library
 * modal's "Go to Voice Library", the sidebar once it stops refusing) has
 * somewhere honest to land instead of a 404, not to promise the feature.
 */
export function VoicesScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-tint text-brand">
        <Mic2 className="size-6" />
      </div>
      <h1 className="text-title font-bold text-ink">Voice Library is coming soon</h1>
      <p className="max-w-[46ch] text-body-lg text-ink-3">
        A shelf for the voices your team has picked and previewed, the same way Characters works today.
        Choose a narrator voice from within any project for now — it&rsquo;ll be here to browse on its own shortly.
      </p>
    </div>
  );
}
