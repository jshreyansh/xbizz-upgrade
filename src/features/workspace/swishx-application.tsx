"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { CreateScreen } from "@/features/workspace/create-screen";
import { DirectionsScreen } from "@/features/workspace/directions-screen";
import { HomeScreen } from "@/features/workspace/home-screen";
import { StudioScreen } from "@/features/workspace/studio-screen";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export function SwishXApplication() {
  const view = useWorkspaceStore((state) => state.view);

  if (view === "create") return <CreateScreen />;
  if (view === "directions") return <DirectionsScreen />;
  if (view === "studio") return <StudioScreen />;

  return (
    <AppShell>
      <HomeScreen />
    </AppShell>
  );
}
