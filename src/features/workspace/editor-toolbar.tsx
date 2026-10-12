"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  BarChart3,
  BarChartHorizontal,
  Blend,
  Bold,
  CalendarRange,
  CaseUpper,
  ChevronDown,
  Filter,
  FolderOpen,
  Hash,
  Heading,
  Info,
  Italic,
  LineChart,
  Link2,
  List,
  ListOrdered,
  Lock,
  Network,
  Package,
  Pilcrow,
  PieChart,
  Plus,
  QrCode,
  Quote,
  RefreshCw,
  RotateCcw,
  ScanText,
  ScatterChart,
  Shapes,
  Sparkles,
  Table2,
  Trash2,
  TrendingDown,
  Type,
  Underline,
  Upload,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import {
  FONTS,
  IconToggle,
  SWATCHES,
  SizeStepper,
  WEIGHTS,
  fontStack,
  hasOverrides,
  nearestWeight,
  type CanvasTextElement,
  type TextAlign,
  type TextStyle,
} from "@/features/workspace/canvas-text-toolbar";

/**
 * The document editor's one toolbar.
 *
 * It sits across the pages and the canvas, never over the chat. Insert is
 * always on the left, like PowerPoint's Insert tab. Selecting something on the
 * page extends the bar with that element's options; with a selection, the six
 * Insert menus fold into one button so the options get the room. Whatever
 * still does not fit goes under More, from the end backwards, while the
 * element's name and Add to chat stay in view.
 */

/* ───────────────────────────────── Insert ───────────────────────────────── */

export type InsertMenuId = "text" | "image" | "layout" | "chart" | "diagram";

type FrameKind = "two" | "three" | "imageText" | "statRow" | "steps" | "table";

interface InsertOption {
  label: string;
  hint?: string;
  /** What choosing it does, in a sentence. Sent with the request to the chat. */
  explain?: string;
  icon?: LucideIcon;
  frame?: FrameKind;
}

interface InsertMenu {
  label: string;
  icon: LucideIcon;
  /** Under the name on hover: what is inside. */
  tip: string;
  sub: string;
  groups: Array<{ title: string; options: InsertOption[] }>;
  foot?: string;
}

/* Chosen for medical documents, not a general catalogue. */
export const INSERT_MENUS: Record<InsertMenuId, InsertMenu> = {
  text: {
    label: "Text",
    icon: Type,
    tip: "Titles, headings, lists",
    sub: "Words in the page's own type styles.",
    groups: [
      {
        title: "Text",
        options: [
          { label: "Title", icon: Type },
          { label: "Heading", icon: Heading },
          { label: "Body text", icon: Pilcrow },
          { label: "Bulleted list", icon: List },
          { label: "Numbered list", icon: ListOrdered },
          { label: "Quote", icon: Quote, hint: "An HCP or KOL quote" },
        ],
      },
      {
        title: "Boxes",
        options: [
          { label: "Callout box", icon: Info, hint: "A highlighted point" },
          { label: "Footnote", icon: Hash, hint: "Small print, numbered" },
        ],
      },
    ],
  },
  image: {
    label: "Image",
    icon: Package,
    tip: "Product shots, library, upload",
    sub: "Approved brand assets first, then your own.",
    groups: [
      {
        title: "Images",
        options: [
          { label: "Brand images library", icon: Package, hint: "Images attached to this drug" },
          { label: "Workspace media library", icon: FolderOpen, hint: "From every drug and project" },
          { label: "Upload", icon: Upload, hint: "PNG, JPG or SVG" },
          { label: "Generate image", icon: Sparkles, hint: "Describe it, SwishX draws it" },
          { label: "Icon", icon: Shapes, hint: "Line icons in brand colour" },
          { label: "QR code", icon: QrCode, hint: "To the PI or a poster copy" },
        ],
      },
    ],
  },
  layout: {
    label: "Layout",
    icon: Table2,
    tip: "Columns, stat rows, steps",
    sub: "An arrangement for what comes next. Fill each part after it lands.",
    groups: [
      {
        title: "Layouts",
        options: [
          { label: "Two columns", frame: "two", explain: "Two columns side by side, under one heading" },
          { label: "Three columns", frame: "three", explain: "Three equal columns, under one heading" },
          { label: "Image and text", frame: "imageText", explain: "An image on the left with the text beside it" },
          { label: "Stat row", frame: "statRow", explain: "Three numbers side by side, each with its claim", hint: "Three numbers side by side" },
          { label: "Process steps", frame: "steps", explain: "Numbered steps, read left to right", hint: "Numbered, left to right" },
          { label: "Comparison table", frame: "table", explain: "The drug against its comparator, row by row", hint: "Drug vs comparator" },
        ],
      },
    ],
  },
  chart: {
    label: "Chart",
    icon: BarChart3,
    tip: "Bar, line, Kaplan–Meier",
    sub: "Drawn from trial data in the dossier. Every value keeps its source.",
    groups: [
      {
        title: "Charts",
        options: [
          { label: "Bar chart", icon: BarChartHorizontal },
          { label: "Column chart", icon: BarChart3 },
          { label: "Line chart", icon: LineChart, hint: "Change over time" },
          { label: "Kaplan–Meier curve", icon: TrendingDown, hint: "Survival over time" },
          { label: "Forest plot", icon: ScatterChart, hint: "Subgroup effects" },
          { label: "Donut chart", icon: PieChart, hint: "Share of a whole" },
        ],
      },
    ],
  },
  diagram: {
    label: "Diagram",
    icon: Workflow,
    tip: "Pathways, flows, timelines",
    sub: "Shapes that explain how something works, or happens in order.",
    groups: [
      {
        title: "Diagrams",
        options: [
          { label: "Mechanism pathway", icon: Network, hint: "How the drug acts" },
          { label: "Process flow", icon: Workflow, hint: "Step to step" },
          { label: "Cycle", icon: RefreshCw, hint: "A repeating process" },
          { label: "Timeline", icon: CalendarRange, hint: "Trial or dosing schedule" },
          { label: "Funnel", icon: Filter, hint: "Narrowing down" },
          { label: "Venn diagram", icon: Blend, hint: "Overlap between groups" },
        ],
      },
    ],
  },
};

const MENU_IDS = Object.keys(INSERT_MENUS) as InsertMenuId[];

/** One option, looked up by its menu and name. */
export function insertOption(menu: InsertMenuId, label: string): InsertOption | undefined {
  for (const group of INSERT_MENUS[menu].groups) {
    const found = group.options.find((o) => o.label === label);
    if (found) return found;
  }
  return undefined;
}

/** A layout drawn small, so the choice is made by eye. */
function Frame({ kind }: { kind: FrameKind }) {
  const cell = "rounded-[2px] bg-hair-3";
  const img = "rounded-[2px] bg-tint-line";
  const title = <span className={cn(cell, "col-span-full h-1")} />;
  const grid: Record<FrameKind, { cols: string; body: ReactNode }> = {
    two: { cols: "1fr 1fr", body: <>{title}<span className={cell} /><span className={cell} /></> },
    three: { cols: "1fr 1fr 1fr", body: <>{title}<span className={cell} /><span className={cell} /><span className={cell} /></> },
    imageText: { cols: "1fr 1.4fr", body: <><span className={cn(img, "row-span-2")} /><span className={cell} /><span className={cell} /></> },
    statRow: { cols: "1fr 1fr 1fr", body: <>{title}<span className={img} /><span className={img} /><span className={img} /></> },
    steps: { cols: "1fr 1fr 1fr 1fr", body: <>{title}<span className={cell} /><span className={cell} /><span className={cell} /><span className={cell} /></> },
    table: { cols: "1fr 1fr 1fr", body: <>{title}{Array.from({ length: 6 }, (_, i) => <span key={i} className={cell} />)}</> },
  };
  return (
    <span
      aria-hidden
      className="grid h-9 w-14 gap-0.5 rounded-glyph border border-hair-2 bg-card p-1"
      style={{ gridTemplateColumns: grid[kind].cols, gridAutoRows: "1fr" }}
    >
      {grid[kind].body}
    </span>
  );
}

/** Closes on a click outside, or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

/** Matches the panel's w-[560px]. */
const PANEL_WIDTH = 560;

function InsertPanel({
  menu,
  onMenu,
  onPick,
  unavailable,
}: {
  menu: InsertMenuId;
  onMenu: (id: InsertMenuId) => void;
  onPick: (option: string) => void;
  /** Options that cannot be added here, with the reason shown in their place. */
  unavailable: Record<string, string>;
}) {
  const m = INSERT_MENUS[menu];
  return (
    <div
      role="dialog"
      aria-label={`Insert ${m.label.toLowerCase()}`}
      className="step-transition absolute left-0 top-0 z-30 max-h-[min(470px,70vh)] w-[560px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-panel border border-hair-2 bg-card p-3.5 shadow-float"
    >
      {/* Tabs, so the folded Insert button reaches every menu. */}
      <div role="tablist" className="mb-3 flex gap-0.5 overflow-x-auto rounded-control bg-subtle p-0.5">
        {MENU_IDS.map((id) => {
          const Icon = INSERT_MENUS[id].icon;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === menu}
              onClick={() => onMenu(id)}
              className={cn(
                "focus-ring inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-chip px-2 text-label font-bold transition",
                id === menu ? "bg-card text-brand-deep shadow-hair" : "text-ink-3 hover:text-ink"
              )}
            >
              <Icon className="size-3.5" />
              {INSERT_MENUS[id].label}
            </button>
          );
        })}
      </div>
      <p className="text-body font-extrabold text-ink">{m.label}</p>
      <p className="mb-1 text-label text-ink-3">{m.sub}</p>
      {m.groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 mt-3 text-micro font-extrabold uppercase tracking-wider text-ink-4">{group.title}</p>
          <div className="grid grid-cols-3 gap-2">
            {group.options.map((option) => {
              const reason = unavailable[option.label];
              const Icon = option.icon;
              return (
                <button
                  key={option.label}
                  type="button"
                  disabled={Boolean(reason)}
                  onClick={() => onPick(option.label)}
                  className="focus-ring grid cursor-pointer justify-items-center gap-1.5 rounded-control border border-hair bg-card px-2 pb-2.5 pt-3 text-center transition hover:border-tint-line hover:bg-tint disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-60"
                >
                  {option.frame ? (
                    <Frame kind={option.frame} />
                  ) : Icon ? (
                    <span className="grid h-9 place-items-center text-brand">
                      <Icon className="size-5" strokeWidth={1.8} />
                    </span>
                  ) : null}
                  <span className="text-label font-bold text-ink">{option.label}</span>
                  {(reason || option.hint) && (
                    <span className="text-caption leading-snug text-ink-3">{reason ?? option.hint}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {m.foot && <p className="mt-3 rounded-control bg-subtle px-2.5 py-2 text-caption text-ink-3">{m.foot}</p>}
    </div>
  );
}

/* ─────────────────────────── selection option sets ─────────────────────────── */

/** One control in the selection's options. Dividers fold away with what they separate. */
export interface ToolbarItem {
  key: string;
  node: ReactNode;
  divider?: boolean;
}

const divider = (key: string): ToolbarItem => ({ key, divider: true, node: <span className="h-5 w-px shrink-0 bg-hair-2" /> });

const TOOL =
  "focus-ring inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-chip px-2 text-label font-semibold text-ink-2 transition hover:bg-subtle hover:text-ink disabled:cursor-not-allowed disabled:text-ink-4 disabled:hover:bg-transparent";

function ToolButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  title,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone?: "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(TOOL, tone === "danger" && "hover:bg-danger-bg hover:text-danger")}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

/** A control that opens a small panel under itself. */
function ToolMenu({
  label,
  trigger,
  children,
}: {
  label: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useDismiss(open, close);
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(TOOL, "gap-0.5 px-1.5", open && "bg-tint text-brand-deep")}
      >
        {trigger}
        <ChevronDown className="size-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 rounded-control border border-hair-2 bg-card p-1.5 shadow-float">
          {children(close)}
        </div>
      )}
    </div>
  );
}

function Note({ icon: Icon, children, tone = "warn" }: { icon: LucideIcon; children: ReactNode; tone?: "warn" | "ok" }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-chip px-2 text-caption font-bold",
        tone === "ok" ? "bg-ok-bg text-ok" : "bg-warn-bg text-warn"
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}

const SELECT =
  "focus-ring h-8 shrink-0 cursor-pointer rounded-chip border border-hair-2 bg-subtle px-1.5 text-label font-bold text-ink";

const ALIGN_ICON: Record<TextAlign, LucideIcon> = { left: AlignLeft, center: AlignCenter, right: AlignRight };

export function textOptions({
  element,
  style,
  onStyle,
  onReset,
  onCite,
  onEdit,
  onDelete,
}: {
  element: CanvasTextElement;
  style: TextStyle | undefined;
  onStyle: (patch: Partial<TextStyle>) => void;
  onReset: () => void;
  /** Runs that can carry a claim; added text has none. */
  onCite?: () => void;
  /** Added text only: typed into directly, and removable. */
  onEdit?: () => void;
  onDelete?: () => void;
}): ToolbarItem[] {
  const size = style?.size ?? element.baseSize;
  const weight = style?.weight ?? element.baseWeight;
  const align = style?.align ?? "left";
  const AlignIcon = ALIGN_ICON[align];
  return [
    {
      key: "font",
      node: (
        <select
          value={style?.font ?? ""}
          onChange={(e) => onStyle({ font: e.target.value || null })}
          aria-label="Font"
          title="Font"
          className={cn(SELECT, "w-32")}
          style={{ fontFamily: fontStack(style?.font ?? null) }}
        >
          <option value="">Template font</option>
          {FONTS.map((f) => (
            <option key={f.label} value={f.label} style={{ fontFamily: f.stack }}>
              {f.label}
            </option>
          ))}
        </select>
      ),
    },
    { key: "size", node: <SizeStepper value={size} onChange={(next) => onStyle({ size: next })} /> },
    {
      key: "weight",
      node: (
        <select
          value={nearestWeight(weight)}
          onChange={(e) => onStyle({ weight: Number(e.target.value) })}
          aria-label="Font weight"
          className={SELECT}
        >
          {WEIGHTS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "bold",
      node: (
        <IconToggle active={weight >= 700} onClick={() => onStyle({ weight: weight >= 700 ? 400 : 850 })} title="Bold">
          <Bold className="size-3.5" />
        </IconToggle>
      ),
    },
    {
      key: "italic",
      node: (
        <IconToggle active={!!style?.italic} onClick={() => onStyle({ italic: !style?.italic })} title="Italic">
          <Italic className="size-3.5" />
        </IconToggle>
      ),
    },
    {
      key: "underline",
      node: (
        <IconToggle active={!!style?.underline} onClick={() => onStyle({ underline: !style?.underline })} title="Underline">
          <Underline className="size-3.5" />
        </IconToggle>
      ),
    },
    divider("d1"),
    {
      key: "colour",
      /* Brand swatches, not a picker: on approved artwork an arbitrary colour
         is a way to ship something off-brand. */
      node: (
        <ToolMenu
          label="Text colour"
          trigger={
            <span
              className="border-b-[3px] px-0.5 text-body font-black leading-none"
              style={{ borderBottomColor: style?.color ?? "var(--color-ink-3)" }}
            >
              A
            </span>
          }
        >
          {(close) => (
            <div className="flex items-center gap-1.5 p-0.5">
              {SWATCHES.map((s) => {
                const active = (style?.color ?? null) === s.value;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      onStyle({ color: s.value });
                      close();
                    }}
                    title={s.label}
                    aria-label={s.label}
                    aria-pressed={active}
                    className={cn(
                      "focus-ring size-6 shrink-0 cursor-pointer rounded-glyph border transition",
                      active ? "border-ink ring-2 ring-brand/30" : "border-hair-3 hover:border-ink-3"
                    )}
                    style={
                      s.value
                        ? { background: s.value }
                        : { background: "linear-gradient(135deg, #ffffff 0 46%, var(--color-hair-3) 46% 54%, #ffffff 54%)" }
                    }
                  />
                );
              })}
            </div>
          )}
        </ToolMenu>
      ),
    },
    {
      key: "align",
      node: (
        <ToolMenu label="Alignment" trigger={<AlignIcon className="size-3.5" />}>
          {(close) => (
            <div className="flex items-center gap-0.5">
              {(["left", "center", "right"] as const).map((a) => {
                const Icon = ALIGN_ICON[a];
                return (
                  <IconToggle
                    key={a}
                    active={align === a}
                    onClick={() => {
                      onStyle({ align: a });
                      close();
                    }}
                    title={a === "left" ? "Align left" : a === "center" ? "Centre" : "Align right"}
                  >
                    <Icon className="size-3.5" />
                  </IconToggle>
                );
              })}
            </div>
          )}
        </ToolMenu>
      ),
    },
    {
      key: "caps",
      node: (
        <IconToggle active={!!style?.uppercase} onClick={() => onStyle({ uppercase: !style?.uppercase })} title="Capitals">
          <CaseUpper className="size-4" />
        </IconToggle>
      ),
    },
    divider("d2"),
    ...(onEdit ? [{ key: "edit", node: <ToolButton icon={Type} label="Edit text" onClick={onEdit} /> }] : []),
    ...(element.citation
      ? [{ key: "claim", node: <Note icon={BadgeCheck} tone="ok">Claim {element.citation}</Note> }]
      : onCite
        ? [{ key: "claim", node: <ToolButton icon={Link2} label="Cite a claim" onClick={onCite} /> }]
        : []),
    {
      key: "reset",
      node: (
        <ToolButton
          icon={RotateCcw}
          label="Reset"
          onClick={onReset}
          disabled={!hasOverrides(style)}
          title="Back to the template's formatting"
        />
      ),
    },
    ...(onDelete ? [{ key: "delete", node: <ToolButton icon={Trash2} label="Delete" onClick={onDelete} tone="danger" /> }] : []),
  ];
}

export function artOptions({
  alt,
  z,
  ready,
  onReplace,
  onRegenerate,
  onBringForward,
  onSendBack,
  onAlt,
  onDelete,
}: {
  alt: string;
  z: number;
  ready: boolean;
  onReplace: () => void;
  onRegenerate: () => void;
  onBringForward: () => void;
  onSendBack: () => void;
  onAlt: (alt: string) => void;
  onDelete: () => void;
}): ToolbarItem[] {
  return [
    { key: "replace", node: <ToolButton icon={Upload} label="Replace" onClick={onReplace} /> },
    {
      key: "regenerate",
      node: (
        <ToolButton
          icon={RefreshCw}
          label="Regenerate"
          onClick={onRegenerate}
          disabled={!ready}
          title={ready ? undefined : "Still rendering"}
        />
      ),
    },
    divider("d1"),
    { key: "forward", node: <ToolButton icon={ArrowUp} label="Bring forward" onClick={onBringForward} disabled={z >= Z_MAX} /> },
    { key: "back", node: <ToolButton icon={ArrowDown} label="Send backward" onClick={onSendBack} disabled={z <= 0} /> },
    divider("d2"),
    {
      key: "alt",
      node: (
        <ToolMenu
          label="Alt text"
          trigger={
            <span className="inline-flex items-center gap-1.5">
              <ScanText className="size-3.5" />
              Alt text
            </span>
          }
        >
          {(close) => <AltTextForm initial={alt} onSave={(next) => { onAlt(next); close(); }} />}
        </ToolMenu>
      ),
    },
    { key: "delete", node: <ToolButton icon={Trash2} label="Delete" onClick={onDelete} tone="danger" /> },
  ];
}

/** The stacking range the studio clamps art to. */
export const Z_MAX = 9;

function AltTextForm({ initial, onSave }: { initial: string; onSave: (alt: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <form
      className="grid w-64 gap-2 p-1"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value.trim());
      }}
    >
      <Field
        size="sm"
        label="Describe the image"
        hint="Read aloud by screen readers and kept in the export."
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        placeholder="Velmora 200 mg pack, front"
      />
      <Button size="sm" type="submit" className="justify-self-end">
        Save
      </Button>
    </form>
  );
}

export function blockOptions({
  locked,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
  extra = [],
}: {
  /** Why this block cannot be moved or removed, if it cannot. */
  locked?: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  /** Options this kind of block adds, e.g. a chart's data. */
  extra?: ToolbarItem[];
}): ToolbarItem[] {
  if (locked) return [{ key: "locked", node: <Note icon={Lock}>{locked}</Note> }, ...extra];
  return [
    ...extra,
    ...(extra.length ? [divider("d0")] : []),
    { key: "up", node: <ToolButton icon={ArrowUp} label="Move up" onClick={onMoveUp} disabled={!canMoveUp} /> },
    { key: "down", node: <ToolButton icon={ArrowDown} label="Move down" onClick={onMoveDown} disabled={!canMoveDown} /> },
    divider("d1"),
    { key: "delete", node: <ToolButton icon={Trash2} label="Delete" onClick={onDelete} tone="danger" /> },
  ];
}

export function chartExtras({ source, onEditData }: { source: string; onEditData: () => void }): ToolbarItem[] {
  return [
    { key: "source", node: <Note icon={BadgeCheck} tone="ok">{source}</Note> },
    { key: "data", node: <ToolButton icon={Table2} label="Edit data" onClick={onEditData} /> },
  ];
}

/* ──────────────────────────────── the bar ──────────────────────────────── */

/**
 * The options, as many as fit, and the rest under More.
 *
 * A hidden copy of every option is measured, so how many fit is worked out
 * from real widths rather than guessed — fonts and labels differ per element.
 */
function FittedOptions({ items }: { items: ToolbarItem[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(items.length);
  const [moreOpen, setMoreOpen] = useState(false);
  const closeMore = () => setMoreOpen(false);
  const moreRef = useDismiss(moreOpen, closeMore);

  useEffect(() => {
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return;
    const GAP = 6;
    const MORE = 84;
    /* The observer reports on observe, so this runs once at mount too. */
    const observer = new ResizeObserver(() => {
      const widths = Array.from(measure.children).map((c) => (c as HTMLElement).offsetWidth);
      const total = widths.reduce((sum, w, i) => sum + w + (i ? GAP : 0), 0);
      const room = wrap.clientWidth;
      if (total <= room) {
        setFit(widths.length);
        return;
      }
      let used = 0;
      let n = 0;
      for (const w of widths) {
        const next = used + (n ? GAP : 0) + w;
        if (next + GAP + MORE > room) break;
        used = next;
        n++;
      }
      /* Never end the visible run on a divider. */
      while (n > 0 && measure.children[n - 1]?.hasAttribute("data-divider")) n--;
      setFit(n);
    });
    observer.observe(wrap);
    observer.observe(measure);
    return () => observer.disconnect();
    /* Sizes, not renders: the observer reports whenever the room or the
       options' widths change. The bar remounts this per selection. */
  }, []);

  const shown = items.slice(0, fit);
  const folded = items.slice(fit).filter((i) => !i.divider);

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-1 items-center gap-1.5">
      {shown.map((i) => (
        <span key={i.key} className="contents">
          {i.node}
        </span>
      ))}
      {folded.length > 0 && (
        <div ref={moreRef} className="relative shrink-0">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(TOOL, moreOpen && "bg-tint text-brand-deep")}
          >
            More
            <ChevronDown className="size-3 opacity-60" />
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 flex w-max max-w-80 flex-wrap items-center gap-1.5 rounded-control border border-hair-2 bg-card p-2 shadow-float">
              {folded.map((i) => (
                <span key={i.key} className="contents">
                  {i.node}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Measured, never seen or reached. */}
      <div
        ref={measureRef}
        aria-hidden
        inert
        className="pointer-events-none invisible absolute left-0 top-0 flex items-center gap-1.5"
      >
        {items.map((i) => (
          <span key={i.key} className="flex shrink-0" data-divider={i.divider ? "" : undefined}>
            {i.node}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface ToolbarSelection {
  /** Changes when the selection does, so the options start fresh. */
  id: string;
  icon: LucideIcon;
  name: string;
  /** "Header band › Headline", on hover. */
  path?: string;
  items: ToolbarItem[];
  onAddToChat: () => void;
}

export function EditorToolbar({
  selection,
  onInsert,
  unavailable = {},
}: {
  selection: ToolbarSelection | null;
  onInsert: (menu: InsertMenuId, option: string) => void;
  unavailable?: Record<string, string>;
}) {
  const [menu, setMenu] = useState<InsertMenuId | null>(null);
  const [lastMenu, setLastMenu] = useState<InsertMenuId>("text");
  const [anchor, setAnchor] = useState(0);
  const closeMenu = () => setMenu(null);
  const insertRef = useDismiss(menu !== null, closeMenu);

  const openMenu = (id: InsertMenuId, button: HTMLElement) => {
    if (menu === id) return closeMenu();
    /* Under the button that opened it, but never past the toolbar's right edge. */
    const bar = button.closest("[data-editor-toolbar]") as HTMLElement | null;
    const room = bar ? bar.clientWidth - PANEL_WIDTH - 24 : button.offsetLeft;
    setAnchor(Math.max(0, Math.min(button.offsetLeft, room)));
    setMenu(id);
    setLastMenu(id);
  };

  const panel = menu && (
    /* From the toolbar's bottom edge, so the menu never covers the buttons. */
    <div className="absolute top-full mt-1.5" style={{ left: anchor }}>
      <InsertPanel
        menu={menu}
        onMenu={(id) => {
          setMenu(id);
          setLastMenu(id);
        }}
        unavailable={unavailable}
        onPick={(option) => {
          onInsert(menu, option);
          closeMenu();
        }}
      />
    </div>
  );

  return (
    <div data-editor-toolbar className="relative z-20 flex h-12 shrink-0 items-center gap-1.5 border-b border-hair bg-card px-3">
      <div ref={insertRef} className="relative flex h-full shrink-0 items-center gap-0.5">
        {selection ? (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={menu !== null}
            onClick={(e) => (menu ? closeMenu() : openMenu(lastMenu, e.currentTarget))}
            className={cn(TOOL, menu && "bg-tint text-brand-deep")}
          >
            <Plus className="size-3.5" />
            Insert
            <ChevronDown className="size-3 opacity-60" />
          </button>
        ) : (
          <>
            <span className="mr-1 text-micro font-extrabold uppercase tracking-wider text-ink-4">Insert</span>
            {MENU_IDS.map((id) => {
              const m = INSERT_MENUS[id];
              const Icon = m.icon;
              const open = menu === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  onClick={(e) => openMenu(id, e.currentTarget)}
                  className={cn(TOOL, "group relative gap-1 px-1.5", open && "bg-tint text-brand-deep")}
                >
                  <Icon className="size-3.5" />
                  {m.label}
                  <ChevronDown className="size-3 opacity-50" />
                  {/* What is inside, on hover; hidden while the menu is open. */}
                  {!open && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-full z-40 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-chip bg-ink px-2 py-1 text-caption font-semibold text-card opacity-0 shadow-soft transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      {m.tip}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
        {panel}
      </div>

      {selection && <span className="mx-1 h-5 w-px shrink-0 bg-hair-2" />}

      {selection ? (
        <div key={selection.id} className="step-transition flex min-w-0 flex-1 items-center gap-1.5">
          <span
            title={selection.path}
            className="inline-flex h-7 max-w-44 shrink-0 items-center gap-1.5 rounded-chip bg-ink px-2.5 text-label font-bold text-card"
          >
            <selection.icon className="size-3.5 shrink-0" />
            <span className="truncate">{selection.name}</span>
          </span>
          <FittedOptions items={selection.items} />
          <Button size="sm" onClick={selection.onAddToChat} className="h-8 shrink-0 gap-1.5 px-3">
            <LogoMark size={13} className="shrink-0" />
            Add to chat
          </Button>
        </div>
      ) : null}
    </div>
  );
}
