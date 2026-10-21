"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/features/workspace/app-shell";
import { ContentLibraryScreen, type StageFilter } from "@/features/content-library/content-library-screen";
import { RenderingNotice } from "@/features/content-library/rendering-notice";

const STAGES: StageFilter[] = ["all", "draft", "shared", "published", "archived"];

/* `?stage=archived` opens on that tab: where a closed project is sent. */
function ContentLibraryContent() {
  const stage = useSearchParams().get("stage");
  const initialStage = STAGES.find((s) => s === stage) ?? "all";
  return (
    <AppShell pageTitle="All Content">
      <ContentLibraryScreen key={initialStage} initialStage={initialStage} />
      <RenderingNotice />
    </AppShell>
  );
}

export default function ContentLibraryPage() {
  return (
    <Suspense fallback={null}>
      <ContentLibraryContent />
    </Suspense>
  );
}
