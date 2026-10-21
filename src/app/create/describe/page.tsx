"use client";

import { PromptCreationScreen } from "@/features/workspace/prompt-creation-screen";
import { AppShell } from "@/features/workspace/app-shell";
import { NoAccess, useCan } from "@/features/settings/view-as";

export default function DescribeCreatePage() {
  /* "Describe your idea" starts a project, so it needs Create like the studios. */
  const { can } = useCan();
  if (!can("create")) {
    return (
      <AppShell pageTitle="Studio">
        <NoAccess area="The studio" needs="create" instead="Published content is in the Content Library." />
      </AppShell>
    );
  }
  return <PromptCreationScreen />;
}
