// A form's problems gathered in one place, meant to sit directly above the
// submit button — where the visitor's eyes (and, on a phone, the viewport)
// already are when they press it. A missing-field message shown up beside a
// field at the top of a long form is simply off-screen by the time the
// button is pressed, and a toast vanishes before it's read; this stays put
// until the problem is fixed. role="alert" so a screen reader announces it.
export function FormErrorList({ messages }: { messages: string[] }) {
  const unique = Array.from(new Set(messages.filter(Boolean)));
  if (unique.length === 0) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
    >
      <ul className="space-y-0.5">
        {unique.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
