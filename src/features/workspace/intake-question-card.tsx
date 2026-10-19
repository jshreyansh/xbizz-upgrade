"use client";

import { useState } from "react";
import { Check, Clock, FileStack, FileText, PenLine, RectangleHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import {
  answerFromChoices,
  intakeChoices,
  type BriefAttachment,
  type IntakeAnswer,
  type IntakeQuestion,
} from "@/features/workspace/plan-intake";

/**
 * What the plan still needs, asked in the chat as choices rather than a list
 * to answer in prose.
 *
 * The questions arrived as one numbered message — "you attached three files
 * but didn't say what they're for" — and the answer had to be written out
 * for each. Here it is one question at a time, the file it is about shown on
 * top, the likely uses as options. Ticking an option opens a line for a note
 * on it ("only the 100 mg pack"); "Something else" takes the user's own
 * words. A file can serve more than one purpose, so its question takes
 * several; a length or a shape takes one. Skip leaves it to SwishX.
 *
 * Typing an answer in the chat still works: the card is the quicker way, not
 * the only one.
 */

interface Pick {
  note: string;
}

export function IntakeQuestionCard({
  questions,
  attachments,
  onComplete,
}: {
  questions: IntakeQuestion[];
  attachments: BriefAttachment[];
  onComplete: (answers: IntakeAnswer[]) => void;
}) {
  const [index, setIndex] = useState(0);
  /* Per question: the options ticked (with their notes), and "Something else". */
  const [picks, setPicks] = useState<Record<string, Record<string, Pick>>>({});
  const [others, setOthers] = useState<Record<string, { on: boolean; text: string }>>({});
  const [answers, setAnswers] = useState<Record<string, IntakeAnswer>>({});

  const question = questions[index];
  if (!question) return null;
  const file = attachments.find((f) => `file-${f.id}` === question.id);
  const kind = file?.kind ?? "doc";
  const { title, multi, options } = intakeChoices(question, kind);
  const picked = picks[question.id] ?? {};
  const other = others[question.id] ?? { on: false, text: "" };
  const last = index === questions.length - 1;
  const ready = Object.keys(picked).length > 0 || (other.on && other.text.trim().length > 0);

  const toggle = (id: string) => {
    setPicks((all) => {
      const current = all[question.id] ?? {};
      if (current[id]) {
        const rest = { ...current };
        delete rest[id];
        return { ...all, [question.id]: rest };
      }
      return { ...all, [question.id]: multi ? { ...current, [id]: { note: "" } } : { [id]: { note: "" } } };
    });
    /* One answer only: choosing an option sets aside "Something else". */
    if (!multi) setOthers((all) => ({ ...all, [question.id]: { ...other, on: false } }));
  };
  const setNote = (id: string, note: string) =>
    setPicks((all) => ({ ...all, [question.id]: { ...(all[question.id] ?? {}), [id]: { note } } }));
  const toggleOther = () => {
    setOthers((all) => ({ ...all, [question.id]: { ...other, on: !other.on } }));
    if (!multi && !other.on) setPicks((all) => ({ ...all, [question.id]: {} }));
  };

  const advance = (answer: IntakeAnswer) => {
    const next = { ...answers, [question.id]: answer };
    setAnswers(next);
    if (last) onComplete(questions.map((q) => next[q.id]).filter(Boolean));
    else setIndex(index + 1);
  };
  const submit = () => {
    const chosen = options
      .filter((o) => picked[o.id])
      .map((o) => ({ id: o.id, label: o.label, note: picked[o.id].note }));
    advance(answerFromChoices(question, chosen, other.on ? other.text : undefined));
  };
  /* Left to SwishX: the answer an empty typed reply would have given. */
  const skip = () => {
    const fallback = options[question.kind === "duration" ? 2 : 0];
    const answer = answerFromChoices(question, [{ id: fallback.id, label: fallback.label }]);
    advance({ ...answer, reply: answer.reply.replace(/\.$/, " (my call; change it on the plan).") });
  };

  return (
    <div
      role="group"
      aria-label={`Question ${index + 1} of ${questions.length}`}
      className="rise-in flex max-h-[min(460px,60vh)] flex-col overflow-hidden rounded-panel border border-tint-line bg-card shadow-soft"
    >
      {/* What it's about, then the question. */}
      <div className="flex items-start gap-3 border-b border-hair p-3.5">
        <Preview file={file} kind={question.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-body-lg font-bold leading-snug text-ink [overflow-wrap:anywhere]">{title}</p>
          <p className="mt-0.5 truncate text-caption text-ink-3">
            {file ? `${file.name} · ` : ""}
            {index + 1} of {questions.length}
            {multi ? " · choose any that apply" : ""}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2.5">
        {options.map((option) => {
          const on = !!picked[option.id];
          return (
            <div
              key={option.id}
              className={cn(
                "rounded-control border transition-colors",
                on ? "border-brand bg-tint" : "border-hair hover:border-hair-3 hover:bg-subtle"
              )}
            >
              <button
                type="button"
                role={multi ? "checkbox" : "radio"}
                aria-checked={on}
                onClick={() => toggle(option.id)}
                className="flex w-full cursor-pointer items-start gap-2.5 px-3 py-2.5 text-left"
              >
                <Tick on={on} round={!multi} />
                <span className="min-w-0">
                  <span className="block text-body font-semibold text-ink">{option.label}</span>
                  <span className="block text-caption text-ink-3">{option.hint}</span>
                </span>
              </button>
              {/* The note, inside the option it is about. */}
              {on && (
                <div className="px-3 pb-2.5 pl-[2.375rem]">
                  <Field
                    size="sm"
                    autoFocus
                    aria-label={`Note on ${option.label}`}
                    placeholder={question.kind === "attachment" ? "Add a note (optional), e.g. only the 100 mg pack" : "Add a note (optional)"}
                    value={picked[option.id].note}
                    onChange={(e) => setNote(option.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && ready && submit()}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Their own answer, at the same level as the options. */}
        <div
          className={cn(
            "rounded-control border transition-colors",
            other.on ? "border-brand bg-tint" : "border-dashed border-hair-2 hover:border-hair-3 hover:bg-subtle"
          )}
        >
          <button
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={other.on}
            onClick={toggleOther}
            className="flex w-full cursor-pointer items-start gap-2.5 px-3 py-2.5 text-left"
          >
            <Tick on={other.on} round={!multi} />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-body font-semibold text-ink">
                <PenLine className="size-3.5 text-ink-3" />
                Something else
              </span>
              <span className="block text-caption text-ink-3">Say it in your own words.</span>
            </span>
          </button>
          {other.on && (
            <div className="px-3 pb-2.5 pl-[2.375rem]">
              <Field
                size="sm"
                autoFocus
                aria-label="Your answer"
                placeholder={question.kind === "attachment" ? "What should SwishX use it for?" : "Your answer"}
                value={other.text}
                onChange={(e) => setOthers((all) => ({ ...all, [question.id]: { on: true, text: e.target.value } }))}
                onKeyDown={(e) => e.key === "Enter" && ready && submit()}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-hair px-3 py-2.5">
        {index > 0 ? (
          <Button size="sm" variant="ghost" onClick={() => setIndex(index - 1)}>
            Back
          </Button>
        ) : (
          /* Where you are in the questions, as dots. */
          <span className="flex items-center gap-1 pl-1" aria-hidden>
            {questions.map((q, i) => (
              <span key={q.id} className={cn("size-1.5 rounded-full", i === index ? "bg-brand" : "bg-hair-3")} />
            ))}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={skip} title="SwishX picks; you can change it on the plan">
            Skip
          </Button>
          <Button size="sm" onClick={submit} disabled={!ready} className="gap-1.5 font-bold">
            {last ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Tick({ on, round }: { on: boolean; round: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 grid size-4 shrink-0 place-items-center border transition-colors",
        round ? "rounded-full" : "rounded-[5px]",
        on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card"
      )}
    >
      {on && (round ? <span className="size-1.5 rounded-full bg-card" /> : <Check className="size-3" strokeWidth={3} />)}
    </span>
  );
}

/** The file the question is about, or an icon for a question about the asset itself. */
function Preview({ file, kind }: { file?: BriefAttachment; kind: IntakeQuestion["kind"] }) {
  const box = "grid size-14 shrink-0 place-items-center overflow-hidden rounded-control border border-hair bg-subtle";
  if (file?.previewUrl && file.kind === "image") {
    return (
      <span className={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={file.previewUrl} alt="" className="size-full object-cover" />
      </span>
    );
  }
  if (file?.previewUrl && file.kind === "video") {
    return (
      <span className={box}>
        <video src={`${file.previewUrl}#t=0.1`} muted playsInline preload="metadata" className="size-full object-cover" />
      </span>
    );
  }
  if (file) {
    const ext = file.name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";
    return (
      <span className={cn(box, "relative")}>
        <FileText className="size-6 text-ink-3" />
        <span className="absolute bottom-1 rounded-glyph bg-danger px-1 text-micro font-extrabold text-white">{ext}</span>
      </span>
    );
  }
  const Icon = kind === "duration" ? Clock : kind === "pages" ? FileStack : RectangleHorizontal;
  return (
    <span className={cn(box, "bg-tint text-brand")}>
      <Icon className="size-6" />
    </span>
  );
}
