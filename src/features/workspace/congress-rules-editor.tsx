"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Check,
  ChevronDown,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Field as Input } from "@/components/ui/field";
import { Portal } from "@/components/ui/portal";
import { cn } from "@/lib/cn";
import {
  ALLOWANCE_LABELS,
  COMPANY_NAME_LABELS,
  DISCLOSURE_WHO_LABELS,
  DRUG_NAME_LABELS,
  FILE_TYPE_OPTIONS,
  FONT_FAMILY_OPTIONS,
  LOGO_LABELS,
  QR_ALLOWED_LABELS,
  QR_LINK_LABELS,
  EPOSTER_ONLY,
  POSTER,
  RULE_GROUPS,
  RULE_LABELS,
  SIZE_PRESETS,
  VERIFICATION_TIME,
  congressLabel,
  conventionalRules,
  findDuplicate,
  formatRange,
  formatSize,
  isUsable,
  orientationOf,
  readCongressGuidelines,
  rulesToCheck,
  verificationEta,
  useCongressStore,
  type Congress,
  type CongressRules,
  type Deliverables,
  type Disclosure,
  type FontFamilies,
  type FontSizes,
  type PosterSize,
  type PtRange,
  type QrRules,
  type RequiredItem,
  type RuleKey,
  type RuleSource,
  type ContentRules,
  type EmbargoRules,
  type Unit,
} from "@/features/workspace/congress-guidelines";

/* ───────────────────────────── Source chip ───────────────────────────── */

export function SourceChip({ source, legend = false }: { source: RuleSource; legend?: boolean }) {
  const [label, tone] =
    source.kind === "doc"
      ? [!legend && source.page ? `From guidelines · p. ${source.page}` : "From guidelines", "border-ok-line bg-ok-bg text-ok"]
      : source.kind === "you"
        ? ["You added", "border-tint-line bg-tint text-brand-deep"]
        : source.kind === "default"
          ? ["Common default · check", "border-warn-line bg-warn-bg text-warn"]
          : ["Not stated", "border-hair-2 bg-subtle text-ink-3"];
  return <span className={cn("shrink-0 rounded-chip border px-1.5 py-0.5 text-caption font-bold", tone)}>{label}</span>;
}

/* ───────────────────────────── Summaries ───────────────────────────── */

function deliverablesSummary(d: Deliverables) {
  const parts: string[] = [];
  if (d.print) parts.push(`Printed poster (${d.print.required ? "required" : "optional"})`);
  if (d.digital) {
    const g = d.digital;
    const spec = [
      g.fileTypes.join(" / "),
      g.aspect,
      g.maxPages ? (g.maxPages === 1 ? "1 page" : `up to ${g.maxPages} pages or slides`) : null,
      g.maxMB ? `up to ${g.maxMB} MB` : null,
      g.minDpi ? `${g.minDpi} dpi or more` : null,
      g.recording ? `plus a ${g.recording.minutes}-min recording (${g.recording.required ? "required" : "optional"}, not made in SwishX)` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    parts.push(`${d.print ? "Digital copy" : "Digital poster"} (${g.required ? "required" : "optional"})${spec ? ` · ${spec}` : ""}`);
  }
  return parts.join("\n") || "Nothing to deliver";
}

function fontSizesSummary(f: FontSizes) {
  const rows = (
    [
      ["Title", f.title],
      ["Headings", f.headings],
      ["Body", f.body],
      ["Legends", f.legends],
    ] as Array<[string, PtRange]>
  )
    .map(([k, r]) => (formatRange(r) ? `${k} ${formatRange(r)}` : null))
    .filter(Boolean);
  if (f.readableFrom) rows.push(`Readable from ${f.readableFrom.value} ${f.readableFrom.unit}`);
  return rows.join(" · ") || "No sizes given";
}

function summary(key: RuleKey, rules: CongressRules): string {
  const v = rules[key].value;
  if (v === null) return "Not stated";
  switch (key) {
    case "sizes":
      return (v as PosterSize[]).map(formatSize).join("\nor ");
    case "deliverables":
      return deliverablesSummary(v as Deliverables);
    case "fontSizes":
      return fontSizesSummary(v as FontSizes);
    case "fontFamilies": {
      const f = v as FontFamilies;
      return `${f.families.join(", ") || "Any"}${f.standardOnly ? " · standard fonts only" : ""}`;
    }
    case "drugNames":
      return DRUG_NAME_LABELS[v as keyof typeof DRUG_NAME_LABELS];
    case "companyName":
      return COMPANY_NAME_LABELS[v as keyof typeof COMPANY_NAME_LABELS];
    case "logos":
      return LOGO_LABELS[v as keyof typeof LOGO_LABELS];
    case "brandLook":
    case "congressLogo":
      return ALLOWANCE_LABELS[v as keyof typeof ALLOWANCE_LABELS];
    case "sponsorWording":
    case "otherBranding":
      return v as string;
    case "disclosure": {
      const d = v as Disclosure;
      return [
        DISCLOSURE_WHO_LABELS[d.who],
        d.evenIfNone && "required even if nothing to declare",
        d.funding && "funding statement",
        d.medicalWriting && "medical-writing acknowledgement",
        d.aiUse && "AI-use disclosure",
      ]
        .filter(Boolean)
        .join(" · ");
    }
    case "qr": {
      const q = v as QrRules;
      if (q.allowed === "no") return "Not allowed";
      return [
        QR_ALLOWED_LABELS[q.allowed],
        `links to ${QR_LINK_LABELS[q.links].toLowerCase()}`,
        q.max ? `max ${q.max}` : null,
        q.disclaimerRequired ? `disclaimer: “${q.disclaimer}”` : null,
      ]
        .filter(Boolean)
        .join(" · ");
    }
    case "requiredItems":
      return (v as RequiredItem[]).map((i) => `${i.label} · ${i.placement}`).join("\n") || "Nothing";
    case "content": {
      const c = v as ContentRules;
      return [
        c.poster.length ? `Poster: ${c.poster.join(" → ")}` : null,
        c.tip.length ? `Trials in Progress: ${c.tip.join(" → ")}${c.noResultsInTip ? " · no results data" : ""}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "embargo": {
      const e = v as EmbargoRules;
      return [
        e.atSessionStart ? "Data public at the session start" : null,
        e.encoreAllowed === true ? "Encores allowed" : e.encoreAllowed === false ? "No encores" : null,
        e.notes || null,
      ]
        .filter(Boolean)
        .join(" · ") || "No embargo stated";
    }
  }
}

/* ───────────────────────────── Validation ───────────────────────────── */

function errorsOf(rules: CongressRules): Partial<Record<RuleKey, string>> {
  const errors: Partial<Record<RuleKey, string>> = {};
  const sizes = rules.sizes.value;
  if (sizes && sizes.some((s) => !(s.width > 0) || !(s.height > 0))) errors.sizes = "Give every size a width and a height above zero.";
  const qr = rules.qr.value;
  if (qr && qr.allowed !== "no" && qr.disclaimerRequired && !qr.disclaimer.trim())
    errors.qr = "Add the disclaimer wording, or turn the disclaimer off.";
  const items = rules.requiredItems.value;
  if (items && items.some((i) => !i.label.trim())) errors.requiredItems = "Every required item needs a name.";
  const fonts = rules.fontSizes.value;
  if (fonts) {
    const bad = [fonts.title, fonts.headings, fonts.body, fonts.legends].some(
      (r) => (r.min != null && r.min <= 0) || (r.max != null && r.min != null && r.max < r.min)
    );
    if (bad) errors.fontSizes = "Sizes must be above zero, and a maximum can't be below its minimum.";
  }
  return errors;
}

/* ───────────────────────────── Small controls ───────────────────────────── */

function NumberBox({
  value,
  onChange,
  label,
  suffix,
  width = "w-20",
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  label: string;
  suffix?: string;
  width?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Input
        size="sm"
        type="number"
        min={0}
        step="any"
        aria-label={label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className={width}
      />
      {suffix && <span className="text-label text-ink-3">{suffix}</span>}
    </span>
  );
}

function Select<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-8 cursor-pointer rounded-control border border-hair-2 bg-card px-2 text-body text-ink focus:border-brand focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Choice<T extends string>({
  value,
  labels,
  onChange,
}: {
  value: T;
  labels: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(labels) as T[]).map((k) => (
        <button
          key={k}
          type="button"
          aria-pressed={value === k}
          onClick={() => onChange(k)}
          className={cn(
            "cursor-pointer rounded-chip border px-2.5 py-1 text-label font-bold transition-colors",
            value === k ? "border-brand bg-tint text-brand-deep" : "border-hair-2 text-ink-2 hover:border-hair-3"
          )}
        >
          {labels[k]}
        </button>
      ))}
    </div>
  );
}

function Check2({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-body text-ink-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-brand" />
      {children}
    </label>
  );
}

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={`${item}-${i}`} className="flex items-center gap-1.5 rounded-control border border-hair px-2 py-1">
          <span className="min-w-0 flex-1 truncate text-body text-ink">{item}</span>
          <IconButton aria-label={`Move ${item} up`} size={6} disabled={i === 0} onClick={() => move(i, -1)}>
            <ArrowUp className="size-3" />
          </IconButton>
          <IconButton aria-label={`Move ${item} down`} size={6} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
            <ArrowDown className="size-3" />
          </IconButton>
          <IconButton aria-label={`Remove ${item}`} size={6} onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <X className="size-3" />
          </IconButton>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <Input
          size="sm"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={!draft.trim()}
          onClick={() => {
            onChange([...items, draft.trim()]);
            setDraft("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────────── Editors, one per rule ───────────────────────────── */

function SizesEditor({ value, onChange }: { value: PosterSize[]; onChange: (v: PosterSize[]) => void }) {
  const update = (i: number, patch: Partial<PosterSize>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-2">
      {value.map((s, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 rounded-control border border-hair px-2.5 py-2">
          <NumberBox label="Width" value={s.width} onChange={(n) => update(i, { width: n ?? 0 })} />
          <span className="text-label text-ink-3">×</span>
          <NumberBox label="Height" value={s.height} onChange={(n) => update(i, { height: n ?? 0 })} />
          <Select<Unit>
            label="Unit"
            value={s.unit}
            options={[
              { value: "mm", label: "mm" },
              { value: "cm", label: "cm" },
              { value: "in", label: "in" },
            ]}
            onChange={(unit) => update(i, { unit })}
          />
          <Select<PosterSize["limit"]>
            label="Exact or maximum"
            value={s.limit}
            options={[
              { value: "exact", label: "Exact" },
              { value: "max", label: "Maximum" },
            ]}
            onChange={(limit) => update(i, { limit })}
          />
          <span className="rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold text-ink-2">{orientationOf(s)}</span>
          <IconButton aria-label="Swap width and height" size={7} onClick={() => update(i, { width: s.height, height: s.width })}>
            <ArrowLeftRight className="size-3.5" />
          </IconButton>
          {value.length > 1 && (
            <IconButton aria-label="Remove this size" size={7} onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <Trash2 className="size-3.5" />
            </IconButton>
          )}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <Select<string>
          label="Apply a preset"
          value=""
          options={[{ value: "", label: "Apply a preset…" }, ...SIZE_PRESETS.map((p) => ({ value: p.label, label: p.label }))]}
          onChange={(label) => {
            const preset = SIZE_PRESETS.find((p) => p.label === label);
            if (preset) onChange([preset.size, ...value.slice(1)]);
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          className="gap-1"
          onClick={() => onChange([...value, { width: 0, height: 0, unit: value[0]?.unit ?? "in", limit: "exact" }])}
        >
          <Plus className="size-3.5" />
          Add another allowed size
        </Button>
      </div>
    </div>
  );
}

type Use = "none" | "optional" | "required";
const USE_LABELS: Record<Use, string> = { none: "Not used", optional: "Optional", required: "Required" };

function DeliverablesEditor({ value, onChange }: { value: Deliverables; onChange: (v: Deliverables) => void }) {
  const printUse: Use = !value.print ? "none" : value.print.required ? "required" : "optional";
  const digitalUse: Use = !value.digital ? "none" : value.digital.required ? "required" : "optional";
  const digital = value.digital;
  const setDigital = (patch: Partial<NonNullable<Deliverables["digital"]>>) =>
    digital && onChange({ ...value, digital: { ...digital, ...patch } });
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="text-label font-semibold text-ink-3">Printed poster</span>
        <Choice<Use>
          value={printUse}
          labels={USE_LABELS}
          onChange={(u) => onChange({ ...value, print: u === "none" ? null : { required: u === "required" } })}
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-label font-semibold text-ink-3">Digital poster or copy (PDF for screens and the online gallery)</span>
        <Choice<Use>
          value={digitalUse}
          labels={USE_LABELS}
          onChange={(u) =>
            onChange({
              ...value,
              digital:
                u === "none"
                  ? null
                  : {
                      ...(digital ?? { fileTypes: ["PDF"], aspect: "16:9", maxMB: null, minDpi: null, maxPages: 1, recording: null }),
                      required: u === "required",
                    },
            })
          }
        />
        {digital && (
          <div className="space-y-2 rounded-control border border-hair px-2.5 py-2">
            <span className="block text-label font-semibold text-ink-3">Poster file</span>
            <div className="flex flex-wrap gap-1.5">
              {FILE_TYPE_OPTIONS.map((t) => {
                const on = digital.fileTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDigital({ fileTypes: on ? digital.fileTypes.filter((x) => x !== t) : [...digital.fileTypes, t] })}
                    className={cn(
                      "cursor-pointer rounded-chip border px-2 py-0.5 text-label font-bold",
                      on ? "border-brand bg-tint text-brand-deep" : "border-hair-2 text-ink-3"
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1.5 text-label text-ink-3">
                Aspect
                <Select<string>
                  label="Aspect ratio"
                  value={digital.aspect ?? ""}
                  options={[
                    { value: "", label: "Not stated" },
                    { value: "16:9", label: "16:9" },
                    { value: "4:3", label: "4:3" },
                    { value: "same as print", label: "Same as print" },
                  ]}
                  onChange={(a) => setDigital({ aspect: (a || null) as never })}
                />
              </span>
              <span className="inline-flex items-center gap-1.5 text-label text-ink-3">
                Max size <NumberBox label="Max file size" value={digital.maxMB} onChange={(n) => setDigital({ maxMB: n })} suffix="MB" />
              </span>
              <span className="inline-flex items-center gap-1.5 text-label text-ink-3">
                Min <NumberBox label="Minimum resolution" value={digital.minDpi} onChange={(n) => setDigital({ minDpi: n })} suffix="dpi" />
              </span>
              <span className="inline-flex items-center gap-1.5 text-label text-ink-3">
                Up to <NumberBox label="Pages or slides" value={digital.maxPages} onChange={(n) => setDigital({ maxPages: n })} suffix="pages" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FontSizesEditor({ value, onChange }: { value: FontSizes; onChange: (v: FontSizes) => void }) {
  const roles: Array<[keyof Omit<FontSizes, "readableFrom">, string]> = [
    ["title", "Title"],
    ["headings", "Headings"],
    ["body", "Body"],
    ["legends", "Legends"],
  ];
  return (
    <div className="space-y-2">
      {roles.map(([key, label]) => (
        <div key={key} className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-label font-semibold text-ink-3">{label}</span>
          <NumberBox label={`${label} minimum`} value={value[key].min} onChange={(n) => onChange({ ...value, [key]: { ...value[key], min: n } })} suffix="pt min" />
          <NumberBox label={`${label} maximum`} value={value[key].max} onChange={(n) => onChange({ ...value, [key]: { ...value[key], max: n } })} suffix="pt max" />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-label font-semibold text-ink-3">Readable from</span>
        <NumberBox
          label="Readable from"
          value={value.readableFrom?.value ?? null}
          onChange={(n) => onChange({ ...value, readableFrom: n == null ? null : { value: n, unit: value.readableFrom?.unit ?? "m" } })}
        />
        <Select<"m" | "ft">
          label="Distance unit"
          value={value.readableFrom?.unit ?? "m"}
          options={[
            { value: "m", label: "m" },
            { value: "ft", label: "ft" },
          ]}
          onChange={(unit) => value.readableFrom && onChange({ ...value, readableFrom: { ...value.readableFrom, unit } })}
        />
      </div>
      <p className="text-caption text-ink-4">Leave a box empty when the guidelines don&apos;t say.</p>
    </div>
  );
}

function FontFamiliesEditor({ value, onChange }: { value: FontFamilies; onChange: (v: FontFamilies) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {FONT_FAMILY_OPTIONS.map((f) => {
          const on = value.families.includes(f);
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...value, families: on ? value.families.filter((x) => x !== f) : [...value.families, f] })}
              className={cn(
                "cursor-pointer rounded-chip border px-2.5 py-1 text-label font-bold",
                on ? "border-brand bg-tint text-brand-deep" : "border-hair-2 text-ink-2 hover:border-hair-3"
              )}
              style={{ fontFamily: f.startsWith("Any") ? undefined : f }}
            >
              {f}
            </button>
          );
        })}
      </div>
      <Check2 checked={value.standardOnly} onChange={(standardOnly) => onChange({ ...value, standardOnly })}>
        Standard fonts only (no custom or brand typefaces)
      </Check2>
    </div>
  );
}

function DisclosureEditor({ value, onChange }: { value: Disclosure; onChange: (v: Disclosure) => void }) {
  return (
    <div className="space-y-2">
      <Choice<Disclosure["who"]> value={value.who} labels={DISCLOSURE_WHO_LABELS} onChange={(who) => onChange({ ...value, who })} />
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        <Check2 checked={value.evenIfNone} onChange={(evenIfNone) => onChange({ ...value, evenIfNone })}>
          Required even if nothing to declare
        </Check2>
        <Check2 checked={value.funding} onChange={(funding) => onChange({ ...value, funding })}>
          Funding statement
        </Check2>
        <Check2 checked={value.medicalWriting} onChange={(medicalWriting) => onChange({ ...value, medicalWriting })}>
          Medical-writing acknowledgement
        </Check2>
        <Check2 checked={value.aiUse} onChange={(aiUse) => onChange({ ...value, aiUse })}>
          AI-use disclosure
        </Check2>
      </div>
    </div>
  );
}

function QrEditor({ value, onChange }: { value: QrRules; onChange: (v: QrRules) => void }) {
  return (
    <div className="space-y-2">
      <Choice<QrRules["allowed"]> value={value.allowed} labels={QR_ALLOWED_LABELS} onChange={(allowed) => onChange({ ...value, allowed })} />
      {value.allowed !== "no" && (
        <>
          <div className="space-y-1">
            <span className="text-label font-semibold text-ink-3">May link to</span>
            <Choice<QrRules["links"]> value={value.links} labels={QR_LINK_LABELS} onChange={(links) => onChange({ ...value, links })} />
          </div>
          <span className="inline-flex items-center gap-1.5 text-label text-ink-3">
            At most <NumberBox label="Maximum QR codes" value={value.max} onChange={(max) => onChange({ ...value, max })} suffix="codes" />
          </span>
          <Check2 checked={value.disclaimerRequired} onChange={(disclaimerRequired) => onChange({ ...value, disclaimerRequired })}>
            A disclaimer is required next to the code
          </Check2>
          {value.disclaimerRequired && (
            <Input
              multiline
              rows={3}
              label="Disclaimer, word for word"
              value={value.disclaimer}
              onChange={(e) => onChange({ ...value, disclaimer: e.target.value })}
            />
          )}
        </>
      )}
    </div>
  );
}

function RequiredItemsEditor({ value, onChange }: { value: RequiredItem[]; onChange: (v: RequiredItem[]) => void }) {
  const update = (i: number, patch: Partial<RequiredItem>) => onChange(value.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-control border border-hair px-2.5 py-2">
          <div className="min-w-[10rem] flex-1">
            <Input size="sm" aria-label="Item" placeholder="e.g. Acceptance code" value={item.label} onChange={(e) => update(i, { label: e.target.value })} />
          </div>
          <div className="w-40">
            <Input size="sm" aria-label="Placement" placeholder="e.g. Top-right corner" value={item.placement} onChange={(e) => update(i, { placement: e.target.value })} />
          </div>
          <Select<RequiredItem["issuedBy"]>
            label="Who supplies it"
            value={item.issuedBy}
            options={[
              { value: "congress", label: "Issued by the congress" },
              { value: "you", label: "Yours" },
            ]}
            onChange={(issuedBy) => update(i, { issuedBy })}
          />
          <IconButton aria-label="Remove item" size={7} onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <Trash2 className="size-3.5" />
          </IconButton>
        </div>
      ))}
      <Button
        size="sm"
        variant="ghost"
        className="gap-1"
        onClick={() => onChange([...value, { id: `item-${Date.now()}`, label: "", placement: "", issuedBy: "congress" }])}
      >
        <Plus className="size-3.5" />
        Add a required item
      </Button>
    </div>
  );
}

function ContentEditor({ value, onChange }: { value: ContentRules; onChange: (v: ContentRules) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <span className="text-label font-semibold text-ink-3">Poster sections, in order</span>
        <ListEditor items={value.poster} onChange={(poster) => onChange({ ...value, poster })} placeholder="Add a section" />
      </div>
      <div className="space-y-1">
        <span className="text-label font-semibold text-ink-3">Trials in Progress sections</span>
        <ListEditor items={value.tip} onChange={(tip) => onChange({ ...value, tip })} placeholder="Add a section" />
        <Check2 checked={value.noResultsInTip} onChange={(noResultsInTip) => onChange({ ...value, noResultsInTip })}>
          No results data in Trials in Progress
        </Check2>
      </div>
    </div>
  );
}

function EmbargoEditor({ value, onChange }: { value: EmbargoRules; onChange: (v: EmbargoRules) => void }) {
  return (
    <div className="space-y-2">
      <Check2 checked={value.atSessionStart} onChange={(atSessionStart) => onChange({ ...value, atSessionStart })}>
        Data becomes public at the start of the session
      </Check2>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-label font-semibold text-ink-3">Encores</span>
        <Choice<"yes" | "no" | "unstated">
          value={value.encoreAllowed === true ? "yes" : value.encoreAllowed === false ? "no" : "unstated"}
          labels={{ yes: "Allowed", no: "Not allowed", unstated: "Not stated" }}
          onChange={(v) => onChange({ ...value, encoreAllowed: v === "yes" ? true : v === "no" ? false : null })}
        />
      </div>
      <Input multiline rows={2} label="Notes" value={value.notes} onChange={(e) => onChange({ ...value, notes: e.target.value })} />
    </div>
  );
}

function Editor({ k, rules, set }: { k: RuleKey; rules: CongressRules; set: (value: unknown) => void }) {
  const fallback = conventionalRules()[k].value;
  const v = (rules[k].value ?? fallback) as never;
  switch (k) {
    case "sizes":
      return <SizesEditor value={v} onChange={set} />;
    case "deliverables":
      return <DeliverablesEditor value={v} onChange={set} />;
    case "fontSizes":
      return <FontSizesEditor value={v} onChange={set} />;
    case "fontFamilies":
      return <FontFamiliesEditor value={v} onChange={set} />;
    case "drugNames":
      return <Choice value={v} labels={DRUG_NAME_LABELS} onChange={set} />;
    case "companyName":
      return <Choice value={v} labels={COMPANY_NAME_LABELS} onChange={set} />;
    case "logos":
      return <Choice value={v} labels={LOGO_LABELS} onChange={set} />;
    case "brandLook":
    case "congressLogo":
      return <Choice value={v} labels={ALLOWANCE_LABELS} onChange={set} />;
    case "sponsorWording":
      return (
        <Input
          size="sm"
          value={(rules[k].value as string) ?? "Study sponsored by {company}"}
          onChange={(e) => set(e.target.value)}
          hint="{company} is filled in with the sponsor's name."
        />
      );
    case "otherBranding":
      return (
        <Input
          multiline
          rows={2}
          value={(rules[k].value as string) ?? ""}
          placeholder="Anything else the guidelines say about branding"
          onChange={(e) => set(e.target.value)}
        />
      );
    case "disclosure":
      return <DisclosureEditor value={v} onChange={set} />;
    case "qr":
      return <QrEditor value={v} onChange={set} />;
    case "requiredItems":
      return <RequiredItemsEditor value={v} onChange={set} />;
    case "content":
      return <ContentEditor value={v} onChange={set} />;
    case "embargo":
      return <EmbargoEditor value={v} onChange={set} />;
  }
}

/* ───────────────────────────── The window ───────────────────────────── */

const READ_STEPS = [
  "Finding size and what to deliver",
  "Finding type sizes and fonts",
  "Finding branding and logo rules",
  "Finding disclosure, QR and required items",
];
const READ_STEP_MS = 650;

/**
 * Add a congress from its guidelines, or read and edit one's rules.
 *
 * Two ways in, and either is enough: the guidelines file, or the rules the
 * person already knows. What comes back is a set of fields, each with where
 * it came from; the ones standing in for something the guidelines did not
 * say are counted at the top and open first, because a poster rejected at
 * the congress is a poster whose amber rules nobody checked.
 */
export function CongressRulesModal({
  initialName,
  congress,
  onClose,
  onSaved,
  onUseExisting,
}: {
  initialName?: string;
  /** Set to view an existing congress; otherwise this adds one. */
  congress?: Congress;
  onClose: () => void;
  /** Called with the congress once it is sent for verification, new or corrected. */
  onSaved: (congress: Congress) => void;
  /** Called when the person picks an existing, verified congress instead of adding it again. */
  onUseExisting?: (congress: Congress) => void;
}) {
  const congresses = useCongressStore((s) => s.congresses);
  const saveCongress = useCongressStore((s) => s.saveCongress);
  const [stage, setStage] = useState<"input" | "reading" | "review" | "submitted">(congress ? "review" : "input");
  const [name, setName] = useState(initialName ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<Congress | null>(congress ?? null);
  /* An existing congress opens read-only; "Suggest a correction" makes it editable. */
  const [correcting, setCorrecting] = useState(false);
  const readOnly = Boolean(congress) && !correcting;
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState<RuleKey | null>(null);
  const [openGroups, setOpenGroups] = useState<string[]>(() => initialOpen(congress?.rules));
  const fileRef = useRef<HTMLInputElement>(null);

  const duplicate = !congress ? findDuplicate(congresses, name) : undefined;
  const canRead = name.trim().length >= 3 && (Boolean(file) || notes.trim().length > 0) && !duplicate;
  const errors = useMemo(() => (draft ? errorsOf(draft.rules) : {}), [draft]);
  const toCheck = draft ? rulesToCheck(draft.rules) : [];
  const hasErrors = Object.keys(errors).length > 0;
  /* A correction has to correct something. */
  const unchanged = correcting && draft?.rules === (congress?.pendingRevision?.rules ?? congress?.rules);

  useEffect(() => {
    if (stage !== "reading") return;
    const timers = READ_STEPS.map((_, i) => window.setTimeout(() => setStep(i + 1), (i + 1) * READ_STEP_MS));
    const done = window.setTimeout(() => {
      const read = readCongressGuidelines({ name, fileName: file?.name, notes });
      setDraft(read);
      setOpenGroups(initialOpen(read.rules));
      setStage("review");
    }, READ_STEPS.length * READ_STEP_MS + 300);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, [stage, name, file, notes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage !== "reading") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, stage]);

  /* Any edit makes that one rule yours; the others keep their source. */
  const setRule = (k: RuleKey, value: unknown) =>
    setDraft((d) => (d ? { ...d, rules: { ...d.rules, [k]: { value, source: { kind: "you" } } } } : d));
  const markUnstated = (k: RuleKey) =>
    setDraft((d) => (d ? { ...d, rules: { ...d.rules, [k]: { value: null, source: { kind: "unstated" } } } } : d));
  const confirm = (k: RuleKey) =>
    setDraft((d) => (d ? { ...d, rules: { ...d.rules, [k]: { ...d.rules[k], source: { kind: "you" } } } } : d));

  /* A correction carries on from one already waiting, if there is one. */
  const startCorrection = () => {
    if (congress?.pendingRevision) setDraft({ ...congress, rules: congress.pendingRevision.rules });
    setCorrecting(true);
  };

  /*
   * Nothing a workspace writes is used until SwishX has verified it. A new
   * congress is saved as pending and can't be chosen; a correction to a
   * verified one waits beside it while the verified rules stay in use.
   */
  const send = () => {
    if (!draft || hasErrors) return;
    /* Edits in progress are kept, not lost: sending is the commit. */
    setEditing(null);
    const submittedAt = Date.now();
    const delivery = draft.rules.deliverables.value;
    const saved: Congress = congress
      ? { ...congress, pendingRevision: { submittedAt, rules: draft.rules } }
      : {
          ...draft,
          status: "pending",
          origin: "team",
          submittedAt,
          presentationTypes: delivery && !delivery.print ? [EPOSTER_ONLY] : [POSTER],
        };
    saveCongress(saved);
    setDraft(saved);
    setStage("submitted");
    onSaved(saved);
  };

  const pending = congress && !isUsable(congress);
  const title = congress ? `${congressLabel(congress)} rules` : "Add congress guidelines";
  const subtitle =
    stage === "submitted"
      ? null
      : stage !== "review"
        ? "Upload the author guidelines, or type the rules you know. Either is enough."
        : !congress
          ? "Check what SwishX read. Each rule says where it came from; edit any of them."
          : correcting
            ? "Change what's wrong. SwishX verifies the correction before it's used."
            : pending
              ? "Waiting for SwishX to verify these rules. They can't be used on a poster until then."
              : "The rules your poster is checked against.";

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={() => stage !== "reading" && onClose()}
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[88vh] w-full max-w-[760px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
        >
          <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-subhead font-[850] tracking-tight text-ink">{title}</h2>
              {subtitle && <p className="mt-0.5 text-label text-ink-3">{subtitle}</p>}
              {congress && stage === "review" && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {pending ? (
                    <span className="inline-flex items-center gap-1 rounded-chip bg-warn-bg px-2 py-0.5 text-label font-bold text-warn">
                      <Clock className="size-3" />
                      Verification pending · {verificationEta(congress.submittedAt)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-chip bg-ok-bg px-2 py-0.5 text-label font-bold text-ok">
                      <Check className="size-3" />
                      Verified by SwishX{congress.verifiedOn ? ` · ${congress.verifiedOn}` : ""}
                    </span>
                  )}
                  {congress.sourceUrl && (
                    <a
                      href={congress.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-label font-bold text-brand hover:underline"
                    >
                      Congress guidelines
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
            {stage !== "reading" && (
              <IconButton aria-label="Close" onClick={onClose}>
                <X className="size-4" />
              </IconButton>
            )}
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {stage === "input" && (
              <>
                <Input
                  label="Congress name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="AAD Annual Meeting 2026"
                  error={
                    name.trim().length > 0 && name.trim().length < 3 ? "Use the congress's full name or acronym." : undefined
                  }
                />
                {duplicate && (
                  <div className="flex flex-wrap items-center gap-2 rounded-control border border-warn-line bg-warn-bg px-3 py-2 text-label text-warn">
                    {isUsable(duplicate) ? (
                      <>
                        <span className="min-w-0 flex-1">{congressLabel(duplicate)} is already in your workspace, verified.</span>
                        <Button size="sm" variant="secondary" onClick={() => (onUseExisting ?? onSaved)(duplicate)}>
                          Use it
                        </Button>
                      </>
                    ) : (
                      <span className="min-w-0 flex-1">
                        {congressLabel(duplicate)} is already waiting for verification ·{" "}
                        {verificationEta(duplicate.submittedAt)}.
                      </span>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <span className="block text-label font-semibold text-ink-3">Author guidelines</span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                    {file ? (
                      <div className="flex items-center gap-2 rounded-control border border-hair-2 px-3 py-2.5">
                        <FileText className="size-4 shrink-0 text-brand" />
                        <span className="min-w-0 flex-1 truncate text-body font-bold text-ink">{file.name}</span>
                        <IconButton aria-label="Remove file" size={7} onClick={() => setFile(null)}>
                          <X className="size-3.5" />
                        </IconButton>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="grid w-full cursor-pointer justify-items-center gap-1 rounded-control border border-dashed border-hair-3 px-3 py-5 text-center transition-colors hover:border-brand"
                      >
                        <Upload className="size-4.5 text-brand" />
                        <span className="text-body font-bold text-ink">Upload guidelines</span>
                        <span className="text-caption text-ink-3">PDF or Word, from the congress site</span>
                      </button>
                    )}
                  </div>
                  <Input
                    multiline
                    rows={5}
                    label="Or type what you know"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Portrait A0. Body text 24 pt or more. Generic names only, no company logos, no QR codes."
                  />
                </div>
              </>
            )}

            {stage === "reading" && (
              <div className="space-y-2.5 py-2" aria-live="polite">
                <p className="text-body font-bold text-ink">Reading {name.trim()} guidelines</p>
                {READ_STEPS.map((label, i) => (
                  <div key={label} className={cn("flex items-center gap-2 text-body", i < step ? "text-ink" : "text-ink-4")}>
                    {i < step ? (
                      <Check className="size-4 text-ok" />
                    ) : i === step ? (
                      <Loader2 className="size-4 animate-spin text-brand" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                    {label}
                  </div>
                ))}
                <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.round((step / READ_STEPS.length) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {stage === "submitted" && draft && (
              <div className="grid justify-items-center gap-2 px-2 py-6 text-center" aria-live="polite">
                <span className="grid size-11 place-items-center rounded-full bg-warn-bg text-warn">
                  <Clock className="size-5" />
                </span>
                <h3 className="text-title font-[850] tracking-tight text-ink">
                  {congress ? "Correction sent to SwishX" : "Sent to SwishX for verification"}
                </h3>
                <p className="max-w-[460px] text-balance text-body text-ink-2">
                  {congress
                    ? `A SwishX specialist checks your correction against the ${draft.acronym} guidelines. Until it's verified, posters keep using the current verified rules.`
                    : `A SwishX specialist checks every rule against the ${draft.acronym} guidelines before anyone can use them. Only verified guidelines can be used on a poster, so ${draft.acronym} can't be chosen yet.`}
                </p>
                <p className="rounded-chip bg-subtle px-2.5 py-1 text-label font-bold text-ink-2">
                  Usually {VERIFICATION_TIME} · come back once it shows as Verified
                </p>
                <p className="text-caption text-ink-3">
                  {congress
                    ? "Once verified, the corrected rules apply to every new poster for this congress."
                    : "It will show as Verified for everyone in this workspace."}
                </p>
              </div>
            )}

            {stage === "review" && draft && (
              <>
                {readOnly && congress?.pendingRevision && (
                  <p className="flex items-start gap-1.5 rounded-control border border-warn-line bg-warn-bg px-3 py-2 text-label text-warn">
                    <Clock className="mt-0.5 size-3.5 shrink-0" />
                    A correction is waiting for verification · {verificationEta(congress.pendingRevision.submittedAt)}. The
                    verified rules below stay in use until then.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                  {readOnly ? null : toCheck.length > 0 ? (
                    <span className="mr-1 rounded-chip bg-warn-bg px-2 py-0.5 text-label font-extrabold text-warn">
                      {toCheck.length} {toCheck.length === 1 ? "rule" : "rules"} to check
                    </span>
                  ) : (
                    <span className="mr-1 rounded-chip bg-ok-bg px-2 py-0.5 text-label font-extrabold text-ok">Nothing to check</span>
                  )}
                  <SourceChip source={{ kind: "doc" }} legend />
                  <SourceChip source={{ kind: "you" }} />
                  <SourceChip source={{ kind: "default" }} />
                  <SourceChip source={{ kind: "unstated" }} />
                </div>

                {RULE_GROUPS.map((group) => {
                  const open = openGroups.includes(group.id);
                  const amber = group.keys.filter((k) => draft.rules[k].source.kind === "default").length;
                  const err = group.keys.some((k) => errors[k]);
                  return (
                    <section key={group.id} className="overflow-hidden rounded-control border border-hair">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenGroups((g) => (open ? g.filter((x) => x !== group.id) : [...g, group.id]))}
                        className="flex w-full cursor-pointer items-center gap-2 bg-subtle/60 px-3.5 py-2.5 text-left"
                      >
                        <span className="flex-1 text-body font-extrabold text-ink">{group.label}</span>
                        {err && <span className="text-caption font-bold text-danger">Fix to save</span>}
                        {amber > 0 && <span className="rounded-chip bg-warn-bg px-1.5 py-0.5 text-caption font-bold text-warn">{amber} to check</span>}
                        <ChevronDown className={cn("size-4 text-ink-3 transition-transform", open && "rotate-180")} />
                      </button>
                      {open && (
                        <div className="divide-y divide-hair">
                          {group.keys.map((k) => {
                            const rule = draft.rules[k];
                            const isEditing = editing === k;
                            return (
                              <div key={k} className="space-y-2 px-3.5 py-2.5">
                                <div className="flex items-start gap-3">
                                  <span className="w-28 shrink-0 pt-0.5 text-label font-semibold text-ink-3">{RULE_LABELS[k]}</span>
                                  <span className={cn("min-w-0 flex-1 whitespace-pre-line text-body leading-snug", rule.value === null ? "text-ink-4" : "text-ink")}>
                                    {summary(k, draft.rules)}
                                  </span>
                                  <SourceChip source={rule.source} />
                                  {rule.source.kind === "default" && !isEditing && !readOnly && (
                                    <Button size="sm" variant="secondary" className="h-7 px-2 text-label" onClick={() => confirm(k)}>
                                      Looks right
                                    </Button>
                                  )}
                                  {!readOnly && (
                                    <IconButton
                                      aria-label={isEditing ? `Done editing ${RULE_LABELS[k]}` : `Edit ${RULE_LABELS[k]}`}
                                      size={7}
                                      onClick={() => setEditing(isEditing ? null : k)}
                                    >
                                      {isEditing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
                                    </IconButton>
                                  )}
                                </div>
                                {isEditing && (
                                  <div className="space-y-2 rounded-control bg-subtle/50 p-3">
                                    <Editor k={k} rules={draft.rules} set={(value) => setRule(k, value)} />
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          markUnstated(k);
                                          setEditing(null);
                                        }}
                                        className="cursor-pointer text-label font-bold text-ink-3 hover:text-ink"
                                      >
                                        Mark as not stated
                                      </button>
                                      <Button size="sm" onClick={() => setEditing(null)}>
                                        Done
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                {errors[k] && <p className="text-label text-danger">{errors[k]}</p>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
              </>
            )}
          </div>

          {stage !== "reading" && (
            <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">
              <span className={cn("text-label", hasErrors && stage === "review" ? "text-danger" : "text-ink-3")}>
                {stage === "input"
                  ? canRead
                    ? "Ready to read"
                    : "Name the congress, then add guidelines or type what you know"
                  : stage === "submitted"
                    ? "Only verified guidelines can be used"
                    : readOnly
                      ? pending
                        ? "Only verified guidelines can be used"
                        : "Something wrong or out of date? SwishX verifies corrections."
                      : hasErrors
                        ? "Fix the rules marked in red to send"
                        : correcting
                          ? unchanged
                            ? "Edit the rule that's wrong, then send it"
                            : `The verified rules stay in use until SwishX checks this · usually ${VERIFICATION_TIME}`
                          : `SwishX verifies before anyone can use it · usually ${VERIFICATION_TIME}`}
              </span>
              {stage === "input" ? (
                <Button size="sm" disabled={!canRead} onClick={() => setStage("reading")}>
                  Read guidelines
                </Button>
              ) : stage === "submitted" ? (
                <Button size="sm" onClick={onClose}>
                  Done
                </Button>
              ) : readOnly ? (
                pending ? (
                  <Button size="sm" variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={startCorrection}>
                    <Pencil className="size-3.5" />
                    Suggest a correction
                  </Button>
                )
              ) : (
                <Button size="sm" disabled={hasErrors || unchanged} onClick={send}>
                  {congress ? "Send correction for verification" : "Send for verification"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/** Open the groups that need a look: anything amber, else the first. */
function initialOpen(rules?: CongressRules) {
  if (!rules) return ["delivery"];
  const amber = RULE_GROUPS.filter((g) => g.keys.some((k) => rules[k].source.kind === "default")).map((g) => g.id);
  return amber.length ? amber : ["delivery"];
}
