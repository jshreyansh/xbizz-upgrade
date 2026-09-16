"use client";

import type { FlowStep } from "@/features/workspace/flow-breadcrumb";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * The two flows, as the trails they actually are.
 *
 * One definition per flow, used by every screen in it. Written per-screen, the
 * crumb drifted: the video studio showed two steps, the canvas showed one, the
 * plan screens showed a pill, and none of them agreed with where the back
 * arrow went.
 */

export type VideoStepId = "brief" | "plan" | "production" | "editor" | "review";
export type CreativeStepId = "brief" | "plan" | "layout" | "canvas" | "review";

/** Navigation shared by every step: the store moves, the screens follow. */
function useFlowNav() {
  const setView = useWorkspaceStore((s) => s.setView);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setCreativeStep = useWorkspaceStore((s) => s.setCreativeStep);
  return {
    toBrief: () => {
      setVideoSubStage("intake");
      setView("create");
    },
    toPlan: () => {
      setCreativeStep("brief");
      setVideoSubStage("directions");
      setView("directions");
    },
    toLayout: () => {
      setCreativeStep("template");
      setVideoSubStage("directions");
      setView("directions");
    },
  };
}

export function useVideoSteps(opts: {
  /** Set in the studio, where Production Plan and Editor are modes, not views. */
  toProduction?: () => void;
  toEditor?: () => void;
}): FlowStep[] {
  const nav = useFlowNav();
  return [
    { id: "brief", label: "Brief", onGo: nav.toBrief },
    { id: "plan", label: "Need your input", onGo: nav.toPlan },
    { id: "production", label: "Production Plan", onGo: opts.toProduction },
    { id: "editor", label: "Video Editor", onGo: opts.toEditor },
    // The end of the trail. Nothing navigates back TO a published review.
    { id: "review", label: "Review" },
  ];
}

export function useCreativeSteps(opts: { toCanvas?: () => void }): FlowStep[] {
  const nav = useFlowNav();
  return [
    { id: "brief", label: "Brief", onGo: nav.toBrief },
    { id: "plan", label: "Need your input", onGo: nav.toPlan },
    { id: "layout", label: "Layout", onGo: nav.toLayout },
    { id: "canvas", label: "Canvas Editor", onGo: opts.toCanvas },
    { id: "review", label: "Review" },
  ];
}
