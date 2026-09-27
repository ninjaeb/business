import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { findCategoryBySlug } from "@/lib/directory";
import { categoryPageHeading, categoryPageDescription } from "@/lib/directory-category-labels";
import { DIRECTORY_SHARE_IMAGE_ALT, DIRECTORY_SHARE_IMAGE_SIZE } from "@/lib/directory-seo";
import { buildDirectorySectionOgImage, OG_IMAGE_TEXT_LOCALE } from "@/lib/directory-og-image";
import type { DirectoryLocale } from "@/lib/directory-i18n";

// This category's own share image (see the `shareImage` in
// buildCategoryMetadata) — same gotka.com house style as the listing and
// site-wide cards, built from this category's own name and description
// rather than generic directory branding.
export const size = DIRECTORY_SHARE_IMAGE_SIZE;
export const contentType = "image/png";

// Keyed by every DirectoryLocale even though OG_IMAGE_TEXT_LOCALE never
// actually resolves to "zh" (see that mapping's own comment) — simpler than
// a narrower type just for an index that's never hit.
const EYEBROW: Record<DirectoryLocale, string> = { en: "CATEGORY", zh: "CATEGORY", ms: "KATEGORI" };

export default async function Image({ params }: { params: Promise<{ locale: string; categorySlug: string }> }) {
  const { locale, categorySlug } = await params;
  const textLocale = OG_IMAGE_TEXT_LOCALE[resolveDirectoryLocale(locale) ?? "en"];
  const category = await findCategoryBySlug(categorySlug);

  return buildDirectorySectionOgImage({
    eyebrow: EYEBROW[textLocale],
    title: category ? categoryPageHeading(category, textLocale) : DIRECTORY_SHARE_IMAGE_ALT,
    description: category ? categoryPageDescription(category, textLocale) : null,
  });
}
