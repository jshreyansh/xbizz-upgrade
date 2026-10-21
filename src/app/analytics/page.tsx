"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { AnalyticsScreen } from "@/features/analytics/analytics-screen";
import { NoAccess, useCan } from "@/features/settings/view-as";

export default function AnalyticsPage() {
  /* Hidden from the sidebar without Analytics, and closed here too, for a typed or bookmarked address. */
  const { can } = useCan();
  return (
    <AppShell pageTitle="Analytics">
      {can("analytics") ? <AnalyticsScreen /> : <NoAccess area="Analytics" needs="analytics" />}
    </AppShell>
  );
}
