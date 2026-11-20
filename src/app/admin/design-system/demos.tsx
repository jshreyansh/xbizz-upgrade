"use client";

import { useState, type ReactNode } from "react";
import {
  FileText, Image as ImageIcon, Layers, ListChecks, Lock, MessageSquare, Palette,
  RefreshCw, ShieldCheck, Sparkles, Stethoscope, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Panel } from "@/components/ui/panel";
import { Row, Stack } from "@/components/ui/stack";
import { Surface } from "@/components/ui/surface";
import { Label, Text } from "@/components/ui/text";
import { BrandLoader } from "@/components/ui/brand-loader";
import { LogoMark } from "@/components/ui/logo-mark";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { ChannelLogo } from "@/components/ui/channel-logo";
import { AudienceIcon, ChannelIcon } from "@/components/ui/select-icons";
import { MultiSelectMenu, SelectMenu } from "@/components/ui/select-menu";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { PageHeading } from "@/components/patterns/page-heading";
import { Toast, useToast } from "@/components/patterns/toast";
import { SaveOrDiscardDialog } from "@/components/patterns/save-or-discard-dialog";
import { ChatComposer, ComposerAttachButton } from "@/components/patterns/chat-composer";
import { ComposerTray, type ComposerTrayItem } from "@/components/patterns/composer-tray";
import { CreateTile } from "@/components/patterns/create-tile";
import { LibraryTile, TileOpen } from "@/components/patterns/library-tile";
import { PickChip, PickEmpty, PickList, PickRow, PickSearch } from "@/components/patterns/pick-list";
import { RequestModal } from "@/components/patterns/request-modal";
import { DetailHeader, type DetailTab } from "@/components/patterns/detail-header";
import { DataList } from "@/components/patterns/data-list";
import { FilterBar } from "@/components/patterns/filter-bar";
import { PageTabs } from "@/components/patterns/page-tabs";
import { PaginationBar, usePaged } from "@/components/patterns/pagination";
import { LibraryModalGoTo, LibraryModalHeader } from "@/components/patterns/library-modal";
import { TileList } from "@/components/patterns/tile-list";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { EmptyState } from "@/components/patterns/empty-state";
import { BackLink } from "@/components/patterns/back-link";
import { Stat } from "@/components/patterns/stat";
import { SectionHeading } from "@/components/patterns/section-heading";
import { RowCard } from "@/components/patterns/row-card";
import { DropZone } from "@/components/patterns/drop-zone";
import {
  InspectorTabButton, InspectorTabStrip, PlanChatHeader, ReadOnlyChatNote,
} from "@/components/patterns/inspector-tabs";
import { useTokenValues } from "./token-table";

/* ── Shared page furniture ────────────────────────────────────────────── */

/** One component on the page: its name, what to use it for, and the live thing. */
export function Demo({ name, use, children, note }: {
  name: string;
  /** "Use it for …", sentence case. */
  use: string;
  /** Anything a builder should know beyond what it is for. */
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-hair pb-6 last:border-0 last:pb-0">
      <Row gap={2} align="baseline" wrap>
        <Text size="body-lg" weight="bold" className="font-mono">{name}</Text>
        <Text size="body" tone="subtle">{use}</Text>
      </Row>
      {note && <Text as="p" size="caption" tone="muted" className="max-w-(--container-measure)">{note}</Text>}
      <div className="mt-1">{children}</div>
    </div>
  );
}

/** A grey well that stands for real content in a demo. */
function Placeholder({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`grid place-items-center rounded-control border border-hair bg-subtle px-3 py-2 ${className ?? ""}`}>
      <Text size="caption" tone="subtle">{children}</Text>
    </div>
  );
}

/* ── Tokens the colour section was missing ────────────────────────────── */

export const CHROME = ["--color-scroll-thumb", "--color-rail"];

/** Non-colour tokens that are values rather than swatches. */
export function ValueTokens({ names }: { names: { name: string; use: string }[] }) {
  const values = useTokenValues(names.map((n) => n.name));
  return (
    <div className="flex flex-col gap-1.5">
      {names.map(({ name, use }) => (
        <div key={name} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-control border border-hair bg-subtle px-3 py-2">
          <Text size="caption" weight="bold" className="font-mono">{name}</Text>
          <Text size="micro" tone={values[name] ? "faint" : "danger"} className="font-mono" tabular>
            {values[name] || "not defined"}
          </Text>
          <Text size="micro" tone="subtle" className="ml-auto">{use}</Text>
        </div>
      ))}
    </div>
  );
}

/* ── Type: the props the scale table does not show ────────────────────── */

export function TypeVariants() {
  return (
    <Stack gap={4}>
      <div className="flex flex-wrap gap-4 rounded-panel bg-ink p-3">
        <Text size="body" tone="inverse" weight="semibold">tone=&quot;inverse&quot; on a dark ground</Text>
        <Text size="body" tone="inverse" className="opacity-70">inverse, softened with opacity</Text>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stack gap={1}>
          <Label size="micro">leading</Label>
          {(["none", "tight", "snug", "normal", "relaxed"] as const).map((l) => (
            <Text key={l} as="p" size="body" leading={l} className="max-w-[40ch] border-l-2 border-tint-line pl-2">
              {l}: Velmora is indicated for adults with HER2-positive breast cancer.
            </Text>
          ))}
        </Stack>
        <Stack gap={1}>
          <Label size="micro">tracking, uppercase, clamp, px</Label>
          {(["tighter", "tight", "normal", "wide", "wider"] as const).map((t) => (
            <Text key={t} size="body-lg" weight="bold" tracking={t}>{t} Oncology Kit</Text>
          ))}
          <Text size="micro" weight="bold" tone="subtle" uppercase tracking="wider">uppercase is a style, never typed copy</Text>
          <Text as="p" size="body" tone="muted" clamp={2} className="max-w-[36ch]">
            clamp=&#123;2&#125;: Grounded in the approved label, every claim in this email carries its reference, and anything new waits for MLR review before it reaches an HCP.
          </Text>
          <Text px={42} weight="extrabold" tracking="tight" leading="none">42</Text>
          <Text size="micro" tone="subtle">px=&#123;42&#125;: the greppable one-off</Text>
        </Stack>
      </div>
    </Stack>
  );
}

/* ── Motion and utility classes ───────────────────────────────────────── */

const MOTION: { cls: string; use: string }[] = [
  { cls: "rise-in", use: "a single block arriving: a card, a result" },
  { cls: "rise-in-stagger", use: "tiles in a grid; pair with an animationDelay per tile" },
  { cls: "stagger-children", use: "on a list's parent: rows arrive one at a time, up to 12" },
  { cls: "page-enter", use: "the root of a page, once" },
  { cls: "stage-in", use: "a stage of a flow replacing the previous one" },
  { cls: "select-pop", use: "a menu opening below its trigger (-above when it flips up)" },
];

export function MotionDemos() {
  const [run, setRun] = useState(0);
  return (
    <Stack gap={6}>
      <div>
        <Row gap={2} align="center" className="mb-2">
          <Label size="micro">Entrances</Label>
          <Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}><RefreshCw className="size-3.5" />Replay</Button>
        </Row>
        <div key={run} className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {MOTION.map((m) => (
            <div key={m.cls} className={`${m.cls} rounded-control border border-hair bg-card p-3 shadow-hair`}>
              <Text size="body" weight="bold" className="block font-mono">.{m.cls}</Text>
              <Text size="caption" tone="subtle">{m.use}</Text>
            </div>
          ))}
        </div>
        <div key={`s${run}`} className="stagger-children mt-3 flex gap-2">
          {["Brief", "Plan", "Script", "Storyboard", "Review"].map((s) => (
            <Chip key={s} tone="neutral">{s}</Chip>
          ))}
        </div>
        <Text size="caption" tone="muted" className="mt-2 block">
          Also: <code>.select-pop-out</code> and <code>.select-pop-out-above</code> for the close, <code>.step-transition</code>,
          and <code>.animate-brand-spin</code> (BrandLoader). Every entrance honours prefers-reduced-motion.
        </Text>
      </div>

      <div>
        <Label size="micro" className="mb-2 block">Working states</Label>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="shimmer flex flex-col gap-2 rounded-control border border-hair bg-card p-3">
            <div className="h-3 w-16 rounded-chip bg-hair" />
            <div className="h-3 w-full rounded-chip bg-hair" />
            <Text size="micro" tone="subtle" className="font-mono">.shimmer, a light tile loading</Text>
          </div>
          <div className="shimmer-strong grid h-[86px] place-items-end rounded-control bg-ink p-3">
            <Text size="micro" tone="inverse" className="font-mono">.shimmer-strong, over footage</Text>
          </div>
          <div className="intake-sweep grid h-[86px] place-items-end rounded-control border border-hair bg-card p-3">
            <Text size="micro" tone="subtle" className="font-mono">.intake-sweep, waiting on answers</Text>
          </div>
          <div className="flex h-[86px] flex-col justify-end rounded-control border border-hair bg-card p-3">
            <Text size="body" weight="bold" className="dot-cycle">Generating<span>.</span><span>.</span><span>.</span></Text>
            <Text size="micro" tone="subtle" className="font-mono">.dot-cycle</Text>
          </div>
        </div>
        <Text size="caption" tone="muted" className="mt-2 block">
          <code>.verified-sheen</code> is the slow glint on the one panel that is meant to read as checked; it needs a
          positioned parent with overflow hidden.
        </Text>
      </div>

      <div>
        <Label size="micro" className="mb-2 block">Utilities</Label>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <Stack gap={1}>
            <button type="button" className="focus-ring rounded-control border border-hair-2 bg-card px-3 py-2 text-body font-semibold">
              Tab to me
            </button>
            <Text size="micro" tone="subtle"><code>.focus-ring</code>: the brand outline on keyboard focus only</Text>
          </Stack>
          <Stack gap={1}>
            <div className="flex gap-2">
              <div className="size-12 rounded-card bg-tint" />
              <div className="squircle size-12 rounded-card bg-tint" />
            </div>
            <Text size="micro" tone="subtle"><code>.squircle</code> (right) vs round. Also <code>.squircle-control/-panel/-card</code>, which set the radius too</Text>
          </Stack>
          <Stack gap={1}>
            <div className="canvas-grid h-12 rounded-control" />
            <Text size="micro" tone="subtle"><code>.canvas-grid</code>: the editing ground behind a slide or frame</Text>
          </Stack>
          <Stack gap={1}>
            <div className="soft-noise h-12 rounded-control bg-tint" />
            <Text size="micro" tone="subtle"><code>.soft-noise</code>: grain over a flat brand fill</Text>
          </Stack>
        </div>
      </div>
    </Stack>
  );
}

/* ── Deprecated aliases ───────────────────────────────────────────────── */

const ALIASES: [string, string][] = [
  ["--brand, --brand-2, --brand-deep, --brand-ink, --brand-light", "bg-brand, text-brand-deep …"],
  ["--canvas, --card, --surface, --surface-subtle, --background", "bg-canvas, bg-card, bg-subtle"],
  ["--ink, --ink-2, --ink-3, --ink-4, --ink-muted", "text-ink … text-ink-4"],
  ["--hair, --hair-2, --hair-3, --line, --line-strong", "border-hair, border-hair-2"],
  ["--tint, --tint-2, --tint-line, --tint-strong, --brand-soft, --brand-strong", "bg-tint, border-tint-line, bg-tint-strong"],
  ["--ok*, --warn*, --warning*, --danger*, --amber-bg, --amber-line, --amber-text", "ok / warn / danger utilities"],
  ["--blue, --violet, --amber", "text-accent-blue, -violet, -amber"],
  ["--r-s, --r, --r-l, --r-xl", "rounded-chip, -control, -panel, -card"],
  ["--squircle-control, --squircle-panel, --squircle-card", ".squircle-control … or rounded-* plus .squircle"],
  ["--sh-1, --sh-2, --sh-3, --sh-4", "shadow-hair, -soft, -float, -modal"],
  ["--e, --spring", "ease-swish, ease-spring"],
  ["--lime, --live, --canvas-grid", "bg-lime, bg-live, bg-canvas-grid"],
];

export function DeprecatedAliases() {
  return (
    <Stack gap={2}>
      {ALIASES.map(([old, now]) => (
        <div key={old} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-hair py-1.5 last:border-0">
          <Text size="caption" tone="muted" className="font-mono line-through decoration-hair-3">{old}</Text>
          <Text size="caption" weight="semibold" className="ml-auto font-mono">{now}</Text>
        </div>
      ))}
      <Surface tone="warn" radius="control" padding="sm" className="mt-2">
        <Text as="p" size="body" weight="semibold">--shadow-sm and --shadow-lg are not aliases</Text>
        <Text as="p" size="caption" tone="muted">
          They override Tailwind&apos;s own scale, so every shadow-sm already renders as shadow-hair and every
          shadow-lg as shadow-float. Changing either restyles every call site at once. Write shadow-hair or
          shadow-float in new work.
        </Text>
      </Surface>
    </Stack>
  );
}

/* ── Primitives not shown before ──────────────────────────────────────── */

const MODAL_SIZES = ["sm", "md", "lg", "xl"] as const;
const CHANNELS = ["Email", "LinkedIn", "Instagram", "YouTube", "Website", "Congress / event", "Internal presentation"];
const AUDIENCES = ["HCP", "Field team", "Payer", "Patient"];

export function PrimitiveDemos() {
  const [modalSize, setModalSize] = useState<(typeof MODAL_SIZES)[number] | null>(null);
  const [channel, setChannel] = useState("Email");
  const [audience, setAudience] = useState("HCP");
  const [topics, setTopics] = useState<string[]>(["Efficacy"]);

  return (
    <Stack gap={6}>
      <Demo name="Chip" use="tone neutral, weight and iconLeft, added for the hand-rolled grey tag">
        <Row gap={2} wrap align="center">
          <Chip tone="neutral" iconLeft={<Lock className="size-3" />} weight="bold">Read-Only</Chip>
          <Chip tone="neutral" size="xs" weight="bold">Coming Soon</Chip>
          <Chip tone="neutral" selected onClick={() => {}}>neutral, selected</Chip>
          <Chip tone="danger">danger, border-danger-line</Chip>
          <Chip tone="ok" size="xs" weight="bold">Online</Chip>
        </Row>
      </Demo>

      <Demo name="Surface" use="the remaining tone, elevation and radius steps">
        <Row gap={3} wrap>
          <Surface tone="transparent" padding="md"><Text size="micro" weight="semibold">transparent</Text></Surface>
          {(["none", "hair", "soft", "float", "modal"] as const).map((e) => (
            <Surface key={e} elevation={e} padding="md"><Text size="micro" weight="semibold">elevation {e}</Text></Surface>
          ))}
          {(["chip", "control", "panel", "card"] as const).map((r) => (
            <Surface key={r} radius={r} tone="tint" padding="md"><Text size="micro" weight="semibold">radius {r}</Text></Surface>
          ))}
        </Row>
      </Demo>

      <Demo name="Field size" use="sm for toolbars and dense rows, md (default) for forms">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field size="sm" label="Size sm" placeholder="Search claims…" />
          <Field size="md" label="Size md" placeholder="Brand name, e.g. Velmora" />
        </div>
      </Demo>

      <Demo name="Modal size" use="sm for a confirm, md for a form, lg for a picker, xl for a reader">
        <Row gap={2} wrap>
          {MODAL_SIZES.map((s) => (
            <Button key={s} size="sm" variant="secondary" onClick={() => setModalSize(s)}>Open {s}</Button>
          ))}
        </Row>
        <Modal
          open={modalSize !== null}
          onClose={() => setModalSize(null)}
          size={modalSize ?? "md"}
          title={`Modal, size ${modalSize}`}
          description="The width is the only thing the size changes."
          footer={<Button onClick={() => setModalSize(null)}>Done</Button>}
        >
          <Text size="body" tone="muted">sm 420px · md 620px · lg 820px · xl 1040px.</Text>
        </Modal>
      </Demo>

      <Demo name="Panel" use="any bounded region with a pinned header and footer and one scrolling body">
        <Surface className="h-56 overflow-hidden">
          <Panel title="Approved Claims" description="Scroll the body; the header and footer stay put." className="h-full"
            footer={<Button size="sm">Add to Email</Button>}>
            <Stack gap={1.5}>
              {Array.from({ length: 8 }, (_, i) => <Placeholder key={i}>Claim {i + 1}</Placeholder>)}
            </Stack>
          </Panel>
        </Surface>
      </Demo>

      <Demo name="SelectMenu / MultiSelectMenu" use="every dropdown; never a native select" note="Sizes: lg for form-first screens, md for settings forms, sm for toolbars. renderIcon puts a glyph on each option.">
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectMenu ariaLabel="Channel" value={channel} options={CHANNELS} onChange={setChannel} renderIcon={(v) => <ChannelIcon value={v} />} />
          <SelectMenu ariaLabel="Audience" size="md" value={audience} options={AUDIENCES} onChange={setAudience} renderIcon={(v) => <AudienceIcon value={v} />} />
          <MultiSelectMenu ariaLabel="Focus topics" values={topics} options={["Efficacy", "Safety", "Dosing", "Mechanism of action"]} onChange={setTopics} />
        </div>
      </Demo>

      <Demo name="ChannelIcon / AudienceIcon" use="the glyph for a channel or audience value in a menu or a row">
        <Row gap={4} wrap align="center">
          {CHANNELS.map((c) => <Row key={c} gap={1.5} align="center"><ChannelIcon value={c} /><Text size="caption" tone="muted">{c}</Text></Row>)}
          {AUDIENCES.map((a) => <Row key={a} gap={1.5} align="center"><AudienceIcon value={a} /><Text size="caption" tone="muted">{a}</Text></Row>)}
        </Row>
      </Demo>

      <Demo name="ChannelLogo" use="the CRM or email platform an Approved Email goes out through">
        <Row gap={3} wrap align="center">
          {(["veeva", "oce", "sfdc", "sfmc", "hubspot", "braze", "html"] as const).map((id) => <ChannelLogo key={id} id={id} />)}
        </Row>
      </Demo>

      <Demo name="SwishXMark / LogoMark / BrandLoader" use="the wordmark in chrome, the bare knot anywhere, and the branded working state">
        <Row gap={6} wrap align="center">
          <SwishXMark />
          <SwishXMark compact />
          <LogoMark size={28} className="text-brand" />
          <div className="rounded-control bg-ink p-2"><LogoMark size={28} className="text-white" /></div>
          <BrandLoader size={52} label="Reading your file…" />
        </Row>
      </Demo>

      <Demo name="Container" use="a centred column for new pages; existing max-w values were left as they are">
        <Stack gap={1.5}>
          {(["narrow", "measure", "wide", "page"] as const).map((w) => (
            <Container key={w} width={w} gutter={false}>
              <Placeholder>width=&quot;{w}&quot;</Placeholder>
            </Container>
          ))}
        </Stack>
      </Demo>

      <Demo name="Stack / Row" use="spacing as a gap on the parent, never margins on children">
        <div className="grid gap-4 sm:grid-cols-2">
          <Stack gap={2}><Placeholder>Stack gap=2</Placeholder><Placeholder>child</Placeholder></Stack>
          <Row gap={2} align="center" justify="between"><Placeholder>Row justify=between</Placeholder><Button size="sm">Action</Button></Row>
        </div>
      </Demo>

      <Demo name="PharmaSignature" use="unused: 0 imports" note="The line-art molecule-and-pulse illustration in ui/pharma-signature.tsx has no call site. Kept until someone decides; do not build on it without checking it still belongs.">
        <Chip tone="warn" size="xs" weight="bold">Unused</Chip>
      </Demo>
    </Stack>
  );
}

/* ── Patterns not shown before ────────────────────────────────────────── */

const TRAY: ComposerTrayItem[] = [
  { id: "a", icon: <Layers className="size-3.5" />, label: "Scene 2 · Headline", detail: "Velmora: proven progression-free survival" },
  { id: "b", icon: <MessageSquare className="size-3.5" />, label: "Suggestion", quote: "Lead with the HCP outcome, not the mechanism." },
];

interface Dossier { id: string; name: string; area: string; sources: number }
const DOSSIERS: Dossier[] = [
  { id: "1", name: "HER2-positive breast cancer", area: "Oncology", sources: 42 },
  { id: "2", name: "Non-small cell lung cancer", area: "Oncology", sources: 37 },
  { id: "3", name: "Heart failure", area: "Cardiology", sources: 29 },
  { id: "4", name: "Multiple sclerosis", area: "Neurology", sources: 18 },
  { id: "5", name: "Asthma", area: "Respiratory", sources: 24 },
  { id: "6", name: "Atopic dermatitis", area: "Dermatology", sources: 15 },
];

type DetailKey = "dossier" | "claims" | "images";
const DETAIL_TABS: DetailTab<DetailKey>[] = [
  { key: "dossier", label: "Dossier", icon: FileText },
  { key: "claims", label: "Claims", icon: ListChecks, count: 214 },
  { key: "images", label: "Images", icon: ImageIcon, count: 36 },
];

export function PatternDemos() {
  const [seg, setSeg] = useState("grid");
  const { message, open, tone, showToast } = useToast();
  const [leaving, setLeaving] = useState(false);
  const [draft, setDraft] = useState("");
  const [tray, setTray] = useState(TRAY);
  const [pick, setPick] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailKey>("dossier");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [status, setStatus] = useState("all");
  const paged = usePaged(DOSSIERS, 2);

  return (
    <Stack gap={6}>
      <Demo name="PageHeading" use="the first thing on every page inside the app shell">
        <PageHeading
          eyebrow="Libraries"
          title="Therapy Library"
          description="Read-only disease dossiers by therapy area, ready to ground unbranded content."
          actions={<Button><Sparkles className="size-4" />New Therapy Dossier</Button>}
        />
      </Demo>

      <Demo name="ScreenHeader" use="the fixed bar across the top of a workspace screen, height --screen-header-h" note="onClose draws the project's ✕ at the far right, the same way on every stage.">
        <div className="overflow-hidden rounded-panel border border-hair">
          <ScreenHeader actions={<Button size="sm" variant="secondary">Share</Button>} onClose={() => {}}>
            <Text size="body-lg" weight="bold">Velmora HCP Email</Text>
          </ScreenHeader>
        </div>
      </Demo>

      <Demo name="Segmented / SegmentedButton" use="a small view switch inside a page or editor: Grid or List, Inbox or Phone. Never a page's main tabs; that is PageTabs">
        <Segmented>
          {[["grid", "Grid"], ["list", "List"], ["archived", "Archived"]].map(([id, label]) => (
            <SegmentedButton key={id} active={seg === id} onClick={() => setSeg(id)}>{label}</SegmentedButton>
          ))}
        </Segmented>
      </Demo>

      <Demo name="PageTabs" use="the one tab row for a page's main split, with counts: All Content kinds, Product Library Drugs and Devices, MLR queues, Settings sections. Give a tab href to navigate by URL">
        <PageTabs ariaLabel="Kind of content" activeId={status} onSelect={setStatus}
          items={[{ id: "all", label: "All", count: 18 }, { id: "approved", label: "Video", count: 6 }, { id: "pending", label: "Docs", count: 4 }, { id: "held", label: "Email", count: 5 }]} />
      </Demo>

      <Demo name="PageTabs + FilterBar" use="a library shelf: the main split as tabs, then search, Filters and the view switch in one bar">
        <Stack gap={3}>
          <PageTabs ariaLabel="Status" activeId={status} onSelect={setStatus}
            items={[{ id: "all", label: "All", count: 214 }, { id: "approved", label: "Approved", count: 180 }, { id: "pending", label: "Pending", count: 27 }, { id: "held", label: "Held Out", count: 7 }]} />
          <FilterBar query={query} onQuery={setQuery} placeholder="Search diseases or therapy areas…"
            filters={[{ id: "area", label: "Therapy Area", value: area, defaultValue: "all", onChange: setArea,
              options: [{ id: "all", label: "All Areas" }, { id: "onc", label: "Oncology" }, { id: "cardio", label: "Cardiology" }] }]} />
        </Stack>
      </Demo>

      <Demo name="DetailHeader" use="the identity card of one thing, with its tabs along the bottom edge">
        <DetailHeader tabs={DETAIL_TABS} active={detailTab} onSelect={setDetailTab}>
          <Row gap={4} align="center" wrap>
            <span className="grid size-12 place-items-center rounded-control bg-tint text-brand-deep"><Stethoscope className="size-6" /></span>
            <div className="min-w-0 flex-1">
              <Text as="h3" size="title" weight="extrabold" tracking="tight" className="block">Velmora</Text>
              <Text size="body" tone="subtle">Trastuzumab biosimilar · Oncology · Updated 3 days ago</Text>
            </div>
            <Row gap={5}><Stat value={214} label="Claims" /><Stat value={5} label="Dossiers" /></Row>
          </Row>
        </DetailHeader>
      </Demo>

      <Demo name="DataList" use="a library in list view: real headers, column widths, pagination at the foot">
        <DataList
          rows={DOSSIERS}
          rowKey={(r) => r.id}
          initialPageSize={3}
          columns={[
            { id: "name", header: "Disease", minWidth: 220, cell: (r) => <Text size="body" weight="semibold">{r.name}</Text> },
            { id: "area", header: "Therapy Area", width: 140, cell: (r) => <Chip tone="neutral" size="xs">{r.area}</Chip> },
            { id: "sources", header: "Sources", width: 90, align: "right", cell: (r) => <Text size="body" tabular>{r.sources}</Text> },
          ]}
        />
      </Demo>

      <Demo name="TileList" use="a list whose rows are objects you open, not values you compare">
        <TileList rows={DOSSIERS.slice(0, 3)} rowKey={(r) => r.id} initialPageSize={3} onRowClick={() => {}}
          renderRow={(r) => (<><Text size="body" weight="bold" className="flex-1">{r.name}</Text><Chip tone="neutral" size="xs">{r.area}</Chip></>)} />
      </Demo>

      <Demo name="PaginationBar / usePaged" use="the foot of any long list; DataList and TileList already include it">
        <Surface className="overflow-hidden"><PaginationBar paged={paged} /></Surface>
      </Demo>

      <Demo name="LibraryTile / TileOpen" use="a card on a library shelf" note="Every slot is optional; a shelf fills what it has.">
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
          <LibraryTile
            media={<div className="h-28" style={{ background: "linear-gradient(135deg,#fd4816,#7a1f06)" }} />}
            mediaTopLeft={<Chip tone="overlay" size="xs">Oncology</Chip>}
            title="Velmora"
            subtitle="Trastuzumab biosimilar"
            chips={<><Chip tone="ok" size="xs">MLR Approved</Chip><Chip tone="neutral" size="xs">5 Dossiers</Chip></>}
            footerLeft="Updated 3 days ago"
            footerRight={<TileOpen />}
            onClick={() => {}}
          />
          <CreateTile title="New Brand" subtitle="Start a brand from its label and approved claims." onSelect={() => {}} />
        </div>
      </Demo>

      <Demo name="CreateTile" use="'start something' as the first tile in the grid it starts (shown above)">
        <Text size="caption" tone="subtle">One plus, centred, on the card surface: it must hold its own beside tiles that lead with imagery.</Text>
      </Demo>

      <Demo name="PickSearch / PickList / PickRow / PickChip / PickEmpty" use="search, then pick one from a short list: a brand, a congress">
        <Stack gap={2} className="max-w-(--container-measure)">
          <PickSearch value={pick} onChange={setPick} placeholder="Search brands…" />
          <PickList>
            {"velmora".includes(pick.toLowerCase()) && (
              <PickRow thumb={<span className="size-9 rounded-control" style={{ background: "linear-gradient(135deg,#fd4816,#b82f0c)" }} />}
                title="Velmora" detail="Trastuzumab biosimilar" chip={<PickChip tone="ok">Verified</PickChip>} onSelect={() => {}} />
            )}
            {"cardivex".includes(pick.toLowerCase()) && (
              <PickRow thumb={<span className="size-9 rounded-control bg-info-bg" />} title="Cardivex" detail="Waiting for label verification"
                chip={<PickChip tone="warn">In Review</PickChip>} onSelect={() => {}} disabled />
            )}
            {!"velmora cardivex".includes(pick.toLowerCase()) && <PickEmpty title="No brands match">Check the spelling, or add it in the Product Library.</PickEmpty>}
          </PickList>
        </Stack>
      </Demo>

      <Demo name="ChatComposer / ComposerAttachButton / ComposerTray" use="the one box you talk to SwishX in, with what is attached above the field">
        <div className="max-w-(--container-measure)">
          <ChatComposer value={draft} onChange={setDraft} onSubmit={() => { setDraft(""); showToast("Sent to SwishX"); }}
            placeholder="Ask SwishX to change something…" canSendEmpty={tray.length > 0}
            attachControl={<ComposerAttachButton onClick={() => setTray(TRAY)} />}>
            <ComposerTray items={tray} onRemove={(id) => setTray((t) => t.filter((x) => x.id !== id))} />
          </ChatComposer>
        </div>
      </Demo>

      <Demo name="Toast / useToast" use="confirming something you just did; it comes down from the top">
        <Row gap={2}>
          <Button size="sm" variant="secondary" onClick={() => showToast("Added to the chat")}>Show Done</Button>
          <Button size="sm" variant="secondary" onClick={() => showToast("Removed from the chat", "undone")}>Show Undone</Button>
        </Row>
        <Toast message={message} open={open} tone={tone} />
      </Demo>

      <Demo name="SaveOrDiscardDialog" use="before leaving a project: keep it as a draft, or archive it">
        <Button size="sm" variant="secondary" onClick={() => setLeaving(true)}>Leave Project</Button>
        <SaveOrDiscardDialog open={leaving} destinationLabel="the Therapy Library"
          onSaveDraft={() => { setLeaving(false); showToast("Saved as a draft"); }}
          onDiscard={() => { setLeaving(false); showToast("Moved to Archived", "undone"); }}
          onCancel={() => setLeaving(false)} />
      </Demo>

      <Demo name="RequestModal" use="asking SwishX for one change to one thing; the request lands in the chat">
        <Button size="sm" variant="secondary" onClick={() => setRequesting(true)}><RefreshCw className="size-3.5" />Regenerate Shot</Button>
        {requesting && (
          <RequestModal icon={RefreshCw} action="Regenerate" subject="Scene 1 · Shot 1"
            current="An oncologist reviewing scans with a patient" label="What should change?"
            placeholder="Warmer light, and the patient facing the camera…" submitLabel="Send to Chat"
            onSubmit={() => { setRequesting(false); showToast("Sent to the chat"); }} onClose={() => setRequesting(false)} />
        )}
      </Demo>

      <Demo name="LibraryModalHeader / LibraryModalGoTo" use="the head and foot of a 'pick from the library' modal">
        <Surface className="overflow-hidden">
          <LibraryModalHeader title="Choose a Voice for Your Video" onClose={() => {}} />
          <div className="p-5"><Placeholder>The shortlist</Placeholder></div>
          <LibraryModalGoTo label="Go to the Voice Library" onClick={() => {}} />
        </Surface>
      </Demo>
    </Stack>
  );
}

/* ── Promoted in this pass ────────────────────────────────────────────── */

export function PromotedDemos() {
  const [tab, setTab] = useState("chat");
  const [files, setFiles] = useState<string[]>([]);
  return (
    <Stack gap={6}>
      <Demo name="SectionHeading" use="the heading over one section of a page; PageHeading's sibling, same props" note="size='subhead' inside a panel or modal. Actions align to the description's baseline.">
        <SectionHeading title="Dossiers" description="One per disease. Read-only: a change comes in as a new version and the old one is kept."
          actions={<Button size="sm"><Upload className="size-4" />Add Dossier</Button>} />
      </Demo>

      <Demo name="BackLink" use="the way back up from a detail page; quiet ink-3, never brand">
        <Stack gap={3}>
          <BackLink onClick={() => {}}>Therapy Library</BackLink>
          <BackLink onClick={() => {}} trail={[{ label: "Oncology", onClick: () => {} }]}>Therapy Library</BackLink>
        </Stack>
      </Demo>

      <Demo name="Stat" use="a count with its label in a header row or a stat tile">
        <Row gap={6} wrap align="end">
          <Row gap={5}><Stat value={12} label="Dossiers" /><Stat value={1480} label="Sources" /><Stat value="v3" label="Version" /></Row>
          <Row gap={5}><Stat size="subhead" value={214} label="Claims" /><Stat size="subhead" value={5} label="Dossiers" /></Row>
        </Row>
      </Demo>

      <Demo name="RowCard" use="one object as a row you open: a dossier, a disease, a claim">
        <Stack gap={2.5}>
          <RowCard
            leading={<span className="grid size-9 place-items-center rounded-control bg-ok-bg text-ok"><FileText size={16} /></span>}
            title="HER2-positive breast cancer"
            meta="v3 · Made with SwishX · 42 sources · Updated 2 Nov"
            trailing={<Chip tone="neutral" weight="bold" iconLeft={<Lock className="size-3" />}>Read-Only</Chip>}
            openLabel="View"
            onOpen={() => {}}
          />
          <RowCard leading={<span className="grid size-10 place-items-center rounded-chip bg-tint text-brand-deep"><ShieldCheck size={18} /></span>}>
            <Stat value={180} label="Approved claims" align="start" />
          </RowCard>
        </Stack>
      </Demo>

      <Demo name="EmptyState" use="where a list would be when there is nothing in it">
        <div className="grid gap-3 sm:grid-cols-2">
          <EmptyState tone="card" title="No dossiers in Oncology yet" hint="Upload your own, or have SwishX make one from cited sources." />
          <EmptyState size="md" icon={<ListChecks size={20} />} title="No claims cited yet"
            hint="Claims appear here once a dossier cites them." />
          <EmptyState size="md" tone="card" iconTone="brand" icon={<Palette size={20} />} title="Start with a therapy area"
            hint="Pick the area and the disease, then upload a dossier or have SwishX make one."
            action={<><Button size="sm"><Sparkles className="size-4" />Make with SwishX</Button><Button size="sm" variant="secondary">Upload Your Own</Button></>} />
          <EmptyState tone="canvas" title="No comments yet" hint="Click any element on the canvas and choose Add Comment." />
        </div>
      </Demo>

      <Demo name="DropZone" use="where a file goes in: click to choose, or drop" note="onFiles owns the input; onChoose opens your own picker instead.">
        <div className="grid gap-3 sm:grid-cols-2">
          <DropZone title="Drop a file or choose one" hint="PDF, Word or PowerPoint" accept=".pdf,.doc,.docx,.ppt,.pptx" multiple
            onFiles={(f) => setFiles(f.map((x) => x.name))} />
          <DropZone tone="tint" size="sm" title="Drop files here, or browse" hint="Label, study readouts, images; as many as you like" multiple
            onFiles={(f) => setFiles(f.map((x) => x.name))} />
        </div>
        {files.length > 0 && <Text size="caption" tone="subtle" className="mt-2 block">Picked: {files.join(", ")}</Text>}
      </Demo>

      <Demo name="InspectorTabStrip / InspectorTabButton" use="the tab strip at the top of a studio's right panel" note="The open tab spells itself out; closed tabs keep only their glyph. disabledHint turns a tab off with the reason as its tooltip. ReadOnlyChatNote and PlanChatHeader are the two headers that sit with it.">
        <Surface className="max-w-[420px] overflow-hidden">
          <InspectorTabStrip>
            <InspectorTabButton tab="chat" current={tab} onClick={setTab} icon={MessageSquare}>Chat</InspectorTabButton>
            <InspectorTabButton tab="claims" current={tab} onClick={setTab} icon={ListChecks} count={12}>Claims</InspectorTabButton>
            <InspectorTabButton tab="comments" current={tab} onClick={setTab} icon={Layers} disabledHint="Comments open once the asset is published">Comments</InspectorTabButton>
          </InspectorTabStrip>
          <PlanChatHeader />
          <ReadOnlyChatNote />
          <div className="p-4"><Placeholder>The conversation</Placeholder></div>
        </Surface>
      </Demo>
    </Stack>
  );
}

/* ── Copy ─────────────────────────────────────────────────────────────── */

const COPY: [string, string, string][] = [
  ["Title Case", "Page titles, section headings, buttons, links that act, tabs, segmented options, menu items, field labels, column headers, modal titles", "Upload New Version · See the Oncology Kit"],
  ["Sentence case", "Descriptions, help text, hints, empty-state explanations, placeholders, toasts, status lines, chat, tooltips", "Search diseases or therapy areas…"],
  ["UK spelling", "organisation, colour, recognise, programme, licence (noun)", "Organisation Settings"],
  ["“and”, never “&”", "In interface text. Brand and product names keep their own spelling", "Billing and Usage"],
  ["Terms of art keep their casing", "SwishX, MLR, HCP, FDA, Veeva, PubMed, CDC", "Send to MLR Review"],
  ["Uppercase is a style", "An eyebrow or a chip with uppercase tracking; never typed in capitals", "<Label>Libraries</Label>"],
  ["One-character ellipsis", "Only on placeholders and work in progress", "Reading your file…"],
  ["Full stops", "None on a label, button, tab or single-line heading; yes on sentences in descriptions", "No images yet"],
  ["Name what the marketer knows", "comment, version, review, claim; not how the system is built", "Comments, not Annotations"],
];

export function CopyRules() {
  return (
    <Stack gap={2}>
      {COPY.map(([rule, where, eg]) => (
        <div key={rule} className="grid gap-x-4 gap-y-0.5 border-b border-hair py-2 last:border-0 sm:grid-cols-[180px_1fr_220px]">
          <Text size="body" weight="bold">{rule}</Text>
          <Text size="caption" tone="muted">{where}</Text>
          <Text size="caption" tone="brand-deep" weight="semibold" className="font-mono">{eg}</Text>
        </div>
      ))}
    </Stack>
  );
}
