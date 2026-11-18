"use client";

import type { ReactNode } from "react";
import { PageGate } from "@/features/settings/page-gate";
import { LIBRARY_ACCESS } from "@/features/settings/view-as";

export default function TherapyLibraryLayout({ children }: { children: ReactNode }) {
  return (
    <PageGate anyOf={LIBRARY_ACCESS} pageTitle="Therapy Library" area="The Therapy Library" needs="library">
      {children}
    </PageGate>
  );
}
