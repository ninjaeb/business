import type { DirectoryLocale } from "@/lib/directory-i18n";
import { DIRECTORY_SITE_NAME_BY_LOCALE } from "@/lib/directory-seo";

// A city/state/country name is shown exactly as the partner typed it, the
// same way the listing detail page's own city/state/country pills already
// do — unlike a category, none of it is translated per locale (there's no
// fixed, seeded set of values to keep a translation table for).

// A location's display label and slug source: "Petaling Jaya, Selangor"
// when the listing(s) behind it have a city, otherwise the state alone —
// the one place this combining rule lives, so every caller (the index
// list, the home page's teaser section, a listing's own location pill, the
// sitemap/llms.txt generators, and findLocationBySlug's own reverse
// lookup) shows and slugifies the exact same string for the exact same
// group. No separate slug function: slugify() (see src/lib/slug.ts)
// collapses ", " and " " identically, so slugify(locationLabel(...)) is
// stable and never drifts from the label itself.
export function locationLabel(city: string | null, state: string): string {
  return city ? `${city}, ${state}` : state;
}

// A friendly location page's own URL — same shape as categoryPath in
// directory-category-labels.ts. Relative — the caller prepends siteOrigin
// for anything that needs an absolute URL. `slug` is slugify(locationLabel(...)).
export function locationPath(slug: string, locale: DirectoryLocale): string {
  return `/${locale}/location/${slug}`;
}

export function locationPageTitle(label: string, locale: DirectoryLocale): string {
  const siteName = DIRECTORY_SITE_NAME_BY_LOCALE[locale];
  if (locale === "zh") return `${label} 企业 | ${siteName}`;
  if (locale === "ms") return `Perniagaan di ${label} | ${siteName}`;
  return `Businesses in ${label} | ${siteName}`;
}

export function locationPageHeading(label: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `${label} 企业`;
  if (locale === "ms") return `Perniagaan di ${label}`;
  return `Businesses in ${label}`;
}

export function locationPageDescription(label: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `浏览 Gotka 网络中位于 ${label} 的值得信赖企业，并直接联系他们。`;
  if (locale === "ms") return `Semak imbas perniagaan yang dipercayai di ${label} dalam rangkaian Gotka dan hubungi terus.`;
  return `Browse trusted businesses in ${label} in the Gotka network and reach out directly.`;
}
