"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { CreationFlow } from "@/features/creation/creation-flow";

export default function CreatePage() {
  return (
    <AppShell pageTitle="Magic Video Creation">
      <CreationFlow />
    </AppShell>
  );
}
