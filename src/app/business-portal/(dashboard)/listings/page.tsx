import { Plus, Store } from "lucide-react";
import { createListingAction } from "@/app/actions/directory";
import { isUpdateCurrent, listPartnerListings, listingViewCountBreakdown, readPublishedSnapshot } from "@/lib/directory";
import { getListingPostsAsUpdateEntries } from "@/lib/partner-posts";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { getSiteOrigin } from "@/lib/site-url";
import { directoryListingPath, directoryListingPostsPath } from "@/lib/directory-i18n";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MyBusinessListingsGrid, type MyBusinessListingCard } from "@/components/directory/my-business-listings-grid";

// A partner account can list more than one business — each card here is
// its own PartnerListing row, independently drafted, submitted, and
// reviewed. "+ New Business" creates a blank draft and drops straight into
// its editor (see createListingAction); there's no separate "new listing"
// form to fill in first, same as the very first listing a partner ever
// gets started with.
export default async function PartnerListingsPage() {
  const user = await requireCompletePartnerProfile();
  const [listings, siteOrigin] = await Promise.all([listPartnerListings(user.id), getSiteOrigin()]);
  const todayIso = new Date().toISOString().slice(0, 10);
  const livePostsByListingId = new Map(
    await Promise.all(listings.map(async (listing) => [listing.id, await getListingPostsAsUpdateEntries(listing.id)] as const)),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Business"
        description="Every business you have on the partner directory."
        actions={
          <form action={createListingAction}>
            <Button type="submit">
              <Plus className="h-4 w-4" />
              New Business
            </Button>
          </form>
        }
      />

      {listings.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={Store}
              title="No listings yet"
              description="Create your first listing to get your business on the public directory."
            />
          </CardBody>
        </Card>
      ) : (
        <MyBusinessListingsGrid
          listings={listings.map((listing): MyBusinessListingCard => {
            const publicUrl = listing.publishedSnapshot ? `${siteOrigin}${directoryListingPath("en", listing.slug)}` : null;
            // Only a shortcut into a section actually on the live page — the
            // Posts card itself only renders when there's at least one
            // current (not-yet-expired) post, same condition as the Posts
            // page's own `posts` (src/app/[locale]/[slug]/posts/page.tsx),
            // merging both sources it does: the published snapshot's own
            // `updates` (legacy, always empty post-migration — see
            // migrateUpdatesToPartnerPosts in prisma/seed.ts) and live
            // PartnerPost rows.
            const currentUpdates = [
              ...(readPublishedSnapshot(listing.publishedSnapshot)?.updates ?? []),
              ...(livePostsByListingId.get(listing.id) ?? []),
            ].filter((update) => isUpdateCurrent(update, todayIso));
            const currentUpdatesPath = currentUpdates.length > 0 ? directoryListingPostsPath("en", listing.slug) : null;
            const viewBreakdown = listingViewCountBreakdown(listing);
            const trackedViewCount = viewBreakdown.reduce((sum, { count }) => sum + count, 0);
            return {
              id: listing.id,
              companyName: listing.companyName,
              logoUrl: listing.logoUrl,
              status: listing.status,
              publicUrl,
              currentUpdatesUrl: currentUpdatesPath ? `${siteOrigin}${currentUpdatesPath}` : null,
              trackedViewCount,
              viewBreakdown: viewBreakdown.map(({ locale, label, count }) => ({
                locale,
                label,
                count,
                href: `${siteOrigin}${directoryListingPath(locale, listing.slug)}`,
              })),
            };
          })}
        />
      )}
    </div>
  );
}
