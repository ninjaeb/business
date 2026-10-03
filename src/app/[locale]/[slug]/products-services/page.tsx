import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedListingBySlug, resolveListingDisplay } from "@/lib/directory";
import { getBusinessPartnerServices } from "@/lib/business-partners";
import { buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingPath, directoryListingServicesPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceList } from "@/components/directory/service-list";
import { ListingLogo } from "@/components/directory/listing-logo";

export const dynamic = "force-dynamic";

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
  const t = DIRECTORY_STRINGS[resolved];
  return buildListingMetadata({
    listing,
    siteOrigin,
    locale: resolved,
    pageUrl: `${siteOrigin}${directoryListingServicesPath(resolved, slug)}`,
    pathFor: (code) => directoryListingServicesPath(code, slug),
    sectionHeading: t.servicesHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

export default async function ProductsServicesPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();

  const t = DIRECTORY_STRINGS[resolved];
  const display = resolveListingDisplay(listing, resolved);
  const partnerServices = await getBusinessPartnerServices(listing.id, resolved);
  if (display.services.length === 0 && partnerServices.length === 0) notFound();

  return (
    <div className="space-y-6">
      {display.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.servicesHeading}</CardTitle>
          </CardHeader>
          <CardBody>
            <ServiceList services={display.services} />
          </CardBody>
        </Card>
      )}

      {/* A connected business partner's own service — not this listing's,
          so it's never a ServiceList row (those toggle into *this*
          listing's own inquiry, see useInquiry) and always links out to
          that partner's own Products & Services page instead. */}
      {partnerServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.partnerServicesHeading}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.partnerServicesDescription}</p>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800">
              <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
                {partnerServices.map((product, index) => (
                  <li key={`${product.listingSlug}-${index}`}>
                    <Link
                      href={directoryListingServicesPath(resolved, product.listingSlug)}
                      className="flex items-start gap-3 px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/60"
                    >
                      <ListingLogo name={product.companyName} logoUrl={product.logoUrl} size={32} loading="lazy" className="h-8 w-8 shrink-0 text-xs" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{product.service.title}</h3>
                          {product.service.price && (
                            <span className="shrink-0 text-base font-medium text-petrol dark:text-petrol-light">{product.service.price}</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{product.companyName}</p>
                        {product.service.description && (
                          <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{product.service.description}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
