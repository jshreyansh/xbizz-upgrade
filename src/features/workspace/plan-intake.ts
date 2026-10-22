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

export type IntakeKind = "attachment" | "duration" | "pages" | "shape" | "nextstep";

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
  /** The user's own words on it, when they added any. */
  note?: string;
}

export interface BriefAttachment {
  id: string;
  name: string;
  kind: "image" | "video" | "doc";
  /** An object URL for images and video, so the question can show the file. */
  previewUrl?: string;
}

/* ── The questions ───────────────────────────────────────────────────────── */

const roleOptions = (kind: BriefAttachment["kind"]) =>
  kind === "doc"
    ? "the clinical evidence in it, the wording, or the layout"
    : "the product shot, the visual style, or footage to cut in";

export function buildIntakeQuestions(
  attachments: BriefAttachment[],
  assetType: AssetType,
  /** A poster's pages and shape come from its congress, so they are not asked. */
  options: { poster?: boolean; brief?: string } = {}
): IntakeQuestion[] {
  const perFile = attachments.map<IntakeQuestion>((file) => ({
    id: `file-${file.id}`,
    kind: "attachment",
    fileName: file.name,
    prompt: `You attached **${file.name}** but didn't say what it's for. What should I take from it, ${roleOptions(file.kind)}?`,
  }));

  if (assetType === "infographic" && options.poster) return perFile;

  /* An ad's length and sizes follow from its placements. What no dossier
     says is what the ad asks people to do, and only when the brief doesn't. */
  if (assetType === "ad") {
    const said = /\b(talk to (your|their) doctor|ask (your|their) doctor|saving|copay|co-pay|sign[- ]?up|visit|find a (doctor|specialist)|learn more)\b/i.test(options.brief ?? "");
    return said
      ? perFile
      : [
          ...perFile,
          {
            id: "nextstep",
            kind: "nextstep",
            prompt: "What should people do after seeing the ad? It becomes the closing line in every ad.",
          },
        ];
  }

  if (assetType === "infographic") {
    return [
      ...perFile,
      {
        id: "pages",
        kind: "pages",
        prompt: "How many pages should this run to, anywhere from one to twelve? One page holds a single figure well; more give room for evidence, safety and a page per message.",
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

/* ── Answering by choosing ─────────────────────────────────────────────── */

export interface IntakeOption {
  id: string;
  label: string;
  hint: string;
}

/**
 * The same questions as choices, for the card in the chat.
 *
 * Typed answers still work; this is the quicker way for anyone who would
 * rather pick than write. A file can be used for more than one thing, so its
 * question takes several; a length or a shape is one thing, so it takes one.
 */
export function intakeChoices(
  question: IntakeQuestion,
  attachmentKind: BriefAttachment["kind"] = "doc"
): { title: string; multi: boolean; options: IntakeOption[] } {
  switch (question.kind) {
    case "attachment":
      return {
        title: `What should I use ${question.fileName} for?`,
        multi: true,
        options:
          attachmentKind === "doc"
            ? [
                { id: "Evidence", label: "Clinical evidence", hint: "Claims and data to ground the content in." },
                { id: "Wording", label: "Wording", hint: "Phrasing to reuse or match." },
                { id: "Layout", label: "Layout", hint: "A structure to follow." },
                { id: "Context only", label: "Context only", hint: "Background reading; nothing quoted from it." },
              ]
            : attachmentKind === "video"
              ? [
                  { id: "Footage", label: "Footage to cut in", hint: "Clips shown in the video." },
                  { id: "Visual style", label: "Visual style", hint: "The look and feel to match." },
                  { id: "Context only", label: "Context only", hint: "Background; not shown." },
                ]
              : [
                  { id: "Product shot", label: "Product packshot", hint: "Your product's picture, shown in the content." },
                  { id: "Logo", label: "Logo", hint: "Your brand mark, placed in a corner." },
                  { id: "Visual style", label: "Visual style", hint: "The look and feel to match." },
                  { id: "Context only", label: "Context only", hint: "Background; not shown." },
                ],
      };
    case "duration":
      return {
        title: "How long should the video run?",
        multi: false,
        options: [
          { id: "30 sec", label: "30 seconds", hint: "A single idea." },
          { id: "45 sec", label: "45 seconds", hint: "One idea with its evidence." },
          { id: "60 sec", label: "60 seconds", hint: "The need, the mechanism and the evidence." },
          { id: "90 sec", label: "90 seconds", hint: "Room for safety and a second claim." },
        ],
      };
    case "pages":
      return {
        title: "How many pages should it run to?",
        multi: false,
        options: [
          { id: "1", label: "1 page", hint: "A single figure, held well." },
          { id: "2", label: "2 pages", hint: "The message, then the evidence and safety." },
          { id: "3", label: "3 pages", hint: "A page per message." },
          { id: "4", label: "4 pages", hint: "A full detail aid." },
        ],
      };
    case "nextstep":
      return {
        title: "What should people do next?",
        multi: false,
        options: [
          { id: "Talk to their doctor", label: "Talk to their doctor", hint: "\u201cAsk your doctor about it.\u201d" },
          { id: "Sign up for savings", label: "Sign up for savings", hint: "Copay card and patient support." },
          { id: "Visit the brand site", label: "Visit the brand site", hint: "Learn more about the treatment." },
          { id: "Find a specialist", label: "Find a specialist", hint: "A doctor who treats the condition." },
        ],
      };
    case "shape":
      return {
        title: "What shape should the pages be?",
        multi: false,
        options: [
          { id: "A4 print", label: "A4 print", hint: "Leave-behinds and printed handouts." },
          { id: "3:4 tablet", label: "3:4 tablet", hint: "Detailing on an iPad." },
          { id: "16:9 landscape", label: "16:9 screen", hint: "Slides and screens." },
        ],
      };
  }
}

/**
 * What the card's choices mean for the plan: the same answer a typed reply
 * would have produced, so the plan cannot tell which way it was given.
 */
export function answerFromChoices(
  question: IntakeQuestion,
  picked: Array<{ id: string; label: string; note?: string }>,
  other?: string
): IntakeAnswer {
  /* With one option ticked the note is plainly about it; with several, say which. */
  const notes = picked
    .filter((p) => p.note?.trim())
    .map((p) => (picked.length > 1 ? `${p.label}: ${p.note!.trim()}` : p.note!.trim()));
  const note = notes.join("; ") || undefined;
  if (question.kind === "attachment") {
    const roles = [...picked.map((p) => p.id), ...(other?.trim() ? [other.trim()] : [])];
    const value = roles.join(" + ") || "Evidence";
    return { questionId: question.id, kind: question.kind, value, note, reply: `Filed **${question.fileName}** under **${value}**.` };
  }
  /* One choice, or the user's own: read the own words the way a typed answer is read. */
  if (!picked.length && other?.trim()) {
    const answer = readIntakeAnswer(question, other);
    return { ...answer, note };
  }
  const choice = picked[0];
  const base = readIntakeAnswer(question, choice ? choice.id : "");
  return { ...base, note };
}

/** The card's answers, said back in the chat as the user's own message. */
export function choicesMessage(answers: IntakeAnswer[], questions: IntakeQuestion[]): string {
  return answers
    .map((a) => {
      const q = questions.find((x) => x.id === a.questionId);
      const what = q?.fileName
        ? `**${q.fileName}**`
        : q?.kind === "duration" ? "**Length**" : q?.kind === "pages" ? "**Pages**" : q?.kind === "nextstep" ? "**Next step**" : "**Shape**";
      return `${what}: ${a.value}${a.note ? ` (${a.note})` : ""}`;
    })
    .join("\n");
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

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

function pageCount(text: string): number {
  /* One to twelve — the same ceiling as the plan's Pages row. */
  const digit = text.match(/\b(1[0-2]|[1-9])\b/);
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

function nextStep(text: string): string {
  if (/\b(saving|copay|co-pay|coupon|cost|afford)/i.test(text)) return "Sign up for savings";
  if (/\b(find|locator|specialist|near me)\b/i.test(text)) return "Find a specialist";
  if (/\b(site|website|visit|learn)\b/i.test(text)) return "Visit the brand site";
  return "Talk to their doctor";
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
    case "nextstep": {
      const value = nextStep(text);
      return {
        questionId: question.id,
        kind: question.kind,
        value,
        reply: `Every ad will close by asking people to **${value.toLowerCase()}**.`,
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
