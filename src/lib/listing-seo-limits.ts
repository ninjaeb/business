import type { ServiceEntry } from "@/lib/directory";

// Pure, dependency-free on purpose — no `db` import, unlike the rest of
// src/lib/directory.ts (which re-exports these kinds of client-safe values
// elsewhere too, e.g. slug.ts/operating-hours.ts). PartnerListingForm is a
// client component and needs these at runtime (its own maxLength
// attributes, live character counters, and the AI-generate button's
// context builder); importing them from directory.ts would pull that
// file's own top-level `db` import into the browser bundle, and the "use
// server" actions file (src/app/actions/directory.ts) can only export
// async functions, never a plain constant.

// Real truncation points search engines and social platforms actually cut
// a title tag (~60 characters) and meta description (~155-160) at — shared
// by the partner editor's own maxLength/counters, the save action's Zod
// validation, and the AI generator's own clip, so all three always agree
// instead of drifting the way the old 100/300-character caps had (well
// past where a search result or share preview actually truncates).
export const MAX_SEO_TITLE_LENGTH = 60;
export const MAX_SEO_DESCRIPTION_LENGTH = 155;

// The other AI actions (description rewrite, SEO meta) just want a
// readable summary of what services exist for grounding — not the
// structured list itself, which rewriteListingServices handles on its own
// terms. Shared between the partner editor (client) and the admin SEO
// backfill action (server) rather than duplicated.
export function servicesContextText(services: ServiceEntry[]): string {
  return services
    .filter((service) => service.title.trim())
    .map((service) => (service.description ? `${service.title} — ${service.description}` : service.title))
    .join("\n");
}
