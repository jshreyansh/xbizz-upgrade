"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/features/workspace/app-shell";
import { SettingsShell } from "@/features/settings/settings-shell";

/**
 * Settings sits INSIDE the app shell. It is a section of the product, not a
 * separate destination, so it keeps the sidebar and topbar like every other
 * screen — it was rendering its own full-height chrome and reading as a
 * different application.
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell pageTitle="Settings">
      <SettingsShell>{children}</SettingsShell>
    </AppShell>
  );
}
