import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { findIndustryBySlug, industryPageHeading, industryPageDescription } from "@/lib/directory-industry-labels";
import { DIRECTORY_SHARE_IMAGE_ALT, DIRECTORY_SHARE_IMAGE_SIZE } from "@/lib/directory-seo";
import { buildDirectorySectionOgImage, OG_IMAGE_TEXT_LOCALE } from "@/lib/directory-og-image";
import type { DirectoryLocale } from "@/lib/directory-i18n";

// This industry's own share image (see the `shareImage` in
// buildIndustryMetadata) — same gotka.com house style as the listing and
// site-wide cards, built from this industry's own name and description
// rather than generic directory branding.
export const size = DIRECTORY_SHARE_IMAGE_SIZE;
export const contentType = "image/png";

const EYEBROW: Record<DirectoryLocale, string> = { en: "INDUSTRY", zh: "INDUSTRY", ms: "INDUSTRI" };

export default async function Image({ params }: { params: Promise<{ locale: string; industrySlug: string }> }) {
  const { locale, industrySlug } = await params;
  const textLocale = OG_IMAGE_TEXT_LOCALE[resolveDirectoryLocale(locale) ?? "en"];
  const industry = findIndustryBySlug(industrySlug);

  return buildDirectorySectionOgImage({
    eyebrow: EYEBROW[textLocale],
    title: industry ? industryPageHeading(industry, textLocale) : DIRECTORY_SHARE_IMAGE_ALT,
    description: industry ? industryPageDescription(industry, textLocale) : null,
  });
}
