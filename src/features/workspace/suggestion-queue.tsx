"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
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

/**
 * Two states, never three.
 *
 * A chat message is a record of a moment, and a spinner inside one keeps
 * spinning long after that moment has passed — the message that said "starting
 * with the headline" was still animating an hour later, as if the work had
 * never finished. So a row is ticked or it is not: unticked in the message
 * that starts it, ticked in the message that reports it done.
 */
function Tick({ status }: { status: SuggestionStatus }) {
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

/**
 * The drafts, pinned above the chat input, with the one control that sends
 * them. Nothing reaches the agent until this button is pressed — which is
 * what lets you mark up a whole page before saying anything.
 */
export function SuggestionChecklist({
  items,
  onSend,
  sendLabel = "Resolve",
}: {
  items: Suggestion[];
  onSend: () => void;
  /** "Resolve" here, so the button reads "Resolve all 3" / "Resolve it". */
  sendLabel?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2.5 shadow-2xs">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-label font-extrabold text-brand-deep">
          {items.length} suggestion{items.length > 1 ? "s" : ""} to send
        </span>
        <button
          type="button"
          onClick={onSend}
          className="focus-ring shrink-0 cursor-pointer rounded-chip bg-brand px-2.5 py-1 text-label font-bold text-white shadow-2xs transition hover:bg-brand-deep"
        >
          {items.length > 1 ? `${sendLabel} all ${items.length}` : `${sendLabel} it`}
        </button>
      </div>
      <ul className="max-h-28 space-y-1.5 overflow-y-auto">
        {items.map((item) => (
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
 *
 * Two lists, not one. Marking up a canvas is drafting — it belongs above the
 * input where you can see what you have written and keep going. The chat is
 * where a batch is handed over. Holding both in one list meant every note you
 * made was also a message, so five notes became five rounds of conversation
 * before you had finished looking at the page, and the same five lines sat on
 * screen twice: in the agent's bubble and in the strip.
 *
 * So: drafts collect silently, the whole batch is sent in one act, and at
 * that moment the strip empties because the list now lives in the chat.
 */
export function useSuggestionQueue(post: (message: { role: "user" | "swishx"; text: string; chips?: string[]; tasks?: SuggestionSnapshot[] }) => void) {
  /** Written but not sent — the strip above the input. */
  const [drafts, setDrafts] = useState<Suggestion[]>([]);
  /** Sent, and being worked — the list the agent reprints in its replies. */
  const [queue, setQueue] = useState<Suggestion[]>([]);
  const seq = useRef(0);
  /* The timers walk the queue after the state that started them was read, so
     they work off this rather than a captured render's value. */
  const queueRef = useRef<Suggestion[]>([]);
  const writeQueue = (next: Suggestion[]) => {
    queueRef.current = next;
    setQueue(next);
  };

  /** Record a new suggestion. Nothing is said to the agent yet. */
  const add = (elementLabel: string, text: string) => {
    const item: Suggestion = {
      id: `sg-${(seq.current += 1)}`,
      elementLabel,
      text: text.trim(),
      status: "open",
    };
    setDrafts((prev) => [...prev, item]);
    return item;
  };

  /**
   * Hand the drafts over. Returns them so the caller can write the one
   * message that carries them, and clears the strip in the same act — the
   * list is in the chat now, and showing it in both places is what this
   * change exists to stop.
   */
  const submit = () => {
    const batch = drafts;
    if (batch.length === 0) return [];
    writeQueue(batch);
    setDrafts([]);
    return batch;
  };

  /** Answer the scope question, for the batch that was just sent. */
  const scopeBatch = (scope: string) => {
    writeQueue(queueRef.current.map((s) => (s.status === "done" ? s : { ...s, scope })));
    return queueRef.current.filter((s) => s.status !== "done");
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
    const pending = queueRef.current.filter((s) => s.status !== "done");
    if (pending.length === 0) return;

    writeQueue(queueRef.current.map((s) => (s.id === pending[0].id ? { ...s, status: "working" } : s)));
    post({ role: "swishx", text: copy.start(pending.length, pending[0]), tasks: snapshot(queueRef.current) });

    pending.forEach((item, index) => {
      window.setTimeout(() => {
        const next = pending[index + 1];
        writeQueue(
          queueRef.current.map((s) =>
            s.id === item.id
              ? { ...s, status: "done" as const }
              : next && s.id === next.id
                ? { ...s, status: "working" as const }
                : s
          )
        );
        const left = pending.length - index - 1;
        post({
          role: "swishx",
          text: left > 0 ? copy.step(item, left) : copy.finish(pending.length),
          tasks: snapshot(queueRef.current),
        });
      }, 1500 * (index + 1));
    });
  };

  return {
    /** The strip's contents. */
    drafts,
    /** How many are waiting to be sent. */
    draftCount: drafts.length,
    /** What the agent is holding — sent, not yet finished. */
    queue,
    pendingCount: queue.filter((s) => s.status !== "done").length,
    add,
    submit,
    scopeBatch,
    resolveAll,
  };
}
