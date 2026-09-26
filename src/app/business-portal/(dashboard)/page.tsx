import { Fragment } from "react";
import Link from "next/link";
import { ExternalLink, Eye, Inbox, Handshake, Plus, Store, ThumbsUp, Trophy, Wallet } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { createListingAction } from "@/app/actions/directory";
import { listPartnerListings, getDirectoryLeadStatsForPartner, listingViewCountBreakdown } from "@/lib/directory";
import { getCurrency } from "@/lib/settings";
import { getSiteOrigin } from "@/lib/site-url";
import { directoryListingPath } from "@/lib/directory-i18n";
import { formatCurrencyExact } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListingLogo } from "@/components/directory/listing-logo";
import { PARTNER_LISTING_STATUS_BADGE_CLASSES, PARTNER_LISTING_STATUS_LABELS } from "@/lib/labels";

// No commission/payout system (unlike the CRM this was extracted from,
// whose own overview page mixed referral-link stats with directory
// stats) — just the one "Referred" stat below, alongside the rest of how
// this partner's directory leads are going.
export default async function PartnerOverviewPage() {
  const user = await requireCompletePartnerProfile();
  const [listings, directoryStats, currency, siteOrigin] = await Promise.all([
    listPartnerListings(user.id),
    getDirectoryLeadStatsForPartner(user.id),
    getCurrency(),
    getSiteOrigin(),
  ]);
  const publishedListingCount = listings.filter((listing) => listing.publishedSnapshot).length;

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Your listings and directory leads at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="New leads" value={directoryStats.new.toString()} icon={Inbox} accent="sky" href="/business-portal/business-leads" />
        <StatCard label="Open" value={directoryStats.open.toString()} icon={Handshake} accent="amber" href="/business-portal/business-leads" />
        <StatCard label="Won" value={directoryStats.won.toString()} icon={Trophy} accent="emerald" />
        <StatCard label="Won value" value={formatCurrencyExact(directoryStats.wonValue, currency)} icon={Wallet} accent="indigo" />
        <StatCard
          label="Referred"
          value={directoryStats.referred.toString()}
          description="Via your Recommend link"
          icon={ThumbsUp}
          accent="orange"
          href="/business-portal/business-leads"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My listings</CardTitle>
          <form action={createListingAction}>
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4" />
              New listing
            </Button>
          </form>
        </CardHeader>
        <CardBody>
          {listings.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No listings yet"
              description="Create your first listing to get your business on the public directory."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => {
                const publicUrl = listing.publishedSnapshot ? `${siteOrigin}${directoryListingPath("en", listing.slug)}` : null;
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
                        <Link href={`/business-portal/listings/${listing.id}`} className={buttonClasses("secondary", "sm")}>
                          Edit
                        </Link>
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
          {listings.length > 0 && (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {listings.length} listing{listings.length === 1 ? "" : "s"}
              {publishedListingCount > 0 && ` · ${publishedListingCount} live on the public directory`} ·{" "}
              <Link href="/business-portal/listings" className="text-petrol hover:underline dark:text-petrol-light">
                Manage listings
              </Link>
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
