"use client";

import { useEffect, useRef } from "react";

// The anti-bot timer half that lives in the browser (the server half is
// isSuspiciouslyFast in src/lib/lead-spam-guard.ts). Renders a hidden `fillMs`
// input that, the instant the surrounding form is submitted, is stamped with
// how many milliseconds the form has been on screen — measured with
// performance.now(), a monotonic clock, so a visitor's wrong system clock
// can't make a human look like a bot (the old Date.now() timestamp could, and
// the server then silently dropped their submission behind a fake "thanks").
//
// Stamped from a native `submit` listener on the form rather than a React
// handler: the form's own element sees the event before React's root listener
// does, so the value is already in place when React builds the FormData for
// the Server Action. Left empty until then, so a submission that never ran
// this script (a bot that doesn't execute JS) reads as "missing" server-side.
export function FillTimeField() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    const form = input?.form;
    if (!input || !form) return;
    const shownAt = performance.now();
    const stamp = () => {
      input.value = String(Math.round(performance.now() - shownAt));
    };
    form.addEventListener("submit", stamp);
    return () => form.removeEventListener("submit", stamp);
  }, []);

  return <input ref={inputRef} type="hidden" name="fillMs" defaultValue="" />;
}
