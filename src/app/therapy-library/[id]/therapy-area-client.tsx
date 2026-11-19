"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AppShell } from "@/features/workspace/app-shell";
import { TherapyAreaScreen } from "@/features/therapy-library/therapy-area-screen";
import { TherapyDiseaseScreen } from "@/features/therapy-library/therapy-disease-screen";
import { useTherapyLibraryStore } from "@/features/therapy-library/therapy-library-store";
import { diseaseArea } from "@/features/workspace/ad-options";

/* A disease opens inside its area's route (?disease=), so one made this session needs no page of its own in the static build. */
function AreaOrDisease() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const diseaseId = params.get("disease");
  const disease = useTherapyLibraryStore((s) => s.dossiers.find((d) => d.id === diseaseId));
  return (
    <AppShell pageTitle={disease?.disease ?? diseaseArea(id)?.name ?? "Therapy Library"}>
      {diseaseId ? (
        <TherapyDiseaseScreen key={diseaseId} areaId={id} dossierId={diseaseId} />
      ) : (
        <TherapyAreaScreen key={params.get("tab") ?? "area"} areaId={id} initialTab={params.get("tab") ?? undefined} />
      )}
    </AppShell>
  );
}

export default function TherapyAreaClient() {
  return (
    <Suspense>
      <AreaOrDisease />
    </Suspense>
  );
}
