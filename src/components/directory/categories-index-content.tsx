import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  directoryCategoriesIndexPath,
  directoryHomePath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import { buildBreadcrumbJsonLd, listCategoriesWithCounts } from "@/lib/directory";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
import { translateCategoryName, categoryPath } from "@/lib/directory-category-labels";
import { DIRECTORY_HOME_COPY } from "@/lib/directory-home-copy";
import { slugify } from "@/lib/slug";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

// Every BusinessCategory (see listCategoriesWithCounts), including ones no
// listing has yet — unlike the home page's own category pills
// (DirectoryHomeSections), which only ever show populated ones. This is the
// one page a visitor (or a crawler) can see the *complete* set from.
export async function buildCategoriesIndexMetadata(locale: DirectoryLocale): Promise<Metadata> {
  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[locale];
  const url = `${siteOrigin}${directoryCategoriesIndexPath(locale)}`;
  const shareImage = directoryShareImage(siteOrigin, locale);

  return {
    title: `${t.categoriesIndexHeading} | ${DIRECTORY_SITE_NAME_BY_LOCALE[locale]}`,
    description: t.categoriesIndexDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, (code) => directoryCategoriesIndexPath(code)),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title: t.categoriesIndexHeading,
      description: t.categoriesIndexDescription,
      url,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t.categoriesIndexHeading,
      description: t.categoriesIndexDescription,
      images: [shareImage],
    },
  };
}

export async function CategoriesIndexContent({ locale }: { locale: DirectoryLocale }) {
  const [siteOrigin, categories] = await Promise.all([getSiteOrigin(), listCategoriesWithCounts()]);
  const t = DIRECTORY_STRINGS[locale];
  const copy = DIRECTORY_HOME_COPY[locale];
  const pageUrl = `${siteOrigin}${directoryCategoriesIndexPath(locale)}`;
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: t.categoriesIndexHeading, url: pageUrl },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }} />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.categoriesIndexHeading}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.categoriesIndexDescription}</p>

        {categories.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={LayoutGrid} title={t.categoriesIndexEmptyTitle} description={t.categoriesIndexEmptyDescription} />
          </div>
        ) : (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ name, count }) => (
              <li key={name}>
                <Link
                  href={categoryPath(slugify(name), locale)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-petrol/40 hover:text-petrol dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-200 dark:hover:border-petrol-light/40 dark:hover:text-petrol-light"
                >
                  <span className="truncate">{translateCategoryName(name, locale)}</span>
                  <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{copy.listingCount(count)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
