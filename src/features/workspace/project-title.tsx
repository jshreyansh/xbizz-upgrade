"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, EllipsisVertical, Globe, Lock, Pencil, Search, Users, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useSettingsStore } from "@/features/settings/settings-store";
import {
  useProjectSharing, useSharingStore, visibilityLabel, type Visibility,
} from "@/features/workspace/project-sharing";
import { cn } from "@/lib/cn";

/**
 * The project's name in the studio header, at every stage of both flows.
 *
 * Click it to rename. Next to it, who can see the draft; clicking that opens
 * the same sharing dialog as the ⋮ menu. Only the owner changes either.
 */

type Kind = "video" | "document" | "ad";

export function ProjectTitle({
  kind, fallback, className, published,
}: {
  kind: Kind;
  /** The generated name, shown until someone renames the project. */
  fallback: string;
  className?: string;
  /** Published work is visible to the whole workspace, so there is no draft sharing to show. */
  published?: boolean;
}) {
  const { title, sharing, isOwner, rename } = useProjectSharing(kind, fallback);
  const renaming = useSharingStore((s) => s.renaming);
  const setRenaming = useSharingStore((s) => s.setRenaming);
  const [shareOpen, setShareOpen] = useState(false);
  const VisIcon = sharing.visibility.kind === "private" ? Lock : sharing.visibility.kind === "workspace" ? Globe : Users;

  return (
    <span className="flex min-w-0 items-center gap-2">
      {published ? (
        /* The published preview shows the name; renaming happens in the flow. */
        <span className={cn("truncate text-ink", className)}>{title}</span>
      ) : renaming && isOwner ? (
        <RenameInput
          initial={title}
          className={className}
          onDone={(next) => { if (next !== null) rename(next); setRenaming(false); }}
        />
      ) : (
        <button
          type="button"
          onClick={() => isOwner && setRenaming(true)}
          disabled={!isOwner}
          title={isOwner ? "Rename project" : title}
          className={cn(
            "group -mx-1.5 flex min-w-0 items-center gap-1.5 rounded-chip px-1.5 py-0.5 text-left text-ink transition-colors",
            isOwner && "cursor-text hover:bg-subtle"
          )}
        >
          <span className={cn("truncate", className)}>{title}</span>
          {isOwner && <Pencil aria-hidden className="size-3 shrink-0 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100" />}
        </button>
      )}

      {!published && (
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          title="Who can see this draft"
          className="focus-ring hidden shrink-0 cursor-pointer items-center gap-1 rounded-chip border border-hair-2 bg-card px-2 py-0.5 text-caption font-bold text-ink-3 transition-colors hover:border-brand hover:text-ink sm:inline-flex"
        >
          <VisIcon className="size-3" />
          {visibilityLabel(sharing.visibility)}
        </button>
      )}

      {shareOpen && <ShareDraftModal kind={kind} fallback={fallback} open onClose={() => setShareOpen(false)} />}
    </span>
  );
}

/** Mounted when renaming starts, so it always opens on the current name. Escape gives null. */
function RenameInput({ initial, className, onDone }: { initial: string; className?: string; onDone: (next: string | null) => void }) {
  const [draft, setDraft] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      value={draft}
      aria-label="Project name"
      maxLength={80}
      size={Math.max(12, draft.length + 1)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onDone(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onDone(draft);
        if (e.key === "Escape") onDone(null);
      }}
      className={cn(
        "min-w-0 max-w-[22rem] rounded-chip border border-brand bg-card px-1.5 py-0.5 text-ink outline-none ring-2 ring-brand/20",
        className
      )}
    />
  );
}

/** The project ⋮: rename and sharing for everyone, then the dev tools under their own divider. */
export function ProjectMenu({
  kind, fallback, published, dev,
}: {
  kind: Kind;
  fallback: string;
  published?: boolean;
  /** Dev-only rows; given a close function. */
  dev?: (close: () => void) => ReactNode;
}) {
  const { isOwner, sharing } = useProjectSharing(kind, fallback);
  const members = useSettingsStore((s) => s.members);
  const setRenaming = useSharingStore((s) => s.setRenaming);
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const ownerName = members.find((m) => m.id === sharing.ownerId)?.name ?? "the owner";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* Nothing to rename, share or check: no menu, rather than a menu of disabled rows. */
  if (!isOwner && !dev) return null;

  const item = "flex w-full cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-body-lg font-semibold text-ink-2 transition-colors hover:bg-subtle hover:text-ink disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Project options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "focus-ring grid size-8 cursor-pointer place-items-center rounded-chip text-ink-3 transition hover:bg-black/5 hover:text-ink",
          open && "bg-black/5 text-ink"
        )}
      >
        <EllipsisVertical className="size-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-10 z-50 w-64 rounded-panel border border-hair-2 bg-card p-1.5 shadow-float">
          <button type="button" role="menuitem" disabled={!isOwner} className={item} onClick={() => { setOpen(false); setRenaming(true); }}>
            <Pencil className="size-4 text-ink-3" /> Rename
          </button>
          {!published && (
            <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); setShareOpen(true); }}>
              <Users className="size-4 text-ink-3" />
              <span className="flex-1">Who can see this</span>
              <span className="text-caption font-bold text-ink-4">{visibilityLabel(sharing.visibility)}</span>
            </button>
          )}
          {!isOwner && (
            <p className="px-2.5 pb-1 pt-0.5 text-caption leading-snug text-ink-4">Only {ownerName} can rename or change sharing.</p>
          )}
          {dev && (
            <>
              <div className="mx-1 my-1 border-t border-hair" />
              {dev(() => setOpen(false))}
            </>
          )}
        </div>
      )}
      {shareOpen && <ShareDraftModal kind={kind} fallback={fallback} open onClose={() => setShareOpen(false)} />}
    </div>
  );
}

/** Private / the workspace / specific people. View and comment only, for now. Mount per opening. */
export function ShareDraftModal({
  kind, fallback, open, onClose,
}: {
  kind: Kind;
  fallback: string;
  open: boolean;
  onClose: () => void;
}) {
  const { title, sharing, isOwner, setVisibility } = useProjectSharing(kind, fallback);
  const members = useSettingsStore((s) => s.members);
  const workspaceName = useSettingsStore((s) => s.workspaceName);
  const [choice, setChoice] = useState<Visibility["kind"]>(sharing.visibility.kind);
  const [people, setPeople] = useState<string[]>(sharing.visibility.kind === "people" ? sharing.visibility.ids : []);
  const [query, setQuery] = useState("");

  const others = members.filter((m) => m.status === "active" && m.id !== sharing.ownerId);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return others.filter((m) => !people.includes(m.id) && (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)));
  }, [others, people, query]);
  const owner = members.find((m) => m.id === sharing.ownerId);
  const invalid = choice === "people" && people.length === 0;

  const save = () => {
    setVisibility(choice === "people" ? { kind: "people", ids: people } : { kind: choice });
    onClose();
  };

  const options: { id: Visibility["kind"]; Icon: typeof Lock; label: string; hint: string }[] = [
    { id: "private", Icon: Lock, label: "Only me", hint: "Private. Admins can't see it either." },
    { id: "workspace", Icon: Globe, label: `Everyone in ${workspaceName}`, hint: "Each person opens it within their own permissions." },
    { id: "people", Icon: Users, label: "Specific people", hint: "Only the people you pick." },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Who can see this draft"
      description={title}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          {isOwner && <Button size="sm" onClick={save} disabled={invalid}>Save</Button>}
        </div>
      }
    >
      <div className="grid gap-2" role="radiogroup" aria-label="Visibility">
        {options.map(({ id, Icon, label, hint }) => {
          const active = choice === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!isOwner}
              onClick={() => setChoice(id)}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-control border px-3 py-2.5 text-left transition-colors disabled:cursor-default",
                active ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-ink-4"
              )}
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", active ? "text-brand" : "text-ink-3")} />
              <span className="grid min-w-0 flex-1 gap-0.5">
                <Text size="body" weight="bold">{label}</Text>
                <Text size="caption" tone="muted">{hint}</Text>
              </span>
              {active && <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      {choice === "people" && (
        <div className="mt-3 grid gap-2">
          {people.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {people.map((id) => {
                const m = members.find((x) => x.id === id);
                return (
                  <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-chip bg-subtle py-0.5 pl-2 pr-1 text-label font-bold text-ink">
                    <span className="truncate">{m?.name ?? id}</span>
                    {isOwner && (
                      <button type="button" aria-label={`Remove ${m?.name ?? id}`} onClick={() => setPeople((p) => p.filter((x) => x !== id))} className="grid size-4 cursor-pointer place-items-center rounded-full text-ink-3 hover:bg-hair hover:text-ink">
                        <X className="size-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}
          {isOwner && (
            <>
              <label className="relative block">
                <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-4" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Add people by name, email or role"
                  aria-label="Find people"
                  className="w-full rounded-control border border-hair-2 bg-card py-2 pl-8 pr-3 text-body text-ink focus:border-brand focus:outline-none"
                />
              </label>
              <div className="max-h-44 overflow-y-auto rounded-control border border-hair">
                {matches.length === 0 ? (
                  <Text size="caption" tone="muted" className="block px-3 py-2.5">No one else matches.</Text>
                ) : (
                  matches.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setPeople((p) => [...p, m.id]); setQuery(""); }}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-hair px-3 py-2 text-left last:border-b-0 hover:bg-subtle"
                    >
                      <span className="min-w-0 truncate text-body font-semibold text-ink">{m.name}</span>
                      <span className="shrink-0 text-caption text-ink-4">{m.role}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      <Text size="caption" tone="muted" className="mt-3 block">
        {isOwner
          ? "People you share with can view and comment. Editing together comes later. Once published, everyone in the workspace can see it."
          : `Only ${owner?.name ?? "the owner"} can change who sees this.`}
      </Text>
    </Modal>
  );
}
