import { Fragment } from "react";
import Link from "next/link";
import { ExternalLink, Eye, Megaphone, Plus, Store, Trash2 } from "lucide-react";
import { createListingAction, deleteListingAction } from "@/app/actions/directory";
import { isUpdateCurrent, listPartnerListings, listingViewCountBreakdown, readPublishedSnapshot } from "@/lib/directory";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { getSiteOrigin } from "@/lib/site-url";
import { directoryListingNewsPath, directoryListingPath, directoryListingPromotionsPath } from "@/lib/directory-i18n";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListingLogo } from "@/components/directory/listing-logo";
import { PARTNER_LISTING_STATUS_BADGE_CLASSES, PARTNER_LISTING_STATUS_LABELS } from "@/lib/labels";

// A partner account can list more than one business — each card here is
// its own PartnerListing row, independently drafted, submitted, and
// reviewed. "+ New listing" creates a blank draft and drops straight into
// its editor (see createListingAction); there's no separate "new listing"
// form to fill in first, same as the very first listing a partner ever
// gets started with.
export default async function PartnerListingsPage() {
  const user = await requireCompletePartnerProfile();
  const [listings, siteOrigin] = await Promise.all([listPartnerListings(user.id), getSiteOrigin()]);
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Business"
        description="Every business you have on the partner directory."
        actions={
          <form action={createListingAction}>
            <Button type="submit">
              <Plus className="h-4 w-4" />
              New listing
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
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
            return (
              <Card key={listing.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ListingLogo name={listing.companyName} logoUrl={listing.logoUrl} className="h-10 w-10 shrink-0 text-sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-200">{listing.companyName}</p>
                      <Badge className={PARTNER_LISTING_STATUS_BADGE_CLASSES[listing.status]}>
                        {PARTNER_LISTING_STATUS_LABELS[listing.status]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <Link
                      href={`/business-portal/listings/${listing.id}`}
                      className={buttonClasses("secondary", "sm")}
                    >
                      Edit
                    </Link>
                    {/* Never-published drafts only — !publicUrl is the
                        same "no publishedSnapshot yet" check
                        deleteListingAction itself makes: a listing that's
                        been live before keeps its last snapshot (and
                        tracked views) public even after an edit reverts its
                        status back to DRAFT pending re-approval, so status
                        alone isn't enough to tell "never published" apart
                        from "published, now mid-edit". */}
                    {listing.status === "DRAFT" && !publicUrl && (
                      <form action={deleteListingAction.bind(null, listing.id)}>
                        <ConfirmSubmitButton confirmMessage={`Delete the draft "${listing.companyName}"? This can't be undone.`}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    )}
                    {publicUrl && (
                      <Link
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-petrol hover:underline dark:text-petrol-light"
                      >
                        View public listing
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    {currentUpdatesPath && (
                      <Link
                        href={`${siteOrigin}${currentUpdatesPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-petrol hover:underline dark:text-petrol-light"
                      >
                        <Megaphone className="h-3.5 w-3.5" />
                        News & Promotions
                      </Link>
                    )}
                    {publicUrl && (
                      <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {trackedViewCount.toLocaleString()} view{trackedViewCount === 1 ? "" : "s"}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          (
                          {viewBreakdown.map(({ locale, label, count }, i) => (
                            <Fragment key={locale}>
                              {i > 0 && " · "}
                              <Link
                                href={`${siteOrigin}${directoryListingPath(locale, listing.slug)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-petrol hover:underline dark:hover:text-petrol-light"
                              >
                                {label} {count.toLocaleString()}
                              </Link>
                            </Fragment>
                          ))}
                          )
                        </span>
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
