import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedListingBySlug, resolveListingDisplay } from "@/lib/directory";
import { buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingPath, directoryListingServicesPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceList } from "@/components/directory/service-list";

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
  if (display.services.length === 0) notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.servicesHeading}</CardTitle>
      </CardHeader>
      <CardBody>
        <ServiceList services={display.services} />
      </CardBody>
    </Card>
  );
}
