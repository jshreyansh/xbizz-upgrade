"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import type { AssetType } from "@/types/content";

/**
 * The MLR review run from Preview and Publish.
 *
 * It is a checkpoint, not a background job: while it runs the asset is
 * frozen — nothing can be edited, and leaving does not cancel it — so the
 * record lives in the browser rather than in a component. A refresh, or
 * coming back to the project later, finds the same run where it got to and
 * lands on the frozen preview until it finishes.
 *
 * The prototype has no server, so "the browser" is localStorage, keyed by
 * project name.
 */

/** How long a run takes in the prototype. */
export const MLR_REVIEW_MS = 20_000;

const KEY = "swishx.mlrReview";

/* This page load. Edit counts live in memory and start again on a reload, so
   a run's mark only means something to the page load that took it. */
const PAGE_LOAD = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Enough of the project to reopen its editor after a reload. */
export interface MlrProjectSnapshot {
  projectName: string;
  assetType: AssetType;
  brief: string;
  demoScenarioId: string;
  sourcePayload: { dossierId?: string; url?: string; text?: string };
  format: string;
  pageShape: "3:4" | "16:9" | "A4";
  infographicPages: string;
}

interface MlrRecord {
  running?: { startedAt: number; changeMark: number; pageLoad: string; snapshot: MlrProjectSnapshot };
  lastRun?: { finishedAt: number; changeMark: number; pageLoad: string };
}

type Store = Record<string, MlrRecord>;

function readAll(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeAll(next: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Private window or blocked storage: the run still works for this tab. */
  }
}

function read(project: string): MlrRecord {
  return readAll()[project] ?? {};
}

function write(project: string, record: MlrRecord) {
  writeAll({ ...readAll(), [project]: record });
}

/** Settle a run whose time is up, wherever it is read from. */
function settle(project: string, record: MlrRecord, now: number): MlrRecord {
  if (record.running && now - record.running.startedAt >= MLR_REVIEW_MS) {
    const done: MlrRecord = {
      lastRun: {
        finishedAt: record.running.startedAt + MLR_REVIEW_MS,
        changeMark: record.running.changeMark,
        pageLoad: record.running.pageLoad,
      },
    };
    write(project, done);
    return done;
  }
  return record;
}

/** The run still going, in any project — what the resume banner looks for. */
export function activeMlrRun(): { project: string; startedAt: number; snapshot: MlrProjectSnapshot } | null {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  for (const [project, record] of Object.entries(readAll())) {
    const settled = settle(project, record, now);
    if (settled.running) return { project, startedAt: settled.running.startedAt, snapshot: settled.running.snapshot };
  }
  return null;
}

/** The current project, as a snapshot to reopen from. */
export function snapshotProject(): MlrProjectSnapshot {
  const s = useWorkspaceStore.getState();
  return {
    projectName: s.projectName,
    assetType: s.assetType,
    brief: s.brief,
    demoScenarioId: s.demoScenarioId,
    sourcePayload: s.sourcePayload,
    format: s.format,
    pageShape: s.pageShape,
    infographicPages: String(s.infographicPages),
  };
}

/** Put the store back to the project, straight into its locked editor. */
export function restoreProject(snapshot: MlrProjectSnapshot) {
  const s = useWorkspaceStore.getState();
  s.setProjectName(snapshot.projectName);
  s.setAssetType(snapshot.assetType);
  s.setBrief(snapshot.brief);
  s.setDemoScenarioId(snapshot.demoScenarioId);
  s.setSourcePayload(snapshot.sourcePayload);
  s.setFormat(snapshot.format);
  s.setPageShape(snapshot.pageShape);
  s.setInfographicPages(snapshot.infographicPages);
  s.setStudioEntry("mlr-review");
  s.setVideoSubStage("studio");
  s.setView("studio");
}

export type MlrStatus = "never" | "running" | "done";

/**
 * The run for one project.
 *
 * `changeCount` is how many edits the project has had; a run records the
 * count it saw, so a later edit marks the result stale and asks for another.
 */
export function useMlrReview(project: string, changeCount: number) {
  const [record, setRecord] = useState<MlrRecord>(() =>
    typeof window === "undefined" ? {} : settle(project, read(project), Date.now())
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!record.running) return;
    const tick = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      const settled = settle(project, read(project), t);
      if (!settled.running) {
        setRecord(settled);
        window.clearInterval(tick);
      }
    }, 200);
    return () => window.clearInterval(tick);
  }, [project, record.running]);

  const running = record.running;
  const status: MlrStatus = running ? "running" : record.lastRun ? "done" : "never";
  const progress = running ? Math.min(100, Math.round(((now - running.startedAt) / MLR_REVIEW_MS) * 100)) : status === "done" ? 100 : 0;
  /* After a reload the editor reopens on the version that was reviewed, so
     every edit made since this page loaded came after the review. */
  const lastRun = record.lastRun;
  const changesSince = !lastRun
    ? 0
    : lastRun.pageLoad === PAGE_LOAD
    ? Math.max(0, changeCount - lastRun.changeMark)
    : changeCount;

  return {
    status,
    progress,
    /** When the last run finished. */
    lastRunAt: record.lastRun?.finishedAt ?? null,
    /** Edits since the last run — anything above zero asks for another. */
    changesSince,
    start: () => {
      const next: MlrRecord = {
        ...record,
        running: { startedAt: Date.now(), changeMark: changeCount, pageLoad: PAGE_LOAD, snapshot: snapshotProject() },
      };
      write(project, next);
      setNow(Date.now());
      setRecord(next);
    },
  };
}

export type MlrReview = ReturnType<typeof useMlrReview>;

/** "just now", "4 min ago", "2 h ago". */
export function timeAgo(at: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} h ago`;
}
