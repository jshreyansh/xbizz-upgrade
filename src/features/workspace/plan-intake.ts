/**
 * The conversation between a brief and a plan.
 *
 * The plan screen used to arrive fully filled in — every parameter decided,
 * every attached file already filed under a purpose nobody stated. Some of
 * that is honest inference from the brief. Some of it was guessing: a file
 * dropped into the brief says nothing about what to take from it, and the
 * length of a video is not in the words "explain the mechanism".
 *
 * So the screen asks first, one question at a time, and only then draws the
 * plan. What it asks about is only ever what it could not infer.
 *
 * This is a mock: the answers are read with regular expressions, not a model.
 * It is deliberately generous about phrasing — the point of the demo is the
 * shape of the exchange, and a question that only accepts one spelling of an
 * answer would misrepresent it.
 */
import type { AssetType } from "@/types/content";

export type IntakeKind = "attachment" | "duration" | "pages" | "shape";

export interface IntakeQuestion {
  id: string;
  kind: IntakeKind;
  /** The file this one is about, when it is about one. */
  fileName?: string;
  prompt: string;
}

export interface IntakeAnswer {
  questionId: string;
  kind: IntakeKind;
  /** What the plan should record — "Evidence", "45 sec", "2 pages". */
  value: string;
  /** What the agent says back before asking the next thing. */
  reply: string;
}

export interface BriefAttachment {
  id: string;
  name: string;
  kind: "image" | "video" | "doc";
}

/* ── The questions ───────────────────────────────────────────────────────── */

const roleOptions = (kind: BriefAttachment["kind"]) =>
  kind === "doc"
    ? "the clinical evidence in it, the wording, or the layout"
    : "the product shot, the visual style, or footage to cut in";

export function buildIntakeQuestions(
  attachments: BriefAttachment[],
  assetType: AssetType
): IntakeQuestion[] {
  const perFile = attachments.map<IntakeQuestion>((file) => ({
    id: `file-${file.id}`,
    kind: "attachment",
    fileName: file.name,
    prompt: `You attached **${file.name}** but didn't say what it's for. What should I take from it, ${roleOptions(file.kind)}?`,
  }));

  if (assetType === "infographic") {
    return [
      ...perFile,
      {
        id: "pages",
        kind: "pages",
        prompt: "How many pages should this run to? One page holds a single figure well; two or three give room for evidence and safety.",
      },
      {
        id: "shape",
        kind: "shape",
        prompt: "And what shape, A4 print, 3:4 tablet, or 16:9 screen?",
      },
    ];
  }

  return [
    ...perFile,
    {
      id: "duration",
      kind: "duration",
      prompt: "How long should the video run? Thirty seconds is a single idea; sixty carries the need, the mechanism and the evidence.",
    },
  ];
}

/**
 * Everything it needs, asked once.
 *
 * Asked one at a time, a person who already knew all three answers had to
 * wait to be asked each of them — a form handed over a field at a time. One
 * message, numbered, and they can answer it in a sentence or in a list.
 */
export function intakeBundlePrompt(questions: IntakeQuestion[]): string {
  if (questions.length === 0) return "";
  if (questions.length === 1) return questions[0].prompt;
  const lines = questions.map((question, index) => `**${index + 1}.** ${question.prompt}`);
  return [
    `${questions.length} things and I can lay the plan out, answer them together or one line each.`,
    "",
    ...lines,
  ].join("\n");
}

/* ── Reading an answer ───────────────────────────────────────────────────── */

const DEFERRED = /\b(you decide|your call|whatever|not sure|dunno|don'?t know|skip|up to you|anything)\b/i;

function attachmentRole(text: string, kind: BriefAttachment["kind"]): string {
  if (/\b(evidence|claim|data|stat|result|endpoint|readout|trial)\b/i.test(text)) return "Evidence";
  if (/\b(wording|copy|script|text|tone|language|phrasing)\b/i.test(text)) return "Wording";
  if (/\b(layout|template|structure|format)\b/i.test(text)) return "Layout";
  if (/\b(packshot|pack shot|product shot|bottle|pen|device|packaging)\b/i.test(text)) return "Product shot";
  if (/\b(style|look|palette|brand|visual|reference)\b/i.test(text)) return "Visual style";
  if (/\b(footage|clip|cut in|b-?roll|scene)\b/i.test(text)) return "Footage";
  if (DEFERRED.test(text)) return kind === "doc" ? "Evidence" : "Visual style";
  // Anything else is a purpose in the user's own words, which is a better
  // answer than a category — it goes on the plan verbatim.
  const trimmed = text.trim().replace(/\.$/, "");
  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed || "Evidence";
}

function seconds(text: string): number {
  const explicit = text.match(/(\d{1,3})\s*(s\b|sec|second)/i) ?? text.match(/\b(\d{2,3})\b/);
  if (explicit) {
    const n = parseInt(explicit[1], 10);
    if (n >= 10 && n <= 180) return n;
  }
  if (/\b(a\s+)?minute\b/i.test(text)) return 60;
  if (/\b(short|quick|brief|tight)\b/i.test(text)) return 30;
  if (/\b(long|full|detailed|thorough)\b/i.test(text)) return 90;
  return 60;
}

const WORD_NUMBERS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };

function pageCount(text: string): number {
  const digit = text.match(/\b([1-6])\b/);
  if (digit) return parseInt(digit[1], 10);
  const word = Object.keys(WORD_NUMBERS).find((w) => new RegExp(`\\b${w}\\b`, "i").test(text));
  if (word) return WORD_NUMBERS[word];
  if (/\b(single|just one|one-?pager)\b/i.test(text)) return 1;
  return 1;
}

function shape(text: string): string {
  if (/\b(a4|print|portrait|3:4|tablet|ipad)\b/i.test(text)) return /\b(a4|print)\b/i.test(text) ? "A4 print" : "3:4 tablet";
  if (/\b(16:9|landscape|screen|slide|wide)\b/i.test(text)) return "16:9 landscape";
  if (/\b(9:16|mobile|story|vertical)\b/i.test(text)) return "9:16 mobile";
  return "A4 print";
}

/**
 * Read one answer. Returns what to record and what to say back — the caller
 * decides what to do with it, because that differs between the two flows.
 */
export function readIntakeAnswer(
  question: IntakeQuestion,
  text: string,
  attachmentKind: BriefAttachment["kind"] = "doc"
): IntakeAnswer {
  switch (question.kind) {
    case "attachment": {
      const value = attachmentRole(text, attachmentKind);
      return {
        questionId: question.id,
        kind: question.kind,
        value,
        reply: `Filed **${question.fileName}** under **${value}**.`,
      };
    }
    case "duration": {
      const n = seconds(text);
      return {
        questionId: question.id,
        kind: question.kind,
        value: `${n} sec`,
        reply: `**${n} seconds** it is.`,
      };
    }
    case "pages": {
      const n = pageCount(text);
      return {
        questionId: question.id,
        kind: question.kind,
        value: String(n),
        reply: `**${n} ${n === 1 ? "page" : "pages"}**, noted.`,
      };
    }
    case "shape": {
      const value = shape(text);
      return {
        questionId: question.id,
        kind: question.kind,
        value,
        reply: `**${value}**, noted.`,
      };
    }
  }
}

/**
 * One reply, read against every outstanding question.
 *
 * Each reader looks for its own words — a duration reader wants a number of
 * seconds, a shape reader wants a shape — so a single answer covering three
 * questions can be handed to all three. A per-file question first looks for
 * the sentence that names its file, and falls back to the whole reply when
 * the answer did not name any.
 */
export function readIntakeBundle(
  questions: IntakeQuestion[],
  text: string,
  attachmentKind: (question: IntakeQuestion) => BriefAttachment["kind"]
): IntakeAnswer[] {
  const sentences = text.split(/(?:\r?\n|(?<=[.;!?])\s+)/).filter((part) => part.trim().length > 0);
  return questions.map((question) => {
    let slice = text;
    if (question.kind === "attachment" && question.fileName) {
      const stem = question.fileName.replace(/\.[a-z0-9]+$/i, "");
      const named = sentences.find(
        (part) =>
          part.toLowerCase().includes(question.fileName!.toLowerCase()) ||
          part.toLowerCase().includes(stem.toLowerCase())
      );
      if (named) slice = named;
    }
    return readIntakeAnswer(question, slice, attachmentKind(question));
  });
}

/* ── The wait before the questions ───────────────────────────────────────── */

/**
 * What the agent is doing between the brief and the first question. Reading
 * the request, and opening whatever came with it — which is exactly what the
 * questions are about, so the wait explains why it is asking.
 */
export function intakeSteps(attachments: BriefAttachment[], brandName: string) {
  const perFile = attachments.map((file) => ({
    label: `Opened ${file.name}`,
    seconds: 0.7,
  }));
  return [
    { label: "Read the request", seconds: 0.8 },
    { label: `Matched it to the ${brandName} dossier`, seconds: 0.7 },
    ...perFile,
    { label: attachments.length ? "Checked what each attachment can ground" : "Checked what can be grounded", seconds: 0.8 },
    { label: "Listed what still needs your answer", seconds: 0.7 },
  ];
}
