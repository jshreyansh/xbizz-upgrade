"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Clapperboard, Eye, FileText, Film, Image as ImageIcon, LayoutGrid, Megaphone, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { AssetPreview, StatusChip } from "@/features/content-library/asset-preview";
import { AD_PLACEMENTS, type AdPlacement } from "@/features/workspace/ad-options";
import type { LibraryAsset } from "@/features/content-library/content-library-data";
import { audienceNoun, type EmailAudience, type EmailPiece } from "@/features/workspace/email-options";
import { ApprovedMaterialViewerModal } from "@/features/workspace/approved-material-viewer-modal";
import { cn } from "@/lib/cn";

export interface ApprovedMaterialsModalProps {
  open: boolean;
  onClose: () => void;
  brandName: string;
  audience: EmailAudience;
  allPieces: EmailPiece[];
  selectedIds: string[];
  onConfirm: (selectedIds: string[]) => void;
}

type MaterialTab = "all" | "video" | "docs" | "ads";

/**
 * Modal to browse and attach approved materials for this drug.
 * Supports Videos, Docs & Infographics, and Ad Campaigns with granular cutdown selection and full previews.
 */
export function ApprovedMaterialsModal({
  open,
  onClose,
  brandName,
  audience,
  allPieces,
  selectedIds,
  onConfirm,
}: ApprovedMaterialsModalProps) {
  const [tab, setTab] = useState<MaterialTab>("all");
  const [query, setQuery] = useState("");
  const [staged, setStaged] = useState<string[]>(selectedIds);
  const [expandedAds, setExpandedAds] = useState<Record<string, boolean>>({});
  const [previewPiece, setPreviewPiece] = useState<EmailPiece | null>(null);

  const toggleStaged = (id: string) => {
    setStaged((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAdExpand = (adId: string) => {
    setExpandedAds((prev) => ({ ...prev, [adId]: !prev[adId] }));
  };

  // Group pieces into standard items and ad-campaign groups
  const { standardPieces, adGroups } = useMemo(() => {
    const std: EmailPiece[] = [];
    const ads: Record<string, { parentAsset: LibraryAsset; cutdowns: EmailPiece[] }> = {};

    allPieces.forEach((piece) => {
      if (piece.parentAdId) {
        if (!ads[piece.parentAdId]) {
          ads[piece.parentAdId] = { parentAsset: piece.asset, cutdowns: [] };
        }
        ads[piece.parentAdId].cutdowns.push(piece);
      } else if (piece.kind !== "Ad") {
        std.push(piece);
      }
    });

    return { standardPieces: std, adGroups: ads };
  }, [allPieces]);

  const q = query.trim().toLowerCase();

  const filteredStandard = useMemo(() => {
    return standardPieces.filter((p) => {
      if (tab === "video" && p.kind !== "Video") return false;
      if (tab === "docs" && p.kind !== "Docs") return false;
      if (tab === "ads") return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q);
    });
  }, [standardPieces, tab, q]);

  const filteredAdGroups = useMemo(() => {
    if (tab === "video" || tab === "docs") return [];
    return Object.entries(adGroups).filter(([, group]) => {
      if (!q) return true;
      const titleMatch = group.parentAsset.title.toLowerCase().includes(q);
      const cutdownMatch = group.cutdowns.some((c) => c.title.toLowerCase().includes(q) || c.spec.toLowerCase().includes(q));
      return titleMatch || cutdownMatch;
    });
  }, [adGroups, tab, q]);

  const totalResults = filteredStandard.length + filteredAdGroups.length;

  const handleSelectAllAdCutdowns = (cutdowns: EmailPiece[]) => {
    const ids = cutdowns.map((c) => c.id);
    const allChecked = ids.every((id) => staged.includes(id));
    if (allChecked) {
      setStaged((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setStaged((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleSave = () => {
    onConfirm(staged);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Approved brand materials"
      description={`Select approved videos, docs, or ad cutdowns for ${brandName} (${audienceNoun(audience)}) to feature in this email.`}
      size="xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-label text-ink-3">
            <b className="font-bold text-ink">{staged.length}</b> {staged.length === 1 ? "material" : "materials"} selected
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="gap-1.5 font-bold">
              <Check className="size-3.5" />
              <span>Attach to Email ({staged.length})</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search and Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair pb-3">
          <div className="w-full sm:w-64">
            <Field
              size="sm"
              iconLeft={<Search className="size-3.5" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search materials..."
              aria-label="Search approved materials"
            />
          </div>
          <Segmented className="shrink-0">
            <SegmentedButton active={tab === "all"} onClick={() => setTab("all")}>
              All
            </SegmentedButton>
            <SegmentedButton active={tab === "video"} onClick={() => setTab("video")}>
              <Film className="mr-1.5 size-3.5 inline" />
              Videos
            </SegmentedButton>
            <SegmentedButton active={tab === "docs"} onClick={() => setTab("docs")}>
              <FileText className="mr-1.5 size-3.5 inline" />
              Docs &amp; Decks
            </SegmentedButton>
            <SegmentedButton active={tab === "ads"} onClick={() => setTab("ads")}>
              <Megaphone className="mr-1.5 size-3.5 inline" />
              Ad Cutdowns
            </SegmentedButton>
          </Segmented>
        </div>

        {totalResults === 0 ? (
          <div className="rounded-control border border-dashed border-hair-3 p-8 text-center text-ink-3">
            <p className="text-body font-semibold">No materials found</p>
            <p className="mt-1 text-label text-ink-4">Try clearing your search query or switching categories.</p>
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Standard Videos and Docs */}
            {filteredStandard.map((piece) => {
              const on = staged.includes(piece.id);
              const KindIcon = piece.kind === "Video" ? Film : FileText;
              return (
                <div
                  key={piece.id}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-control border text-left transition shadow-2xs hover:shadow-xs",
                    on ? "border-brand bg-tint/40 ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3"
                  )}
                >
                  <div className="relative">
                    <div onClick={() => toggleStaged(piece.id)} className="cursor-pointer">
                      <AssetPreview asset={piece.asset} className="h-28" />
                    </div>
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-chip bg-black/60 px-2 py-0.5 text-micro font-bold uppercase tracking-wider text-white backdrop-blur-sm pointer-events-none">
                      <KindIcon className="size-3" />
                      {piece.kind === "Video" ? "Video" : "Doc"} · {piece.spec}
                    </span>
                    <span
                      onClick={() => toggleStaged(piece.id)}
                      className={cn(
                        "absolute right-2.5 top-2.5 grid size-5.5 cursor-pointer place-items-center rounded-full border shadow-sm transition-colors",
                        on ? "border-brand bg-brand text-white" : "border-white/70 bg-black/40 text-transparent"
                      )}
                    >
                      <Check className="size-3.5 stroke-[3]" />
                    </span>

                    {/* Quick Preview Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewPiece(piece);
                      }}
                      className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-chip bg-black/75 px-2.5 py-1 text-micro font-bold text-white shadow-sm backdrop-blur-sm hover:bg-black transition cursor-pointer"
                      title="Inspect full material"
                    >
                      <Eye className="size-3" />
                      <span>Full preview</span>
                    </button>
                  </div>

                  <div
                    onClick={() => toggleStaged(piece.id)}
                    className="flex flex-1 flex-col justify-between p-3 cursor-pointer"
                  >
                    <div>
                      <h4 className="line-clamp-1 text-body font-extrabold text-ink">{piece.title}</h4>
                      <p className="mt-0.5 line-clamp-2 text-label text-ink-3">{piece.approval}</p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-hair-2 pt-2 text-micro">
                      <StatusChip status={piece.asset.status} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewPiece(piece);
                        }}
                        className="text-brand font-bold hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Ad Campaign Packs with selective cutdown picking */}
            {filteredAdGroups.map(([adId, group]) => {
              const expanded = expandedAds[adId] !== false; // default expanded
              const cutdownIds = group.cutdowns.map((c) => c.id);
              const checkedCount = cutdownIds.filter((id) => staged.includes(id)).length;
              const allChecked = checkedCount === cutdownIds.length && cutdownIds.length > 0;

              return (
                <div key={adId} className="flex flex-col overflow-hidden rounded-control border border-hair-2 bg-card shadow-2xs sm:col-span-2 lg:col-span-3">
                  {/* Campaign Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair-2 bg-subtle/50 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid size-8 shrink-0 place-items-center rounded-control bg-tint text-brand-deep">
                        <Megaphone className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-body font-extrabold text-ink">{group.parentAsset.title}</h4>
                          <StatusChip status={group.parentAsset.status} />
                        </div>
                        <p className="text-label text-ink-3">Ad Campaign · {group.cutdowns.length} individual cutdowns available with visual previews</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleSelectAllAdCutdowns(group.cutdowns)} className="h-7 text-label font-bold text-ink-2">
                        {allChecked ? "Deselect all" : "Select all cutdowns"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => toggleAdExpand(adId)}
                        className="grid size-7 cursor-pointer place-items-center rounded-chip text-ink-3 hover:bg-black/5 hover:text-ink transition"
                        title={expanded ? "Collapse cutdowns" : "Expand cutdowns"}
                      >
                        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Constituent Cutdowns Visual Grid */}
                  {expanded && (
                    <div className="grid gap-3 p-3.5 sm:grid-cols-2 lg:grid-cols-4 bg-canvas/40">
                      {group.cutdowns.map((cutdown) => {
                        const on = staged.includes(cutdown.id);
                        const pId = cutdown.adPlacementId as AdPlacement | undefined;
                        const placement = AD_PLACEMENTS.find((p) => p.id === pId);
                        const isVideo = placement?.makes.includes("video") || /video|reel|shorts/i.test(cutdown.title);
                        const isDisplay = pId === "google-display";
                        const Icon = isVideo ? Clapperboard : isDisplay ? LayoutGrid : ImageIcon;

                        return (
                          <div
                            key={cutdown.id}
                            className={cn(
                              "group relative flex flex-col overflow-hidden rounded-control border text-left transition shadow-2xs hover:shadow-xs",
                              on ? "border-brand bg-tint/30 ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3"
                            )}
                          >
                            {/* Visual Thumbnail Header */}
                            <div
                              onClick={() => toggleStaged(cutdown.id)}
                              className="relative h-24 w-full cursor-pointer overflow-hidden flex flex-col justify-between p-2.5 text-white"
                              style={{ background: group.parentAsset.gradient || "linear-gradient(150deg,#7c2d12,#c2410c 55%,#f97316)" }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 rounded-chip bg-black/60 px-2 py-0.5 text-micro font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                                  <Icon className="size-3" />
                                  {cutdown.spec}
                                </span>
                                <span
                                  className={cn(
                                    "grid size-5.5 place-items-center rounded-full border shadow-sm transition-colors",
                                    on ? "border-brand bg-brand text-white" : "border-white/70 bg-black/40 text-transparent"
                                  )}
                                >
                                  <Check className="size-3.5 stroke-[3]" />
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-micro font-extrabold uppercase tracking-wider text-white/80 truncate">
                                  {placement?.label || "Cutdown"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewPiece(cutdown);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-chip bg-black/60 px-2 py-0.5 text-micro font-bold text-white backdrop-blur-sm hover:bg-black/90 transition cursor-pointer"
                                  title="Full preview"
                                >
                                  <Eye className="size-3" />
                                  <span>Preview</span>
                                </button>
                              </div>
                            </div>

                            {/* Cutdown Meta & Details */}
                            <div
                              onClick={() => toggleStaged(cutdown.id)}
                              className="flex flex-1 flex-col justify-between p-2.5 cursor-pointer"
                            >
                              <div>
                                <h5 className="line-clamp-1 text-label font-extrabold text-ink">{cutdown.cutdownName || cutdown.title}</h5>
                                <p className="mt-0.5 line-clamp-1 text-caption text-ink-3">{cutdown.spec} · {placement?.sizes || "Ad Placement"}</p>
                              </div>
                              <div className="mt-2 flex items-center justify-between border-t border-hair-2 pt-1.5 text-micro">
                                <span className="text-ink-4">Cutdown</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewPiece(cutdown);
                                  }}
                                  className="text-brand font-bold hover:underline cursor-pointer"
                                >
                                  Inspect
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewPiece && (
        <ApprovedMaterialViewerModal
          piece={previewPiece}
          onClose={() => setPreviewPiece(null)}
          isAttached={staged.includes(previewPiece.id)}
          onToggleAttach={(id) => toggleStaged(id)}
        />
      )}
    </Modal>
  );
}
