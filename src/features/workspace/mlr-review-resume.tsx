"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { MLR_REVIEW_MS, activeMlrRun, restoreProject, type MlrProjectSnapshot } from "@/features/workspace/mlr-review";

/* Read the running review from the browser, twice a second. */
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 500);
  return () => window.clearInterval(id);
}
function snapshot(): string {
  const run = activeMlrRun();
  if (!run) return "";
  const progress = Math.min(99, Math.floor(((Date.now() - run.startedAt) / MLR_REVIEW_MS) * 100));
  return JSON.stringify({ project: run.project, progress, snapshot: run.snapshot });
}

/**
 * Keeps a running MLR review in front of the person who started it.
 *
 * A refresh on the create page drops the project from memory; this puts it
 * back, straight into the frozen preview. Anywhere else in the app, a pill
 * says the review is still running and opens it — so closing the tab and
 * coming back from the Content Library finds the review, not an editor.
 */
export function MlrReviewResume() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const run = raw ? (JSON.parse(raw) as { project: string; progress: number; snapshot: MlrProjectSnapshot }) : null;
  const pathname = usePathname();
  const router = useRouter();
  const view = useWorkspaceStore((s) => s.view);
  const projectName = useWorkspaceStore((s) => s.projectName);

  /* A reload of the create page: back into the locked preview. */
  const reloadedIntoCreate = Boolean(run) && pathname === "/create" && view !== "studio";
  useEffect(() => {
    if (reloadedIntoCreate && run) restoreProject(run.snapshot);
    // Only when the page comes back without its project.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadedIntoCreate]);

  const insideIt = pathname === "/create" && view === "studio" && projectName === run?.snapshot.projectName;
  if (!run || insideIt || reloadedIntoCreate) return null;

  return (
    <button
      type="button"
      onClick={() => {
        restoreProject(run.snapshot);
        router.push("/create");
      }}
      className="fixed bottom-5 right-5 z-[60] flex cursor-pointer items-center gap-3 rounded-panel bg-ink px-4 py-3 text-left text-white shadow-float ring-1 ring-white/10 transition hover:-translate-y-0.5"
    >
      <span className="grid size-8 place-items-center rounded-control bg-brand/20 text-brand">
        <ShieldCheck className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-body font-extrabold">MLR review running · {run.progress}%</span>
        <span className="block max-w-[220px] truncate text-caption text-white/60">
          {run.snapshot.projectName || "Your project"} is frozen until it finishes
        </span>
      </span>
      <span className="ml-1 rounded-control bg-brand px-2.5 py-1 text-label font-bold">Open</span>
    </button>
  );
}
