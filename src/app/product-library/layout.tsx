"use client";

import type { ReactNode } from "react";
import { PageGate } from "@/features/settings/page-gate";
import { LIBRARY_ACCESS } from "@/features/settings/view-as";

export default function ProductLibraryLayout({ children }: { children: ReactNode }) {
  return (
    <PageGate anyOf={LIBRARY_ACCESS} pageTitle="Product Library" area="The Product Library" needs="library">
      {children}
    </PageGate>
  );
}
