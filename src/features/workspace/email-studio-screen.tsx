"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Image as ImageIcon, Link2, Lock, Mail, MessageCircle, MessageSquare, PanelRight, Pencil, Send, ShieldCheck, Download, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { WorkbenchLayout } from "@/components/patterns/workbench-layout";
import { ChatComposer, ComposerAttachButton } from "@/components/patterns/chat-composer";
import { ComposerTray } from "@/components/patterns/composer-tray";
import { SaveOrDiscardDialog } from "@/components/patterns/save-or-discard-dialog";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { Toast, useToast } from "@/components/patterns/toast";
import { cn } from "@/lib/cn";
import { DossierReaderModal } from "@/features/dossiers/dossier-reader-modal";
import { dossierFor } from "@/features/dossiers/dossier-for";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { moleculeFor } from "@/features/workspace/grounding-dossiers";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useProjectExit } from "@/features/workspace/project-exit";
import { ProjectMenu, ProjectTitle } from "@/features/workspace/project-title";
import { VersionChip, type AssetVersion } from "@/features/workspace/version-trail";
import { PreviewPublishModal } from "@/features/workspace/preview-publish-modal";
import type { PreflightCheck } from "@/features/workspace/preflight-panel";
import { useMlrReview } from "@/features/workspace/mlr-review";
import { ReviewStatusBanner, useAssetReview } from "@/features/review/asset-review";
import { InspectorTabButton, INSPECTOR_TAB_STRIP } from "@/features/workspace/inspector-tabs";
import { FormattedMessageText } from "@/features/workspace/chat-message";
import { ChatAttachmentRow, useChatAttachments } from "@/features/workspace/chat-attachments";
import { EditorToolbar, toolbarDivider, type ToolbarItem, type ToolbarSelection } from "@/features/workspace/editor-toolbar";
import { useEmailStore } from "@/features/workspace/email-store";
import { ZONE_NAME, ZONE_TYPE_LABEL, useEmailProject, type EmailZone, type ZoneType } from "@/features/workspace/email-project";
import { EmailCanvas, type EmailView } from "@/features/workspace/email-canvas";
import { EmailInsertDialogs, insertRequestFor, type EmailInsertRequest } from "@/features/workspace/email-insert";
import { EmailRepPreview } from "@/features/workspace/email-rep-preview";
import { EmailExportModal, EmailPublishPreview, emailPackage } from "@/features/workspace/email-export";
import { LINK_STATUS, SENDER_AS, SENDER_PLURAL } from "@/features/workspace/email-options";

type PanelTab = "assistant" | "evidence" | "links";

const DOT: Record<ZoneType, string> = { lock: "bg-ink-4", auto: "bg-ok", choose: "bg-accent-blue", type: "bg-brand" };
const PILL: Record<ZoneType, string> = { lock: "bg-subtle text-ink-3", auto: "bg-ok-bg text-ok", choose: "bg-accent-blue/10 text-accent-blue", type: "bg-tint text-brand-deep" };
const TONE: Record<"ok" | "lock" | "warn" | "danger", string> = { ok: "bg-ok-bg text-ok", lock: "bg-subtle text-ink-3", warn: "bg-warn-bg text-warn", danger: "bg-danger-bg text-danger" };

/**
 * The approved-email editor.
 *
 * The same studio as Ads and Docs: the email's parts down the rail, the email
 * on the canvas with one toolbar that follows the selection, and Chat and
 * Claims on the right — plus Links, because every link in an approved email
 * is something MLR reviews.
 *
 * Its own idea is the lock: every part says what the sender can do with it, and
 * the parts a sender could change carry a switch on the toolbar, so the marketer
 * decides the locks on the email itself.
 */
export function EmailStudioScreen() {
  const { chatMessages, addChatMessage, copilotPanelOpen, copilotPanelWidth, setCopilotPanelWidth, setCopilotPanelOpen, toggleCopilotPanel, studioEntry } = useWorkspaceStore();
  const exit = useProjectExit();
  const p = useEmailProject();
  const { email, brandName, purpose } = p;
  const setEmail = useEmailStore((s) => s.set);
  /* "reps", "account managers", "support nurses": whoever personalises this email. */
  const who = SENDER_PLURAL[email.sender];
  const Who = who[0].toUpperCase() + who.slice(1);
  const one = p.sender.label.toLowerCase();

  const [view, setView] = useState<EmailView>("zones");
  const [selected, setSelected] = useState<string | null>(p.zones.includes("blocks") ? "blocks" : "opening");
  const [panelTab, setPanelTab] = useState<PanelTab>("assistant");
  const [insert, setInsert] = useState<{ request: EmailInsertRequest; replace?: string } | null>(null);
  const [repOpen, setRepOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportedTo, setExportedTo] = useState<string | null>(null);
  const [dossier, setDossier] = useState<BrandDossier | null>(null);
  const [studioMode, setStudioMode] = useState<"editor" | "review">(studioEntry === "review" ? "review" : "editor");
  const [publishedCount, setPublishedCount] = useState(0);
  const [editCount, setEditCount] = useState(0);
  const { message: toastMessage, open: toastOpen, tone: toastTone, showToast } = useToast();

  const reviewKey = `email:${p.title}`;
  const assetReview = useAssetReview(reviewKey);
  const mlrReview = useMlrReview(reviewKey, editCount);
  const submitted = studioMode === "review";
  const approved = assetReview.item?.status === "approved" || (!!assetReview.item && assetReview.stages.length === 0);

  /* A part that was removed can't stay selected. */
  const sel = selected && p.zones.includes(selected) ? selected : null;
  const selMedia = sel?.startsWith("m:") ? email.media.find((m) => `m:${m.uid}` === sel) : undefined;
  const edited = () => setEditCount((n) => n + 1);

  /* ── Chat ── */
  const chatFiles = useChatAttachments();
  const [chatInput, setChatInput] = useState("");
  const [chatContexts, setChatContexts] = useState<Array<{ id: string; label: string; detail: string }>>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  const handToChat = (context: { id: string; label: string; detail: string }, prompt: string) => {
    setCopilotPanelOpen(true);
    setPanelTab("assistant");
    setChatContexts((prev) => (prev.some((c) => c.id === context.id) ? prev : [...prev, context]));
    setChatInput((prev) => (prev.trim() ? prev : prompt));
  };
  const handleSendChat = (directText?: string) => {
    const attached = directText ? [] : chatFiles.take();
    const text = directText || chatInput.trim();
    if (!text && attached.length === 0) return;
    const context = directText ? [] : chatContexts;
    addChatMessage({ role: "user", text: [text, ...context.map((c) => `\u{1F4CE} ${c.label}`), ...attached.map((f) => `\u{1F4CE} ${f.name}`)].filter(Boolean).join("\n") });
    if (!directText) {
      setChatInput("");
      setChatContexts([]);
    }
    edited();
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Done. Every number is still in the approved wording of its claim.`;
      if (/shorter|shorten/.test(lower)) reply = "Shortened the opening to one sentence. The indication statement stays word for word.";
      else if (/no note|remove the note/.test(lower)) {
        setEmail({ repEdit: { ...email.repEdit, note: false } });
        reply = `${Who} can no longer add a note.`;
      } else if (/lock|fix the blocks/.test(lower)) {
        setEmail({ repEdit: { ...email.repEdit, blocks: false } });
        reply = `The blocks are locked now: all ${who} send the same ones.`;
      }
      addChatMessage({ role: "swishx", text: reply });
    }, 450);
  };

  /* ── What the toolbar offers for the selection ── */
  const whoFor = (id: string): string => {
    const t = p.zoneType(id);
    const tokens: Record<string, string> = {
      greeting: "Filled from the CRM record",
      note: `The ${one} types it, up to 255 characters`,
      blocks: t === "choose" ? `The ${one} picks which of the ${p.included.length} approved blocks to send` : "Every block is sent",
      piece: t === "choose" ? `The ${one} ticks which documents to send` : "Every document goes as a link card",
      cta: p.cta.status === "missing" ? "Goes nowhere yet" : `Goes to ${p.cta.dest}`,
      signoff: p.isHQ ? "The brand team" : "Filled from the sender's profile",
      isi: "Current ISI, inserted by SwishX",
      footer: "Unsubscribe, address and job code",
    };
    return tokens[id] ?? "Approved text";
  };
  const actionsFor: Record<string, string[]> = {
    opening: ["Rewrite with SwishX", "Shorter"],
    blocks: ["Rewrite a block", "Swap a claim", "Reorder"],
    cta: ["Rewrite with SwishX"],
    note: [`Write guidance for ${who}`],
    header: ["Change header image"],
  };
  const switchable = !p.isHQ && (sel === "note" || sel === "blocks" || sel === "piece");

  let toolbarSelection: ToolbarSelection | null = null;
  if (sel && !submitted) {
    const items: ToolbarItem[] = [];
    if (selMedia) {
      items.push({ key: "from", node: <span className={cn("rounded-chip px-2 py-0.5 text-micro font-extrabold", selMedia.from === "platform" ? TONE.ok : TONE.warn)}>{selMedia.from === "platform" ? `Approved · ${selMedia.code}` : "New upload · goes to MLR"}</span> });
      if (selMedia.kind === "image" || selMedia.kind === "video")
        items.push({
          key: "alt",
          node: (
            <Field
              size="sm"
              aria-label="Alt text"
              placeholder="Alt text: what it shows"
              value={selMedia.alt}
              onChange={(e) => setEmail({ media: email.media.map((m) => (m.uid === selMedia.uid ? { ...m, alt: e.target.value } : m)) })}
              className="w-64"
            />
          ),
        });
      if (selMedia.kind === "video")
        items.push({
          key: "thumb",
          node: (
            <Segmented>
              <SegmentedButton active={!selMedia.gif} onClick={() => setEmail({ media: email.media.map((m) => (m.uid === selMedia.uid ? { ...m, gif: false } : m)) })}>
                Still
              </SegmentedButton>
              <SegmentedButton active={!!selMedia.gif} onClick={() => setEmail({ media: email.media.map((m) => (m.uid === selMedia.uid ? { ...m, gif: true } : m)) })}>
                Animated GIF
              </SegmentedButton>
            </Segmented>
          ),
        });
      items.push(toolbarDivider("d1"));
      items.push({
        key: "replace",
        node: (
          <Button size="sm" variant="ghost" onClick={() => setInsert({ request: selMedia.kind === "image" ? "brand-images" : selMedia.kind === "video" ? "videos" : selMedia.kind === "doc" ? "documents" : "url", replace: selMedia.uid })}>
            Replace
          </Button>
        ),
      });
      items.push({
        key: "remove",
        node: (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEmail({ media: email.media.filter((m) => m.uid !== selMedia.uid) });
              setSelected(null);
              edited();
            }}
          >
            Remove
          </Button>
        ),
      });
    } else {
      const t = p.zoneType(sel);
      items.push({ key: "type", node: <span className={cn("inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-micro font-extrabold", PILL[t])}>{t === "lock" && <Lock className="size-3" />}{ZONE_TYPE_LABEL[t]}</span> });
      items.push({ key: "who", node: <span className="truncate text-label text-ink-3">{whoFor(sel)}</span> });
      if (switchable) {
        const k = sel as "note" | "blocks" | "piece";
        items.push(toolbarDivider("d-lock"));
        items.push({
          key: "lock",
          node: (
            <span className="flex items-center gap-2">
              <span className="text-label text-ink-3">{Who} can</span>
              <Segmented>
                <SegmentedButton active={!email.repEdit[k]} onClick={() => { setEmail({ repEdit: { ...email.repEdit, [k]: false } }); edited(); }}>
                  {k === "note" ? "Not add a note" : "Not change it"}
                </SegmentedButton>
                <SegmentedButton active={email.repEdit[k]} onClick={() => { setEmail({ repEdit: { ...email.repEdit, [k]: true } }); edited(); }}>
                  {k === "note" ? "Type a note" : "Choose"}
                </SegmentedButton>
              </Segmented>
            </span>
          ),
        });
      }
      const actions = actionsFor[sel] ?? [];
      if (actions.length) items.push(toolbarDivider("d-act"));
      actions.forEach((a) =>
        items.push({
          key: a,
          node: (
            <Button size="sm" variant="ghost" onClick={() => handToChat({ id: `${sel}-${a}`, label: `${ZONE_NAME[sel as EmailZone]} · ${a}`, detail: whoFor(sel) }, `${a}: `)}>
              {a}
            </Button>
          ),
        })
      );
    }
    const name = selMedia ? selMedia.title : ZONE_NAME[sel as EmailZone];
    toolbarSelection = {
      id: sel,
      icon: (selMedia ? (selMedia.kind === "link" || selMedia.kind === "doc" ? Link2 : ImageIcon) : Mail) as LucideIcon,
      name,
      path: `Email › ${name}`,
      items,
      onAddToChat: () => handToChat({ id: `sel-${sel}`, label: name, detail: selMedia ? selMedia.src : whoFor(sel) }, `Change the ${name.toLowerCase()}: `),
    };
  }

  /* ── Checks before MLR ── */
  const noAlt = email.media.filter((m) => (m.kind === "image" || m.kind === "video") && !m.alt.trim());
  const unmatched = email.media.filter((m) => m.newClaims.length > 0);
  const expiring = p.included.filter((b) => b.expires);
  const htmlSize = 21400 + p.included.length * 2300 + email.media.length * 1100;
  const checks: PreflightCheck[] = [
    { id: "claims", source: "MLR", title: `Every number traces to an approved claim · ${p.claimIds.length} claims`, detail: p.included.map((b) => `${b.claimId} · ${b.source}`).join(" · ") || "No claims in this email" },
    p.unbranded
      ? { id: "isi", source: "MLR", title: "No product named or implied", detail: "Disease awareness only, so no safety information is needed" }
      : { id: "isi", source: "MLR", title: "Safety information current and as prominent as the claims", detail: `${brandName} ISI${p.professional ? "" : " in plain language"}${p.boxedWarning ? " with the boxed warning" : ""} at the foot of the email` },
    ...(!p.professional ? [{ id: "plain", source: "Quality", title: "Plain language for patients and the public", detail: "No clinical jargon; reads at about a 6th to 8th grade level" }] : []),
    { id: "footer", source: "MLR", title: "Unsubscribe, company address and job code in the footer", detail: p.professional ? "Required in every commercial email" : "With why they're receiving it and the privacy policy" },
    p.cta.status === "missing"
      ? { id: "cta", source: "MLR", severity: "blocker", title: `"${p.ctaText}" goes nowhere`, detail: "Add the page it opens in the Links tab." }
      : { id: "cta", source: "Quality", title: `Every link has a destination · ${p.links.length} links`, detail: "Each tracked with a label for click reports" },
    { id: "assets", source: "Quality", title: "Images hosted, none embedded", detail: `${email.media.filter((m) => m.kind === "image" || m.kind === "video").length + 1} files in the Assets folder · ${htmlSize.toLocaleString("en-US")} of 131,072 characters` },
    ...noAlt.map((m) => ({ id: `alt-${m.uid}`, source: "Quality", severity: "warning" as const, title: `${m.title} has no alt text`, detail: "Outlook often blocks images, so the doctor would see an empty box." })),
    ...unmatched.map((m) => ({ id: `new-${m.uid}`, source: "MLR", severity: "warning" as const, title: `${m.title} shows ${m.newClaims.join(", ")}`, detail: "It matches no approved claim, so it goes to MLR as a new claim." })),
    ...expiring.map((b) => ({ id: `exp-${b.id}`, source: "MLR", severity: "warning" as const, title: `${b.title}: approval ends ${b.expires}`, detail: "Senders can't use it after that. Leave it out, or plan its renewal." })),
  ];

  const publish = () => {
    setPublishOpen(false);
    setStudioMode("review");
    setPublishedCount((n) => n + 1);
    setSelected(null);
    setView("inbox");
    const flags = checks.filter((c) => c.severity === "blocker").length;
    const item = assetReview.submit({
      key: reviewKey,
      title: p.title,
      kind: "email",
      brand: brandName,
      spec: `${p.sender.long} · ${p.included.length} blocks · ${p.links.length} links`,
      version: `Version ${publishedCount + 1}`,
      ownerId: assetReview.me,
      /* Illustration: the email's own header, as its card in the queue. */
      preview: { gradient: "linear-gradient(150deg, #3b2370, #1f2937)", badge: "Approved Email", metric: purpose.label, metricLabel: `${emailPackage(p).filter((r) => !r.already).length} items for MLR` },
      stages: assetReview.stages,
      check: { flags, summary: flags ? "A link has no destination." : "Every claim resolves to an approved source." },
    });
    showToast(item.status === "in_review" ? `Submitted for review · ${item.stages[item.stageIndex]?.name} is next` : `Published · Export it to your ${p.professional ? "CRM" : "email platform"} when it's approved`);
  };

  const versions: AssetVersion[] = submitted
    ? [{ label: `Version ${Math.max(1, publishedCount)}`, state: "current", at: "Published just now" }]
    : [{ label: "Draft v1", state: "current", at: "Saved just now" }];

  /* ── Rail: the email's parts, top to bottom ── */
  const rail = (
    <aside className="flex w-60 min-h-0 shrink-0 flex-col overflow-y-auto border-r border-hair bg-subtle">
      <div className="flex h-11 shrink-0 items-center border-b border-hair bg-card px-3">
        <span className="text-micro font-bold uppercase tracking-[0.12em] text-ink-3">Email · {p.zones.length} parts</span>
      </div>
      <div className="space-y-1 p-2.5">
        {p.zones.map((id) => {
          const media = id.startsWith("m:") ? email.media.find((m) => `m:${m.uid}` === id) : undefined;
          const t = p.zoneType(id);
          return (
            <div key={id}>
              <button
                type="button"
                onClick={() => {
                  setSelected(id);
                  setView("zones");
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-control border px-2.5 py-2 text-left transition",
                  sel === id ? "border-brand bg-card ring-2 ring-brand/15" : "border-transparent hover:border-hair hover:bg-card",
                  media && "pl-6"
                )}
              >
                <span className={cn("size-2 shrink-0 rounded-sm", DOT[t])} />
                <span className="min-w-0 flex-1 truncate text-label font-bold text-ink">{media ? media.title : ZONE_NAME[id as EmailZone]}</span>
                {media?.from === "upload" && <span className="rounded-chip bg-warn-bg px-1 text-micro font-extrabold text-warn">New</span>}
              </button>
              {id === "blocks" && !submitted && (
                <div className="space-y-0.5 py-1 pl-7">
                  {p.blocks.map((b) => {
                    const on = !email.offBlocks.includes(b.id);
                    return (
                      <label key={b.id} className="flex cursor-pointer items-center gap-1.5 py-0.5 text-label text-ink-3">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => {
                            setEmail({ offBlocks: on ? [...email.offBlocks, b.id] : email.offBlocks.filter((x) => x !== b.id) });
                            edited();
                          }}
                          className="accent-brand"
                        />
                        <span className="truncate">{b.title}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );

  const toolbar = submitted ? (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-hair bg-card px-4">
      <span className="shrink-0 text-label font-bold text-ink">Shared review</span>
      <span className="truncate text-label text-ink-3">{exportedTo ? `Exported to ${exportedTo}.${p.professional ? " Senders see it after their next sync." : ""}` : approved ? `Approved. Export it to your ${p.professional ? "CRM" : "email platform"}.` : "In MLR review. Locked until it's approved."}</span>
    </div>
  ) : (
    <EditorToolbar
      selection={toolbarSelection}
      menus={["image", "video", "link"]}
      onInsert={(menu, option) => {
        const request = insertRequestFor(option);
        if (request) setInsert({ request });
        else {
          handToChat({ id: `insert-${option}`, label: `Insert ${option.toLowerCase()}`, detail: "In the email" }, `Add ${option.toLowerCase()} to the email `);
          showToast(`${option} added to chat`);
        }
      }}
    />
  );

  const main = (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#eef1ed]">
      {submitted && assetReview.item && <ReviewStatusBanner item={assetReview.item} onEdit={() => setStudioMode("editor")} />}
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 px-4 pt-4">
        <Segmented>
          {(submitted ? (["inbox", "phone", "nopics"] as EmailView[]) : (["zones", "inbox", "phone", "nopics"] as EmailView[])).map((v) => (
            <SegmentedButton key={v} active={view === v} onClick={() => setView(v)}>
              {v === "zones" ? (p.isHQ ? "What's locked" : `What ${who} can change`) : v === "inbox" ? (p.professional ? "Doctor's inbox" : "Inbox") : v === "phone" ? "Phone" : "Images off"}
            </SegmentedButton>
          ))}
        </Segmented>
      </div>
      {view === "zones" && (
        <div className="flex shrink-0 flex-wrap justify-center gap-3 px-4 pt-2.5 text-label text-ink-3">
          {(["lock", "auto", "choose", "type"] as ZoneType[]).map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-sm", DOT[t])} />
              {t === "auto" ? (p.professional ? "Filled in from the CRM" : "Filled in automatically") : ZONE_TYPE_LABEL[t]}
            </span>
          ))}
        </div>
      )}
      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto p-5" onClick={() => setSelected(null)}>
        <EmailCanvas project={p} view={view} selected={sel} onSelect={(id) => setSelected(id)} />
      </div>
    </section>
  );

  /* ── Panel: Chat, Claims and Links ── */
  const tab: PanelTab = submitted && panelTab === "assistant" ? "evidence" : panelTab;
  const panel = (
    <>
      <div className="border-b border-hair bg-subtle p-2.5">
        <div className={cn(INSPECTOR_TAB_STRIP, "bg-[#e6ebe6] shadow-inner-xs")}>
          {!submitted && (
            <InspectorTabButton tab="assistant" current={tab} onClick={setPanelTab} icon={MessageCircle} badge={<span className="size-1.5 shrink-0 rounded-full bg-ok" />}>
              Chat
            </InspectorTabButton>
          )}
          <InspectorTabButton tab="evidence" current={tab} onClick={setPanelTab} icon={ShieldCheck} count={p.claimIds.length}>
            Claims
          </InspectorTabButton>
          <InspectorTabButton tab="links" current={tab} onClick={setPanelTab} icon={Link2} count={p.links.length}>
            Links
          </InspectorTabButton>
        </div>
      </div>
      {tab === "assistant" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-hair bg-tint px-3.5 py-2 text-label font-bold text-brand-deep">
            <MessageSquare className="size-3.5 shrink-0" />
            <span className="truncate">{sel ? (selMedia ? selMedia.title : ZONE_NAME[sel as EmailZone]) : "The whole email"}</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={cn("flex max-w-full gap-2.5", msg.role === "user" ? "ml-auto justify-end" : "mr-auto")}>
                {msg.role === "swishx" && <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand text-caption font-bold text-white shadow-2xs">SX</div>}
                <div className="max-w-[85%] space-y-2">
                  <div className={cn("rounded-panel p-3 text-body leading-relaxed", msg.role === "user" ? "rounded-tr-xs bg-brand text-white" : "rounded-tl-xs border border-hair bg-subtle text-ink")}>
                    <FormattedMessageText text={msg.text} />
                  </div>
                  {msg.role === "swishx" && idx === chatMessages.length - 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Make the opening shorter", "Lock the blocks", "Remove the note"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSendChat(chip)}
                          className="cursor-pointer rounded-chip border border-hair-2 bg-card px-2.5 py-1 text-label font-semibold text-ink-2 shadow-2xs transition hover:bg-tint hover:text-brand"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {expiring.length > 0 && !email.offBlocks.includes(expiring[0].id) && (
              <div className="flex gap-2.5">
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand text-caption font-bold text-white shadow-2xs">SX</div>
                <div className="max-w-[85%] space-y-2 rounded-panel rounded-tl-xs border border-warn-line bg-warn-bg p-3 text-body leading-relaxed text-ink">
                  <p>
                    The <b>{expiring[0].title}</b> block cites a source whose approval ends on {expiring[0].expires}. Emails using it will be blocked from that day. Leave it out?
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" onClick={() => { setEmail({ offBlocks: [...email.offBlocks, expiring[0].id] }); edited(); showToast("Left out"); }}>
                      Leave it out
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
          <div className="shrink-0 space-y-2 border-t border-hair bg-card p-3">
            <ChatComposer
              value={chatInput}
              onChange={setChatInput}
              onSubmit={() => handleSendChat()}
              placeholder="Ask SwishX or request a change…"
              attachControl={<ComposerAttachButton onClick={chatFiles.open} label="Attach a file" />}
            >
              <ChatAttachmentRow attachments={chatFiles} />
              <ComposerTray
                items={chatContexts.map((c) => ({ id: c.id, icon: <MessageSquare className="size-3" />, label: c.label, detail: c.detail }))}
                onRemove={(id) => setChatContexts((prev) => prev.filter((c) => c.id !== id))}
              />
            </ChatComposer>
          </div>
        </div>
      ) : tab === "evidence" ? (
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="flex items-center justify-between border-b border-hair pb-2.5">
            <div>
              <div className="text-micro font-extrabold uppercase tracking-[0.12em] text-ink-3">Compliance grounding</div>
              <h2 className="mt-0.5 text-body-lg font-[800] text-ink">
                {p.claimIds.length} approved {p.claimIds.length === 1 ? "claim" : "claims"}
              </h2>
            </div>
            <span className="rounded-chip border border-ok-line bg-ok-bg px-2.5 py-0.5 text-micro font-bold text-ok">✓ PromoMats verified</span>
          </div>
          {p.blocks.map((b) => {
            const used = !email.offBlocks.includes(b.id);
            return (
              <div key={b.id} className={cn("rounded-control border p-3", b.expires ? "border-warn-line bg-warn-bg" : "border-hair bg-canvas")}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="rounded-glyph bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep">{b.claimId}</span>
                  <span className={cn("text-caption font-bold", used ? "text-ok" : "text-ink-4")}>{used ? "✓ In this email" : "Approved · not used"}</span>
                </div>
                <h4 className="text-body font-bold text-ink">{b.text}</h4>
                <p className="mt-1 text-caption text-ink-3">
                  {b.source}
                  {b.expires ? ` · approval ends ${b.expires}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => setDossier(dossierFor(brandName, moleculeFor(brandName)))}
                  className="focus-ring mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-glyph px-1.5 py-1 text-caption font-bold text-ink-4 transition hover:bg-tint hover:text-brand-deep"
                >
                  <BookOpen className="size-3" />
                  See in dossier
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          <div className="border-b border-hair pb-2.5">
            <div className="text-micro font-extrabold uppercase tracking-[0.12em] text-ink-3">Every link is tracked</div>
            <h2 className="mt-0.5 text-body-lg font-[800] text-ink">{p.links.length} links</h2>
          </div>
          {p.links.map((l) => {
            const s = LINK_STATUS[l.status];
            return (
              <div key={l.label} className={cn("rounded-control border p-3", l.status === "missing" ? "border-danger-line bg-danger-bg" : "border-hair bg-canvas")}>
                <div className="flex items-center justify-between gap-2">
                  <b className="min-w-0 truncate text-body text-ink">{l.label}</b>
                  <span className={cn("shrink-0 rounded-chip px-1.5 py-0.5 text-micro font-extrabold", TONE[s.tone])}>{s.label}</span>
                </div>
                <p className="mt-1 break-all text-caption text-ink-3">{l.dest}</p>
                <p className="mt-1 font-mono text-caption text-ink-4">LinkName={l.tag}</p>
                {l.cta && l.status === "missing" && !submitted && (
                  <Field size="sm" className="mt-2" placeholder="https://" value={email.ctaUrl} onChange={(e) => setEmail({ ctaUrl: e.target.value.trim() })} aria-label="Page the button opens" />
                )}
              </div>
            );
          })}
          <p className="text-label text-ink-3">{p.unbranded ? "" : p.professional ? "Prescribing Information, safety information, " : "Medication Guide, safety information, "}unsubscribe and privacy links are added by SwishX.</p>
        </div>
      )}
    </>
  );

  return (
    <WorkbenchLayout
      className="bg-[#edf0ed]"
      panelOpen={copilotPanelOpen}
      onPanelOpenChange={setCopilotPanelOpen}
      panelWidth={copilotPanelWidth}
      onPanelWidthChange={setCopilotPanelWidth}
      panelStorageKey="swishx.copilotPanelWidth"
      autoCollapsePanelBelow="laptop"
      panelMinCanvas={240 + 420}
      header={
        <ScreenHeader onClose={() => (submitted ? exit.leave() : exit.requestExit())}>
          <SwishXMark compact />
          <div className="mx-3 h-5 w-px bg-hair" />
          <div className="min-w-0">
            <ProjectTitle kind="email" fallback={p.title} className="text-body font-[800]" />
            <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
              {submitted ? "Published" : "Saved just now"} · {p.sender.long} · {p.included.length} blocks · {p.links.length} links
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!submitted && <ProjectMenu kind="email" fallback={p.title} />}
            <button
              type="button"
              onClick={toggleCopilotPanel}
              className={cn(
                "grid size-8 cursor-pointer place-items-center rounded-chip border transition-colors",
                copilotPanelOpen ? "border-hair-2 bg-black/5 text-ink hover:bg-black/10" : "border-hair-2 bg-card text-ink-3 shadow-2xs hover:border-brand hover:text-ink"
              )}
              title={copilotPanelOpen ? "Collapse sidebar (⌘\\)" : "Expand sidebar (⌘\\)"}
              aria-label="Toggle sidebar"
            >
              <PanelRight className="size-4" />
            </button>
            <VersionChip versions={versions} variant="button" />
            {submitted ? (
              <>
                {assetReview.canEdit && (
                  <Button size="sm" variant="secondary" onClick={() => setStudioMode("editor")} className="gap-1.5 px-3.5 font-bold">
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                )}
                {assetReview.canEdit && (
                  <Button size="sm" onClick={() => setExportOpen(true)} disabled={!approved} title={approved ? undefined : "Opens once the review chain approves it"} className="gap-1.5 px-4 font-bold">
                    <Download className="size-3.5" />
                    {p.professional ? "Export to CRM" : "Export to email platform"}
                  </Button>
                )}
              </>
            ) : (
              <>
                {!p.isHQ && (
                  <Button size="sm" variant="secondary" onClick={() => setRepOpen(true)} className="gap-1.5 px-3.5 font-bold">
                    <Send className="size-3.5" />
                    Try it as {SENDER_AS[email.sender]}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setPublishOpen(true)}
                  disabled={p.cta.status === "missing"}
                  title={p.cta.status === "missing" ? `Add the page "${p.ctaText}" opens first` : undefined}
                  className="gap-1.5 px-4 font-bold disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <LogoMark size={14} />
                  Preview and Publish
                </Button>
              </>
            )}
          </div>
        </ScreenHeader>
      }
      toolbar={toolbar}
      rail={rail}
      main={main}
      panel={panel}
      overlay={
        <>
          <Toast message={toastMessage} open={toastOpen} tone={toastTone} />
          {insert && (
            <EmailInsertDialogs
              request={insert.request}
              brandName={brandName}
              audience={p.audience}
              lead={p.included[0]}
              onClose={() => setInsert(null)}
              onInsert={(m) => {
                const media = useEmailStore.getState().media;
                const at = insert.replace ? media.findIndex((x) => x.uid === insert.replace) : -1;
                setEmail({ media: at >= 0 ? media.map((x, i) => (i === at ? m : x)) : [...media, m] });
                setSelected(`m:${m.uid}`);
                setView("zones");
                setInsert(null);
                edited();
                showToast(`${m.title} ${at >= 0 ? "replaced" : "inserted"}`);
              }}
            />
          )}
          {repOpen && <EmailRepPreview project={p} onClose={() => setRepOpen(false)} />}
          {publishOpen && (
            <PreviewPublishModal
              title={p.title}
              version={`Version ${publishedCount + 1}`}
              kind="email"
              review={mlrReview}
              checks={checks}
              submit={
                assetReview.stages.length
                  ? { label: assetReview.item?.status === "changes" ? "Resubmit for review" : "Submit for review", route: assetReview.stages.map((st) => st.name) }
                  : undefined
              }
              onClose={() => setPublishOpen(false)}
              onPublish={publish}
              preview={<EmailPublishPreview p={p} />}
            />
          )}
          {exportOpen && (
            <EmailExportModal
              p={p}
              onClose={() => setExportOpen(false)}
              onExported={(name) => {
                setExportOpen(false);
                setExportedTo(name);
                showToast(`Exported to ${name}.${p.professional ? " Senders see it after their next sync." : ""}`);
              }}
            />
          )}
          <DossierReaderModal dossier={dossier} onClose={() => setDossier(null)} />
          <SaveOrDiscardDialog
            open={!!exit.pending}
            destinationLabel={exit.pending?.label}
            onSaveDraft={() => exit.resolve(true)}
            onDiscard={() => exit.resolve(false)}
            onCancel={exit.cancel}
          />
        </>
      }
    />
  );
}
