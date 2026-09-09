"use client";

import { CircleCheck, GitBranch, Globe2, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoScenarios, type DemoScenario, type DemoScenarioCategory } from "@/features/workspace/demo-scenarios";
import type { AssetType } from "@/types/content";
import { cn } from "@/lib/cn";

const CATEGORY_ICONS: Record<DemoScenarioCategory, typeof CircleCheck> = {
  "Happy paths": CircleCheck,
  "Dynamic branches": GitBranch,
  "Blocked": TriangleAlert,
  "Source and market": Globe2,
};

/**
 * The use-case library, shared by the prompt screen and the plan screen.
 *
 * `assetType` narrows it to the cases that belong to the flow you are in: the
 * video plan screen has no use for an infographic case, and offering one would
 * mean a switcher that can change asset type mid-plan — which lands on the
 * early return at the top of DirectionsScreen and takes its remaining hooks
 * with it. Omit it on the prompt screen, which serves every flow.
 */
export function ScenarioDrawer({
  currentScenarioId,
  assetType,
  onSelect,
  onReset,
  onClose,
  title = "Sample briefs",
}: {
  currentScenarioId: string;
  assetType?: AssetType;
  onSelect: (scenario: DemoScenario) => void;
  onReset: () => void;
  onClose: () => void;
  title?: string;
}) {
  const available = assetType
    ? demoScenarios.filter((s) => s.inputs.assetType === assetType)
    : demoScenarios;
  const categories = [...new Set(available.map((s) => s.category))];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/38 backdrop-blur-[2px]" role="dialog" aria-modal="true">
      <div className="slide-left flex h-full w-full max-w-[440px] flex-col border-l border-white/50 bg-canvas shadow-2xl">
        <div className="flex items-center justify-between border-b border-hair px-5 py-4">
          <div>
            <div className="text-label font-bold uppercase tracking-[0.12em] text-brand">Use-case library</div>
            <h3 className="text-title font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-ok-bg cursor-pointer" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {categories.map((category) => {
            const CategoryIcon = CATEGORY_ICONS[category];
            const list = available.filter((item) => item.category === category);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-1.5 text-body font-bold uppercase tracking-wider text-ink-3">
                  <CategoryIcon className="size-3.5 text-brand" />
                  <span>{category}</span>
                </div>
                {list.map((scenario) => {
                  const active = scenario.id === currentScenarioId;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => onSelect(scenario)}
                      className={cn(
                        "block w-full rounded-control border p-3 text-left transition hover:-translate-y-px hover:shadow-sm cursor-pointer",
                        active ? "border-brand bg-tint" : "border-hair bg-card hover:border-hair-3"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <b className="text-body-lg font-semibold">{scenario.label}</b>
                        {active && <span className="shrink-0 rounded-chip bg-brand px-2 py-0.5 text-caption font-bold text-white">Active</span>}
                      </div>
                      <p className="mt-1 text-body leading-5 text-ink-3">{scenario.description}</p>
                      {/* What the case is FOR: the branch it puts the UI down. */}
                      <p className="mt-1.5 text-caption font-semibold text-brand-deep">{scenario.expected}</p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="border-t border-hair p-4">
          <Button variant="secondary" size="sm" onClick={onReset} className="w-full">Reset to default case</Button>
        </div>
      </div>
    </div>
  );
}
