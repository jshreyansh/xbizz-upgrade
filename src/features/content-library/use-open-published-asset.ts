"use client";

import { useRouter } from "next/navigation";
import type { LibraryAsset } from "@/features/content-library/content-library-data";
import { demoScenarios } from "@/features/workspace/demo-scenarios";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * The way back into a published asset.
 *
 * Opening one does not show a picture of it: it rebuilds that project's real
 * state from the brief it was made with and lands on the shared review — the
 * same screen the link in the email opens.
 *
 * A hook rather than a copy in each screen, because the Content Library is no
 * longer the only place that lists published work: a claim's Usage tab lists
 * the assets that cite it, and two shelves that open the same asset by two
 * different routes would eventually open two different things.
 */
export function useOpenPublishedAsset(): (asset: LibraryAsset) => void {
  const router = useRouter();
  const setAssetType = useWorkspaceStore((s) => s.setAssetType);
  const setDemoScenarioId = useWorkspaceStore((s) => s.setDemoScenarioId);
  const setStudioEntry = useWorkspaceStore((s) => s.setStudioEntry);
  const setView = useWorkspaceStore((s) => s.setView);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setBrief = useWorkspaceStore((s) => s.setBrief);
  const setAudience = useWorkspaceStore((s) => s.setAudience);
  const setMarket = useWorkspaceStore((s) => s.setMarket);
  const setIntendedUse = useWorkspaceStore((s) => s.setIntendedUse);
  const setSelectedSourceIds = useWorkspaceStore((s) => s.setSelectedSourceIds);
  const setProjectName = useWorkspaceStore((s) => s.setProjectName);

  return (asset: LibraryAsset) => {
    const scenario = demoScenarios.find((s) => s.id === asset.scenarioId);
    if (scenario) {
      setBrief(scenario.inputs.brief);
      setAudience(scenario.inputs.audience);
      setMarket(scenario.inputs.market);
      setIntendedUse(scenario.inputs.intendedUse);
      setSelectedSourceIds(scenario.inputs.selectedSourceIds);
      setDemoScenarioId(scenario.id);
    }
    setProjectName(asset.title);
    setAssetType(asset.kind);
    setStudioEntry("review");
    setVideoSubStage("studio");
    setView("studio");
    router.push("/create");
  };
}
