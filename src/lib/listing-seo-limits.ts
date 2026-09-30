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
// a title tag (~60 characters) and meta description at — shared by the
// partner editor's own maxLength/counters, the save action's Zod
// validation, and the AI generator's own clip, so all three always agree
// instead of drifting the way the old 100/300-character caps had.
// MAX_SEO_DESCRIPTION_LENGTH is 255 — the <meta name="description"> tag
// itself has no enforced limit, and Google's SERP snippet is commonly cut
// off around 155-160 characters on desktop, but a longer stored value is
// still worth allowing: Google sometimes shows a longer snippet (mobile,
// certain queries), and the same seoDescription is reused verbatim for
// Open Graph/Twitter Card previews, which tolerate more text than a SERP
// snippet does. Content past ~160 characters just won't reliably show in a
// plain Google search result, so the AI generator (see
// LISTING_SEO_SYSTEM_PROMPT/AUTO_LISTING_SYSTEM_PROMPT in
// src/app/actions/directory.ts) still targets ~140-160 for the part that
// has to do the work there.
export const MAX_SEO_TITLE_LENGTH = 60;
export const MAX_SEO_DESCRIPTION_LENGTH = 255;

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
