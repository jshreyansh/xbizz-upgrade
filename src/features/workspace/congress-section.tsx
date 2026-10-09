"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  Circle,
  FileText,
  Files,
  Loader2,
  Lock,
  Monitor,
  Pencil,
  Plus,
  Presentation,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Portal } from "@/components/ui/portal";
import { cn } from "@/lib/cn";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import {
  MORE_CONGRESSES,
  SUGGESTED_CONGRESS_IDS,
  congressLabel,
  readCongressGuidelines,
  ruleOf,
  searchCongresses,
  useCongressStore,
  type Congress,
  type CongressRule,
  type PosterFormat,
  type RuleSource,
} from "@/features/workspace/congress-guidelines";

/** The poster's congress and format, for the section's summary line. */
export function congressSummary(congress: Congress | undefined, format: PosterFormat | undefined) {
  if (!congress) return "Choose the congress first";
  if (!format) return `${congressLabel(congress)} · choose printed or ePoster`;
  return `${congressLabel(congress)} · ${format.detail} · 1 page`;
}

/** The chosen congress and format, resolved from the stores. */
export function useChosenCongress() {
  const congresses = useCongressStore((s) => s.congresses);
  const congressId = useWorkspaceStore((s) => s.congressId);
  const posterFormat = useWorkspaceStore((s) => s.posterFormat);
  const congress = congresses.find((c) => c.id === congressId);
  const format = congress?.formats.find((f) => f.id === posterFormat);
  return { congress, format };
}

/**
 * Congress, format and pages — the poster's version of Format & pages.
 *
 * One decision, the congress; the other two follow from it. Format and Pages
 * are shown, not asked: they are what the congress set, and changing them
 * means changing the congress or its rules. The one exception is a congress
 * that itself accepts both a printed poster and an ePoster.
 */
export function CongressSectionContent({
  onContinue,
  onToast,
}: {
  onContinue: () => void;
  onToast?: (message: string) => void;
}) {
  const congresses = useCongressStore((s) => s.congresses);
  const setCongress = useWorkspaceStore((s) => s.setCongress);
  const setPosterFormat = useWorkspaceStore((s) => s.setPosterFormat);
  const setPageShape = useWorkspaceStore((s) => s.setPageShape);
  const setInfographicPages = useWorkspaceStore((s) => s.setInfographicPages);
  const { congress, format } = useChosenCongress();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ mode: "add"; name: string } | { mode: "view"; congress: Congress } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const pickFormat = (next: PosterFormat) => {
    setPosterFormat(next.id);
    setPageShape(next.shape);
  };

  const choose = (next: Congress) => {
    const only = next.formats.length === 1 ? next.formats[0] : null;
    setCongress(next.id, only?.id ?? null);
    /* A poster is one page, in the shape its format sets. */
    setInfographicPages("1");
    if (only) setPageShape(only.shape);
    setQuery("");
    onToast?.(`${congressLabel(next)} rules applied to this poster`);
  };

  const suggested = SUGGESTED_CONGRESS_IDS.map((id) => congresses.find((c) => c.id === id)).filter(
    (c): c is Congress => Boolean(c)
  );
  const results = searchCongresses(congresses, query);

  return (
    <div className="space-y-2.5">
      {/* ── Congress ── */}
      <div className="space-y-2">
        <span className="block text-label font-medium text-ink-3">Congress</span>
        {congress ? (
          <div className="flex flex-wrap items-center gap-3 rounded-control border border-hair-3 bg-card px-3.5 py-3">
            <RowIcon>
              <Presentation className="size-4" />
            </RowIcon>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-lg font-bold text-ink">{congressLabel(congress)}</span>
              <span className="block truncate text-label text-ink-3">
                {congress.rules.length} rules · {ruleOf(congress, "branding")}
              </span>
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => setModal({ mode: "view", congress })}>
                View rules
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCongress(null, null);
                  requestAnimationFrame(() => searchRef.current?.focus());
                }}
              >
                Change
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Field
              ref={searchRef as never}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a congress"
              aria-label="Search a congress"
              iconLeft={<Search className="size-4" />}
            />
            {!query.trim() ? (
              /* Two suggestions, then the size of the rest: enough to start
                 from, without a list to scroll. */
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {suggested.map((c) => (
                  <CongressOption key={c.id} congress={c} onSelect={() => choose(c)} />
                ))}
                <button
                  type="button"
                  onClick={() => searchRef.current?.focus()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-control border border-dashed border-hair-3 px-3 py-2.5 text-center transition-colors hover:border-brand hover:bg-tint/40"
                >
                  <span className="text-subhead font-extrabold text-ink">+{MORE_CONGRESSES}</span>
                  <span className="text-caption text-ink-3">more congresses · search to find yours</span>
                </button>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1.5">
                {results.map((c) => (
                  <CongressOption key={c.id} congress={c} wide onSelect={() => choose(c)} />
                ))}
              </div>
            ) : (
              /* Not listed is not a dead end: the search becomes its name. */
              <div className="rounded-control border border-dashed border-hair-3 px-4 py-4 text-center">
                <p className="text-body font-bold text-ink">No guidelines for “{query.trim()}” yet</p>
                <p className="mt-0.5 text-label text-ink-3">
                  Upload its author guidelines, or type the rules you know. Your team can pick it next time.
                </p>
                <Button size="sm" className="mt-3 gap-1.5" onClick={() => setModal({ mode: "add", name: query.trim() })}>
                  <Plus className="size-3.5" />
                  Add congress guidelines
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Format: set by the congress, or chosen between the two it accepts ── */}
      {congress && congress.formats.length > 1 ? (
        <div className="space-y-2 rounded-control border border-hair-3 bg-card px-3.5 py-3">
          <span className="block text-label font-medium text-ink-3">
            Format · {congress.name} accepts both
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {congress.formats.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={format?.id === f.id}
                onClick={() => pickFormat(f)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-control border px-3 py-2.5 text-left transition-colors",
                  format?.id === f.id ? "border-brand bg-tint ring-1 ring-brand" : "border-hair-2 hover:border-hair-3"
                )}
              >
                {f.id === "eposter" ? <Monitor className="size-4 text-brand" /> : <FileText className="size-4 text-brand" />}
                <span className="min-w-0">
                  <span className="block text-body font-bold text-ink">{f.label}</span>
                  <span className="block truncate text-caption text-ink-3">{f.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <SettledRow
          icon={<FileText className="size-4" />}
          label="Format"
          value={format ? `${format.label} · ${format.detail}` : null}
          source={congress ? `Set by ${congressLabel(congress)} · to change it, edit the congress rules` : undefined}
        />
      )}

      {/* ── Pages ── */}
      <SettledRow
        icon={<Files className="size-4" />}
        label="Pages"
        value={congress ? "1 page" : null}
        source={congress ? "A poster is one page" : undefined}
      />

      <PlanSectionContinue
        onClick={onContinue}
        disabled={!congress || !format}
        hint={!congress ? "Choose the congress first" : !format ? "Choose printed or ePoster" : undefined}
      />

      {modal && (
        <CongressRulesModal
          initialName={modal.mode === "add" ? modal.name : undefined}
          congress={modal.mode === "view" ? modal.congress : undefined}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            setModal(null);
            choose(saved);
          }}
        />
      )}
    </div>
  );
}

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="squircle-control grid size-8 shrink-0 place-items-center rounded-chip bg-[#edf3ef] text-brand">
      {children}
    </span>
  );
}

/** A value the congress decided: shown, not asked. Locked until there is a congress. */
function SettledRow({
  icon,
  label,
  value,
  source,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
  source?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[58px] items-center gap-3 rounded-control border border-hair bg-card px-3.5",
        !value && "opacity-60"
      )}
      aria-disabled={!value}
    >
      <RowIcon>{value ? icon : <Lock className="size-3.5" />}</RowIcon>
      <span className="min-w-0 flex-1 py-2">
        <span className="block text-label font-medium text-ink-3">{label}</span>
        <span className="mt-0.5 block truncate text-body-lg font-medium text-ink">
          {value ?? "Set when you choose the congress"}
        </span>
        {value && source && <span className="block truncate text-caption text-ink-3">{source}</span>}
      </span>
    </div>
  );
}

/** A congress to pick, previewing what it sets. */
function CongressOption({ congress, wide = false, onSelect }: { congress: Congress; wide?: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-control border border-hair-2 bg-card px-3 py-2.5 text-left transition-colors hover:border-brand hover:bg-tint/40",
        wide && "w-full"
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-bold text-ink">{congressLabel(congress)}</span>
        <span className="block truncate text-caption text-ink-3">
          {congress.formats.map((f) => (f.id === "eposter" ? "ePoster 16:9" : f.detail)).join(" or ")}
        </span>
      </span>
      {wide && <span className="shrink-0 text-label font-bold text-brand">Select</span>}
    </button>
  );
}

/* ───────────────────────── Add or review a congress's rules ───────────────────────── */

const READ_STEPS = [
  "Finding size and orientation",
  "Finding type sizes",
  "Finding branding and logo rules",
  "Finding disclosure and QR rules",
];
const READ_STEP_MS = 700;

function SourceChip({ source }: { source: RuleSource }) {
  const [label, tone] =
    source.kind === "doc"
      ? [source.page ? `From guidelines · p. ${source.page}` : "From guidelines", "border-ok-line bg-ok-bg text-ok"]
      : source.kind === "you"
        ? ["You added", "border-tint-line bg-tint text-brand-deep"]
        : ["Common default · check", "border-warn-line bg-warn-bg text-warn"];
  return (
    <span className={cn("shrink-0 rounded-chip border px-1.5 py-0.5 text-caption font-bold", tone)}>{label}</span>
  );
}

/**
 * Add a congress from its guidelines, or read and edit one's rules.
 *
 * Two ways in, and either is enough: the guidelines file, or the rules the
 * person already knows. What comes back is shown rule by rule with where it
 * came from, because a poster rejected at the congress for a 20 pt body is
 * a poster nobody checked — so the amber ones ask to be checked.
 */
export function CongressRulesModal({
  initialName,
  congress,
  onClose,
  onSaved,
}: {
  initialName?: string;
  /** Set to review an existing congress; otherwise this adds one. */
  congress?: Congress;
  onClose: () => void;
  onSaved: (congress: Congress) => void;
}) {
  const saveCongress = useCongressStore((s) => s.saveCongress);
  const [stage, setStage] = useState<"input" | "reading" | "review">(congress ? "review" : "input");
  const [name, setName] = useState(initialName ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<Congress | null>(congress ?? null);
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState<{ id: CongressRule["id"]; value: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canRead = name.trim().length > 0 && (Boolean(file) || notes.trim().length > 0);

  /* The reading plays step by step, then the rules it found. */
  useEffect(() => {
    if (stage !== "reading") return;
    const timers = READ_STEPS.map((_, i) => window.setTimeout(() => setStep(i + 1), (i + 1) * READ_STEP_MS));
    const done = window.setTimeout(() => {
      setDraft(readCongressGuidelines({ name, fileName: file?.name, notes }));
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

  const commitEdit = () => {
    if (!editing || !draft) return;
    const value = editing.value.trim();
    setDraft({
      ...draft,
      rules: draft.rules.map((r) => (r.id === editing.id && value ? { ...r, value, source: { kind: "you" } } : r)),
    });
    setEditing(null);
  };

  /* Format follows the size and orientation rules, so editing them is how a
     poster's format changes. */
  const save = () => {
    if (!draft) return;
    const orientation = /portrait/i.test(ruleOf(draft, "orientation")) ? "Portrait" : "Landscape";
    const formats = draft.formats.map((f) =>
      f.id === "print"
        ? { ...f, detail: `${orientation} · ${ruleOf(draft, "size")}`, shape: orientation === "Portrait" ? ("A4" as const) : ("16:9" as const) }
        : f
    );
    const saved = { ...draft, formats };
    saveCongress(saved);
    onSaved(saved);
  };

  const title = congress ? `${congressLabel(congress)} rules` : "Add congress guidelines";

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
          className="flex max-h-[86vh] w-full max-w-[620px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
        >
          <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
            <div>
              <h2 className="text-subhead font-[850] tracking-tight text-ink">{title}</h2>
              <p className="mt-0.5 text-label text-ink-3">
                {stage === "review"
                  ? "Check what SwishX read. Every rule says where it came from; edit any of them."
                  : "Upload the author guidelines, or type the rules you know. Either is enough."}
              </p>
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
                <Field
                  label="Congress name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="AAD Annual Meeting 2026"
                />
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
                  <Field
                    multiline
                    rows={5}
                    label="Or type what you know"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Portrait, A0. Body text 24 pt or more. No product names or company logos."
                  />
                </div>
              </>
            )}

            {stage === "reading" && (
              <div className="space-y-2.5 py-2" aria-live="polite">
                <p className="text-body font-bold text-ink">Reading {name.trim()} guidelines</p>
                {READ_STEPS.map((label, i) => (
                  <div
                    key={label}
                    className={cn("flex items-center gap-2 text-body", i < step ? "text-ink" : "text-ink-4")}
                  >
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

            {stage === "review" && draft && (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* The key, without a page: page 0 reads as the category. */}
                  <SourceChip source={{ kind: "doc", page: 0 }} />
                  <SourceChip source={{ kind: "you" }} />
                  <SourceChip source={{ kind: "default" }} />
                </div>
                <div className="divide-y divide-hair rounded-control border border-hair">
                  {draft.rules.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 px-3.5 py-2.5">
                      <span className="w-24 shrink-0 pt-0.5 text-label font-semibold text-ink-3">{r.label}</span>
                      {editing?.id === r.id ? (
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Field
                            size="sm"
                            autoFocus
                            value={editing.value}
                            onChange={(e) => setEditing({ id: r.id, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") {
                                e.stopPropagation();
                                setEditing(null);
                              }
                            }}
                          />
                          <Button size="sm" onClick={commitEdit}>
                            Done
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 text-body leading-snug text-ink">{r.value}</span>
                          <SourceChip source={r.source} />
                          <IconButton aria-label={`Edit ${r.label}`} size={7} onClick={() => setEditing({ id: r.id, value: r.value })}>
                            <Pencil className="size-3.5" />
                          </IconButton>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-label text-ink-3">
                  Accepts{" "}
                  {draft.formats
                    .map((f) => (f.id === "eposter" ? "an ePoster (16:9, single-page PDF)" : "a printed poster"))
                    .join(" or ")}
                  . The format follows the size and orientation above.
                </p>
              </>
            )}
          </div>

          {stage !== "reading" && (
            <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">
              <span className="text-label text-ink-3">
                {stage === "input"
                  ? canRead
                    ? "Ready to read"
                    : "Name the congress, then add guidelines or type what you know"
                  : congress
                    ? "Saved for everyone in this workspace"
                    : "Saved for everyone in this workspace once you save"}
              </span>
              {stage === "input" ? (
                <Button size="sm" disabled={!canRead} onClick={() => setStage("reading")}>
                  Read guidelines
                </Button>
              ) : (
                <Button size="sm" disabled={Boolean(editing)} onClick={save}>
                  {congress ? "Save changes" : "Save congress"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
