"use client";

import { PageHeading } from "@/components/patterns/page-heading";
import { useMemo, useState } from "react";
import { Search, Grid3x3, List, Film, Image as ImageIcon, MessageSquare, Play, Lock, Globe, Users } from "lucide-react";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { DataList } from "@/components/patterns/data-list";
import { LibraryTile, TileOpen } from "@/components/patterns/library-tile";
import { LIBRARY_ASSETS, type LibraryAsset } from "@/features/content-library/content-library-data";
import { useWorkspaceReviewItems } from "@/features/review/review-store";
import { SEED_WORKSPACE_ID, useSettingsStore } from "@/features/settings/settings-store";
import { canSeeDraft, sharedWith, useSharingStore, visibilityLabel } from "@/features/workspace/project-sharing";
import { useOpenPublishedAsset } from "@/features/content-library/use-open-published-asset";
import { AssetVideo } from "@/features/workspace/asset-video";

/**
 * Published work, and the way back into it.
 *
 * Built to read like the Product Library because it is the same kind of
 * screen — a shelf of things you own — and two shelves that look different
 * teach the same person two layouts for one idea. No stat tiles and no create
 * button: nothing is authored here, and a count of assets is not a decision.
 *
 * Opening a row does not show a picture of the asset. It rebuilds that
 * project's real state from the brief it was made with and lands on its shared
 * review — the same screen the link in the email opens.
 */

const STATUS_STYLE: Record<LibraryAsset["status"], { bg: string; fg: string; line: string }> = {
  Draft: { bg: "var(--color-subtle)", fg: "var(--ink-3)", line: "var(--hair-2)" },
  Published: { bg: "var(--ok-bg)", fg: "var(--ok)", line: "var(--ok-line)" },
  Approved: { bg: "var(--tint-2)", fg: "var(--brand-deep)", line: "var(--tint-line)" },
  "In MLR review": { bg: "#fff4e5", fg: "#b45309", line: "#fcd9a4" },
  "Changes requested": { bg: "var(--warn-bg)", fg: "var(--warn)", line: "var(--warn-line)" },
};

type KindFilter = "all" | "video" | "infographic";
export type StageFilter = "all" | "draft" | "shared" | "published" | "archived";

export function ContentLibraryScreen({ initialStage = "all" }: { initialStage?: StageFilter }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [kind, setKind] = useState<KindFilter>("all");
  /* Where a thing is in its life, which the review status does not answer:
     a draft can be in MLR, and an archived asset was published once. */
  const [stage, setStage] = useState<StageFilter>(initialStage);

  const openReview = useOpenPublishedAsset();

  /* A sample's status follows its review: approving or sending it back in MLR Review shows here. */
  const reviews = useWorkspaceReviewItems();
  /* A draft is private to its owner unless shared, and Admin doesn't override that. */
  const me = useSettingsStore((st) => st.currentUserId);
  const members = useSettingsStore((st) => st.members);
  const sharing = useSharingStore((st) => st.projects);
  /* Content belongs to its workspace; a new one starts empty. */
  const workspaceId = useSettingsStore((st) => st.workspaceId);
  const workspaceName = useSettingsStore((st) => st.workspaceName);
  const assets = useMemo(
    () =>
      (workspaceId === SEED_WORKSPACE_ID ? LIBRARY_ASSETS : []).filter((a) => a.stage !== "draft" || canSeeDraft(sharing[`lib:${a.id}`], me)).map((a) => {
        const r = reviews.find((i) => i.libraryId === a.id);
        if (!r) return a;
        const status: LibraryAsset["status"] =
          r.status === "approved" ? "Approved" : r.status === "changes" ? "Changes requested" : "In MLR review";
        return { ...a, status };
      }),
    [reviews, sharing, me, workspaceId]
  );
  const draftSharing = (a: LibraryAsset) => (a.stage === "draft" ? sharing[`lib:${a.id}`] : undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      if (stage === "shared") {
        if (a.stage !== "draft" || !sharedWith(sharing[`lib:${a.id}`], me)) return false;
      } else if (stage !== "all" && a.stage !== stage) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.brand.toLowerCase().includes(q) ||
        a.audience.toLowerCase().includes(q)
      );
    });
  }, [assets, query, kind, stage, sharing, me]);

  return (
    <div className="page-enter space-y-6">
      <PageHeading
        title="All Content"
        description="Everything published in this workspace, with the comments your reviewers left on it, plus your drafts and drafts shared with you."
      />

      {/* Search, kind filter, view toggle */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 420 }}>
          <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, brands or audiences…"
            style={{ width: "100%", padding: "10px 13px 10px 36px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, color: "var(--ink)", background: "#fff" }}
          />
        </div>

        <Segmented>
          {([
            { id: "all" as const, label: "All" },
            { id: "video" as const, label: "Video" },
            { id: "infographic" as const, label: "Doc & image" },
          ]).map((opt) => (
            <SegmentedButton key={opt.id} active={kind === opt.id} onClick={() => setKind(opt.id)}>
              {opt.label}
            </SegmentedButton>
          ))}
        </Segmented>

        <Segmented>
          {([
            { id: "all" as const, label: "All" },
            { id: "draft" as const, label: "Drafts" },
            { id: "shared" as const, label: "Shared with me" },
            { id: "published" as const, label: "Published" },
            { id: "archived" as const, label: "Archived" },
          ]).map((opt) => (
            <SegmentedButton key={opt.id} active={stage === opt.id} onClick={() => setStage(opt.id)}>
              {opt.label}
            </SegmentedButton>
          ))}
        </Segmented>

        <Segmented>
          {([
            { id: "grid" as const, Icon: Grid3x3, label: "Grid view" },
            { id: "list" as const, Icon: List, label: "List view" },
          ]).map(({ id, Icon, label }) => (
            <SegmentedButton
              key={id}
              active={view === id}
              onClick={() => setView(id)}
              aria-label={label}
              className="w-8 px-0"
            >
              <Icon size={15} />
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      {view === "grid" ? (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        {filtered.map((a, i) => {
          const status = STATUS_STYLE[a.status];
          const KindIcon = a.kind === "video" ? Film : ImageIcon;
          return (
            <LibraryTile
              key={a.id}
              delayMs={80 + i * 45}
              onClick={() => openReview(a)}
              media={
                /* The asset itself, not a coloured rectangle standing in for
                   it. A film plays its own reel and a deck shows the figure it
                   leads on — the only thing that tells two of these apart at a
                   glance. */
                <div className="relative h-[168px] w-full overflow-hidden" style={{ background: a.gradient }}>
                  {a.videoSrc && <AssetVideo src={a.videoSrc} />}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute rounded-full"
                    style={{ width: "70%", height: "70%", right: "-10%", top: "-10%", background: "radial-gradient(circle,rgba(255,255,255,.22),transparent 70%)" }}
                  />
                  {!a.videoSrc && a.metric && (
                    <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end p-3.5">
                      <span className="text-micro font-extrabold uppercase tracking-[.06em] text-white/60">
                        {a.badge}
                      </span>
                      <span className="mt-0.5 text-subhead font-black leading-tight tracking-tight text-white">
                        {a.metric}
                      </span>
                      <span className="mt-0.5 text-caption text-white/65">{a.metricLabel}</span>
                    </div>
                  )}
                </div>
              }
              mediaTopLeft={
                <span className="inline-flex items-center gap-1.5 rounded-chip bg-black/40 px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.04em] text-white/90 backdrop-blur-sm">
                  <KindIcon size={10} />
                  {a.kind === "video" ? "Video" : "Doc / image"}
                </span>
              }
              mediaTopRight={
                <span className="rounded-chip bg-white/90 px-2 py-0.5 text-micro font-extrabold text-ink">
                  {a.spec}
                </span>
              }
              mediaHover={
                a.videoSrc ? (
                  <span className="inline-flex items-center gap-1.5 rounded-chip bg-brand px-3 py-1.5 text-label font-bold text-white shadow-md">
                    <Play size={13} fill="currentColor" /> Preview
                  </span>
                ) : undefined
              }
              title={a.title}
              subtitle={`${a.brand} · ${a.audience}`}
              chips={
                <>
                  <span
                    className="rounded-chip px-2 py-0.5 text-caption font-bold"
                    style={{ background: status.bg, color: status.fg, border: `1px solid ${status.line}` }}
                  >
                    {a.status}
                  </span>
                  <DraftVisibility entry={draftSharing(a)} me={me} ownerName={members.find((m) => m.id === a.ownerId)?.name} />
                  {a.comments > 0 && (
                    <span className="inline-flex items-center gap-1 text-caption font-bold text-brand">
                      <MessageSquare size={12} /> {a.comments}
                    </span>
                  )}
                </>
              }
              footerLeft={a.updated}
              footerRight={<TileOpen label="Open review" />}
            />
          );
        })}
      </div>
      ) : (
        <DataList
          rows={filtered}
          rowKey={(a) => a.id}
          onRowClick={openReview}
          emptyLabel={`No assets match “${query}”.`}
          columns={[
            {
              id: "asset",
              header: "Asset",
              minWidth: 280,
              cell: (a) => (
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="relative grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-chip"
                    style={{ background: a.gradient }}
                  >
                    {a.videoSrc ? (
                      <AssetVideo src={a.videoSrc} className="h-full w-full object-cover" />
                    ) : (
                      <span className="px-1 text-center text-micro font-extrabold leading-tight text-white/80">
                        {a.badge}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-body font-bold text-ink">{a.title}</span>
                    <span className="block truncate text-caption text-ink-3">
                      {a.brand} · {a.audience}
                    </span>
                  </span>
                </div>
              ),
            },
            {
              id: "kind",
              header: "Kind",
              width: 110,
              cell: (a) => (
                <span className="inline-flex items-center gap-1.5 rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">
                  {a.kind === "video" ? <Film size={11} /> : <ImageIcon size={11} />}
                  {a.kind === "video" ? "Video" : "Doc"}
                </span>
              ),
            },
            {
              id: "status",
              header: "Status",
              width: 170,
              cell: (a) => {
                const tone = STATUS_STYLE[a.status];
                return (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="rounded-chip px-2 py-0.5 text-caption font-bold"
                      style={{ background: tone.bg, color: tone.fg, border: `1px solid ${tone.line}` }}
                    >
                      {a.status}
                    </span>
                    <DraftVisibility entry={draftSharing(a)} me={me} iconOnly />
                  </span>
                );
              },
            },
            {
              id: "spec",
              header: "Spec",
              width: 140,
              cell: (a) => <span className="truncate text-caption text-ink-3">{a.spec}</span>,
            },
            {
              id: "comments",
              header: "Comments",
              width: 110,
              cell: (a) =>
                a.comments > 0 ? (
                  <span className="inline-flex items-center gap-1 text-caption font-bold text-brand">
                    <MessageSquare size={12} /> {a.comments}
                  </span>
                ) : (
                  <span className="text-caption text-ink-4">—</span>
                ),
            },
            {
              id: "updated",
              header: "Updated",
              width: 150,
              cell: (a) => <span className="truncate text-caption text-ink-4">{a.updated}</span>,
            },
            {
              id: "open",
              header: "",
              width: 120,
              align: "right",
              hideHeader: true,
              cell: () => <span className="whitespace-nowrap text-label font-bold text-brand">Open review →</span>,
            },
          ]}
        />
      )}

      {view === "grid" && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-4)", fontSize: 14 }}>
          {assets.length === 0
            ? `Nothing in ${workspaceName} yet. What your team makes and publishes here shows up in this list.`
            : query ? <>No assets match &ldquo;{query}&rdquo;.</> : "Nothing here with these filters."}
        </div>
      )}
    </div>
  );
}

/**
 * A still that moves when you point at it.
 *
 * Eight reels looping at once is a noisy wall and a lot of decoding for a
 * screen people scan — and the browser pauses background video anyway, so the
 * motion was never dependable. The first frame is what identifies the asset;
 * the motion is what confirms it, and that is worth exactly the moment you
 * hover.
 */

/** A draft's sharing at a glance: private, the workspace, or named people; and who shared it, if not you. */
function DraftVisibility({
  entry, me, ownerName, iconOnly,
}: {
  entry: ReturnType<typeof useSharingStore.getState>["projects"][string] | undefined;
  me: string;
  ownerName?: string;
  iconOnly?: boolean;
}) {
  if (!entry) return null;
  const Icon = entry.visibility.kind === "private" ? Lock : entry.visibility.kind === "workspace" ? Globe : Users;
  const label = entry.ownerId === me ? visibilityLabel(entry.visibility) : `Shared by ${ownerName ?? "a teammate"}`;
  return (
    <span title={label} className="inline-flex min-w-0 items-center gap-1 text-caption font-bold text-ink-3">
      <Icon size={12} className="shrink-0" />
      {!iconOnly && <span className="truncate">{label}</span>}
    </span>
  );
}
