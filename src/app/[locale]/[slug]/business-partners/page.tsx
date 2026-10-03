import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedListingBySlug } from "@/lib/directory";
import { getPublishedBusinessPartners } from "@/lib/business-partners";
import { buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, INDUSTRY_LABELS_BY_LOCALE, directoryListingBusinessPartnersPath, directoryListingPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingCard } from "@/components/directory/listing-card";

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
    pageUrl: `${siteOrigin}${directoryListingBusinessPartnersPath(resolved, slug)}`,
    pathFor: (code) => directoryListingBusinessPartnersPath(code, slug),
    sectionHeading: t.businessPartnersHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

// Conditional like every other section page except About/Testimonials —
// layout.tsx only links to this tab once getPublishedBusinessPartners
// returns at least one partner, so a direct hit with none notFound()s the
// same way Visit us/Photos/Videos/FAQ do for their own empty case.
export default async function BusinessPartnersPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();

  const partners = await getPublishedBusinessPartners(listing.id, resolved);
  if (partners.length === 0) notFound();

  const t = DIRECTORY_STRINGS[resolved];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.businessPartnersHeading}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.businessPartnersIntro}</p>
        {/* Same card as "Latest Businesses"/"Businesses near you" (see
            [locale]/[slug]/page.tsx) rather than this tab's own thinner
            logo+name+tagline row — one card treatment (cover photo/logo,
            rating, location, tags, views) across every "other businesses"
            list on a listing's page, not a second, less informative one
            just for partners. */}
        <div className="grid gap-4 sm:grid-cols-2">
          {partners.map((partner) => (
            <ListingCard
              key={partner.slug}
              listing={partner}
              viewLabel={t.viewListing}
              industryLabel={partner.industry ? INDUSTRY_LABELS_BY_LOCALE[resolved][partner.industry] : undefined}
              locale={resolved}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
