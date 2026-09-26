import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { directoryImagePath, getPublishedListingBySlug } from "@/lib/directory";
import { buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingPath, directoryListingPhotosPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoLightbox } from "@/components/directory/photo-lightbox";

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
    pageUrl: `${siteOrigin}${directoryListingPhotosPath(resolved, slug)}`,
    pathFor: (code) => directoryListingPhotosPath(code, slug),
    sectionHeading: t.photosHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();
  if (listing.photos.length === 0) notFound();

  const t = DIRECTORY_STRINGS[resolved];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.photosHeading}</CardTitle>
      </CardHeader>
      <CardBody>
        <PhotoLightbox
          companyName={listing.companyName}
          photos={listing.photos.map((photo) => ({
            id: photo.id,
            src: directoryImagePath(photo.id),
            caption: photo.caption,
            // Caption plus company name, not caption alone — a photo with
            // no caption still gets a distinct, non-generic alt instead of
            // repeating the bare company name across every uncaptioned
            // photo on the page, and a photo with one gets the business
            // tied to it explicitly (useful to an AI crawler that only sees
            // this image out of context, e.g. via Google Images).
            alt: photo.caption ? `${photo.caption} – ${listing.companyName}` : listing.companyName,
          }))}
        />
      </CardBody>
    </Card>
  );
}
