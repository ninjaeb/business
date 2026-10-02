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

// The public testimonial form's own lookup (see WriteTestimonialButton,
// getTestimonialRequestPreview in src/app/actions/testimonials.ts) — scoped
// by listingId as well as id so a token copied from one listing's link can
// never be replayed against a different listing's slug, and excludes an
// already-used link so a visitor who reopens an old link mid-conversation
// just sees the ordinary form instead of a stale "you're reviewing X" banner.
export async function getTestimonialRequestLinkPreview(id: string, listingId: string) {
  return db.testimonialRequestLink.findFirst({
    where: { id, listingId, usedAt: null },
    select: { serviceTitle: true },
  });
}

// Built fresh by the list page / copy-link button, not stored — the token
// is just the row's own id (see TestimonialRequestLink's own comment on
// why), so there's nothing to persist beyond the row itself.
export function testimonialRequestUrl(siteOrigin: string, locale: string, slug: string, linkId: string): string {
  return `${siteOrigin}/${locale}/${slug}/testimonials?req=${linkId}`;
}
