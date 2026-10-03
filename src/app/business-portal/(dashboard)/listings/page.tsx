import { Plus, Store } from "lucide-react";
import { createListingAction } from "@/app/actions/directory";
import { isUpdateCurrent, listPartnerListings, listingViewCountBreakdown, readPublishedSnapshot } from "@/lib/directory";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { getSiteOrigin } from "@/lib/site-url";
import { directoryListingNewsPath, directoryListingPath, directoryListingPromotionsPath } from "@/lib/directory-i18n";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PORTAL_LISTINGS_STRINGS } from "@/lib/portal-listing-i18n";
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
  const [listings, siteOrigin, locale] = await Promise.all([
    listPartnerListings(user.id),
    getSiteOrigin(),
    getDirectoryLocale(),
  ]);
  const t = PORTAL_LISTINGS_STRINGS[locale];
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.myBusiness}
        description={t.listingsPageDescription}
        actions={
          <form action={createListingAction}>
            <Button type="submit">
              <Plus className="h-4 w-4" />
              {t.newBusiness}
            </Button>
          </form>
        }
      />

      {listings.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState icon={Store} title={t.emptyTitle} description={t.emptyDescription} />
          </CardBody>
        </Card>
      ) : (
        <MyBusinessListingsGrid
          locale={locale}
          listings={listings.map((listing): MyBusinessListingCard => {
            const publicUrl = listing.publishedSnapshot ? `${siteOrigin}${directoryListingPath("en", listing.slug)}` : null;
            // Only a shortcut into a section actually on the live page —
            // the News & Promotions card itself only renders when the
            // published snapshot has at least one current (not-yet-expired)
            // post, same condition as [slug]/page.tsx's own currentUpdates.
            const currentUpdates = (readPublishedSnapshot(listing.publishedSnapshot)?.updates ?? []).filter((update) =>
              isUpdateCurrent(update, todayIso),
            );
            // News and Promotions are each their own page now (see
            // src/app/[locale]/[slug]/), so this one shortcut link points at
            // whichever of the two actually has something current — the
            // Promotion, when there's one, same priority as the two used to
            // render in on the single combined card.
            const currentUpdatesPath = currentUpdates.some((update) => update.kind === "PROMOTION")
              ? directoryListingPromotionsPath("en", listing.slug)
              : currentUpdates.length > 0
                ? directoryListingNewsPath("en", listing.slug)
                : null;
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
