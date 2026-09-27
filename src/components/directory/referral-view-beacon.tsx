"use client";

import { useEffect, useRef, useTransition } from "react";
import { recordReferralView } from "@/app/actions/directory";

// Records one view against whichever signed-in partner's own copy of the
// Recommend link (its `via=<User.id>` tag — see recommendUrl in
// src/app/[locale]/[slug]/layout.tsx) this visit arrived through, if any.
// Reads window.location.search directly rather than useSearchParams(),
// same trick directory-lead-form.tsx already uses for its own `r` field —
// no Suspense boundary needed for that. Renders nothing; mounted at layout
// level (not inside a child page) so this effect's empty dependency array
// gives it the same "once per visit, not once per child page" lifetime
// incrementListingViewCount already has, rather than refiring on every
// client-side navigation between this listing's own section pages.
//
// The `hasFired` ref guards against React Strict Mode's dev-only double
// invoke of effects — harmless in production (this component only ever
// mounts once per real visit either way) but avoids a misleading double
// count while testing locally against `next dev`.
export function ReferralViewBeacon({ listingId }: { listingId: string }) {
  const hasFired = useRef(false);
  const [, startTransition] = useTransition();

  // Intentionally once per mount (this listing's own visit), not once per
  // re-render — listingId can't meaningfully change under this component anyway.
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    const referrerId = new URLSearchParams(window.location.search).get("via");
    if (referrerId) startTransition(() => recordReferralView(listingId, referrerId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
