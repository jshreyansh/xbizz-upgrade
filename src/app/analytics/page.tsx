"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { AnalyticsScreen } from "@/features/analytics/analytics-screen";

export default function AnalyticsPage() {
  return (
    <AppShell pageTitle="Analytics">
      <AnalyticsScreen />
    </AppShell>
  );
}
