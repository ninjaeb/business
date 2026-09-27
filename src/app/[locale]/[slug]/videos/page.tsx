import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedListingBySlug, resolveListingDisplay } from "@/lib/directory";
import { buildListingMetadata, buildVideoJsonLd } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import {
  DIRECTORY_STRINGS,
  VIDEO_CATEGORY_LABELS_BY_LOCALE,
  directoryListingPath,
  directoryListingVideosPath,
} from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoGallery } from "@/components/directory/video-gallery";

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
    pageUrl: `${siteOrigin}${directoryListingVideosPath(resolved, slug)}`,
    pathFor: (code) => directoryListingVideosPath(code, slug),
    sectionHeading: t.videoHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

export default async function VideosPage({
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
  if (display.videoGallery.length === 0) notFound();

  return (
    <>
      {/* One VideoObject <script> per video — see buildVideoJsonLd's own
          comment in directory-seo.ts for why each stands alone rather than
          sharing one @graph the way News/Promotions' Article nodes do. */}
      {display.videoGallery.map((video, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildVideoJsonLd(video, video.embed?.embedUrl ?? null, listing.companyName) }}
        />
      ))}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.videoHeading}</CardTitle>
        </CardHeader>
        <CardBody>
          <VideoGallery
            companyName={listing.companyName}
            watchOnProviderLabel={t.watchOnProviderLabel}
            videos={display.videoGallery.map((video) => ({
              url: video.url,
              title: video.title,
              category: video.category,
              categoryLabel: VIDEO_CATEGORY_LABELS_BY_LOCALE[resolved][video.category],
              thumbnailUrl: video.thumbnailUrl,
              embedUrl: video.embed?.embedUrl ?? null,
              provider: video.embed?.provider ?? null,
            }))}
          />
        </CardBody>
      </Card>
    </>
  );
}
