import { db } from "@/lib/db";
import { listingLogoPath, readPublishedSnapshot } from "@/lib/directory";
import type { Industry } from "@/generated/prisma/client";

// The business-portal's own list of every partner-connection this account
// has a stake in (see /business-portal/business-partners) — spans every
// listing this partner owns, on either side of the relationship (requester
// or recipient), same "a partner account can list more than one business"
// reasoning as the Testimonials/Review Links pages just above this one in
// the nav. The page itself buckets these into "awaiting your approval"
// (recipientListing.partnerId === partnerId && status PENDING), "sent"
// (requesterListing.partnerId === partnerId && status PENDING), and
// "connected" (ACCEPTED) — cheaper to do once in JS than as three separate
// queries.
export async function listBusinessPartnerLinksForPartner(partnerId: string) {
  return db.businessPartnerLink.findMany({
    where: { OR: [{ requesterListing: { partnerId } }, { recipientListing: { partnerId } }] },
    orderBy: { createdAt: "desc" },
    include: {
      requesterListing: { select: { id: true, slug: true, companyName: true, partnerId: true } },
      recipientListing: { select: { id: true, slug: true, companyName: true, partnerId: true } },
    },
  });
}

// Ownership-scoped lookup for a single link — same "an id alone doesn't
// prove ownership" discipline as getOwnedListing/getOwnedTestimonialRequestLink.
// Matches on EITHER side, since both the requester (cancelling) and the
// recipient (accepting/declining) are legitimate owners of this row from
// their own account's point of view — callers that need one side
// specifically (e.g. only a recipient may accept) check requesterListing/
// recipientListing.partnerId themselves after this resolves the row.
export async function getOwnedBusinessPartnerLink(id: string, partnerId: string) {
  return db.businessPartnerLink.findFirst({
    where: { id, OR: [{ requesterListing: { partnerId } }, { recipientListing: { partnerId } }] },
    include: {
      requesterListing: { select: { id: true, slug: true, companyName: true, partnerId: true } },
      recipientListing: { select: { id: true, slug: true, companyName: true, partnerId: true } },
    },
  });
}

export type BusinessPartnerSearchResult = {
  id: string;
  slug: string;
  companyName: string;
  tagline: string | null;
  logoUrl: string | null;
  industry: Industry | null;
};

const SEARCH_CANDIDATE_LIMIT = 20;
const SEARCH_RESULT_LIMIT = 8;

// The "add business partner" picker's own search (see
// BusinessPartnerRequestForm) — a fresh query, since nothing in this
// codebase already searches PartnerListing rows by name (the public
// directory's own search is an in-memory index built from every PUBLISHED
// listing, not a DB query — see loadDirectorySearchIndex). Only a listing
// that's actually live (has a current publishedSnapshot — same "published"
// convention as loadPublishedListings/getPublishedBranchListings, not the
// status column) can be found here: requesting a partnership with a
// listing that visitors can't even see yet wouldn't make sense. excludeIds
// is always this partner's own listing ids, so a partner never finds (and
// can't request to partner with) one of their own other businesses — that
// relationship is branch linking (see linkListingsAsBranches), a different
// feature for a different purpose.
export async function searchBusinessPartnerCandidates(
  query: string,
  excludeIds: string[],
): Promise<BusinessPartnerSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const rows = await db.partnerListing.findMany({
    where: { companyName: { contains: trimmed, mode: "insensitive" }, id: { notIn: excludeIds } },
    select: { id: true, slug: true, publishedAt: true, publishedSnapshot: true },
    take: SEARCH_CANDIDATE_LIMIT,
  });
  const results: BusinessPartnerSearchResult[] = [];
  for (const row of rows) {
    const snapshot = readPublishedSnapshot(row.publishedSnapshot);
    if (!snapshot) continue;
    results.push({
      id: row.id,
      slug: row.slug,
      companyName: snapshot.companyName,
      tagline: snapshot.tagline,
      // Never the snapshot's own logoUrl directly (the raw data: URL it's
      // stored as) — see ListingLogo's own comment on why every public
      // caller resolves through listingLogoPath instead.
      logoUrl: snapshot.logoUrl ? listingLogoPath(row.slug, row.publishedAt) : null,
      industry: snapshot.industry,
    });
    if (results.length >= SEARCH_RESULT_LIMIT) break;
  }
  return results;
}

export type PublishedBusinessPartner = {
  slug: string;
  companyName: string;
  tagline: string | null;
  logoUrl: string | null;
  industry: Industry | null;
};

// For the public Business Partners tab — every connection that's ACCEPTED
// on either side of this listing, resolved to whichever is the *other*
// listing, and still actually live (same "read every row, keep whichever
// has a snapshot" treatment as getPublishedBranchListings — a partner since
// unpublished or deleted simply drops out here rather than needing the
// link cleaned up separately).
export async function getPublishedBusinessPartners(listingId: string): Promise<PublishedBusinessPartner[]> {
  const links = await db.businessPartnerLink.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterListingId: listingId }, { recipientListingId: listingId }],
    },
    select: { requesterListingId: true, recipientListingId: true },
  });
  if (links.length === 0) return [];
  const partnerIds = links.map((link) => (link.requesterListingId === listingId ? link.recipientListingId : link.requesterListingId));
  const rows = await db.partnerListing.findMany({
    where: { id: { in: partnerIds } },
    select: { slug: true, publishedAt: true, publishedSnapshot: true },
  });
  return rows
    .map((row) => {
      const snapshot = readPublishedSnapshot(row.publishedSnapshot);
      if (!snapshot) return null;
      return {
        slug: row.slug,
        companyName: snapshot.companyName,
        tagline: snapshot.tagline,
        logoUrl: snapshot.logoUrl ? listingLogoPath(row.slug, row.publishedAt) : null,
        industry: snapshot.industry,
      };
    })
    .filter((entry): entry is PublishedBusinessPartner => entry !== null);
}

// The business-portal's own list of businesses a partner has invited by
// hand (see /business-portal/business-partners and
// createBusinessPartnerInvite) — spans every listing this partner owns,
// same reasoning as listBusinessPartnerLinksForPartner above.
export async function listBusinessPartnerInvitesForPartner(partnerId: string) {
  return db.businessPartnerInvite.findMany({
    where: { inviterListing: { partnerId } },
    orderBy: { createdAt: "desc" },
    include: { inviterListing: { select: { companyName: true } } },
  });
}

export async function getOwnedBusinessPartnerInvite(id: string, partnerId: string) {
  return db.businessPartnerInvite.findFirst({ where: { id, inviterListing: { partnerId } } });
}
