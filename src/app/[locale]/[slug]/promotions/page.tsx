import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedListingBySlug, resolveListingDisplay } from "@/lib/directory";
import { buildListingMetadata, buildUpdatesJsonLd } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingPath, directoryListingPromotionsPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateItem } from "@/components/directory/update-item";

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
    pageUrl: `${siteOrigin}${directoryListingPromotionsPath(resolved, slug)}`,
    pathFor: (code) => directoryListingPromotionsPath(code, slug),
    sectionHeading: t.promotionsHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

export default async function PromotionsPage({
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
  if (display.currentPromotions.length === 0) notFound();

  const siteOrigin = await getSiteOrigin();
  const pageUrl = `${siteOrigin}${directoryListingPromotionsPath(resolved, slug)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildUpdatesJsonLd(display.currentPromotions, siteOrigin, pageUrl) }}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.promotionsHeading}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {display.currentPromotions.map((update, index) => (
            <UpdateItem key={index} update={update} locale={resolved} />
          ))}
        </CardBody>
      </Card>
    </>
  );
}
