"use client";

import { useActionState } from "react";
import { backfillListingGoogleRatings } from "@/app/actions/directory";
import { Button } from "@/components/ui/button";

// The admin page's own "Google ratings" card — see backfillListingGoogleRatings's
// own comment in src/app/actions/directory.ts for why this exists (a
// one-time backfill for listings that predate the feature, distinct from a
// partner's own AI Auto Create, which is how a listing gets — or corrects —
// its rating going forward). missingCount is read fresh on the server each
// time this page loads, so it drops to 0 (hiding the button) once nothing
// is left to search for.
export function GoogleRatingBackfillForm({ missingCount }: { missingCount: number }) {
  const [state, formAction, pending] = useActionState(backfillListingGoogleRatings, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {missingCount === 0
          ? "Every published listing already has a Google rating, or none was found for it."
          : `${missingCount} published listing${missingCount === 1 ? "" : "s"} ${missingCount === 1 ? "has" : "have"} no Google rating yet. This searches Google Places by each listing's own name and location and applies the top match automatically — a best-effort match, not a guaranteed-correct one, so review the result afterward.`}
      </p>
      {state && "error" in state && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      {state && "success" in state && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Matched {state.updated} listing{state.updated === 1 ? "" : "s"}
          {state.noMatch > 0 ? ` — ${state.noMatch} had no clear match on Google Maps` : ""}
          {state.noRating > 0 ? ` — ${state.noRating} matched a place with no rating on file` : ""}
          {"."}
        </p>
      )}
      {missingCount > 0 && (
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Searching…" : `Backfill for ${missingCount} listing${missingCount === 1 ? "" : "s"}`}
        </Button>
      )}
    </form>
  );
}
