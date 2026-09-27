import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  INDUSTRY_LABELS_BY_LOCALE,
  directoryHomePath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import {
  findLocationBySlug,
  buildDirectoryCollectionJsonLd,
  buildBreadcrumbJsonLd,
  countListingsByCityState,
  loadPublishedListings,
  toDirectoryGridListing,
  topCategoryNames,
} from "@/lib/directory";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  pageShareImage,
} from "@/lib/directory-seo";
import {
  locationLabel,
  locationPath,
  locationPageTitle,
  locationPageHeading,
  locationPageDescription,
} from "@/lib/directory-location-labels";
import { slugify } from "@/lib/slug";
import { DirectorySearch } from "@/components/directory/directory-search";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";

// Shared by every locale variant of the friendly location route (see
// src/app/[locale]/location/[locationSlug]/page.tsx), same division
// of labor as buildCategoryMetadata/CategoryPageContent. No noindex branch
// here the way the category version has: a category can exist in
// BusinessCategory with zero published listings, but a location slug only
// ever resolves (see findLocationBySlug) when at least one published
// listing actually carries it — there's no "empty location page" to keep
// out of the index in the first place.
export async function buildLocationMetadata(locationSlug: string, locale: DirectoryLocale): Promise<Metadata> {
  const [siteOrigin, rows] = await Promise.all([getSiteOrigin(), loadPublishedListings()]);
  const location = findLocationBySlug(rows, locationSlug);
  if (!location) return {};

  // Same exact-city+state match LocationPageContent's own locationListings
  // uses — see that filter's comment for why it's never city or state alone.
  const locationRows = rows.filter((row) => row.listing.city === location.city && row.listing.state === location.state);
  const label = locationLabel(location.city, location.state);
  const title = locationPageTitle(label, locale);
  const description = locationPageDescription(label, locale, locationRows.length, topCategoryNames(locationRows));
  const url = `${siteOrigin}${locationPath(locationSlug, locale)}`;
  const shareImage = pageShareImage(url, locationPageHeading(label, locale));

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, (code) => locationPath(locationSlug, code)),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title,
      description,
      url,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage],
    },
  };
}

export async function LocationPageContent({
  locationSlug,
  locale,
  q,
}: {
  locationSlug: string;
  locale: DirectoryLocale;
  q: string;
}) {
  const [siteOrigin, rows] = await Promise.all([getSiteOrigin(), loadPublishedListings()]);
  const location = findLocationBySlug(rows, locationSlug);
  if (!location) notFound();
  const { city, state } = location;

  const t = DIRECTORY_STRINGS[locale];
  const pageUrl = `${siteOrigin}${locationPath(locationSlug, locale)}`;
  const label = locationLabel(city, state);
  const heading = locationPageHeading(label, locale);
  // Same exact-city+state match as locationListings below (over the raw
  // rows rather than the locale-mapped grid listings — see
  // buildLocationMetadata's identical filter, which needs it before any
  // locale-specific mapping happens).
  const locationRows = rows.filter((row) => row.listing.city === city && row.listing.state === state);
  const description = locationPageDescription(label, locale, locationRows.length, topCategoryNames(locationRows));

  const listings = rows.map((row) => toDirectoryGridListing(row, locale));
  // Exact city+state match, including a state-only group's own city: null
  // (see countListingsByCityState) — "Petaling Jaya, Selangor" never picks
  // up a Shah Alam listing, and a plain "Selangor" (no city — an older
  // listing from before that field existed, or one left blank) never picks
  // up a listing that DOES have a city, matching the count
  // listLocationsWithCounts advertised for this exact group on the index.
  const locationListings = listings.filter((listing) => listing.city === city && listing.state === state);
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: heading, url: pageUrl },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  // Every other city+state (or state-only) group at least one published
  // listing carries — a location page otherwise has no on-page link to a
  // sibling location, only reachable by going back through the home page's
  // own "Browse by location" section (see DirectoryHomeSections). No
  // noindex-to-avoid concern here the way category's equivalent list has:
  // see buildLocationMetadata's own comment on why there's no such thing as
  // an empty location.
  const otherLocations = [...countListingsByCityState(rows).values()]
    .filter((group) => !(group.city === city && group.state === state))
    .map((group) => locationLabel(group.city, group.state))
    .sort((a, b) => a.localeCompare(b));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildDirectoryCollectionJsonLd(locationListings, pageUrl, siteOrigin, heading, locale, description),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <div className="w-full px-4 pt-4 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
      </div>
      <DirectorySearch
        listings={listings}
        industryLabels={INDUSTRY_LABELS_BY_LOCALE[locale]}
        t={t}
        locale={locale}
        initialQuery={q}
        initialIndustry=""
        initialCategory=""
        initialCity={city ?? ""}
        initialState={state}
        initialCountry=""
        directoryUrl={pageUrl}
        heading={heading}
        subheading={description}
      />
      {otherLocations.length > 0 && (
        <section aria-labelledby="other-locations" className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-8">
          <h2 id="other-locations" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.otherLocationsHeading}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otherLocations.map((name) => (
              <li key={name}>
                <Link
                  href={locationPath(slugify(name), locale)}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-petrol/40 hover:text-petrol dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:border-petrol-light/40 dark:hover:text-petrol-light"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
