import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  directoryHomePath,
  directoryLocationsIndexPath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import { buildBreadcrumbJsonLd, listLocationsWithCounts } from "@/lib/directory";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
import { locationLabel, locationPath } from "@/lib/directory-location-labels";
import { DIRECTORY_HOME_COPY } from "@/lib/directory-home-copy";
import { slugify } from "@/lib/slug";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

// Every state at least one published listing carries (see
// listLocationsWithCounts) — the locations counterpart of
// CategoriesIndexContent.
export async function buildLocationsIndexMetadata(locale: DirectoryLocale): Promise<Metadata> {
  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[locale];
  const url = `${siteOrigin}${directoryLocationsIndexPath(locale)}`;
  const shareImage = directoryShareImage(siteOrigin, locale);

  return {
    title: `${t.locationsIndexHeading} | ${DIRECTORY_SITE_NAME_BY_LOCALE[locale]}`,
    description: t.locationsIndexDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, (code) => directoryLocationsIndexPath(code)),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title: t.locationsIndexHeading,
      description: t.locationsIndexDescription,
      url,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t.locationsIndexHeading,
      description: t.locationsIndexDescription,
      images: [shareImage],
    },
  };
}

export async function LocationsIndexContent({ locale }: { locale: DirectoryLocale }) {
  const [siteOrigin, locations] = await Promise.all([getSiteOrigin(), listLocationsWithCounts()]);
  // Only worth showing at all once there's more than one country in the
  // list — with a single country (the common case for now) every row would
  // repeat the same word for no reason.
  const showCountry = new Set(locations.map((location) => location.country).filter(Boolean)).size > 1;
  const t = DIRECTORY_STRINGS[locale];
  const copy = DIRECTORY_HOME_COPY[locale];
  const pageUrl = `${siteOrigin}${directoryLocationsIndexPath(locale)}`;
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: t.locationsIndexHeading, url: pageUrl },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }} />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.locationsIndexHeading}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.locationsIndexDescription}</p>

        {locations.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={MapPin} title={t.locationsIndexEmptyTitle} description={t.locationsIndexEmptyDescription} />
          </div>
        ) : (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map(({ city, state, country, count }) => {
              const label = locationLabel(city, state);
              return (
                <li key={label}>
                  <Link
                    href={locationPath(slugify(label), locale)}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-petrol/40 hover:text-petrol dark:border-neutral-800 dark:text-slate-200 dark:hover:border-petrol-light/40 dark:hover:text-petrol-light"
                  >
                    <span className="min-w-0 truncate">
                      {label}
                      {showCountry && country && <span className="text-slate-400 dark:text-slate-500"> · {country}</span>}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{copy.listingCount(count)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
