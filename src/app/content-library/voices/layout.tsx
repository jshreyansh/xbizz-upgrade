"use client";

import type { ReactNode } from "react";
import { PageGate } from "@/features/settings/page-gate";

/* Voices are made for videos, so they belong to people who create — like Characters. */
export default function VoicesLayout({ children }: { children: ReactNode }) {
  return (
    <PageGate anyOf={["create"]} pageTitle="Voices" area="Voices" needs="create" instead="Published content is in All Content.">
      {children}
    </PageGate>
  );
}
