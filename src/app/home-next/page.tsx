"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { HomeScreenNext } from "@/features/workspace/home-screen-next";

/**
 * Experimental home page — lives at /home-next, separate from the
 * production Home route at /. Nothing here is wired into the real
 * navigation; open it directly to review, and it can be merged into
 * home-screen.tsx later once it's settled.
 */
export default function HomeNextPage() {
  return (
    <AppShell pageTitle="Home — Next (preview)">
      <HomeScreenNext />
    </AppShell>
  );
}
