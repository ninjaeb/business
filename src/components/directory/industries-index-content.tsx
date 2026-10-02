import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  INDUSTRY_LABELS_BY_LOCALE,
  directoryIndustriesIndexPath,
  directoryHomePath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import { buildBreadcrumbJsonLd, listIndustriesWithCounts } from "@/lib/directory";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
import { INDUSTRY_ICONS, industryPath } from "@/lib/directory-industry-labels";
import { DIRECTORY_HOME_COPY } from "@/lib/directory-home-copy";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

// Every Industry, including one with zero published listings — the
// industry counterpart of CategoriesIndexContent, same division of labor
// and same "one page a visitor/crawler sees the complete set from" reason
// (the home page's own pills, see DirectoryHomeSections, only show
// populated ones).
export async function buildIndustriesIndexMetadata(locale: DirectoryLocale): Promise<Metadata> {
  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[locale];
  const url = `${siteOrigin}${directoryIndustriesIndexPath(locale)}`;
  const shareImage = directoryShareImage(siteOrigin, locale);

  return {
    title: `${t.industriesIndexHeading} | ${DIRECTORY_SITE_NAME_BY_LOCALE[locale]}`,
    description: t.industriesIndexDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, (code) => directoryIndustriesIndexPath(code)),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title: t.industriesIndexHeading,
      description: t.industriesIndexDescription,
      url,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t.industriesIndexHeading,
      description: t.industriesIndexDescription,
      images: [shareImage],
    },
  };
}

export async function IndustriesIndexContent({ locale }: { locale: DirectoryLocale }) {
  const [siteOrigin, industries] = await Promise.all([getSiteOrigin(), listIndustriesWithCounts()]);
  const t = DIRECTORY_STRINGS[locale];
  const copy = DIRECTORY_HOME_COPY[locale];
  const pageUrl = `${siteOrigin}${directoryIndustriesIndexPath(locale)}`;
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: t.industriesIndexHeading, url: pageUrl },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }} />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          {t.industriesIndexHeading}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.industriesIndexDescription}</p>

        {industries.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={Briefcase} title={t.industriesIndexEmptyTitle} description={t.industriesIndexEmptyDescription} />
          </div>
        ) : (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map(({ industry, count }) => {
              const IndustryIcon = INDUSTRY_ICONS[industry];
              return (
                <li key={industry}>
                  <Link
                    href={industryPath(industry, locale)}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-petrol/40 hover:text-petrol dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-200 dark:hover:border-petrol-light/40 dark:hover:text-petrol-light"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <IndustryIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                      <span className="truncate">{INDUSTRY_LABELS_BY_LOCALE[locale][industry]}</span>
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
