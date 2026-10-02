import { db } from "@/lib/db";

// The write-a-testimonial dialog's "you've already reviewed this business"
// state (see WriteTestimonialButton) — both of its call sites (the listing
// layout's Share column, and the Testimonials page itself) need this same
// lookup, so it's factored out here rather than duplicated.
export async function getVisitorTestimonialForListing(visitorId: string, listingId: string) {
  return db.directoryTestimonial.findUnique({
    where: { listingId_authorId: { listingId, authorId: visitorId } },
    select: { status: true, reviewNote: true },
  });
}

export type TestimonialRatingSummary = { average: number; count: number };

// Feeds the listing layout's rich-result JSON-LD (buildJsonLd's
// aggregateRating) and its own visible rating badge — only when the listing
// has no Google rating of its own (see RatingBadge/buildJsonLd's own
// comments on that precedence). Returns null rather than a zero-count
// summary so callers can treat "no on-site rating yet" the same way they
// already treat a null googleRating. `_count: { rating: true }`, not the
// bare row count — DirectoryTestimonial.rating is nullable (a handful of
// testimonials predate the form requiring one), and Prisma's `_avg` already
// skips those nulls when averaging, so the count has to match or
// reviewCount would overstate how many ratings actually back the average.
export async function getListingTestimonialRatingSummary(listingId: string): Promise<TestimonialRatingSummary | null> {
  const result = await db.directoryTestimonial.aggregate({
    where: { listingId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  if (result._count.rating === 0 || result._avg.rating === null) return null;
  return { average: result._avg.rating, count: result._count.rating };
}

const JSON_LD_REVIEW_SAMPLE_SIZE = 10;

// A capped, newest-first sample for the same JSON-LD's own `review` array —
// every one of these is already genuinely visible on the listing's own
// Testimonials page (TestimonialList), which is what keeps this markup
// honest rather than asserting reviews a visitor can't actually go read.
// Capped rather than every APPROVED row: schema.org puts no limit on it, but
// a business with hundreds of testimonials doesn't need all of them
// duplicated into every page's own JSON-LD — the aggregate from
// getListingTestimonialRatingSummary above already reflects the true total.
// rating: { not: null } excludes the same legacy no-rating rows that
// summary's own count already excludes — a Review needs a reviewRating to
// be worth emitting at all.
export async function getRecentApprovedTestimonialsForJsonLd(listingId: string) {
  const rows = await db.directoryTestimonial.findMany({
    where: { listingId, status: "APPROVED", rating: { not: null } },
    orderBy: { createdAt: "desc" },
    take: JSON_LD_REVIEW_SAMPLE_SIZE,
    select: { rating: true, body: true, authorName: true, createdAt: true },
  });
  // The where clause above guarantees every row's rating is non-null, but
  // Prisma's generated type can't narrow on a runtime filter — this just
  // tells TypeScript what the query already ensures.
  return rows as { rating: number; body: string; authorName: string; createdAt: Date }[];
}
