import { cache } from "react";
import { db } from "@/lib/db";
import { isUpdateCurrent, listingLogoPath, readPublishedSnapshot, type ListingUpdateEntry, type ListingUpdateFeedEntry } from "@/lib/directory";
import type { PartnerPost, PartnerPostKind } from "@/generated/prisma/client";

// A PartnerPost (see its own schema comment) has no locale of its own —
// unlike PartnerListing.updates, which carries a full zh/ms translation
// (see ListingTranslations) through the same careful review each listing
// edit already gets. A quick post is deliberately lighter: it publishes in
// English only, on every locale's page, rather than needing a partner to
// translate (or wait on an admin re-approval) before a time-sensitive post
// goes out. If that tradeoff ever stops being the right one, add
// translations the same way `updates` has them — nothing here would need
// to change shape, just gain the same optional per-locale fields.
function toUpdateEntry(post: Pick<PartnerPost, "kind" | "title" | "body" | "createdAt" | "endDate">): ListingUpdateEntry {
  return {
    kind: post.kind,
    title: post.title,
    body: post.body,
    postedAt: post.createdAt.toISOString().slice(0, 10),
    endDate: post.endDate ? post.endDate.toISOString().slice(0, 10) : null,
  };
}

export async function getOwnedPost(id: string, partnerId: string) {
  return db.partnerPost.findFirst({ where: { id, partnerId } });
}

// Every post this partner has published, across every listing they own —
// same "spans every listing" shape as PartnerTestimonialsPage's own query
// (src/app/business-portal/(dashboard)/testimonials/page.tsx), newest
// first so the composer's own feed reads like a real post history.
export async function listPartnerPostsForPartner(partnerId: string) {
  return db.partnerPost.findMany({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { companyName: true, slug: true, googleBusinessProfileUrl: true } } },
  });
}

// Cached per request: the listing's own News/Promotions tab pages and
// layout.tsx's own tab-gating (does this listing have anything to show at
// all) both call this for the same listingId in the same request — see
// getPublishedListingBySlug's own comment for the same "cheap, cache()d"
// reasoning. Callers never need to re-check this listing is published —
// unlike loadLatestPartnerPosts below, every caller here already reached
// this listingId through getPublishedListingBySlug, which 404s first.
export const getListingPostsAsUpdateEntries = cache(async (listingId: string): Promise<ListingUpdateEntry[]> => {
  const posts = await db.partnerPost.findMany({ where: { listingId }, orderBy: { createdAt: "desc" } });
  return posts.map(toUpdateEntry);
});

const MAX_LATEST_POSTS = 60;

// The directory-wide news feed's own counterpart to loadLatestListingUpdates
// (src/lib/directory.ts) — same ListingUpdateFeedEntry shape, merged
// together by that feed's own caller (see news-feed-content.tsx) so a
// PartnerPost and an `updates` JSON entry render through the exact same
// UpdateItem/JSON-LD. Unlike getListingPostsAsUpdateEntries above, this
// reads across every listing, so it has to check for itself that each
// post's own listing has actually been published at least once — an
// instant post skips its *own* re-approval, not the bar of "is this a
// real, live business" the listing itself still has to clear.
export async function loadLatestPartnerPosts(limit = MAX_LATEST_POSTS): Promise<ListingUpdateFeedEntry[]> {
  const rows = await db.partnerPost.findMany({
    orderBy: { createdAt: "desc" },
    // Generous over-fetch: an unknown number of these drop out below (their
    // own listing was never published), so take(limit) alone could return
    // fewer than `limit` entries even when enough real ones exist.
    take: limit * 2,
    include: { listing: { select: { slug: true, publishedAt: true, publishedSnapshot: true } } },
  });
  const today = new Date().toISOString().slice(0, 10);
  const entries: ListingUpdateFeedEntry[] = [];
  for (const post of rows) {
    const snapshot = readPublishedSnapshot(post.listing.publishedSnapshot);
    if (!snapshot) continue;
    const entry = toUpdateEntry(post);
    // Only while still current, same as loadLatestListingUpdates
    // (src/lib/directory.ts) — a promotion past its own endDate drops out.
    if (!isUpdateCurrent(entry, today)) continue;
    entries.push({
      listingSlug: post.listing.slug,
      companyName: snapshot.companyName,
      logoUrl: snapshot.logoUrl ? listingLogoPath(post.listing.slug, post.listing.publishedAt) : null,
      update: entry,
      publishedAt: post.listing.publishedAt,
    });
    if (entries.length >= limit) break;
  }
  return entries;
}

export type { PartnerPostKind };
