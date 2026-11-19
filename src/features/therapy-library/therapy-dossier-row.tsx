"use client";

import { FileText, Loader2, Lock } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { RowCard } from "@/components/patterns/row-card";
import type { TherapyDossier } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark } from "@/features/therapy-library/therapy-area-mark";
import { originWords } from "@/features/therapy-library/therapy-dossier-reader";

/** One disease dossier as a row. With `areaName`, it also says which area it sits in. */
export function TherapyDossierRow({ dossier: d, areaName, onOpen }: { dossier: TherapyDossier; areaName?: string; onOpen: () => void }) {
  const making = d.status === "making";
  return (
    <RowCard
      onOpen={onOpen}
      openLabel="View"
      leading={areaName ? (
        <TherapyAreaMark areaId={d.areaId} className="size-9 rounded-control" iconClassName="size-4" />
      ) : (
        <span className={`grid size-9 place-items-center rounded-control ${making ? "bg-tint text-brand" : "bg-ok-bg text-ok"}`}>
          {making ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
        </span>
      )}
      title={d.disease}
      meta={
        <>
          {areaName && `${areaName} · `}
          {making
            ? d.origin === "swishx" ? "SwishX is writing it from cited sources…" : `Reading ${d.fileName ?? "your file"}…`
            : `v${d.version} · ${originWords(d)} · ${d.sources} sources · Updated ${d.updated}${d.previous.length ? ` · ${d.previous.length} earlier ${d.previous.length === 1 ? "version" : "versions"} kept` : ""}`}
        </>
      }
      trailing={!making && (
        <Chip tone="neutral" weight="bold" iconLeft={<Lock className="size-3" />}>Read-Only</Chip>
      )}
    />
  );
}
