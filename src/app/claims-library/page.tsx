"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { ClaimsLibraryScreen } from "@/features/claims-library/claims-library-screen";

export default function ClaimsLibraryPage() {
  return (
    <AppShell pageTitle="Claims Library">
      <ClaimsLibraryScreen />
    </AppShell>
  );
}
