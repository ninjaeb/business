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
