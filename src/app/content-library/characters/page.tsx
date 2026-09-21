"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { CharactersScreen } from "@/features/content-library/characters-screen";

export default function CharactersPage() {
  return (
    <AppShell pageTitle="Characters">
      <CharactersScreen />
    </AppShell>
  );
}
