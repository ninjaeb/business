import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  directoryHomePath,
  directoryListingServicesPath,
  directoryProductsPath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import { buildBreadcrumbJsonLd, loadLatestProducts } from "@/lib/directory";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
import { Card, CardBody } from "@/components/ui/card";
import { ListingLogo } from "@/components/directory/listing-logo";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

// A directory-wide "recently added" feed over every published listing's own
// services — no separate Product model, see loadLatestProducts.
export async function buildLatestProductsMetadata(locale: DirectoryLocale): Promise<Metadata> {
  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[locale];
  const url = `${siteOrigin}${directoryProductsPath(locale)}`;
  const shareImage = directoryShareImage(siteOrigin, locale);

  return {
    title: `${t.latestProductsHeading} | ${DIRECTORY_SITE_NAME_BY_LOCALE[locale]}`,
    description: t.latestProductsDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, (code) => directoryProductsPath(code)),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title: t.latestProductsHeading,
      description: t.latestProductsDescription,
      url,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t.latestProductsHeading,
      description: t.latestProductsDescription,
      images: [shareImage],
    },
  };
}

export async function LatestProductsContent({ locale }: { locale: DirectoryLocale }) {
  const [siteOrigin, products] = await Promise.all([getSiteOrigin(), loadLatestProducts(locale)]);
  const t = DIRECTORY_STRINGS[locale];
  const pageUrl = `${siteOrigin}${directoryProductsPath(locale)}`;
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: t.latestProductsHeading, url: pageUrl },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }} />
      <div className="mx-auto w-full px-4 py-8 sm:w-4/5 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          {t.latestProductsHeading}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.latestProductsDescription}</p>

        {products.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={Package} title={t.latestProductsEmptyTitle} description={t.latestProductsEmptyDescription} />
          </div>
        ) : (
          /* grid-cols-1 explicit, not just the implied single column below
             sm: an explicit track is sized minmax(0, 1fr) (bounded to the
             container), where an implicit "auto" track sizes itself off its
             widest item's own content instead — which, for a card holding a
             long company name, can blow the whole row wider than the
             viewport on mobile. */
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {products.map((product, index) => (
              <li key={`${product.listingSlug}-${index}`}>
                <Link href={directoryListingServicesPath(locale, product.listingSlug)} className="block h-full">
                  <Card className="flex h-full flex-col transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
                    <CardBody className="flex flex-1 flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <ListingLogo name={product.companyName} logoUrl={product.logoUrl} size={32} loading="lazy" className="h-8 w-8 text-xs" />
                        {/* min-w-0: a flex item's default min-width is its content's
                            un-wrapped size, which for a long company name can exceed
                            the row's available width and push the whole card (and
                            page) wider than the viewport on mobile — min-w-0 lets it
                            shrink so `truncate` actually has room to take effect. */}
                        <span className="min-w-0 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{product.companyName}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{product.service.title}</h3>
                      {product.service.description && (
                        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{product.service.description}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        {product.service.price ? (
                          <span className="text-sm font-medium text-petrol dark:text-petrol-light">{product.service.price}</span>
                        ) : (
                          <span />
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-petrol dark:text-petrol-light">
                          {t.viewListing}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
