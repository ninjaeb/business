"use client";

import { useActionState } from "react";
import { backfillListingSeoMeta } from "@/app/actions/directory";
import { Button } from "@/components/ui/button";

// The admin page's own "SEO metadata" card — see backfillListingSeoMeta's
// own comment in src/app/actions/directory.ts for why this exists at all
// (most listings never get an AI-written or hand-typed SEO title/
// description, and silently fall back to a generic one). missingCount is
// read fresh on the server each time this page loads, so it drops to 0
// (hiding the button) once nothing is left to generate.
export function SeoBackfillForm({ missingCount }: { missingCount: number }) {
  const [state, formAction, pending] = useActionState(backfillListingSeoMeta, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {missingCount === 0
          ? "Every published listing already has its own SEO title and description."
          : `${missingCount} published listing${missingCount === 1 ? "" : "s"} ${missingCount === 1 ? "has" : "have"} no SEO title or description of its own yet — visitors and search engines see a generic fallback instead.`}
      </p>
      {state && "error" in state && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      {state && "success" in state && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Generated SEO metadata for {state.updated} listing{state.updated === 1 ? "" : "s"}
          {state.failed > 0 ? ` — ${state.failed} failed, try again later.` : "."}
        </p>
      )}
      {missingCount > 0 && (
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Generating…" : `Generate for ${missingCount} listing${missingCount === 1 ? "" : "s"}`}
        </Button>
      )}
    </form>
  );
}
