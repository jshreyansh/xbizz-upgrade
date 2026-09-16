"use client";

import { useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Suggestions the author leaves on their own draft.
 *
 * A comment is somebody else's words on a published link and has to be
 * answered. A suggestion is your own instruction, and instructions go to the
 * agent — but five of them dropped into a chat scroll away, and then neither
 * side knows what is still owed. So they are a list: the agent reprints it
 * under every reply, and the same list sits above the input while anything
 * is open. Nothing to click in it — it is a checklist, not a menu.
 */
export type SuggestionStatus = "open" | "working" | "done";

export interface Suggestion {
  id: string;
  /** Where it was left — "Scene 3 · Headline", "Page 1 · Stat hero". */
  elementLabel: string;
  text: string;
  status: SuggestionStatus;
  /** Set once the author answers the scope question. */
  scope?: string;
}

/** What a chat message carries when the agent reprints the list. */
export type SuggestionSnapshot = Pick<Suggestion, "id" | "elementLabel" | "text" | "status">;

export function snapshot(items: Suggestion[]): SuggestionSnapshot[] {
  return items.map(({ id, elementLabel, text, status }) => ({ id, elementLabel, text, status }));
}

function Tick({ status }: { status: SuggestionStatus }) {
  if (status === "working") {
    return (
      <span className="grid size-3.5 shrink-0 place-items-center rounded-[4px] border border-brand bg-brand text-white">
        <Loader2 className="size-2.5 animate-spin" />
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="grid size-3.5 shrink-0 place-items-center rounded-[4px] border border-ok bg-ok text-white">
        <Check className="size-2.5" strokeWidth={3.5} />
      </span>
    );
  }
  return <span className="mt-px size-3.5 shrink-0 rounded-[4px] border border-hair-3 bg-card" />;
}

function Row({ item }: { item: SuggestionSnapshot }) {
  return (
    <li className="flex items-start gap-2 leading-snug">
      <Tick status={item.status} />
      <span className={cn("min-w-0 text-label", item.status === "done" ? "text-ink-4 line-through" : "text-ink")}>
        <span className="font-bold">{item.elementLabel}</span>
        <span className="text-ink-3"> — </span>
        <span>{item.text}</span>
      </span>
    </li>
  );
}

/** The list the agent reprints at the end of a reply. */
export function ChatTaskList({ items }: { items?: SuggestionSnapshot[] }) {
  if (!items || items.length === 0) return null;
  const left = items.filter((i) => i.status !== "done").length;
  return (
    <div className="mt-2.5 rounded-control border border-hair bg-subtle p-2.5">
      <div className="mb-1.5 text-micro font-extrabold uppercase tracking-wider text-ink-3">
        {left === 0 ? "All done" : `Open · ${left}`}
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

/** The same list, pinned above the chat input while anything is open. */
export function SuggestionChecklist({ items }: { items: Suggestion[] }) {
  const live = items.filter((i) => i.status !== "done");
  if (live.length === 0) return null;
  const working = live.some((i) => i.status === "working");
  return (
    <div className="rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2.5 shadow-2xs">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-label font-extrabold text-brand-deep">
          {working ? "Applying suggestions" : `${live.length} open suggestion${live.length > 1 ? "s" : ""}`}
        </span>
      </div>
      <ul className="max-h-28 space-y-1.5 overflow-y-auto">
        {live.map((item) => (
          <Row key={item.id} item={snapshot([item])[0]} />
        ))}
      </ul>
    </div>
  );
}

/**
 * The queue itself. Both studios run the same machine and differ only in
 * whether the thing being changed is a scene or a page, so the wording is a
 * parameter and the mechanics are not.
 */
export function useSuggestionQueue(post: (message: { role: "user" | "swishx"; text: string; chips?: string[]; tasks?: SuggestionSnapshot[] }) => void) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const seq = useRef(0);
  /* The timers walk the queue after the state that started them was read, so
     they work off this rather than a captured render's value. */
  const liveRef = useRef<Suggestion[]>([]);
  const write = (next: Suggestion[]) => {
    liveRef.current = next;
    setSuggestions(next);
  };

  const openItems = () => liveRef.current.filter((s) => s.status !== "done");

  /** Record a new suggestion; returns the open list as it now stands. */
  const add = (elementLabel: string, text: string) => {
    const item: Suggestion = {
      id: `sg-${(seq.current += 1)}`,
      elementLabel,
      text: text.trim(),
      status: "open",
    };
    write([...liveRef.current.filter((s) => s.status !== "done"), item]);
    return { item, open: openItems() };
  };

  /** Answer the scope question on the newest suggestion. */
  const scopeNewest = (scope: string) => {
    const open = openItems();
    const newest = open[open.length - 1];
    if (!newest) return { newest: null, open };
    write(liveRef.current.map((s) => (s.id === newest.id ? { ...s, scope } : s)));
    return { newest, open: openItems() };
  };

  /**
   * Work the queue one at a time.
   *
   * The first message is not "done" — it is "starting". Reporting five
   * finished changes in the same breath as being asked to make them is the
   * agent claiming work it has not done yet, and the list is the thing that
   * makes that visible: it shrinks a line per reply until it is empty.
   */
  const resolveAll = (copy: {
    start: (count: number, first: Suggestion) => string;
    step: (item: Suggestion, left: number) => string;
    finish: (count: number) => string;
  }) => {
    const queue = openItems();
    if (queue.length === 0) return;

    write(liveRef.current.map((s) => (s.id === queue[0].id ? { ...s, status: "working" } : s)));
    post({ role: "swishx", text: copy.start(queue.length, queue[0]), tasks: snapshot(liveRef.current) });

    queue.forEach((item, index) => {
      window.setTimeout(() => {
        const next = queue[index + 1];
        write(
          liveRef.current.map((s) =>
            s.id === item.id
              ? { ...s, status: "done" as const }
              : next && s.id === next.id
                ? { ...s, status: "working" as const }
                : s
          )
        );
        const left = queue.length - index - 1;
        post({
          role: "swishx",
          text: left > 0 ? copy.step(item, left) : copy.finish(queue.length),
          tasks: snapshot(liveRef.current),
        });
        /* The trail stays in the chat; the strip above the input only ever
           shows what is still owed, so a finished queue clears it. */
        if (left === 0) window.setTimeout(() => write([]), 1200);
      }, 1500 * (index + 1));
    });
  };

  return {
    suggestions,
    /** What is still owed — what the strip shows and the chips count. */
    openCount: suggestions.filter((s) => s.status !== "done").length,
    add,
    scopeNewest,
    resolveAll,
  };
}
