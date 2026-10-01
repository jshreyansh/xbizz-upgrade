"use client";

import { useRef, useState } from "react";

/**
 * Suggestions the author leaves on their own draft.
 *
 * A comment is somebody else's words on a published link and has to be
 * answered. A suggestion is your own instruction, and instructions go to the
 * agent — but five of them dropped into a chat scroll away, and then neither
 * side knows what is still owed. So they are a list: the agent reprints it
 * under every reply. Unsent drafts sit in the composer's tray, one row each
 * with an ×, and go with the next message.
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
 * The batch, written out as lines of a message.
 *
 * This was a checkbox panel rendered inside the chat bubble, reprinted in
 * every reply while the agent worked — the same seven rows four times down
 * the transcript, in a component that does not belong inside a sentence. A
 * chat message is prose; what the agent is holding is said, not drawn.
 */
export function listSuggestions(items: Suggestion[]): string {
  return items.map((item, i) => `${i + 1}. **${item.elementLabel}**, ${item.text}`).join("\n");
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
export function useSuggestionQueue(post: (message: { role: "user" | "swishx"; text: string; chips?: string[] }) => void) {
  /** Written but not sent — rows in the composer's tray. */
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

  /** Drop one draft before it is sent — the × on its row in the tray. */
  const remove = (id: string) => setDrafts((prev) => prev.filter((d) => d.id !== id));

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
    post({ role: "swishx", text: copy.start(pending.length, pending[0]) });

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
        /* The running count is already in the sentence, so a list on every
           step adds nothing on the way through. The recap at the end is the
           one place seeing all of them together is worth the room. */
        post({
          role: "swishx",
          text:
            left > 0
              ? copy.step(item, left)
              : `${copy.finish(pending.length)}\n\n${listSuggestions(pending)}`,
        });
      }, 1500 * (index + 1));
    });
  };

  return {
    /** The tray's suggestion rows. */
    drafts,
    /** How many are waiting to be sent. */
    draftCount: drafts.length,
    /** What the agent is holding — sent, not yet finished. */
    queue,
    pendingCount: queue.filter((s) => s.status !== "done").length,
    add,
    remove,
    submit,
    scopeBatch,
    resolveAll,
  };
}
