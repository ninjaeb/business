import { db } from "@/lib/db";

// The business-portal's own list of links a partner has generated (see
// /business-portal/testimonial-links) — spans every listing the partner
// owns, same "a partner account can list more than one business" reasoning
// as the testimonials moderation page.
export async function listTestimonialRequestLinks(partnerId: string) {
  return db.testimonialRequestLink.findMany({
    where: { listing: { partnerId } },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { slug: true, companyName: true } } },
  });
}

// Ownership-scoped lookup for a single link — same "an id alone doesn't
// prove ownership" discipline as getOwnedListing/getOwnedTestimonialOrThrow.
export async function getOwnedTestimonialRequestLink(id: string, partnerId: string) {
  return db.testimonialRequestLink.findFirst({
    where: { id, listing: { partnerId } },
    include: { listing: { select: { slug: true, companyName: true } } },
  });
}

// The standalone page's own lookup (see /[locale]/review/[token] and
// submitStandaloneTestimonial) — excludes an already-used link (so
// reopening a spent link reads as "not available" rather than silently
// re-showing the form) and a listing that isn't published (the same guard
// every other testimonial path applies — checked in JS rather than the
// where clause itself, since publishedSnapshot is a Json column and Prisma
// wants its own JsonNull sentinel there instead of a plain `null`, same
// reasoning submitDirectoryTestimonial's own `!listing.publishedSnapshot`
// check already follows). Returns the full listing row, not a trimmed
// selection, since both the page (logo/name/locale-aware display) and
// notifyPartnerOfNewTestimonial (partnerId, companyName) need different
// slices of it.
export async function getTestimonialRequestLinkForForm(id: string) {
  const request = await db.testimonialRequestLink.findFirst({
    where: { id, usedAt: null },
    include: { listing: true },
  });
  if (!request || !request.listing.publishedSnapshot) return null;
  return request;
}

// Built fresh by the list page / copy-link button, not stored — the token
// is just the row's own id (see TestimonialRequestLink's own comment on
// why), so there's nothing to persist beyond the row itself. Always /en/ —
// the business-portal that generates this link is English-only, same as
// every other partner-facing page, but the customer who opens it can still
// switch locale on the standalone page itself like any other visitor.
export function testimonialRequestUrl(siteOrigin: string, linkId: string): string {
  return `${siteOrigin}/en/review/${linkId}`;
}
