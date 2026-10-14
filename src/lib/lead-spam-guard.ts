// Extra bot/spam resistance for the public lead form, layered on top of
// the honeypot field already checked by each caller (submitLead,
// /api/public/lead). Both checks below are deliberately silent to the
// caller when they trip — same reasoning as the honeypot's "pretend
// success" response: an error just teaches a bot to route around it,
// where a fake success doesn't.

// A bot that fills every field and submits within a fraction of a second
// of the form appearing didn't read anything — no human types this fast.
// The form measures its own fill time in the browser (see FillTimeField in
// src/components/ui/fill-time-field.tsx) and sends it as `fillMs`; missing
// or malformed input counts as suspicious too, since a bot that never
// executed the page's JS won't have sent it.
//
// Deliberately a DURATION measured on one clock, not a timestamp compared
// against the server's clock. The original check sent `Date.now()` at render
// and compared it to the server's `Date.now()` at submit — so any visitor
// whose device clock ran even a few seconds AHEAD of the server's looked
// like they'd submitted before the form existed, tripped this check, and got
// the silent fake-success below: "Thanks!" on screen, nothing saved. For a
// contact-a-business lead or a testimonial that's a lost message with no
// error anywhere. A monotonic in-browser duration can't be skewed by a wrong
// system clock.
export const MIN_FILL_MS = 1500;

export function isSuspiciouslyFast(formData: FormData): boolean {
  const fillMs = Number(formData.get("fillMs"));
  if (formData.get("fillMs") !== null && formData.get("fillMs") !== "") {
    return !Number.isFinite(fillMs) || fillMs < MIN_FILL_MS;
  }

  // A tab opened before this change shipped still posts the old `renderedAt`
  // timestamp instead. Its wall-clock comparison can't be trusted either
  // (see above), so only a plainly-too-fast, non-negative gap counts as
  // suspicious — a future timestamp means a skewed clock, not a bot. Anything
  // else (neither field) never ran the page's JS at all.
  const renderedAt = Number(formData.get("renderedAt"));
  if (formData.get("renderedAt") === null || !Number.isFinite(renderedAt)) return true;
  const elapsed = Date.now() - renderedAt;
  return elapsed >= 0 && elapsed < MIN_FILL_MS;
}

// Per-IP throttle for submissions that get past the checks above — catches
// a scripted bot that waits out the timer and leaves the honeypot blank
// but still hammers the endpoint with different fake data each time.
// In-memory rather than a DB table: this is abuse mitigation, not a
// security boundary, so losing counts on a redeploy is harmless. Grows by
// one small entry per distinct IP that ever submits, with no eviction —
// fine at the volume a lead-gen contact form actually sees; a
// high-traffic public endpoint would need a real store or a cleanup sweep.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

// Two separate budgets, so one never starves the other. "form" is every
// submission-style action (a lead, a signup/login, a testimonial) — few
// legitimate attempts per visitor, so 5 is generous. "ai" is the "Rewrite
// with AI" / "Suggest a testimonial" helpers: a visitor re-rolls those
// several times while working on ONE testimonial, and if they shared the
// "form" budget the visitor would burn it on the helpers and then be told
// "too many attempts" at the moment they press Submit — losing the
// testimonial they just finished. They still need a cap (each call costs
// real model usage), just a higher, separate one.
const RATE_LIMIT_MAX_ATTEMPTS = { form: 5, ai: 20 } as const;
export type RateLimitScope = keyof typeof RATE_LIMIT_MAX_ATTEMPTS;
const attemptsByScopeAndIp = new Map<string, number[]>();

export function isRateLimited(ip: string | null, scope: RateLimitScope = "form"): boolean {
  if (!ip) return false;
  const now = Date.now();
  const key = `${scope}:${ip}`;
  const recent = (attemptsByScopeAndIp.get(key) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  attemptsByScopeAndIp.set(key, recent);
  return recent.length > RATE_LIMIT_MAX_ATTEMPTS[scope];
}
