"use client";

import { useState } from "react";
import { ChevronDown, Download, FileCode2, FileSpreadsheet, Images, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { downloadBlob, downloadText } from "@/lib/download";
import type { veevaPackage } from "@/features/workspace/email-veeva-package";

type VeevaPackage = ReturnType<typeof veevaPackage>;

/**
 * The email's share option: no live link to the customer's Vault yet, so the
 * marketer downloads what PromoMats asks for and uploads it there, where MLR
 * review happens.
 */
export function EmailVeevaCard({ pkg, onDownloaded }: { pkg: VeevaPackage; onDownloaded: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const fragments = pkg.documents.filter((d) => d.type === "Email Fragment");
  const footer = pkg.documents.find((d) => d.type === "Template Fragment");
  const template = pkg.documents[0];
  const fieldCount = pkg.documents.reduce((n, d) => n + d.fields.length, 0);

  const contents = [
    { icon: FileCode2, label: "Email Template", detail: `${template.number} · HTML with Veeva tokens` },
    ...(footer ? [{ icon: FileCode2, label: "ISI footer", detail: `${footer.number} · Template Fragment` }] : []),
    ...(fragments.length ? [{ icon: FileCode2, label: `${fragments.length} Email Fragment${fragments.length === 1 ? "" : "s"}`, detail: "The blocks a rep can choose" }] : []),
    { icon: Images, label: "Images", detail: "assets.zip, for the Assets field" },
    { icon: FileSpreadsheet, label: "Metadata", detail: `${fieldCount} fields, ${pkg.relationships.length} relationships, content rules, claims, links` },
  ];

  const downloadPackage = async () => {
    setBusy(true);
    try {
      downloadBlob(await pkg.zip(), pkg.fileName);
      onDownloaded(`Downloaded ${pkg.fileName}`);
    } finally {
      setBusy(false);
    }
  };

  const downloadMetadata = () => {
    downloadText(pkg.metadataSheet, pkg.metadataFileName, "text/csv;charset=utf-8");
    onDownloaded(`Downloaded ${pkg.metadataFileName}`);
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-panel border border-hair-2 bg-card p-3.5 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="grid size-8 shrink-0 place-items-center rounded-control border border-warn-line bg-warn-bg text-warn">
          <ShieldCheck className="size-4.5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-body-lg font-bold text-ink">Package for Veeva PromoMats</h4>
          <p className="text-label text-ink-3">Upload it in PromoMats, where MLR review happens.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={downloadMetadata} className="gap-1.5 font-bold">
          <FileSpreadsheet className="size-3.5" />
          Download metadata only (.csv)
        </Button>
        <Button size="sm" onClick={downloadPackage} disabled={busy} className="gap-1.5 px-4 font-bold">
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Download package (.zip)
        </Button>
      </div>
      <ul className="flex flex-col divide-y divide-hair rounded-control border border-hair bg-subtle">
        {contents.map((c) => (
          <li key={c.label} className="flex items-center gap-2.5 px-3 py-2">
            <c.icon className="size-3.5 shrink-0 text-ink-3" />
            <span className="shrink-0 text-body font-semibold text-ink">{c.label}</span>
            <span className="truncate text-label text-ink-3">{c.detail}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setStepsOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1 self-start text-label font-bold text-ink-2 hover:text-ink"
        aria-expanded={stepsOpen}
      >
        How to upload it
        <ChevronDown className={cn("size-3.5 transition-transform", stepsOpen && "rotate-180")} />
      </button>
      {stepsOpen && (
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-label leading-snug text-ink-2">
          <li>In PromoMats, upload the template HTML as an Email Template.</li>
          <li>Fill its fields from the metadata sheet, and add assets.zip under Assets.</li>
          {footer && <li>Upload the ISI footer as a Template Fragment.</li>}
          {fragments.length > 0 && <li>Upload each fragment as an Email Fragment, one product each.</li>}
          <li>Add the relationships: PI, ISI, pieces{fragments.length ? " and fragments" : ""}.</li>
          <li>Start MLR review. Once approved, reps see it after the next CRM sync.</li>
        </ol>
      )}

    </div>
  );
}
