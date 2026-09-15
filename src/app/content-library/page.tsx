"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { ContentLibraryScreen } from "@/features/content-library/content-library-screen";

export default function ContentLibraryPage() {
  return (
    <AppShell pageTitle="Content Library">
      <ContentLibraryScreen />
    </AppShell>
  );
}
