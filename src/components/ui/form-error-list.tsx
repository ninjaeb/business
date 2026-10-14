"use client";

// A form's problems gathered in one place, meant to sit directly above the
// submit button — where the visitor's eyes (and, on a phone, the viewport)
// already are when they press it. A missing-field message shown up beside a
// field at the top of a long form is simply off-screen by the time the
// button is pressed, and a toast vanishes before it's read; this stays put
// until the problem is fixed. role="alert" so a screen reader announces it.
//
// An item with a `targetId` is a link back to the field it's about: tapping
// "Please select a rating" scrolls the rating into view and moves focus into
// it, so on a long phone form the visitor isn't left hunting for what's
// missing. Items without one (an AI or server failure) are plain text.
export type FormErrorItem = { message: string; targetId?: string };

// The id may name the control itself (an <input>/<textarea>) or a wrapper
// around one (the star-rating row, a button group) — focus whichever
// interactive thing is there. preventScroll because scrollIntoView below has
// already centred it; letting focus() scroll as well makes it jump twice.
function goToField(targetId: string) {
  const element = document.getElementById(targetId);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  const control = element.matches("input, textarea, select, button")
    ? element
    : element.querySelector<HTMLElement>("input, textarea, select, button");
  control?.focus({ preventScroll: true });
}

export function FormErrorList({ items }: { items: FormErrorItem[] }) {
  const unique = items.filter((item, index) => item.message && items.findIndex((other) => other.message === item.message) === index);
  if (unique.length === 0) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
    >
      <ul className="space-y-0.5">
        {unique.map(({ message, targetId }) => (
          <li key={message}>
            {targetId ? (
              <button
                type="button"
                onClick={() => goToField(targetId)}
                className="text-left underline decoration-rose-400 underline-offset-2 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                {message}
              </button>
            ) : (
              message
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
