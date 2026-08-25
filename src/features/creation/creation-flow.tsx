"use client";

import { useCreationStore } from "@/features/creation/creation-store";
import { Step1Format } from "@/features/creation/step1-format";
import { Step2Sources } from "@/features/creation/step2-sources";
import { Step3AudienceVoice } from "@/features/creation/step3-audience-voice";
import { Step4ScriptReview } from "@/features/creation/step4-script-review";
import { Step5ScenesTimeline } from "@/features/creation/step5-scenes-timeline";
import { Step6RenderConfirm } from "@/features/creation/step6-render-confirm";
import { Step7RenderingPlayer } from "@/features/creation/step7-rendering-player";

export function CreationFlow() {
  const stage = useCreationStore((s) => s.stage);

  return (
    <div className="w-full">
      {stage === 1 && <Step1Format />}
      {stage === 2 && <Step2Sources />}
      {stage === 3 && <Step3AudienceVoice />}
      {stage === 4 && <Step4ScriptReview />}
      {stage === 5 && <Step5ScenesTimeline />}
      {stage === 6 && <Step6RenderConfirm />}
      {stage === 7 && <Step7RenderingPlayer />}
    </div>
  );
}
