"use client";

/**
 * The left pane while the agent is asking.
 *
 * It has nothing to show yet — the plan is drawn from answers that have not
 * been given, and a plan drawn before them would be a guess presented as a
 * decision. So it does not pretend to have content: it says what it is
 * waiting for and points at where to give it.
 *
 * The bars sweep left to right, toward the chat. Not a progress bar — there
 * is no progress to report — but a direction, so the eye leaves this half of
 * the screen and lands on the half that is asking.
 */
export function IntakePlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-8">
      <div className="w-full max-w-[420px]">
        <h2 className="text-display font-[850] tracking-tight text-ink">Need your input</h2>
        <p className="mt-1.5 text-body-lg leading-snug text-ink-3">
          Answer in chat to help us make the best plan for you.
        </p>

        <div aria-hidden className="mt-6 space-y-2.5">
          {[100, 82, 64].map((width, index) => (
            <div
              key={width}
              className="h-9 overflow-hidden rounded-control border border-hair-2 bg-card"
              style={{ width: `${width}%` }}
            >
              <div
                className="intake-sweep h-full w-full"
                style={{ animationDelay: `${index * 0.22}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
