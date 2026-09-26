import type { Industry } from "@/generated/prisma/client";
import { INDUSTRIES, INDUSTRY_LABELS } from "@/lib/labels";
import { slugify } from "@/lib/slug";
import { DIRECTORY_SITE_NAME_BY_LOCALE } from "@/lib/directory-seo";
import { INDUSTRY_LABELS_BY_LOCALE, type DirectoryLocale } from "@/lib/directory-i18n";

// A friendly industry page's own URL slug is derived from the English label
// (slugify("Food & Beverage") -> "food-beverage"), same convention as
// categoryPath — reads like words in the URL bar rather than the enum's own
// SCREAMING_SNAKE_CASE. Industry is a fixed, small enum (unlike
// BusinessCategory, a DB table), so this needs no async lookup the way
// findCategoryBySlug does.
export function industrySlug(industry: Industry): string {
  return slugify(INDUSTRY_LABELS[industry]);
}

export function findIndustryBySlug(slug: string): Industry | null {
  return INDUSTRIES.find((industry) => industrySlug(industry) === slug) ?? null;
}

// Same shape as categoryPath in directory-category-labels.ts.
export function industryPath(industry: Industry, locale: DirectoryLocale): string {
  return `/${locale}/business/industry/${industrySlug(industry)}`;
}

export function industryPageTitle(industry: Industry, locale: DirectoryLocale): string {
  const label = INDUSTRY_LABELS_BY_LOCALE[locale][industry];
  const siteName = DIRECTORY_SITE_NAME_BY_LOCALE[locale];
  if (locale === "zh") return `${label} 企业 | ${siteName}`;
  if (locale === "ms") return `Perniagaan ${label} | ${siteName}`;
  return `${label} Businesses | ${siteName}`;
}

export function industryPageHeading(industry: Industry, locale: DirectoryLocale): string {
  const label = INDUSTRY_LABELS_BY_LOCALE[locale][industry];
  if (locale === "zh") return `${label} 企业`;
  if (locale === "ms") return `Perniagaan ${label}`;
  return `${label} businesses`;
}

export function industryPageDescription(industry: Industry, locale: DirectoryLocale): string {
  const label = INDUSTRY_LABELS_BY_LOCALE[locale][industry];
  if (locale === "zh") return `浏览 Gotka 网络中值得信赖的 ${label} 企业，并直接联系他们。`;
  if (locale === "ms") return `Semak imbas perniagaan ${label} yang dipercayai dalam rangkaian Gotka dan hubungi terus.`;
  return `Browse trusted ${label} businesses in the Gotka network and reach out directly.`;
}
