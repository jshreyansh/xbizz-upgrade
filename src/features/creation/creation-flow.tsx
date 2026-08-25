"use client";

import { useCreationStore } from "@/features/creation/creation-store";
import { IntentScreen } from "@/features/creation/intent-screen";
import { BriefFormatScreen } from "@/features/creation/brief-format-screen";
import { CreativeDirectionScreen } from "@/features/creation/creative-direction-screen";
import { SceneScriptScreen } from "@/features/creation/scene-script-screen";
import { GenerationPipeline } from "@/features/creation/generation-pipeline";

export function CreationFlow() {
  const step = useCreationStore((s) => s.step);

  if (step === "intent") return <IntentScreen />;
  if (step === "brief") return <BriefFormatScreen />;
  if (step === "direction") return <CreativeDirectionScreen />;
  if (step === "script") return <SceneScriptScreen />;
  return <GenerationPipeline />;
}
