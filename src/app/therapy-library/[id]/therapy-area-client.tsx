"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/features/workspace/app-shell";
import { TherapyAreaScreen } from "@/features/therapy-library/therapy-area-screen";
import { diseaseArea } from "@/features/workspace/ad-options";

export default function TherapyAreaClient() {
  const { id } = useParams<{ id: string }>();
  return (
    <AppShell pageTitle={diseaseArea(id)?.name ?? "Therapy Library"}>
      <TherapyAreaScreen areaId={id} />
    </AppShell>
  );
}
