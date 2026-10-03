import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedListingBySlug } from "@/lib/directory";
import { getPublishedBusinessPartners } from "@/lib/business-partners";
import { buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingBusinessPartnersPath, directoryListingPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
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

  const partners = await getPublishedBusinessPartners(listing.id);
  if (partners.length === 0) notFound();

  const t = DIRECTORY_STRINGS[resolved];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.businessPartnersHeading}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.businessPartnersIntro}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {partners.map((partner) => (
            <Link
              key={partner.slug}
              href={directoryListingPath(resolved, partner.slug)}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-petrol/40 dark:border-neutral-800 dark:hover:border-petrol-light/30"
            >
              <ListingLogo name={partner.companyName} logoUrl={partner.logoUrl} size={48} loading="lazy" className="h-12 w-12 shrink-0 text-base" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-900 dark:text-slate-100">{partner.companyName}</span>
                {partner.tagline && <span className="block truncate text-sm text-slate-500 dark:text-slate-400">{partner.tagline}</span>}
              </span>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
