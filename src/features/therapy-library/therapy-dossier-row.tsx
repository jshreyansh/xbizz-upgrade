"use client";

import { FileText, Loader2, Lock } from "lucide-react";
import type { TherapyDossier } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark } from "@/features/therapy-library/therapy-area-mark";
import { originWords } from "@/features/therapy-library/therapy-dossier-reader";

/** One disease dossier as a row. With `areaName`, it also says which area it sits in. */
export function TherapyDossierRow({ dossier: d, areaName, onOpen }: { dossier: TherapyDossier; areaName?: string; onOpen: () => void }) {
  const making = d.status === "making";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      className="group flex cursor-pointer items-center gap-4 rounded-panel border border-hair bg-card p-4 shadow-hair transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
    >
      {areaName ? (
        <TherapyAreaMark areaId={d.areaId} className="size-9 shrink-0 rounded-control" iconClassName="size-4" />
      ) : (
        <span className={`grid size-9 shrink-0 place-items-center rounded-control ${making ? "bg-tint text-brand" : "bg-ok-bg text-ok"}`}>
          {making ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <b className="block text-subhead font-bold text-ink">{d.disease}</b>
        <span className="block truncate text-body text-ink-3">
          {areaName && `${areaName} · `}
          {making
            ? d.origin === "swishx" ? "SwishX is writing it from cited sources…" : `Reading ${d.fileName ?? "your file"}…`
            : `v${d.version} · ${originWords(d)} · ${d.sources} sources · Updated ${d.updated}${d.previous.length ? ` · ${d.previous.length} earlier ${d.previous.length === 1 ? "version" : "versions"} kept` : ""}`}
        </span>
      </div>
      {!making && (
        <span className="inline-flex items-center gap-1 rounded-chip border border-hair bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">
          <Lock className="size-3" />
          Read-Only
        </span>
      )}
      <span className="inline-flex items-center gap-1 text-body-lg font-bold text-brand transition-all group-hover:gap-1.5 group-hover:text-brand-deep">View →</span>
    </div>
  );
}
