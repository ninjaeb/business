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

// Feeds the listing layout's Review/AggregateRating JSON-LD (see buildJsonLd
// in src/app/[locale]/[slug]/layout.tsx) — a narrower projection than the
// Testimonials page's own query (no images, no locale), since JSON-LD only
// ever needs the fields a Review/Rating node itself carries.
export async function listApprovedTestimonialsForJsonLd(listingId: string) {
  return db.directoryTestimonial.findMany({
    where: { listingId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: { authorName: true, rating: true, body: true, createdAt: true },
  });
}
