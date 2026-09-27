import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { directoryImagePath, getPublishedListingBySlug } from "@/lib/directory";
import { buildListingMetadata, buildPhotoGalleryJsonLd } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import {
  DIRECTORY_STRINGS,
  directoryListingPath,
  directoryListingPhotosPath,
  formatAlbumMetaDescription,
  formatPhotoCountLabel,
} from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoLightbox, type LightboxPhoto } from "@/components/directory/photo-lightbox";
import { AlbumGrid, type AlbumSummary } from "@/components/directory/album-grid";

export const dynamic = "force-dynamic";

// A stale/bad ?album= is treated as absent everywhere it's read (metadata
// here and the page component below) — same fallback, computed the same
// way in both places since they run as two separate requests and can't
// share state.
function resolveActiveAlbum(listing: { photos: { gallery: string }[] }, album: string | undefined): string | null {
  const albumNames = new Set(listing.photos.map((photo) => photo.gallery).filter(Boolean));
  return album && albumNames.has(album) ? album : null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ album?: string }>;
}): Promise<Metadata> {
  const [{ locale, slug }, { album }] = await Promise.all([params, searchParams]);
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) return {};

  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[resolved];
  const photosPath = directoryListingPhotosPath(resolved, slug);

  // A valid album gets its own title/description/canonical/hreflang — the
  // same distinct-content treatment every other field here already gets —
  // so each named album is a page search engines (and Google Images) can
  // index on its own instead of as a duplicate of the plain Photos page,
  // which is what every ?album= value pointed at before this.
  const activeAlbum = resolveActiveAlbum(listing, album);
  const albumQuery = activeAlbum ? `?album=${encodeURIComponent(activeAlbum)}` : "";
  const photoCount = activeAlbum ? listing.photos.filter((photo) => photo.gallery === activeAlbum).length : listing.photos.length;

  return buildListingMetadata({
    listing,
    siteOrigin,
    locale: resolved,
    pageUrl: `${siteOrigin}${photosPath}${albumQuery}`,
    pathFor: (code) => `${directoryListingPhotosPath(code, slug)}${albumQuery}`,
    sectionHeading: activeAlbum ? `${t.photosHeading} – ${activeAlbum}` : t.photosHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
    descriptionOverride: activeAlbum
      ? formatAlbumMetaDescription(activeAlbum, photoCount, listing.companyName, resolved)
      : undefined,
  });
}

export default async function PhotosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ album?: string }>;
}) {
  const [{ locale, slug }, { album: selectedAlbum }] = await Promise.all([params, searchParams]);
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();
  if (listing.photos.length === 0) notFound();

  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[resolved];
  const photosPath = directoryListingPhotosPath(resolved, slug);

  const lightboxPhotos: LightboxPhoto[] = listing.photos.map((photo) => ({
    id: photo.id,
    src: directoryImagePath(photo.id),
    caption: photo.caption,
    gallery: photo.gallery,
    // Caption plus company name, not caption alone — a photo with no
    // caption still gets a distinct, non-generic alt instead of repeating
    // the bare company name across every uncaptioned photo on the page,
    // and a photo with one gets the business tied to it explicitly (useful
    // to an AI crawler that only sees this image out of context, e.g. via
    // Google Images).
    alt: photo.caption ? `${photo.caption} – ${listing.companyName}` : listing.companyName,
  }));

  // One ImageObject per photo actually rendered by a PhotoLightbox below
  // (never the album-grid's own cover thumbnails — see
  // buildPhotoGalleryJsonLd's own comment) — a plain function of whichever
  // photos a branch below is about to show, called once per branch rather
  // than once for the whole listing.
  const companyName = listing.companyName;
  function photoGalleryJsonLd(photos: LightboxPhoto[]): string {
    return buildPhotoGalleryJsonLd(
      photos.map((photo) => ({ url: `${siteOrigin}${photo.src}`, caption: photo.caption })),
      companyName,
    );
  }

  // Named albums, in first-appearance order (a partner's own free-text
  // label, not a fixed enum — see PhotoLightbox — so there's no canonical
  // order to sort by). A listing with none of its photos grouped into a
  // named album keeps today's plain flat grid, unchanged.
  const albumNames = [...new Set(lightboxPhotos.map((photo) => photo.gallery).filter(Boolean))];

  if (albumNames.length === 0) {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: photoGalleryJsonLd(lightboxPhotos) }} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.photosHeading}</CardTitle>
          </CardHeader>
          <CardBody>
            <PhotoLightbox companyName={listing.companyName} photos={lightboxPhotos} />
          </CardBody>
        </Card>
      </>
    );
  }

  // A stale/bad `?album=` (a since-renamed or removed album) falls back to
  // the album grid rather than 404ing — the grid is always a valid page to
  // land on. Same check generateMetadata above makes, computed separately
  // since the two run as independent requests.
  const activeAlbum = resolveActiveAlbum(listing, selectedAlbum);

  if (activeAlbum) {
    const albumPhotos = lightboxPhotos.filter((photo) => photo.gallery === activeAlbum);
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: photoGalleryJsonLd(albumPhotos) }} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.photosHeading}</CardTitle>
          </CardHeader>
          <CardBody>
            <Link
              href={photosPath}
              className="mb-3 inline-flex items-center gap-1 text-sm text-petrol hover:underline dark:text-petrol-light"
            >
              <ChevronLeft className="h-4 w-4" />
              {t.backToAlbumsLabel}
            </Link>
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{activeAlbum}</h4>
            <PhotoLightbox companyName={listing.companyName} photos={albumPhotos} />
          </CardBody>
        </Card>
      </>
    );
  }

  const albums: AlbumSummary[] = albumNames.map((name) => {
    const albumPhotos = lightboxPhotos.filter((photo) => photo.gallery === name);
    const cover = albumPhotos[0];
    return {
      name,
      coverSrc: cover.src,
      coverAlt: `${name} – ${listing.companyName}`,
      countLabel: formatPhotoCountLabel(albumPhotos.length, resolved),
      href: `${photosPath}?album=${encodeURIComponent(name)}`,
    };
  });
  // Photos left outside any named album stay reachable too, in their own
  // flat section below the album grid — same principle as PhotoLightbox not
  // inventing an "Uncategorized" heading, just without leaving them
  // unreachable from this page.
  const otherPhotos = lightboxPhotos.filter((photo) => !photo.gallery);

  return (
    <>
      {otherPhotos.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: photoGalleryJsonLd(otherPhotos) }} />
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.photosHeading}</CardTitle>
        </CardHeader>
        <CardBody>
          <AlbumGrid albums={albums} />
          {otherPhotos.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {t.otherPhotosLabel}
              </h4>
              <PhotoLightbox companyName={listing.companyName} photos={otherPhotos} />
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
