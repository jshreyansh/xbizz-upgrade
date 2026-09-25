"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { VoicesScreen } from "@/features/content-library/voices-screen";

export default function VoicesPage() {
  return (
    <AppShell pageTitle="Voices">
      <VoicesScreen />
    </AppShell>
  );
}
