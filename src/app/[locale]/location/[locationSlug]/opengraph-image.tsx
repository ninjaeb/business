import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { findLocationBySlug, loadPublishedListings } from "@/lib/directory";
import { locationLabel, locationPageHeading, locationPageDescription } from "@/lib/directory-location-labels";
import { DIRECTORY_SHARE_IMAGE_ALT, DIRECTORY_SHARE_IMAGE_SIZE } from "@/lib/directory-seo";
import { buildDirectorySectionOgImage, OG_IMAGE_TEXT_LOCALE } from "@/lib/directory-og-image";
import type { DirectoryLocale } from "@/lib/directory-i18n";

// This location's own share image (see the `shareImage` in
// buildLocationMetadata) — same gotka.com house style as the listing and
// site-wide cards, built from this location's own label and description
// rather than generic directory branding.
export const size = DIRECTORY_SHARE_IMAGE_SIZE;
export const contentType = "image/png";

const EYEBROW: Record<DirectoryLocale, string> = { en: "LOCATION", zh: "LOCATION", ms: "LOKASI" };

export default async function Image({ params }: { params: Promise<{ locale: string; locationSlug: string }> }) {
  const { locale, locationSlug } = await params;
  const textLocale = OG_IMAGE_TEXT_LOCALE[resolveDirectoryLocale(locale) ?? "en"];
  const rows = await loadPublishedListings();
  const location = findLocationBySlug(rows, locationSlug);
  const label = location ? locationLabel(location.city, location.state) : null;

  return buildDirectorySectionOgImage({
    eyebrow: EYEBROW[textLocale],
    title: label ? locationPageHeading(label, textLocale) : DIRECTORY_SHARE_IMAGE_ALT,
    description: label ? locationPageDescription(label, textLocale) : null,
  });
}
