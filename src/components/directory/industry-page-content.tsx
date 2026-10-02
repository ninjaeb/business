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
  buildDirectoryCollectionJsonLd,
  buildBreadcrumbJsonLd,
  countListingsByIndustry,
  loadPublishedListings,
  toDirectoryGridListing,
} from "@/lib/directory";
import {
  DIRECTORY_NOINDEX_ROBOTS,
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  pageShareImage,
} from "@/lib/directory-seo";
import {
  findIndustryBySlug,
  industryPath,
  industryPageTitle,
  industryPageHeading,
  industryPageDescription,
} from "@/lib/directory-industry-labels";
import { INDUSTRIES } from "@/lib/labels";
import { directoryGuidePath } from "@/lib/directory-i18n";
import { listPublishedGuidesByIndustry } from "@/lib/directory-guides";
import { Card, CardBody } from "@/components/ui/card";
import { DirectorySearch } from "@/components/directory/directory-search";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";

// Shared by every locale variant of the friendly industry route (see
// src/app/[locale]/industry/[industrySlug]/page.tsx), same
// division of labor as buildCategoryMetadata/CategoryPageContent.
export async function buildIndustryMetadata(industrySlugParam: string, locale: DirectoryLocale): Promise<Metadata> {
  const industry = findIndustryBySlug(industrySlugParam);
  if (!industry) return {};

  const [siteOrigin, rows] = await Promise.all([getSiteOrigin(), loadPublishedListings()]);
  const hasListings = (countListingsByIndustry(rows).get(industry) ?? 0) > 0;
  const title = industryPageTitle(industry, locale);
  const description = industryPageDescription(industry, locale);
  const url = `${siteOrigin}${industryPath(industry, locale)}`;
  const shareImage = pageShareImage(url, industryPageHeading(industry, locale));

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, (code) => industryPath(industry, code)),
    },
    // An industry nobody's listing carries yet is thin content, same
    // reasoning (and same fix — it flips back on its own the moment a
    // listing carries it) as an empty category (see buildCategoryMetadata).
    robots: hasListings ? DIRECTORY_ROBOTS : DIRECTORY_NOINDEX_ROBOTS,
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

export async function IndustryPageContent({
  industrySlug: industrySlugParam,
  locale,
  q,
}: {
  industrySlug: string;
  locale: DirectoryLocale;
  q: string;
}) {
  const industry = findIndustryBySlug(industrySlugParam);
  if (!industry) notFound();

  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[locale];
  const pageUrl = `${siteOrigin}${industryPath(industry, locale)}`;
  const heading = industryPageHeading(industry, locale);
  const description = industryPageDescription(industry, locale);

  const [rows, relatedGuides] = await Promise.all([loadPublishedListings(), listPublishedGuidesByIndustry(industry, locale)]);
  const listings = rows.map((row) => toDirectoryGridListing(row, locale));
  const industryListings = listings.filter((listing) => listing.industry === industry);
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: heading, url: pageUrl },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  // Every other industry with at least one published listing — same
  // populated-only rule as category's own sibling-links section (an empty
  // industry's own page is noindex, see buildIndustryMetadata, so linking
  // to one here would only lead somewhere search engines are asked to skip).
  const countByIndustry = countListingsByIndustry(rows);
  const otherIndustries = INDUSTRIES.filter((code) => code !== industry && (countByIndustry.get(code) ?? 0) > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildDirectoryCollectionJsonLd(industryListings, pageUrl, siteOrigin, heading, locale, description),
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
        initialIndustry={industry}
        initialCategory=""
        initialCity={null}
        initialState=""
        initialCountry=""
        directoryUrl={pageUrl}
        heading={heading}
        subheading={description}
      />
      {relatedGuides.length > 0 && (
        <section aria-labelledby="related-guides" className="mx-auto w-full max-w-5xl px-4 pb-8 sm:px-8">
          <h2 id="related-guides" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.guideRelatedHeading}
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedGuides.map((guide) => (
              <li key={guide.id}>
                <Link href={directoryGuidePath(locale, guide.slug)} className="block">
                  <Card className="h-full transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
                    <CardBody className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{guide.title}</h3>
                      <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{guide.excerpt}</p>
                    </CardBody>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {otherIndustries.length > 0 && (
        <section aria-labelledby="other-industries" className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-8">
          <h2 id="other-industries" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.otherIndustriesHeading}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otherIndustries.map((code) => (
              <li key={code}>
                <Link
                  href={industryPath(code, locale)}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-petrol/40 hover:text-petrol dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:border-petrol-light/40 dark:hover:text-petrol-light"
                >
                  {INDUSTRY_LABELS_BY_LOCALE[locale][code]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
