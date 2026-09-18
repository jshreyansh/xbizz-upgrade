"use client";

import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { intakeLabel, type IntakeAnswer, type IntakeQuestion } from "@/features/workspace/plan-intake";

/**
 * The left pane while the agent is asking its questions.
 *
 * It used to be a title, a line of instruction and a bare "2 of 2" on an
 * otherwise empty screen — which told you a conversation was happening
 * somewhere and nothing about what it was for. Half the screen said less than
 * the counter did.
 *
 * It is the same questions, listed: what has been answered and what it was
 * answered with, what is being asked right now, and what is still to come.
 * The plan is drawn from these answers, so this is the plan taking shape.
 */
export function IntakeChecklist({
  questions,
  answers,
  currentIndex,
}: {
  questions: IntakeQuestion[];
  answers: IntakeAnswer[];
  /** Which question is outstanding. */
  currentIndex: number;
}) {
  const remaining = Math.max(0, questions.length - answers.length);

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-8">
      <div className="w-full max-w-[480px]">
        <h2 className="text-display font-[850] tracking-tight text-ink">Need your input</h2>
        <p className="mt-1.5 text-body-lg leading-snug text-ink-3">
          {remaining === 0
            ? "That is everything — laying the plan out now."
            : `${remaining} ${remaining === 1 ? "question" : "questions"} and the plan is ready. Answer in the chat.`}
        </p>

        <ol className="mt-5 space-y-1.5">
          {questions.map((question, index) => {
            const answer = answers.find((a) => a.questionId === question.id);
            const isCurrent = !answer && index === currentIndex;
            return (
              <li
                key={question.id}
                className={cn(
                  "flex items-start gap-2.5 rounded-control border px-3 py-2.5 transition-all duration-200",
                  answer
                    ? "border-ok-line bg-ok-bg/40"
                    : isCurrent
                      ? "border-brand bg-tint shadow-xs ring-2 ring-brand/15"
                      : "border-hair-2 bg-card opacity-65"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full border text-micro font-black tabular-nums",
                    answer
                      ? "border-ok bg-ok text-white"
                      : isCurrent
                        ? "border-brand bg-brand text-white"
                        : "border-hair-3 bg-card text-ink-4"
                  )}
                >
                  {answer ? <Check className="size-2.5 stroke-[3]" /> : index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-body font-bold", answer ? "text-ink-2" : "text-ink")}>
                    {intakeLabel(question)}
                  </div>
                  {answer ? (
                    <div className="mt-0.5 truncate text-label font-bold text-ok">{answer.value}</div>
                  ) : isCurrent ? (
                    /* The question as asked, so the pane and the chat say the
                       same thing rather than two versions of it. */
                    <p className="mt-0.5 text-label leading-snug text-ink-2">
                      {question.prompt.replace(/\*\*/g, "")}
                    </p>
                  ) : null}
                </div>

                {isCurrent && (
                  <span className="mt-0.5 flex shrink-0 items-center gap-1 text-caption font-extrabold text-brand">
                    Answer in chat
                    <ArrowRight className="size-3" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
