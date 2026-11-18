"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { TherapyLibraryScreen } from "@/features/therapy-library/therapy-library-screen";

export default function TherapyLibraryPage() {
  return (
    <AppShell pageTitle="Therapy Library">
      <TherapyLibraryScreen />
    </AppShell>
  );
}
