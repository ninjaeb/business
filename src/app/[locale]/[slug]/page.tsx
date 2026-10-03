import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPublishedListingBySlug,
  latestListings,
  loadPublishedListings,
  nearbyListingsExcludingIndustry,
  resolveListingDisplay,
  toDirectoryGridListing,
} from "@/lib/directory";
import { buildListingMetadata } from "@/lib/directory-seo";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, INDUSTRY_LABELS_BY_LOCALE, directoryListingPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingCard } from "@/components/directory/listing-card";
import { LegacyAnchorRedirect } from "@/components/directory/legacy-anchor-redirect";

export const dynamic = "force-dynamic";

// How many other listings to surface in each of the two "other businesses"
// sections below this one (see latestListings/nearbyListingsExcludingIndustry)
// — enough to be useful, not so many the section competes with the
// listing's own content for attention.
const MAX_RELATED_LISTINGS = 6;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) return {};

  const siteOrigin = await getSiteOrigin();
  return buildListingMetadata({
    listing,
    siteOrigin,
    locale: resolved,
    pageUrl: `${siteOrigin}${directoryListingPath(resolved, slug)}`,
    pathFor: (code) => directoryListingPath(code, slug),
    // Every listing gets the same branded card (company name, its services,
    // and this same description, in the gotka.com house style) as its link
    // preview, rather than a partner's own logo/photo — consistent quality
    // across the whole directory regardless of what a partner did or didn't
    // upload. Rendered by this route's own opengraph-image.tsx, which reads
    // the same published snapshot buildListingMetadata's own listing param
    // does. Shared by every one of this listing's pages, not just this one.
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

export default async function DirectoryAboutPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  // Cached (see getPublishedListingBySlug) — this is the same fetch the
  // shared layout already made for this request, not a second database
  // round trip.
  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();

  const t = DIRECTORY_STRINGS[resolved];
  const display = resolveListingDisplay(listing, resolved);

  // Two ways to reach another business from this page — without these,
  // landing here from search or an AI answer engine has no path to another
  // listing except going all the way back to the directory home.
  // Deliberately NOT grouped by this listing's own category/industry: the
  // newest published listings overall, and other listings in the same
  // state but a different industry, so a visitor sees fresh and nearby
  // businesses rather than a list of this one's direct competitors. Kept
  // only on this, the listing's default/About page — its other pages
  // (Products & Services, Photos, ...) stay focused on their own single
  // topic rather than repeating this same "browse more" content on every
  // one of them.
  const publishedRows = await loadPublishedListings();
  const latestBusinesses = latestListings(publishedRows, slug, MAX_RELATED_LISTINGS).map((row) =>
    toDirectoryGridListing(row, resolved),
  );
  const nearbyBusinesses = listing.state
    ? nearbyListingsExcludingIndustry(publishedRows, listing.state, slug, listing.industry, MAX_RELATED_LISTINGS).map(
        (row) => toDirectoryGridListing(row, resolved),
      )
    : [];

  return (
    <>
      <LegacyAnchorRedirect basePath={directoryListingPath(resolved, slug)} />
      {display.description && (
        <Card id="about">
          <CardHeader>
            <CardTitle className="text-base">{t.aboutHeading}</CardTitle>
          </CardHeader>
          <CardBody className="text-base text-slate-600 dark:text-slate-300">
            {renderMarkdownLite(display.description, undefined, { zoomableImages: true })}
          </CardBody>
        </Card>
      )}

      {/* Kept inside the shared layout's own lg:col-span-2 column (rather
          than full-width sections below the whole grid) so the grid itself
          — and with it the "Get in touch" card's sticky containing block —
          extends the whole way down through them. Sticky only holds while
          its own column has room left to move within; ending the column
          right after the About card would leave the contact card scrolling
          away well before the page's actual end. */}
      {latestBusinesses.length > 0 && (
        <section aria-labelledby="latest-businesses">
          <h2 id="latest-businesses" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.latestBusinessesHeading}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {latestBusinesses.map((related) => (
              <ListingCard
                key={related.slug}
                listing={related}
                viewLabel={t.viewListing}
                industryLabel={related.industry ? INDUSTRY_LABELS_BY_LOCALE[resolved][related.industry] : undefined}
                locale={resolved}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

      {nearbyBusinesses.length > 0 && (
        <section aria-labelledby="nearby-businesses">
          <h2 id="nearby-businesses" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.nearbyBusinessesHeading}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {nearbyBusinesses.map((related) => (
              <ListingCard
                key={related.slug}
                listing={related}
                viewLabel={t.viewListing}
                industryLabel={related.industry ? INDUSTRY_LABELS_BY_LOCALE[resolved][related.industry] : undefined}
                locale={resolved}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
