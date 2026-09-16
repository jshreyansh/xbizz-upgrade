import { cn } from "@/lib/cn";

/**
 * The agent writes **bold** into its own copy, so every panel that shows a
 * chat message has to read it back. Three panels grew their own copy of this
 * and one of them never got it — the creative editor was printing the
 * asterisks. One definition, and the drift has nowhere to start.
 */
export function FormattedMessageText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
}

/** The replies the agent offers with a question, under the message it asked. */
export function ChatChips({
  chips,
  onPick,
  className,
}: {
  chips?: string[];
  onPick: (chip: string) => void;
  className?: string;
}) {
  if (!chips || chips.length === 0) return null;
  return (
    <div className={cn("mt-2.5 pt-2 border-t border-hair flex flex-wrap gap-1.5", className)}>
      {chips.map((chip, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(chip)}
          className="text-label font-bold text-brand-deep bg-tint hover:bg-tint-strong border border-brand/20 px-2.5 py-1 rounded-chip transition cursor-pointer shadow-2xs hover:-translate-y-0.5"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
