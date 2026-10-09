"use client";

import { useRef, useState, type ReactNode } from "react";
import { BadgeCheck, Clock, FileText, Lock, Monitor, Plus, Presentation, ShieldAlert, Tag } from "lucide-react";
import { PickChip, PickEmpty, PickList, PickRow, PickSearch } from "@/components/patterns/pick-list";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { PERSONA } from "@/features/workspace/mock-personas";
import { CongressRulesModal } from "@/features/workspace/congress-rules-editor";
import {
  MORE_CONGRESSES,
  SUGGESTED_CONGRESS_IDS,
  congressLabel,
  deliverablesFor,
  formatSize,
  isUsable,
  keyRules,
  pageShapeFor,
  recordingNote,
  searchCongresses,
  sizeChoices,
  typeDetail,
  useCongressStore,
  verificationEta,
  type Congress,
  type PresentationType,
} from "@/features/workspace/congress-guidelines";

type PosterType = PresentationType["id"];

/** The chosen congress, type and size, resolved from the stores. */
export function useChosenCongress() {
  const congresses = useCongressStore((s) => s.congresses);
  const congressId = useWorkspaceStore((s) => s.congressId);
  const posterType = useWorkspaceStore((s) => s.posterType);
  const sizeIndex = useWorkspaceStore((s) => s.posterSizeIndex);
  const congress = congresses.find((c) => c.id === congressId);
  return { congress, posterType, sizeIndex };
}

/** What still stands between this poster and a plan, if anything. */
export function posterMissing(congress: Congress | undefined, type: PosterType | null, sizeIndex: number | null) {
  if (!congress) return "congress" as const;
  if (!type) return "type" as const;
  if (sizeChoices(congress, type).length > 1 && sizeIndex == null) return "size" as const;
  return null;
}

export function congressSummary(congress: Congress | undefined, type: PosterType | null, sizeIndex: number | null) {
  const missing = posterMissing(congress, type, sizeIndex);
  if (!congress) return "Choose the congress first";
  if (missing === "type") return `${congressLabel(congress)} · choose the presentation type`;
  if (missing === "size") return `${congressLabel(congress)} · choose the poster size`;
  const typeLabel = congress.presentationTypes.find((t) => t.id === type)?.label ?? "Printed poster";
  const sizes = sizeChoices(congress, type);
  const size = sizes[sizeIndex ?? 0];
  return [congressLabel(congress), typeLabel, size ? formatSize(size) : "16:9 PDF"].join(" · ");
}

/** What the congress means for the brand, where it changes another section. */
export function congressBrandingNotes(congress: Congress | undefined) {
  if (!congress) return { noLogo: null as string | null, genericNames: null as string | null };
  const r = congress.rules;
  const noLogo =
    r.logos.value === "none" || r.logos.value === "nonprofit" || r.brandLook.value === "not-allowed"
      ? `${congress.acronym} doesn't allow company or product logos${r.brandLook.value === "not-allowed" ? " or a brand look" : ""}. The poster carries no brand mark and doesn't use the product brand kit.`
      : null;
  const genericNames =
    r.drugNames.value === "generic"
      ? `${congress.acronym} allows generic drug names only. SwishX writes generic names on the poster, not brand names from the dossier.`
      : r.drugNames.value === "generic-brand-brackets"
        ? `${congress.acronym} wants generic names, with the brand in brackets only on first use. SwishX writes it that way.`
        : null;
  return { noLogo, genericNames };
}

/**
 * Congress, format and pages — the poster's version of Format & pages.
 *
 * One decision, the congress, and the presentation type where it offers more
 * than one. What has to be delivered, at what size, and what must be printed
 * on it follow from those: shown, not asked, except where the congress itself
 * allows a choice of size.
 */
export function CongressSectionContent({ onContinue }: { onContinue: () => void }) {
  const congresses = useCongressStore((s) => s.congresses);
  const setCongress = useWorkspaceStore((s) => s.setCongress);
  const setPosterType = useWorkspaceStore((s) => s.setPosterType);
  const setPosterSizeIndex = useWorkspaceStore((s) => s.setPosterSizeIndex);
  const setPosterField = useWorkspaceStore((s) => s.setPosterField);
  const posterFields = useWorkspaceStore((s) => s.posterFields);
  const setPageShape = useWorkspaceStore((s) => s.setPageShape);
  const setInfographicPages = useWorkspaceStore((s) => s.setInfographicPages);
  const { congress, posterType, sizeIndex } = useChosenCongress();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ mode: "add"; name: string } | { mode: "view"; congress: Congress } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* A poster is one page, in the shape its size or ePoster sets. */
  const applyShape = (c: Congress, type: PosterType | null, index: number | null) => {
    setInfographicPages("1");
    setPageShape(pageShapeFor(c, type, index));
  };

  const choose = (next: Congress) => {
    /* Only verified guidelines can be used; pending rows can't be picked, and this holds the line. */
    if (!isUsable(next)) return;
    const type = next.presentationTypes.length === 1 ? next.presentationTypes[0].id : null;
    const index = sizeChoices(next, type).length > 1 ? null : 0;
    setCongress(next.id, type, index);
    applyShape(next, type, index);
    /* A congress that bans logos means the poster carries none. */
    if (congressBrandingNotes(next).noLogo) useWorkspaceStore.getState().setLogoMark({ position: "none" });
    setQuery("");
  };

  const chooseType = (type: PosterType) => {
    if (!congress) return;
    setPosterType(type);
    const many = sizeChoices(congress, type).length > 1;
    const index = many ? sizeIndex : 0;
    if (!many) setPosterSizeIndex(0);
    applyShape(congress, type, index);
  };

  const chooseSize = (index: number) => {
    if (!congress) return;
    setPosterSizeIndex(index);
    applyShape(congress, posterType, index);
  };

  const suggested = SUGGESTED_CONGRESS_IDS.map((id) => congresses.find((c) => c.id === id)).filter(
    (c): c is Congress => Boolean(c)
  );
  const results = searchCongresses(congresses, query);
  /* What this workspace sent, so whoever added it can see it is on its way. */
  const waiting = congresses.filter((c) => c.origin === "team" && !isUsable(c));
  const missing = posterMissing(congress, posterType, sizeIndex);
  const delivery = congress && posterType ? deliverablesFor(congress, posterType) : null;
  const sizes = congress && posterType ? sizeChoices(congress, posterType) : [];
  const typeInfo = congress?.presentationTypes.find((t) => t.id === posterType);
  const required = congress?.rules.requiredItems.value ?? [];
  const chips = congress ? keyRules(congress) : [];

  return (
    <div className="space-y-2.5">
      {/* ── Congress ── */}
      <div className="space-y-2">
        <RowLabel>Congress</RowLabel>
        {congress ? (
          <div className="space-y-2 rounded-control border border-hair-3 bg-card px-3.5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <RowIcon>
                <Presentation className="size-4" />
              </RowIcon>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-body-lg font-bold text-ink">{congressLabel(congress)}</span>
                  <StatusBadge congress={congress} />
                  {congress.pendingRevision && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-chip border border-warn-line bg-warn-bg px-1.5 py-0.5 text-caption font-bold text-warn">
                      <Clock className="size-3" />
                      Correction pending
                    </span>
                  )}
                </span>
                <span className="block truncate text-label text-ink-3">
                  {[congress.city, congress.therapyAreas.join(", ")].filter(Boolean).join(" · ") || "Added by your team"}
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
                    setCongress(null, null, null);
                    requestAnimationFrame(() => searchRef.current?.focus());
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:pl-11">
                {chips.map((rule) => (
                  <span key={rule} className="rounded-chip border border-hair-2 bg-subtle px-2 py-0.5 text-caption font-bold text-ink-2">
                    {rule}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <PickSearch
              ref={searchRef}
              value={query}
              onChange={setQuery}
              placeholder="Search congress by name, acronym, city or therapy area (e.g. ESMO, ASCO, lung)..."
              label="Search a congress"
            />
            {!query.trim() ? (
              /* Two to start from, and a row saying the rest are a search away. */
              <PickList>
                {suggested.map((c) => (
                  <CongressRow key={c.id} congress={c} onSelect={() => choose(c)} />
                ))}
                <button
                  type="button"
                  onClick={() => searchRef.current?.focus()}
                  className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-subtle"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-chip border border-dashed border-hair-3 text-label font-extrabold text-ink-2">
                    +{MORE_CONGRESSES}
                  </span>
                  <span className="text-label text-ink-3">More congresses · search to find yours</span>
                </button>
              </PickList>
            ) : (
              <PickList>
                {results.map((c) => (
                  <CongressRow key={c.id} congress={c} onSelect={() => choose(c)} />
                ))}
                {results.length === 0 && (
                  /* Not listed is not a dead end: the search becomes its name. */
                  <PickEmpty title={<>No guidelines for &quot;{query.trim()}&quot; yet</>}>
                    <p>Upload its author guidelines, or type the rules you know. Your team can pick it next time.</p>
                    <Button size="sm" className="mt-3 gap-1.5" onClick={() => setModal({ mode: "add", name: query.trim() })}>
                      <Plus className="size-3.5" />
                      Add congress guidelines
                    </Button>
                  </PickEmpty>
                )}
              </PickList>
            )}
            {waiting.length > 0 && (
              <div className="space-y-1.5 rounded-control border border-warn-line bg-warn-bg/50 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-label font-bold text-warn">
                  <Clock className="size-3.5" />
                  Waiting for SwishX to verify · only verified guidelines can be used
                </span>
                {waiting.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setModal({ mode: "view", congress: c })}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
                  >
                    <span className="truncate text-body font-bold text-ink">{congressLabel(c)}</span>
                    <span className="shrink-0 text-caption text-ink-3">{verificationEta(c.submittedAt)}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Presentation type: chosen where the congress offers more than one ── */}
      {congress && congress.presentationTypes.length > 1 ? (
        <div className="space-y-2 rounded-control border border-hair-3 bg-card px-3.5 py-3">
          <RowLabel>How are you presenting at {congress.acronym}? · choose one</RowLabel>
          <div className="grid gap-2" role="radiogroup" aria-label={`How are you presenting at ${congress.acronym}?`}>
            {congress.presentationTypes.map((t) => {
              const { bracket, line } = typeDetail(congress, t);
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={posterType === t.id}
                  onClick={() => chooseType(t.id)}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-control border px-3 py-2.5 text-left transition-colors",
                    posterType === t.id ? "border-brand bg-tint ring-1 ring-brand" : "border-hair-2 hover:border-hair-3"
                  )}
                >
                  {t.digitalOnly ? (
                    <Monitor className="mt-0.5 size-4 shrink-0 text-brand" />
                  ) : (
                    <FileText className="mt-0.5 size-4 shrink-0 text-brand" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-body font-bold text-ink">
                      {t.label}
                      {bracket && <span className="font-medium text-ink-3"> ({bracket})</span>}
                    </span>
                    <span className="block text-label text-ink-3">{line}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {typeInfo?.note && <Warning>{typeInfo.note}</Warning>}
        </div>
      ) : (
        <SettledRow
          icon={<Tag className="size-4" />}
          label="Presentation type"
          value={
            congress && typeInfo
              ? `${typeInfo.label}${typeDetail(congress, typeInfo).bracket ? ` (${typeDetail(congress, typeInfo).bracket})` : ""}`
              : null
          }
          source={congress && typeInfo ? `${typeDetail(congress, typeInfo).line} The only type ${congress.acronym} offers.` : undefined}
        />
      )}

      {/* ── What you deliver: set by the congress, a size chosen only where it allows several ── */}
      {congress && posterType && delivery ? (
        <div className="space-y-2.5 rounded-control border border-hair bg-card px-3.5 py-3">
          <RowLabel>What you deliver · set by {congress.acronym}</RowLabel>
          {delivery.print && (
            <div className="flex items-start gap-2.5">
              <FileText className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <span className="block text-body font-bold text-ink">
                  Printed poster{delivery.print.required ? "" : " · optional"} · 1 page
                </span>
                {sizes.length > 1 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {sizes.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={sizeIndex === i}
                        onClick={() => chooseSize(i)}
                        className={cn(
                          "cursor-pointer rounded-control border px-2.5 py-1.5 text-label font-bold transition-colors",
                          sizeIndex === i
                            ? "border-brand bg-tint text-brand-deep ring-1 ring-brand"
                            : "border-hair-2 text-ink-2 hover:border-hair-3"
                        )}
                      >
                        {formatSize(s)}
                      </button>
                    ))}
                    <span className="text-caption text-ink-3">{congress.acronym} accepts these sizes. Choose one.</span>
                  </div>
                ) : (
                  <span className="block text-label text-ink-3">
                    {sizes[0] ? formatSize(sizes[0]) : "Size not stated · check the guidelines"}
                  </span>
                )}
              </div>
            </div>
          )}
          {delivery.digital && (
            <div className="flex items-start gap-2.5">
              <Monitor className="mt-0.5 size-4 shrink-0 text-brand" />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-bold text-ink">
                  {delivery.print ? "Digital copy for the online gallery" : "Digital poster"}
                  {delivery.digital.required ? "" : " · optional"} ·{" "}
                  {delivery.digital.maxPages && delivery.digital.maxPages > 1
                    ? `up to ${delivery.digital.maxPages} pages or slides`
                    : "1 page"}
                </span>
                <span className="block text-label text-ink-3">
                  {[
                    delivery.digital.fileTypes.join(" / "),
                    delivery.digital.aspect,
                    !delivery.print && sizes[0] ? formatSize(sizes[0]) : null,
                    delivery.digital.maxMB ? `up to ${delivery.digital.maxMB} MB` : null,
                    delivery.digital.minDpi ? `${delivery.digital.minDpi} dpi or more` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </div>
          )}
          {delivery.digital && recordingNote(congress) && (
            /* Not part of the poster, but part of what is due: said here so
               nobody finds out at upload. */
            <p className="pl-6.5 text-caption text-ink-3">{recordingNote(congress)}</p>
          )}
        </div>
      ) : (
        <SettledRow
          icon={<FileText className="size-4" />}
          label="What you deliver"
          value={congress && posterType && !delivery ? "Not stated · check the congress rules" : null}
          lockedText={congress ? "Set when you choose the presentation type" : undefined}
        />
      )}

      {/* ── Required on the poster: never blocks; the check flags anything missing later ── */}
      {congress && required.length > 0 && (
        <div className="space-y-2 rounded-control border border-hair bg-card px-3.5 py-3">
          <RowLabel>Required on the poster · add now or later</RowLabel>
          {required.map((item) => (
            <div key={item.id} className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <span className="min-w-0">
                <span className="block truncate text-body font-bold text-ink">{item.label}</span>
                <span className="block truncate text-caption text-ink-3">
                  {item.placement}
                  {item.issuedBy === "congress" ? ` · issued by ${congress.acronym}` : ""}
                </span>
              </span>
              <Field
                size="sm"
                aria-label={item.label}
                value={posterFields[item.id] ?? (/email/i.test(item.label) ? PERSONA.email : "")}
                placeholder={item.issuedBy === "congress" ? "Add when you have it" : "Add later"}
                onChange={(e) => setPosterField(item.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <PlanSectionContinue
        onClick={onContinue}
        disabled={Boolean(missing)}
        hint={
          missing === "congress"
            ? "Choose the congress first"
            : missing === "type"
              ? "Choose the presentation type"
              : missing === "size"
                ? "Choose the poster size"
                : undefined
        }
      />

      {modal && (
        <CongressRulesModal
          initialName={modal.mode === "add" ? modal.name : undefined}
          congress={modal.mode === "view" ? modal.congress : undefined}
          onClose={() => setModal(null)}
          /* Sent for verification: nothing to choose yet. The window says so,
             and the congress waits in the list until SwishX verifies it. */
          onSaved={() => setQuery("")}
          onUseExisting={(existing) => {
            setModal(null);
            choose(existing);
          }}
        />
      )}
    </div>
  );
}

function RowLabel({ children }: { children: ReactNode }) {
  return <span className="block text-label font-medium text-ink-3">{children}</span>;
}

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span className="squircle-control grid size-8 shrink-0 place-items-center rounded-chip bg-[#edf3ef] text-brand">
      {children}
    </span>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 rounded-control border border-warn-line bg-warn-bg px-2.5 py-1.5 text-label text-warn">
      <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
      {children}
    </p>
  );
}

function StatusBadge({ congress }: { congress: Congress }) {
  const [label, icon, tone] = isUsable(congress)
    ? ["Verified", <BadgeCheck key="i" className="size-3" />, "border-ok-line bg-ok-bg text-ok"]
    : ["Verification pending", <Clock key="i" className="size-3" />, "border-warn-line bg-warn-bg text-warn"];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-chip border px-1.5 py-0.5 text-caption font-bold", tone)}>
      {icon}
      {label}
    </span>
  );
}

/** A value the congress decided: shown, not asked. Locked until there is one. */
function SettledRow({
  icon,
  label,
  value,
  source,
  lockedText = "Set when you choose the congress",
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
  source?: string;
  lockedText?: string;
}) {
  return (
    <div
      className={cn("flex min-h-[58px] items-center gap-3 rounded-control border border-hair bg-card px-3.5", !value && "opacity-60")}
      aria-disabled={!value}
    >
      <RowIcon>{value ? icon : <Lock className="size-3.5" />}</RowIcon>
      <span className="min-w-0 flex-1 py-2">
        <span className="block text-label font-medium text-ink-3">{label}</span>
        <span className="mt-0.5 block truncate text-body-lg font-medium text-ink">{value ?? lockedText}</span>
        {value && source && <span className="block truncate text-caption text-ink-3">{source}</span>}
      </span>
    </div>
  );
}

/** A congress to pick, previewing what it sets — the same row as the brand search. */
function CongressRow({ congress, onSelect }: { congress: Congress; onSelect: () => void }) {
  const sizes = congress.rules.sizes.value ?? [];
  const delivery = congress.rules.deliverables.value;
  const detail = [
    congress.city,
    sizes[0] ? formatSize(sizes[0]) + (sizes.length > 1 ? ` (+${sizes.length - 1} more)` : "") : null,
    delivery && !delivery.print ? "Digital poster only" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const usable = isUsable(congress);
  return (
    <PickRow
      onSelect={onSelect}
      disabled={!usable}
      thumb={
        <span className="grid size-10 shrink-0 place-items-center rounded-chip border border-hair-2 bg-tint px-0.5 text-center text-micro font-extrabold leading-tight text-brand-deep">
          {congress.acronym.split(" ")[0].slice(0, 5)}
        </span>
      }
      title={congressLabel(congress)}
      detail={usable ? detail || "Size not stated" : `Only verified guidelines can be used · ${verificationEta(congress.submittedAt)}`}
      chip={
        usable ? (
          <PickChip tone="ok">Verified</PickChip>
        ) : (
          <PickChip tone="warn">Verification pending</PickChip>
        )
      }
    />
  );
}
