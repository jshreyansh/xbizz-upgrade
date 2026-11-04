"use client";

import { useState } from "react";
import { Check, Eye, LayoutTemplate, Link2, ListChecks, Lock, MousePointerClick, PenLine, Plus, ShieldCheck, Sparkles, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { PlanSectionShell, planState } from "@/features/workspace/plan-status";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { useEmailStore } from "@/features/workspace/email-store";
import { EmailCanvas, HEADER_ART } from "@/features/workspace/email-canvas";
import { Tag, TickRow } from "@/features/workspace/email-plan-parts";
import {
  getBlockRule,
  SENDER_PLURAL,
  type EmailBacklinkItem,
  type EmailBlock,
  type EmailBlockRule,
  type EmailCtaItem,
  type EmailTemplate,
} from "@/features/workspace/email-options";
import type { EmailProject } from "@/features/workspace/email-project";

type SectionId = "subjects" | "blocks" | "template";

/** A layout's shape, not a finished design: its header, then a bar per block it holds. */
function TemplateSketch({ template }: { template: EmailTemplate }) {
  return (
    <span className="grid w-36 overflow-hidden rounded-chip border border-hair bg-card shadow-2xs">
      {template.header === "letter" ? (
        <span className="mx-2.5 mb-1 mt-2.5 h-3 border-b-2 border-accent-violet" />
      ) : (
        <span className={template.header === "banner" ? "h-10" : "h-5"} style={{ background: HEADER_ART }} />
      )}
      <span className="grid gap-1 p-2.5">
        <span className="h-1 w-3/4 rounded-full bg-hair-3" />
        {Array.from({ length: Math.min(template.holds, 5) }, (_, i) => (
          <span key={i} className={cn("rounded-[3px] border border-hair-2", template.header === "plain" && i === 0 ? "h-4 bg-tint" : "h-2.5")} />
        ))}
        <span className="mt-0.5 h-2.5 w-14 rounded-full bg-accent-violet/70" />
      </span>
    </span>
  );
}

/** Modal to select which CTAs and Backlinks to attach to a specific block. */
function BlockAttachmentsModal({
  open,
  onClose,
  block,
  allBlocks,
  ctas,
  backlinks,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  block: EmailBlock;
  allBlocks: EmailBlock[];
  ctas: EmailCtaItem[];
  backlinks: EmailBacklinkItem[];
  onSave: (selectedCtaIds: string[], selectedBacklinkIds: string[]) => void;
}) {
  const [selectedCtas, setSelectedCtas] = useState<string[]>(() =>
    ctas.filter((c) => c.blockId === block.id).map((c) => c.id)
  );
  const [selectedBacklinks, setSelectedBacklinks] = useState<string[]>(() =>
    backlinks.filter((bl) => bl.blockId === block.id).map((bl) => bl.id)
  );

  const toggleCta = (id: string) => {
    setSelectedCtas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleBacklink = (id: string) => {
    setSelectedBacklinks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onSave(selectedCtas, selectedBacklinks);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={`Attach to: ${block.title}`}
      description="Choose action buttons and clinical citations to link to this block. Once an item is used in a block, it cannot be used elsewhere."
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-label text-ink-3">
            {selectedCtas.length} {selectedCtas.length === 1 ? "CTA" : "CTAs"} · {selectedBacklinks.length}{" "}
            {selectedBacklinks.length === 1 ? "citation" : "citations"} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="font-bold">
              Save Attachments
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 p-1">
        {/* Section 1: CTAs */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="size-4 text-accent-violet" />
              <span className="text-body font-bold text-ink">Action Buttons (CTAs)</span>
            </div>
            <span className="text-caption text-ink-4">Multiple allowed per block</span>
          </div>

          {ctas.length === 0 ? (
            <div className="rounded-control border border-dashed border-hair-3 p-3 text-center text-label text-ink-3">
              No action buttons configured in the input stage yet.
            </div>
          ) : (
            <div className="space-y-2">
              {ctas.map((c) => {
                const isAttachedHere = selectedCtas.includes(c.id);
                const isUsedInOther = Boolean(c.blockId && c.blockId !== block.id);
                const otherBlock = isUsedInOther ? allBlocks.find((b) => b.id === c.blockId) : null;

                if (isUsedInOther) {
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-control border border-hair bg-canvas/60 p-3 opacity-60"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Tag tone="lock">
                          {c.priority === "primary" ? "Primary" : "Secondary"}
                        </Tag>
                        <div className="min-w-0">
                          <span className="block truncate text-label font-bold text-ink">{c.label}</span>
                          <span className="block truncate text-caption text-ink-4">{c.url}</span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-chip bg-subtle px-2 py-0.5 text-micro font-bold text-ink-3">
                        Used in: {otherBlock?.title || "Another block"}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCta(c.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3 rounded-control border p-3 text-left transition shadow-2xs",
                      isAttachedHere
                        ? "border-brand/50 bg-tint/60"
                        : "border-hair-2 bg-card hover:border-hair-3"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          "grid size-4.5 shrink-0 place-items-center rounded-chip border transition",
                          isAttachedHere
                            ? "border-brand bg-brand text-white"
                            : "border-hair-3 bg-card"
                        )}
                      >
                        {isAttachedHere && <Check className="size-3 stroke-[3]" />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-body font-bold text-ink">{c.label}</span>
                          <Tag tone={c.priority === "primary" ? "brand" : "lock"}>
                            {c.priority === "primary" ? "Primary" : "Secondary"}
                          </Tag>
                        </div>
                        <span className="block truncate text-caption text-ink-3">{c.url}</span>
                      </div>
                    </div>
                    {isAttachedHere ? (
                      <span className="shrink-0 text-micro font-bold text-brand">Attached</span>
                    ) : (
                      <span className="shrink-0 text-micro font-semibold text-ink-4">Available</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Citations & Backlinks */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Link2 className="size-4 text-accent-violet" />
              <span className="text-body font-bold text-ink">Citations & Backlinks</span>
            </div>
            <span className="text-caption text-ink-4">Multiple allowed per block</span>
          </div>

          {backlinks.length === 0 ? (
            <div className="rounded-control border border-dashed border-hair-3 p-3 text-center text-label text-ink-3">
              No citations or backlinks configured in the input stage yet.
            </div>
          ) : (
            <div className="space-y-2">
              {backlinks.map((bl) => {
                const isAttachedHere = selectedBacklinks.includes(bl.id);
                const isUsedInOther = Boolean(bl.blockId && bl.blockId !== block.id);
                const otherBlock = isUsedInOther ? allBlocks.find((b) => b.id === bl.blockId) : null;

                if (isUsedInOther) {
                  return (
                    <div
                      key={bl.id}
                      className="flex items-center justify-between gap-3 rounded-control border border-hair bg-canvas/60 p-3 opacity-60"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Tag tone="lock">Backlink</Tag>
                        <div className="min-w-0">
                          <span className="block truncate text-label font-bold text-ink">{bl.title}</span>
                          <span className="block truncate text-caption text-ink-4">
                            {bl.context ? `${bl.context} · ` : ""}
                            {bl.url}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-chip bg-subtle px-2 py-0.5 text-micro font-bold text-ink-3">
                        Used in: {otherBlock?.title || "Another block"}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={bl.id}
                    type="button"
                    onClick={() => toggleBacklink(bl.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3 rounded-control border p-3 text-left transition shadow-2xs",
                      isAttachedHere
                        ? "border-accent-violet/60 bg-accent-violet/10"
                        : "border-hair-2 bg-card hover:border-hair-3"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          "grid size-4.5 shrink-0 place-items-center rounded-chip border transition",
                          isAttachedHere
                            ? "border-accent-violet bg-accent-violet text-white"
                            : "border-hair-3 bg-card"
                        )}
                      >
                        {isAttachedHere && <Check className="size-3 stroke-[3]" />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-body font-bold text-ink">{bl.title}</span>
                          <Tag tone="lock">Backlink</Tag>
                        </div>
                        <span className="block truncate text-caption text-ink-3">
                          {bl.context ? `${bl.context} · ` : ""}
                          {bl.url}
                        </span>
                      </div>
                    </div>
                    {isAttachedHere ? (
                      <span className="shrink-0 text-micro font-bold text-accent-violet">Attached</span>
                    ) : (
                      <span className="shrink-0 text-micro font-semibold text-ink-4">Available</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Modal to configure permissions and MLR rules for a specific block (Mandatory vs Optional, Locked vs Editable note) */
function BlockRulesModal({
  open,
  onClose,
  block,
  currentRule,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  block: EmailBlock;
  currentRule: EmailBlockRule;
  onSave: (rule: EmailBlockRule) => void;
}) {
  const [mandatory, setMandatory] = useState(currentRule.mandatory);
  const [editable, setEditable] = useState(currentRule.editable);

  const handleSave = () => {
    onSave({ mandatory, editable });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={`Rules & Permissions: ${block.title}`}
      description="Configure sales rep permissions and MLR compliance locking for this fragment in Veeva CRM Approved Email."
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-label font-bold text-ink-3">
            {mandatory ? (
              <span className="inline-flex items-center gap-1 text-ink-2">
                <Lock className="size-3 text-ink-3" /> Mandatory fragment
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-ok">
                <Check className="size-3 text-ok" /> Optional fragment
              </span>
            )}
            <span>·</span>
            <span>{editable ? "Rep editable note" : "Locked text"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="font-bold">
              Save Rules
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 p-1">
        {/* Rule 1: Rep Inclusivity Requirement */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-body font-bold text-ink">Field Rep Inclusivity</span>
            <span className="text-caption font-semibold text-ink-3">In Veeva: {mandatory ? "part of the Email Template" : "an Email Fragment, via {{insertEmailFragments}}"}</span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {/* Mandatory Option */}
            <button
              type="button"
              onClick={() => setMandatory(true)}
              className={cn(
                "flex flex-col justify-between rounded-control border p-3.5 text-left transition shadow-2xs cursor-pointer",
                mandatory
                  ? "border-brand bg-tint/60 ring-2 ring-brand/15"
                  : "border-hair-2 bg-card hover:border-hair-3"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-body text-ink">
                    <Lock className="size-3.5 text-ink-3" />
                    <span>Mandatory</span>
                  </div>
                  <Tag tone="brand">Default</Tag>
                </div>
                <p className="mt-1.5 text-caption leading-relaxed text-ink-3">
                  Locked in the template. Sales reps <strong>cannot deselect or remove</strong> this fragment when sending.
                </p>
              </div>
              <span className="mt-3 block text-micro font-extrabold uppercase tracking-wide text-ink-4">
                Required by MLR
              </span>
            </button>

            {/* Optional Option */}
            <button
              type="button"
              onClick={() => setMandatory(false)}
              className={cn(
                "flex flex-col justify-between rounded-control border p-3.5 text-left transition shadow-2xs cursor-pointer",
                !mandatory
                  ? "border-ok bg-ok-bg/50 ring-2 ring-ok/15"
                  : "border-hair-2 bg-card hover:border-hair-3"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-body text-ink">
                    <Check className="size-3.5 text-ok" />
                    <span>Optional</span>
                  </div>
                  <Tag tone="ok">Field choice</Tag>
                </div>
                <p className="mt-1.5 text-caption leading-relaxed text-ink-3">
                  Available in the rep&apos;s fragment library. Reps can pick whether to include or omit based on doctor questions.
                </p>
              </div>
              <span className="mt-3 block text-micro font-extrabold uppercase tracking-wide text-ink-4">
                Discretionary fragment
              </span>
            </button>
          </div>
        </div>

        {/* Rule 2: Editability */}
        <div className="space-y-2.5 border-t border-hair-2 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-body font-bold text-ink">Content &amp; Claim Protection</span>
            <span className="text-caption font-semibold text-ink-3">{editable ? "Customizable note" : "100% Locked copy"}</span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {/* Locked MLR Text */}
            <button
              type="button"
              onClick={() => setEditable(false)}
              className={cn(
                "flex flex-col justify-between rounded-control border p-3.5 text-left transition shadow-2xs cursor-pointer",
                !editable
                  ? "border-accent-violet bg-accent-violet/10 ring-2 ring-accent-violet/15"
                  : "border-hair-2 bg-card hover:border-hair-3"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-body text-ink">
                    <ShieldCheck className="size-3.5 text-accent-violet" />
                    <span>Locked MLR Text</span>
                  </div>
                  <Tag tone="lock">Compliance</Tag>
                </div>
                <p className="mt-1.5 text-caption leading-relaxed text-ink-3">
                  Exact approved clinical wording strictly preserved. Reps cannot modify claims or references.
                </p>
              </div>
              <span className="mt-3 block text-micro font-extrabold uppercase tracking-wide text-ink-4">
                Zero audit deviation
              </span>
            </button>

            {/* Editable note field */}
            <button
              type="button"
              onClick={() => setEditable(true)}
              className={cn(
                "flex flex-col justify-between rounded-control border p-3.5 text-left transition shadow-2xs cursor-pointer",
                editable
                  ? "border-brand bg-tint/60 ring-2 ring-brand/15"
                  : "border-hair-2 bg-card hover:border-hair-3"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-body text-ink">
                    <PenLine className="size-3.5 text-brand" />
                    <span>Editable rep commentary</span>
                  </div>
                  <Tag tone="warn">Unformatted</Tag>
                </div>
                <p className="mt-1.5 text-caption leading-relaxed text-ink-3">
                  Permits the rep to add a short contextual comment (up to 255 chars) alongside the approved claim.
                </p>
              </div>
              <span className="mt-3 block text-micro font-extrabold uppercase tracking-wide text-ink-4">
                Plain text placeholder
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** A clean, focused block tile showing only items attached to this block, with triggers for attachments and rules. */
function BlockPlanTile({
  block: b,
  on,
  onToggle,
  attachedCtas,
  attachedBacklinks,
  onOpenModal,
  onDetachCta,
  onDetachBacklink,
  rule,
  onOpenRulesModal,
  onResetMandatory,
  onResetEditable,
}: {
  block: EmailBlock;
  on: boolean;
  onToggle: () => void;
  attachedCtas: EmailCtaItem[];
  attachedBacklinks: EmailBacklinkItem[];
  onOpenModal: () => void;
  onDetachCta: (ctaId: string) => void;
  onDetachBacklink: (backlinkId: string) => void;
  rule: EmailBlockRule;
  onOpenRulesModal: () => void;
  onResetMandatory: () => void;
  onResetEditable: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-control border transition overflow-hidden",
        on
          ? "border-brand/40 bg-card shadow-2xs"
          : "border-hair-2 bg-canvas/60 opacity-60 hover:opacity-100 hover:border-hair-3"
      )}
    >
      {/* Clickable Header Row */}
      <div className="flex items-start gap-3 p-3.5">
        <button
          type="button"
          aria-pressed={on}
          onClick={onToggle}
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-chip border cursor-pointer transition",
            on ? "border-brand bg-brand text-white shadow-2xs" : "border-hair-3 bg-card hover:border-brand/40"
          )}
          title={on ? "Exclude from email" : "Include in email"}
        >
          {on && <Check className="size-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onToggle}
                className="cursor-pointer text-left text-body font-bold text-ink hover:text-brand transition"
              >
                {b.title}
              </button>
              {b.group === "custom" ? (
                <Tag tone="brand">Drafted with SwishX</Tag>
              ) : b.newClaim ? (
                <Tag tone="warn">New claim · goes to MLR</Tag>
              ) : b.expires ? (
                <Tag tone="warn">Source approval ends {b.expires}</Tag>
              ) : null}
            </div>

            {/* Quick summary badges */}
            {on && (
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Rule badge */}
                {rule.mandatory ? (
                  <span className="inline-flex items-center gap-1 rounded-chip border border-hair-2 bg-subtle px-2 py-0.5 text-micro font-bold text-ink-2" title="Mandatory fragment: locked in template">
                    <Lock className="size-3 text-ink-3" />
                    <span>Mandatory</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-chip border border-ok-line bg-ok-bg px-2 py-0.5 text-micro font-bold text-ok" title="Optional fragment: rep can choose whether to include">
                    <Check className="size-3 text-ok" />
                    <span>Optional</span>
                  </span>
                )}
                {rule.editable && (
                  <span className="inline-flex items-center gap-1 rounded-chip border border-tint-line bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep" title="Rep editable commentary allowed">
                    <PenLine className="size-3" />
                    <span>Editable Note</span>
                  </span>
                )}

                {attachedCtas.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-chip border border-tint-line bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep">
                    <MousePointerClick className="size-3" />
                    <span>{attachedCtas.length} {attachedCtas.length === 1 ? "CTA" : "CTAs"}</span>
                  </span>
                )}
                {attachedBacklinks.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-chip border border-hair-2 bg-subtle px-2 py-0.5 text-micro font-bold text-ink-2">
                    <Link2 className="size-3" />
                    <span>{attachedBacklinks.length} {attachedBacklinks.length === 1 ? "Backlink" : "Backlinks"}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="mt-1 text-label text-ink-2 leading-relaxed">{b.text}</p>
          <span className="mt-1 block text-caption text-ink-4">
            {b.newClaim ? "" : `${b.claimId} · `}
            {b.source}
          </span>
        </div>
      </div>

      {/* Block-Level Attachments Drawer (only shown if block is included) */}
      {on && (
        <div className="border-t border-hair-2 bg-subtle/30 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
          {/* List of currently attached rules, buttons and citations */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* Rule Chip: Inclusivity */}
            {rule.mandatory ? (
              <span
                onClick={onOpenRulesModal}
                className="inline-flex items-center gap-1.5 rounded-chip border border-hair-2 bg-subtle px-2 py-0.5 text-label font-bold text-ink-2 shadow-2xs cursor-pointer hover:border-hair-3 transition"
                title="Mandatory fragment (locked in template) · Click to edit"
              >
                <Lock className="size-3 text-ink-3" />
                <span>Mandatory</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-chip border border-ok-line bg-ok-bg pl-2 pr-1.5 py-0.5 text-label font-bold text-ok shadow-2xs"
                title="Optional fragment (rep choice)"
              >
                <button
                  type="button"
                  onClick={onOpenRulesModal}
                  className="flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <Check className="size-3 text-ok stroke-[3]" />
                  <span>Optional</span>
                </button>
                <button
                  type="button"
                  onClick={onResetMandatory}
                  className="grid size-4 cursor-pointer place-items-center rounded-full hover:bg-ok-line/50 transition text-ok"
                  title="Reset to Mandatory fragment"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {/* Rule Chip: Protection / Editability */}
            {rule.editable ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-chip border border-tint-line bg-tint pl-2 pr-1.5 py-0.5 text-label font-bold text-brand-deep shadow-2xs"
                title="Editable rep commentary allowed"
              >
                <button
                  type="button"
                  onClick={onOpenRulesModal}
                  className="flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <PenLine className="size-3 text-brand" />
                  <span>Editable Note</span>
                </button>
                <button
                  type="button"
                  onClick={onResetEditable}
                  className="grid size-4 cursor-pointer place-items-center rounded-full hover:bg-brand/20 transition text-brand-deep"
                  title="Reset to Locked MLR text"
                >
                  <X className="size-3" />
                </button>
              </span>
            ) : (
              <span
                onClick={onOpenRulesModal}
                className="inline-flex items-center gap-1.5 rounded-chip border border-accent-violet/30 bg-accent-violet/10 px-2 py-0.5 text-label font-bold text-accent-violet shadow-2xs cursor-pointer hover:bg-accent-violet/15 transition"
                title="Locked MLR text (compliance preserved) · Click to edit"
              >
                <ShieldCheck className="size-3 text-accent-violet" />
                <span>Locked Text</span>
              </span>
            )}

            {/* Attached Action Buttons (CTAs) */}
            {attachedCtas.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 rounded-chip border border-brand bg-tint pl-2 pr-1.5 py-0.5 text-label font-bold text-brand-deep shadow-2xs"
              >
                <MousePointerClick className="size-3 text-brand" />
                <span className="truncate max-w-[140px]">{c.label}</span>
                <span className="rounded-chip bg-brand/10 px-1 py-0.2 text-micro font-extrabold uppercase">
                  {c.priority}
                </span>
                <button
                  type="button"
                  onClick={() => onDetachCta(c.id)}
                  className="grid size-4 cursor-pointer place-items-center rounded-full hover:bg-brand/20 transition text-brand-deep"
                  title={`Remove ${c.label} from this block`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}

            {/* Attached Backlinks & Citations */}
            {attachedBacklinks.map((bl) => (
              <span
                key={bl.id}
                className="inline-flex items-center gap-1.5 rounded-chip border border-accent-violet/60 bg-accent-violet/10 pl-2 pr-1.5 py-0.5 text-label font-bold text-accent-violet shadow-2xs"
              >
                <Link2 className="size-3 text-accent-violet" />
                <span className="truncate max-w-[140px]">{bl.title}</span>
                <button
                  type="button"
                  onClick={() => onDetachBacklink(bl.id)}
                  className="grid size-4 cursor-pointer place-items-center rounded-full hover:bg-accent-violet/20 transition text-accent-violet"
                  title={`Remove citation ${bl.title} from this block`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Action triggers: Rules & Permissions and Attach CTA / Citation */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenRulesModal}
              className="h-7 gap-1 px-2.5 text-micro font-bold cursor-pointer"
            >
              <ShieldCheck className="size-3.5 text-accent-violet" />
              <span>Rules &amp; Permissions</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenModal}
              className="h-7 gap-1 px-2.5 text-micro font-bold cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Attach CTA / Backlink</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The email plan: what SwishX drafted once the sources were settled, to be
 * confirmed. Need your input asked what should be in the email; this asks
 * about what SwishX made of it — the subject lines, the blocks, the documents
 * and the template — as the same kind of tiles, one decision each. Images
 * depend on the template, so they are made when the email is built.
 */
export function EmailPlanStep({
  project: p,
  onAskChatForBlock,
}: {
  project: EmailProject;
  onAskChatForBlock?: (prefill?: string) => void;
}) {
  const setEmail = useEmailStore((s) => s.set);
  const [open, setOpen] = useState<SectionId | null>("subjects");
  const [ownSubject, setOwnSubject] = useState("");
  const [preview, setPreview] = useState<EmailTemplate | null>(null);
  const [modalBlock, setModalBlock] = useState<EmailBlock | null>(null);
  const [rulesBlock, setRulesBlock] = useState<EmailBlock | null>(null);
  const { email } = p;
  const who = SENDER_PLURAL[email.sender];
  const choice = email.subjectMode === "choice";
  const order: SectionId[] = ["subjects", "blocks", "template"];
  const toggle = (id: SectionId) => setOpen(open === id ? null : id);
  const next = (id: SectionId) => setOpen(order[order.indexOf(id) + 1] ?? null);

  /* Blocks under the source each was drafted from. */
  const groups: Array<{ id: string; label: string; blocks: EmailBlock[] }> = [
    { id: "dossier", label: `From the ${p.unbranded ? "disease information" : `${p.brandName} dossier`}`, blocks: p.blocks.filter((b) => (b.group ?? "dossier") === "dossier") },
    ...p.attachedPieces.map((pc) => ({
      id: `piece-${pc.id}`,
      label: `From approved material: ${pc.title}`,
      blocks: p.blocks.filter((b) => b.id === `piece-${pc.id}`),
    })),
    ...email.files.map((f) => ({ id: `file-${f.name}`, label: `From your file ${f.name}`, blocks: p.blocks.filter((b) => b.id === `file-${f.name}`) })),
    { id: "custom", label: "Custom blocks drafted with SwishX", blocks: p.blocks.filter((b) => b.group === "custom") },
  ].filter((g) => g.blocks.length > 0);

  const addSubject = () => {
    const line = ownSubject.trim();
    if (!line) return;
    const at = p.subjects.length;
    setEmail({ extraSubjects: [...email.extraSubjects, line], subjects: choice ? [...email.subjects, at] : [at] });
    setOwnSubject("");
  };

  const handleSaveAttachments = (selectedCtaIds: string[], selectedBacklinkIds: string[]) => {
    if (!modalBlock) return;
    const blockId = modalBlock.id;

    const nextCtas = (email.ctas || []).map((c) => {
      if (selectedCtaIds.includes(c.id)) {
        return { ...c, blockId, blockIds: [blockId] };
      }
      if (c.blockId === blockId) {
        return { ...c, blockId: null, blockIds: [] };
      }
      return c;
    });

    const nextBacklinks = (email.backlinks || []).map((bl) => {
      if (selectedBacklinkIds.includes(bl.id)) {
        return { ...bl, blockId, blockIds: [blockId] };
      }
      if (bl.blockId === blockId) {
        return { ...bl, blockId: null, blockIds: [] };
      }
      return bl;
    });

    setEmail({ ctas: nextCtas, backlinks: nextBacklinks });
  };

  const handleDetachCta = (ctaId: string) => {
    const nextCtas = (email.ctas || []).map((c) =>
      c.id === ctaId ? { ...c, blockId: null, blockIds: [] } : c
    );
    setEmail({ ctas: nextCtas });
  };

  const handleDetachBacklink = (backlinkId: string) => {
    const nextBacklinks = (email.backlinks || []).map((bl) =>
      bl.id === backlinkId ? { ...bl, blockId: null, blockIds: [] } : bl
    );
    setEmail({ backlinks: nextBacklinks });
  };

  return (
    <>
      <div className="shrink-0">
        <h2 className="text-display font-[850] tracking-tight text-ink">Email Plan</h2>
        <p className="mt-0.5 text-body text-ink-3">Drafted from your sources and approved materials. Confirm the subject lines, blocks and template, then build.</p>
      </div>

      <div className="stagger-children w-full min-w-0 space-y-3 pb-24">
        {/* 1. Subject lines */}
        <PlanSectionShell
          icon={Type}
          title={choice ? "Subject Lines" : "Subject Line"}
          summary={choice ? `${email.subjects.length} for ${who} to choose from` : `"${p.subject}"`}
          state={planState(email.subjects.length === 0)}
          source="drafted from your sources"
          open={open === "subjects"}
          onToggle={() => toggle("subjects")}
        >
          <div className="space-y-2">
            <p className="text-label text-ink-3">{choice ? `Tick the ones ${who} can choose from when sending.` : "Pick one."} Each goes to MLR with the email.</p>
            {p.subjects.map((line, i) => {
              const on = email.subjects.includes(i);
              return (
                <TickRow
                  key={`${line}-${i}`}
                  on={on}
                  title={line}
                  tag={
                    <>
                      <span className="text-label font-semibold text-ink-4">{line.length} characters</span>
                      {i >= p.subjects.length - email.extraSubjects.length ? (
                        <Tag tone="lock">Yours</Tag>
                      ) : (
                        <Tag tone="brand">Suggested</Tag>
                      )}
                    </>
                  }
                  onToggle={() => setEmail({ subjects: !choice ? [i] : on ? (email.subjects.length > 1 ? email.subjects.filter((x) => x !== i) : email.subjects) : [...email.subjects, i].sort() })}
                />
              );
            })}
            <div className="flex items-end gap-2 pt-1">
              <Field size="sm" className="flex-1" placeholder="Write your own subject line" maxLength={80} value={ownSubject} onChange={(e) => setOwnSubject(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} aria-label="Your own subject line" />
              <Button size="sm" variant="secondary" disabled={!ownSubject.trim()} onClick={addSubject} className="h-8 gap-1.5 text-label font-bold">
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>
          </div>
          <PlanSectionContinue onClick={() => next("subjects")} />
        </PlanSectionShell>

        {/* 2. Content blocks, grouped by where each was drafted from */}
        <PlanSectionShell
          icon={ListChecks}
          title="Content Blocks"
          summary={`${p.included.length} of ${p.blocks.length} blocks${p.isHQ ? " in the email" : ` for ${who} to pick from`}`}
          state={planState(p.included.length === 0)}
          error={p.included.length === 0 ? { title: "No blocks in the email", detail: "Tick at least one block." } : null}
          source="from your sources"
          open={open === "blocks"}
          onToggle={() => toggle("blocks")}
        >
          <div className="space-y-3">
            <p className="text-label text-ink-3">
              {p.isHQ ? "Every ticked block is sent." : `${who[0].toUpperCase() + who.slice(1)} pick which of the ticked blocks to send.`} Each comes from one approved claim and goes to MLR on its own.
            </p>
            {groups.map((g) => (
              <div key={g.id} className="space-y-2">
                <div className="text-label font-bold text-ink-3">{g.label}</div>
                {g.blocks.map((b) => {
                  const on = !email.offBlocks.includes(b.id);
                  const attachedCtas = (p.ctas || []).filter((c) => c.blockId === b.id);
                  const attachedBacklinks = (p.backlinks || []).filter((bl) => bl.blockId === b.id);
                  const rule = getBlockRule(email.blockRules, b.id);
                  return (
                    <BlockPlanTile
                      key={b.id}
                      block={b}
                      on={on}
                      onToggle={() =>
                        setEmail({
                          offBlocks: on ? [...email.offBlocks, b.id] : email.offBlocks.filter((x) => x !== b.id),
                        })
                      }
                      attachedCtas={attachedCtas}
                      attachedBacklinks={attachedBacklinks}
                      onOpenModal={() => setModalBlock(b)}
                      onDetachCta={handleDetachCta}
                      onDetachBacklink={handleDetachBacklink}
                      rule={rule}
                      onOpenRulesModal={() => setRulesBlock(b)}
                      onResetMandatory={() =>
                        setEmail({
                          blockRules: {
                            ...email.blockRules,
                            [b.id]: { ...rule, mandatory: true },
                          },
                        })
                      }
                      onResetEditable={() =>
                        setEmail({
                          blockRules: {
                            ...email.blockRules,
                            [b.id]: { ...rule, editable: false },
                          },
                        })
                      }
                    />
                  );
                })}
              </div>
            ))}

            {/* Assisted custom block addition via chat */}
            <div className="flex flex-col gap-2 rounded-control border border-hair-2 bg-subtle/50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-body font-bold text-ink">Need an Additional Content Block?</span>
                  <span className="rounded-chip bg-tint px-1.5 py-0.5 text-micro font-bold text-brand-deep border border-tint-line">Context required</span>
                </div>
                <p className="mt-0.5 text-caption text-ink-3">
                  Unlike subject lines, content blocks require clinical evidence and MLR source context. Ask SwishX in chat to draft a grounded block.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  onAskChatForBlock?.(
                    `Add a content block about [topic, e.g. secondary endpoints or dosing], grounded in the ${p.brandName} evidence dossier`
                  )
                }
                className="h-8 gap-1.5 shrink-0 text-label font-bold text-brand hover:text-brand-deep cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Ask SwishX in Chat</span>
              </Button>
            </div>
          </div>
          <PlanSectionContinue onClick={() => next("blocks")} />
        </PlanSectionShell>

        {/* 3. Template, as a grid of layouts */}
        <PlanSectionShell
          icon={LayoutTemplate}
          title="Email Template & Layout"
          summary={`${p.template.title} · holds ${p.template.holds} blocks`}
          state={planState(false)}
          source={p.template.from === "brand" ? "from your brand" : "SwishX layout"}
          open={open === "template"}
          onToggle={() => toggle("template")}
        >
          <div className="space-y-3">
            {(["swishx", "brand"] as const).map((from) => {
              const list = p.templates.filter((t) => t.from === from);
              if (list.length === 0) return null;
              return (
                <div key={from} className="space-y-2">
                  <div className="text-label font-bold text-ink-3">{from === "swishx" ? "SwishX layouts, in your brand kit" : `${p.brandName}'s email templates`}</div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((t) => {
                      const on = p.template.id === t.id;
                      const roomy = t.holds >= p.included.length;
                      return (
                        <div
                          key={t.id}
                          className={cn("flex flex-col overflow-hidden rounded-card border transition", on ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-brand/50")}
                        >
                          <button type="button" role="radio" aria-checked={on} onClick={() => setEmail({ template: t.id })} className="flex cursor-pointer flex-col text-left">
                            <span className="grid h-40 place-items-center border-b border-hair bg-canvas">
                              <TemplateSketch template={t} />
                            </span>
                            <span className="grid gap-0.5 p-3">
                              <span className="flex items-center gap-1.5 text-body font-[850] text-ink">
                                {t.title}
                                {on && <Check className="size-3.5 text-brand" />}
                              </span>
                              <span className="text-label leading-snug text-ink-3">{t.detail}</span>
                              <span className={cn("text-label font-bold", roomy ? "text-ink-4" : "text-warn")}>
                                Holds {t.holds} blocks{roomy ? "" : ` · you ticked ${p.included.length}`} · {t.approval}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreview(t)}
                            className="flex cursor-pointer items-center justify-center gap-1.5 border-t border-hair py-2 text-label font-bold text-ink-2 hover:bg-subtle"
                          >
                            <Eye className="size-3.5" />
                            Preview with your content
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <PlanSectionContinue onClick={() => setOpen(null)} />
        </PlanSectionShell>
      </div>

      {preview && (
        <Modal
          open
          onClose={() => setPreview(null)}
          title={preview.title}
          description="A rough layout with your drafted content. The final design is made when you build."
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setEmail({ template: preview.id });
                  setPreview(null);
                }}
                className="font-bold"
              >
                Use this template
              </Button>
            </div>
          }
        >
          <div className="flex justify-center rounded-panel bg-canvas p-4">
            <EmailCanvas project={p} view="inbox" template={preview} />
          </div>
        </Modal>
      )}

      {modalBlock && (
        <BlockAttachmentsModal
          key={modalBlock.id}
          open
          onClose={() => setModalBlock(null)}
          block={modalBlock}
          allBlocks={p.blocks}
          ctas={p.ctas}
          backlinks={p.backlinks}
          onSave={handleSaveAttachments}
        />
      )}

      {rulesBlock && (
        <BlockRulesModal
          key={rulesBlock.id}
          open={Boolean(rulesBlock)}
          onClose={() => setRulesBlock(null)}
          block={rulesBlock}
          currentRule={getBlockRule(email.blockRules, rulesBlock.id)}
          onSave={(updatedRule) => {
            setEmail({
              blockRules: {
                ...email.blockRules,
                [rulesBlock.id]: updatedRule,
              },
            });
          }}
        />
      )}
    </>
  );
}
